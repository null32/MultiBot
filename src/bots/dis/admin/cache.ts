import { Message, RichEmbed } from "discord.js";
import DisBot from "..";
import { DIS_ADMIN } from "../../../constants";
import { BytesToHuman } from "../../../util";

export default async function (msg: Message, args: string[], bot: DisBot) {
    const { channel, author } = msg;
    if (author.id !== DIS_ADMIN) {
        await channel.send(`❌ You are not my master`);
        return;
    }
    if (args.length < 1) {
        await channel.send(`⚠ Expected \`list\`, \`show\`, \`del\` or \`clear\``);
        return;
    }

    const files = await bot.FileMgr.DBGetFiles();
    let index = 0;
    let cmd = args.shift();
    switch (cmd) {
        case 'list':
            let currentPage = args.length > 0 ? parseInt(args.pop()!) - 1 : 0;
            let pages = files.length / 10 + files.length % 10 > 0 ? 1 : 0;
            if (currentPage > pages || currentPage < 0) {
                currentPage = 0;
            }
            let emb = new RichEmbed();
            emb.setDescription(`total: ${files.length} files, ${BytesToHuman(files.reduce((s, e) => s += e.Size, 0))}`);
            for (let i = currentPage * 10; i < files.length && i < (currentPage + 1) * 10; i++) {
                const el = files[i];
                emb.addField(`\`${i + 1}\` name: \`${el.Name}\` size: \`${BytesToHuman(el.Size)}\` @\`${el.CreatedAt.toDateString()}\``, `[cached](${el.WebUrl})\t[original](${el.OriginalUrl})`);
            }
            emb.setFooter(`page: ${currentPage + 1}/${pages}`);
            await channel.send(emb);
            break;
        case 'show':
            if (args.length < 1) {
                await channel.send('❌ Index expected');
                return;
            }
            index = parseInt(args.pop()!);
            if (index < 0 || index > files.length) {
                await channel.send('❌ Invalid index');
                return
            }
            await channel.send(files[index - 1].WebUrl);
            break;
        case 'del':
            if (args.length < 1) {
                await channel.send('❌ Index expected');
                return;
            }
            index = parseInt(args.pop()!);
            if (index < 0 || index > files.length) {
                await channel.send('❌ Invalid index');
                return
            }
            await bot.FileMgr.RemoveFile(files[index]);
            await channel.send('✅ File deleted');
            break;
        case 'clear':
            for (const item of files) {
                await bot.FileMgr.RemoveFile(item);
            }
            await channel.send('✅ Cache cleared');
            break;
        default:
            await channel.send('❌ Unknown sub-command');
            break;
    }
}