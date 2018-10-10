import { Message } from 'discord.js';
import DisBot from '..';

export default (msg: Message, bot: DisBot) => {
    msg.channel.send(`${bot.DisApi.ping.toFixed()} ms ${DisBot.roflEmojis[Math.round(Math.random() * DisBot.roflEmojis.length)]}`);
}