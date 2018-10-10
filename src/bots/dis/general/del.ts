import { Message, DMChannel, MessageReaction } from "discord.js";
import DisBot from "..";

export default async (msg: Message, args: Array<string>, bot: DisBot) => {
    if (args.length < 1) {
        msg.channel.send('❌ Too few args, expected 1');
        return;
    }
    if (msg.channel instanceof DMChannel) {
        msg.channel.send('❌ Can\'t delete in DM');
        return;
    }
    const count = Number.parseInt(args.shift() as string);
    if (!count || count < 1) {
        msg.channel.send('❌ Invalid number');
        return;
    }

    const boldNum = count.toString().split('').map(c => DisBot.roflNums[c]).join('');
    let msgChoose: Message = (await msg.channel.send(`Delete ${boldNum} message(s)?`)) as Message;
    let acc = await msgChoose.react('✅');

    let tempHandler = async (msgReact: MessageReaction) => {
        if (msgReact.message.id === msgChoose.id && msgReact.emoji.name === acc.emoji.name) {
            let users = msgReact.users.map((v, k) => v);
            if (users.find(c => c.id === msg.author.id)) {
                msg.channel.bulkDelete(count, true).catch(err => {
                    console.log(`When ${msg.author.username} tried to delete ${count} messages in ${msg.channel.id} the following error occured: ${err}`);
                    msg.channel.send('( /)w(\\✿) I can\'t do that, sorry')
                });

                bot.DisApi.removeListener('messageReactionAdd', tempHandler);
                clearTimeout(timer);
            }
        }
    };
    bot.DisApi.on('messageReactionAdd', tempHandler);
    let timer = setTimeout(() => {
        msgChoose.edit('Timeout ⏱');
        msgChoose.react('✅');

        bot.DisApi.removeListener('messageReactionAdd', tempHandler);
    }, 10 * 1000);
}