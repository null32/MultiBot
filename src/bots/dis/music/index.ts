import { Message, RichEmbed, StreamDispatcher, VoiceConnection, VoiceChannel, MessageReaction, User, StreamOptions } from "discord.js";
import { clearTimeout, setTimeout } from "timers";
import { Dictionary } from "typescript-collections";
import DisBot from "..";
import { DIS_ADMIN } from "../../../constants";
import { BytesToHuman, DateSub, GetWebFileInfo, SecsToHuman } from "../../../util";
import Command from "../command";
import CommandCategory from "../commandCategory";
import SongFile from "./filesong";
import Song from "./song";
import SongYT from "./ytsong";

class MusicPlayer {
    //#region Fields
    private readonly SkipReason = 'Got "skip" from client';
    private readonly StopReason = 'Got "stop" from client';

    private readonly Bot: DisBot;
    private Servers: Dictionary<string, MusicPlayer>;
    private FailCount: number;

    private StreamDispatcher?: StreamDispatcher;
    private Voice?: VoiceConnection;
    private LeaveTimer?: NodeJS.Timer;

    private Queue: QueueItem[];
    private CurrentSong?: QueueItem;
    private RepeatOne: boolean;
    private RepeatAll: boolean;
    //#endregion

    //#region Public Methods
    public constructor(bot: DisBot) {
        this.Servers = new Dictionary<string, MusicPlayer>();

        this.Bot = bot;
        this.FailCount = 0;
        this.Queue = new Array<QueueItem>();
        this.RepeatOne = false;
        this.RepeatAll = false;
    }

    public GetCommands() {
        return new CommandCategory('audio',
            new Command(['play', 'p'], (a, b) => this.GetPlayerForMsg(a).Play(a, b), 'Play song from [YT]'),
            new Command(['loop', 'repeat', 'l'], (a, b) => this.GetPlayerForMsg(a).RepeatOneToggle(a, b), 'Repeat one song'),
            new Command(['loopall', 'repeatall', 'loopqueue', 'lq'], (a, b) => this.GetPlayerForMsg(a).RepeatAllToggle(a, b), 'Repeat all songs in queue'),
            new Command(['search', 'find', 'f'], (a, b) => this.GetPlayerForMsg(a).Search(a, b), 'Search music from YouTube'),
            new Command(['nowplaying', 'np'], (a, b) => this.GetPlayerForMsg(a).NowPlaying(a, b), 'Info about current song'),
            new Command(['queue', 'q'], (a, b) => this.GetPlayerForMsg(a).PrintQueue(a, b), 'Show items in play queue'),
            new Command(['remove', 'rm'], (a, b) => this.GetPlayerForMsg(a).RemoveFromQueue(a, b), 'Removes item from play queue'),
            new Command('clear', (a, b) => this.GetPlayerForMsg(a).ClearQueue(a, b), 'Clear play queue'),
            new Command('stop', (a, b) => this.GetPlayerForMsg(a).Stop(a, b), 'Stops music playback'),
            new Command(['skip', 's'], (a, b) => this.GetPlayerForMsg(a).Skip(a, b), 'Skips current track'),
            new Command('leave', (a, b) => this.GetPlayerForMsg(a).Leave(a, b), 'Leave current voice channel'),
        );
    }
    //#endregion

    //#region Chat callbacks
    private async Search(msg: Message, args: string[]) {
        const { channel, author } = msg;
        if (args.length < 1) {
            await channel.send('❌ Query expected');
            return;
        }

        if (!await this.VoicePreJoin(msg)) {
            return;
        }

        const searchRes = await this.Bot.YTApi.Search(args.join(' '));
        if (searchRes.length < 1) {
            await channel.send('OwO No results');
            return;
        }

        let pgCur = 1;
        let pgTot = searchRes.length / 10 + (searchRes.length % 10 > 0 ? 1 : 0);

        let makeSelectionPage = () => {
            let content = `Select song [1-${searchRes.length}] or \`cancel\` to abort\n\n`;
            for (let i = (pgCur - 1) * 10; i < searchRes.length && i < pgCur * 10; i++) {
                const item = searchRes[i];
                content += `\`${i + 1}.\` ${item.Title} | **[${SecsToHuman(item.Duration)}]** posted by __${item.ChannelTitle}__ *${DateSub(item.PublishedAt)}* ago\n`
            }
            content += `\nPage **[${pgCur}/${pgTot}]**`

            return content;
        }

        const msgChoose = await channel.send(makeSelectionPage()) as Message;
        const pgPrev = await msgChoose.react('◀');
        const pgNext = await msgChoose.react('▶');

        let selectionHandler = async (msgTemp: Message) => {
            if (msgTemp.author.id === author.id && msgTemp.channel.id === channel.id) {
                if (msgTemp.content.toLowerCase() === 'cancel') {
                    await msgChoose.delete();
                    await msg.channel.send('✅ Canceled');
                } else {
                    let index = parseInt(msgTemp.content);
                    if (!index || index <= 0 || index > searchRes.length) {
                        await msg.channel.send('⚠ Invalid index');
                        return;
                    } else {
                        await msgChoose.delete();
                        let pl = searchRes[index - 1];
                        const qItem: QueueItem = { song: new SongYT(pl), requestMsg: msg };

                        this.QueueAdd(qItem);
                        this.PrettyPrintSong(qItem);
                    }
                }

                this.Bot.DisApi.removeListener('message', selectionHandler);
                this.Bot.DisApi.removeListener('messageReactionAdd', pageHandler);
                this.Bot.DisApi.removeListener('messageReactionRemove', pageHandler);
                clearTimeout(timer);
            }
        }

        let pageHandler = async (msgReact: MessageReaction, user: User) => {
            if (msgReact.message.id === msgChoose.id && user.id === msg.author.id) {
                if (msgReact.emoji.name === pgPrev.emoji.name && pgCur !== 1) {
                    pgCur--;
                    await msgChoose.edit(makeSelectionPage());
                    clearTimeout(timer);
                    timer = setTimeout(cleanUp, 30 * 1000);
                } else if (msgReact.emoji.name === pgNext.emoji.name && pgCur != pgTot) {
                    pgCur++;
                    await msgChoose.edit(makeSelectionPage());
                    clearTimeout(timer);
                    timer = setTimeout(cleanUp, 30 * 1000);
                }
            }
        }

        this.Bot.DisApi.on('message', selectionHandler);
        this.Bot.DisApi.on('messageReactionAdd', pageHandler);
        this.Bot.DisApi.on('messageReactionRemove', pageHandler);

        let cleanUp = async () => {
            await msgChoose.delete();
            await msg.channel.send('⏱ Timeout');

            this.Bot.DisApi.removeListener('message', selectionHandler);
            this.Bot.DisApi.removeListener('messageReactionAdd', pageHandler);
            this.Bot.DisApi.removeListener('messageReactionRemove', pageHandler);
        };
        let timer = setTimeout(cleanUp, 30 * 1000);
    }

    private async Play(msg: Message, args: string[]) {
        const { channel } = msg;
        if (args.length < 1) {
            await channel.send('❌ Query expected');
            return;
        }

        if (!await this.VoicePreJoin(msg)) {
            return;
        }

        //https://www.youtube.com/watch?v=6LbC2BT_iog&index=2&list=RDMMjpe09yZ4eAE
        //https://www.youtube.com/playlist?list=PLPlHGp2_ssBqjCtmB5bzKcDvrU1m3_9SV
        //https://www.youtube.com/watch?v=5RNePy_awq0&t=0s&list=PLPlHGp2_ssBqjCtmB5bzKcDvrU1m3_9SV&index=2
        //https://youtu.be/8RUWkv4Ray8  

        /**
         * Determine query type
         * 1. Plain text -> Search YT && first result
         * 2. YT Link -> Get video && add to queue
         * 3. YT Playlist -> Get video(s) && add to queue
         * 4. Direct link -> Download && add to queue
         * 5. other?...
         */

        let songs: QueueItem[] | null = null;
        let url: URL | null = null;
        try {
            url = new URL(args[0]);
        } catch (e) {

        }

        if (url) {
            //Check if url is from YT
            if (url.hostname === 'www.youtube.com') {
                let listId = url.searchParams.get('list');
                let videoId = url.searchParams.get('v');

                if (listId) {
                    let videos = await this.Bot.YTApi.GetPlaylist(listId, 100);
                    if (videos.length < 1) {
                        channel.send('⚠ Playlist is invalid or has 0 items')
                        return;
                    }
                    songs = videos.map(e => {
                        return { song: new SongYT(e), requestMsg: msg };
                    });
                } else if (videoId) {
                    let video = await this.Bot.YTApi.GetById(videoId);
                    songs = [{ song: new SongYT(video), requestMsg: msg }];
                } else {
                    channel.send('❌ Invalid youtube link');
                    return;
                }
                //...or from short YT 
            } else if (url.hostname === 'youtu.be') {
                let videoId = url.pathname.slice(1);
                let video = await this.Bot.YTApi.GetById(videoId);
                songs = [{ song: new SongYT(video), requestMsg: msg }];
                //...maybe it's direct link
            } else {
                let info = await GetWebFileInfo(url.href);
                if (info.size > 1024 * 1024 * 200 && msg.author.id !== DIS_ADMIN) {
                    channel.send(`⚠ File is too big: ${BytesToHuman(info.size)}`);
                    return;
                }
                //Should there be some mime whitelist?
                if (!info.ext) {
                    channel.send(`⚠ Unknown file extention for mime: ${info.mime}`);
                    return;
                }

                let downStatus = (await channel.send(`**Downloading file**`) as Message);
                let cached = await this.Bot.FileMgr.DownloadFile(url.href, info.ext!, 60 * 60 * 2, (done, total) => {
                    downStatus.edit(`**Downloading file: ${total === 0 ? '0' : (done/total * 100).toFixed()}%**`);
                });
                songs = [{ song: new SongFile(cached), requestMsg: msg }];
            }
            //Treat as search query
        } else {
            const searchRes = await this.Bot.YTApi.Search(args.join(' '));
            if (searchRes.length < 1) {
                channel.send('OwO No results');
            } else {
                songs = [{ song: new SongYT(searchRes[0]), requestMsg: msg }];
            }
        }

        if (songs) {
            songs.forEach(c => this.QueueAdd(c));
            if (songs.length > 1) {
                channel.send(`✅ Enqueued ${songs.length} items`);
            }
            this.PrettyPrintSong(songs[0]);
        }
    }

    private RepeatOneToggle(msg: Message, args: string[]) {
        this.RepeatOne = !this.RepeatOne;
        msg.channel.send(`${this.RepeatOne ? `🔂 Loop enabled` : `➡ Loop disabled`}`);
    }

    private RepeatAllToggle(msg: Message, args: string[]) {
        this.RepeatAll = !this.RepeatAll;
        msg.channel.send(`${this.RepeatAll ? `🔁 Loop queue enabled` : `➡ Loop queue disabled`}`);
    }

    private RemoveFromQueue(msg: Message, args: string[]) {
        if (args.length < 1) {
            msg.channel.send('❌ Index expected');
            return;
        }

        let index = parseInt(args.shift()!);
        if (!index || index < 1 || index > this.Queue.length) {
            msg.channel.send('❌ Invalid index');
            return
        }

        let item = this.Queue.splice(index - 1, 1)[0];
        msg.channel.send(`✅ Removed \`${item.song.Title}\` from queue`);
    }

    private async NowPlaying(msg: Message, args: string[]) {
        if (!this.CurrentSong) {
            await msg.channel.send(`Nothing playing`);
            return;
        }

        let cur = this.CurrentSong!;
        let emb = new RichEmbed();
        emb.setAuthor('Now playing');
        emb.setColor(msg.guild.me.displayColor);
        if (cur.song instanceof SongYT) {
            emb.setThumbnail(cur.song.Src.ThumbNails.default.url);
        }
        emb.setTitle(cur.song.Title);
        emb.setURL(cur.song.Url);
        emb.setDescription(
            `\n**${SecsToHuman(parseInt((this.StreamDispatcher!.time / 1000).toFixed()))}/${SecsToHuman(this.CurrentSong!.song.Duration)}**\n\n` +
            `Requested by <@${cur.requestMsg.author.id}>`);
        msg.channel.send(emb);
    }

    private async PrintQueue(msg: Message, args: string[]) {
        if (this.Queue.length < 1) {
            msg.channel.send('**Queue is empty**');
            this.NowPlaying(msg, args);
            return;
        }
        
        let totalTime = this.Queue.reduce((time, e) => time += e.song.Duration, 0);
        totalTime += parseInt((this.CurrentSong!.song.Duration - this.StreamDispatcher!.time / 1000).toFixed())

        let emb = new RichEmbed();
        emb.setColor(msg.guild.me.displayColor);
        emb.setTitle(`Queue for **${msg.guild.name}**`);
        if (this.CurrentSong!.song instanceof SongYT) {
            emb.setThumbnail((this.CurrentSong!.song as SongYT).Src.ThumbNails.default.url);
        }
        emb.setDescription(`**Now playing**\n` + 
            `[${this.CurrentSong!.song.Title}](${this.CurrentSong!.song.Url})\n` +
            `**${SecsToHuman(parseInt((this.StreamDispatcher!.time / 1000).toFixed()))}/${SecsToHuman(this.CurrentSong!.song.Duration)}**\n` +
            `Requested by <@${this.CurrentSong!.requestMsg.author.id}>\n\n` +
            `__Up next__\n` +
            `${this.Queue.slice(0, 10).map((item, index) =>
                `\`${index + 1}.\` [${
                    item.song.Title.length > 60 
                        ? `${item.song.Title.slice(0, 60)}...` 
                        : item.song.Title
                    }](${item.song.Url}) | **[${SecsToHuman(item.song.Duration)}]** requested by \`${item.requestMsg.member.displayName}\``
            ).join('\n')}` +
            `\n\n**${this.Queue.length}** items in queue | **${SecsToHuman(totalTime)}** in total`
        );
        msg.channel.send(emb);
    }

    private ClearQueue(msg: Message, args: string[]) {
        this.Queue = new Array<QueueItem>();
        msg.channel.send(`🚫 Queue cleared`);
    }

    private Skip(msg: Message, args: string[]) {
        let count: number | undefined;
        if (args.length > 0 && (count = parseInt(args.shift()!)) && count <= this.Queue.length && count > 1) {
            this.Queue = this.Queue.slice(count - 1);
            msg.channel.send(`↪ Skipped to: \`${this.Queue[0].song.Title}\``);
        } else {
            msg.channel.send('⏩ **Skipped**');
        }
        if (this.StreamDispatcher) {
            this.StreamDispatcher.end(this.SkipReason);
        }
    }

    private Stop(msg: Message, args: string[]) {
        this.Queue = new Array<QueueItem>();
        msg.channel.send(`⏹ **Stopped**`);

        if (this.StreamDispatcher) {
            this.StreamDispatcher.end(this.StopReason);
        }
    }

    private Leave(msg: Message, args: string[]) {
        if (this.CurrentSong) {
            this.Stop(msg, args);
        }
        if (this.Voice) {
            msg.channel.send('👋 **cya~**');
            this.VoiceLeave();
        }
    }
    //#endregion

    //#region Utility methods
    private async VoicePreJoin(msg: Message) {
        const { member, channel } = msg;
        if (!member.voiceChannel) {
            await channel.send('❌ Join voice channel first');
            return false;
        }

        if (this.CurrentSong && this.CurrentSong!.requestMsg.member.voiceChannelID !== member.voiceChannelID) {
            await channel.send(`⚠ I'm already in another voice channel`);
            return false;
        }

        return true;
    }

    private async VoiceJoin(vc: VoiceChannel) {
        if (!this.Voice) {
            this.Voice = await vc.join();
        } else if (vc.id !== this.Voice.channel.id) {
            await this.Voice.disconnect();
            this.Voice = await vc.join();
        }
    }

    private async VoiceReJoin() {
        if (this.Voice) {
            if (this.CurrentSong) {
                this.CurrentSong.requestMsg.channel.send('😓 Experiencing problems; Trying to rejoin voice channel')
            }
            await this.Voice.disconnect();
            await new Promise(resolve => setTimeout(() => resolve(), 1000));
            this.Voice = await this.Voice.channel.join();
        } else {
            throw new Error("Attempt to rejoined non existing voice channel");
        }
    }

    private async VoiceLeave() {
        if (this.Voice) {
            await this.Voice.disconnect();
            this.Voice = undefined;
        }

        this.RepeatOne = false;
        this.RepeatAll = false;
    }

    private async PrettyPrintSong(item: QueueItem) {
        let resEmb = new RichEmbed();
        resEmb.setAuthor(`Requested by ${item.requestMsg.member.displayName}`, item.requestMsg.author.displayAvatarURL);
        resEmb.setDescription(`[${item.song.Title}](${item.song.Url})`);

        if (item.song instanceof SongYT) {
            const { ThumbNails, ChannelTitle } = item.song.Src;
            resEmb.setColor('FF3333');
            resEmb.setThumbnail(ThumbNails.default.url);
            resEmb.addField('Channel', `${ChannelTitle}`, true);
        } else if (item.song instanceof SongFile) {
            resEmb.setColor('00FFFF');
        }

        resEmb.addField('Duration', `${SecsToHuman(item.song.Duration)}`, true);
        if (this.CurrentSong && this.StreamDispatcher && this.CurrentSong !== item) {
            const index = this.Queue.indexOf(item);
            resEmb.addField('Position in queue', `${index + 1}`, true);
            let eta = this.CurrentSong.song.Duration - this.StreamDispatcher.time / 1000;
            eta += this.Queue.slice(0, index).reduce((time, song) => time += song.song.Duration, 0);
            eta = parseInt(eta.toFixed());
            resEmb.addField('Time untill playing', `${SecsToHuman(eta)}`, true);
        }

        item.requestMsg.channel.send(resEmb);
    }

    private GetPlayerForMsg(msg: Message): MusicPlayer {
        if (!this.Servers.getValue(msg.guild.id)) {
            this.Servers.setValue(msg.guild.id, new MusicPlayer(this.Bot));
        }
        return this.Servers.getValue(msg.guild.id)!;
    }

    private QueueAdd(song: QueueItem) {
        if (this.LeaveTimer) {
            clearTimeout(this.LeaveTimer);
        }

        if (!this.CurrentSong) {
            this.CurrentSong = song;
            this.PlayNext();
        } else {
            this.Queue.push(song);
        }
    }

    private async OnStreamEnded(reason: string) {
        console.log(`Finished playing: ${reason}`);
        if (!reason) {
            this.FailCount++;
            await this.VoiceReJoin();
            
            if (this.FailCount < 4) {
                if (this.CurrentSong) {
                    this.PlayNext();
                    return;
                }
            }
            if (this.CurrentSong) {
                this.CurrentSong.requestMsg.channel.send('😭 **Got 4 fails in a row;**\n*Probably* song is anavaible');
            }
            if (this.RepeatOne && this.Queue.length > 0) {
                this.CurrentSong = this.Queue.splice(0, 1)[0];
            }
        }
        this.FailCount = 0;

        if (!this.RepeatOne || reason === this.SkipReason) {

            if (this.RepeatAll) {
                this.Queue.push(this.CurrentSong!);
            }

            if (this.Queue.length > 0) {
                this.CurrentSong = this.Queue.splice(0, 1)[0];
            } else {
                this.CurrentSong = undefined;
            }
        }

        if (this.CurrentSong) {
            this.PlayNext();
            return;
        }

        this.LeaveTimer = setTimeout(() => this.VoiceLeave(), 30 * 1000);
    }

    private async PlayNext(seek: number | null = null) {
        let opts: StreamOptions = {};
        opts.volume = 0.5;
        if (seek) {
            opts.seek = seek;
        }

        let onEnd = (reason: string) => this.OnStreamEnded(reason);
        if (this.StreamDispatcher) {
            this.StreamDispatcher.removeAllListeners('end');
            this.StreamDispatcher.end();
        }

        let cur = this.CurrentSong!;

        await this.VoiceJoin(cur.requestMsg.member.voiceChannel);

        if (cur.song instanceof SongYT) {
            this.StreamDispatcher = this.Voice!.playStream(this.Bot.YTApi.StreamVideo(cur.song.Src.Id), opts);
        } else if (cur.song instanceof SongFile) {
            this.StreamDispatcher = this.Voice!.playFile(cur.song.Path, opts);
        } else {
            throw new Error(`Unknown song type: ${JSON.stringify(cur)}`);
        }

        this.StreamDispatcher.on('end', onEnd);
    }
    //#endregion
}

type QueueItem = {
    song: Song,
    requestMsg: Message,
}

export default MusicPlayer;