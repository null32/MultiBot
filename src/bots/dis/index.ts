import Discord, { DMChannel, TextChannel } from 'discord.js';
import YTApi from '../../apis/yt';
import FileManager from '../../fileManager';
import AdminStuff from './admin';
import CommandCategory from './commandCategory';
import GeneralStuff from './general';
import MusicPlayer from './music';

export default class DisBot {
    public readonly DisApi: Discord.Client;
    public readonly FileMgr: FileManager;
    public readonly YTApi: YTApi;

    public readonly Commands: Array<CommandCategory>;
    public readonly Prefix: string;

    private readonly GeneralStuff: GeneralStuff;
    private readonly MusicPlayer: MusicPlayer;
    private readonly AdminStuff: AdminStuff;

    constructor(prefix: string, disApi: Discord.Client, fm: FileManager, ytApi: YTApi) {
        this.Prefix = prefix;
        this.DisApi = disApi;
        this.FileMgr = fm;
        this.YTApi = ytApi;

        this.GeneralStuff = new GeneralStuff(this);
        this.MusicPlayer = new MusicPlayer(this);
        this.AdminStuff = new AdminStuff(this);

        this.Commands = new Array<CommandCategory>();
    }

    public Init(): void {
        //wrap this shit in =>() because of `this` 
        this.DisApi.on('message', (msg) => {this.OnMessage(msg)});

        this.Commands.push(this.GeneralStuff.GetCommands());
        this.Commands.push(this.MusicPlayer.GetCommands());
        this.Commands.push(this.AdminStuff.GetCommands());
    }

    public static roflEmojis = ['😂', '👌', '🤔', '👅', '🍑', '💦', '🍆', '👺', ':middle_finger:', '💀'];
    public static roflNums: any = {
        0:':zero:', 
        1:':one:', 
        2:':two:', 
        3:':three:', 
        4:':four:', 
        5:':five:', 
        6:':six:', 
        7:':seven:', 
        8:':eight:', 
        9:':nine:'
    };

    private OnMessage(msg: Discord.Message): void {
        let args = new Array<string>();
        if (msg.channel instanceof TextChannel && msg.content.startsWith(this.Prefix) && !msg.author.bot) {
            args = msg.content.slice(this.Prefix.length).split(/ +/);
        } else if (msg.channel instanceof DMChannel && !msg.author.bot) {
            args = msg.content.split(/ +/);
        } else {
            return;
        }

        if (args.length === 0) {
            return;
        }

        let command = (args.shift() as string).toLowerCase();

        for (const category of this.Commands) {
            let index = category.Commands.findIndex(t => t.CheckName(command));
            if (index !== -1) {
                category.Commands[index].Execute(msg, args);
                return;
            }
        }
        msg.channel.send(`OwO What's this?`);
    }

}