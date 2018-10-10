import { Message, RichEmbed } from "discord.js";
import DisBot from "..";
import Command from "../command";

export default (msg: Message, args: Array<string>, bot: DisBot) => {
    let emb = new RichEmbed();
    emb.setDescription('List of available commands');
    bot.Commands.forEach(c => {
        const padding = c.Commands.reduce((a: Command, b: Command): Command => {
            return a.Name.length > b.Name.length ? a : b;
        }).Name.length + 4;
        emb.addField(c.Name, 
            `\`\`\`asciidoc\n` + 
            `${c.Commands.map(
                e => `${e.Name}${''.padStart(padding - e.Name.length)}:: ${e.Description}` +
                `${e.Aliases.length > 1 ? `\n[${e.Aliases}]` : ''}`
            ).join('\n')}`+
            `\`\`\``
        );
        //emb.addField(c.Name, `${c.Commands.map(e => `\`${e.Name}${''.padStart(padding - e.Name.length)}::\` ${e.Description}`).join('\n')}`);
        emb.setColor('#00FFFF');
    });
    msg.channel.send(emb);
}