import { Message, User, RichEmbed } from "discord.js";

export default async (msg: Message, args: Array<string>) => {
    let targetUser: User;
    if (args.length < 1) {
        targetUser = msg.author;
    } else {
        let name = args.shift() as string;
        let guild = await msg.guild.fetchMembers(name, 1);
        let members = guild.members.map((v, k) => v).filter(c => c.displayName.includes(name));
        if (members.length === 0) {
            msg.channel.send('❌ Unknown user');
            return;
        }
        targetUser = members[0].user;
    }

    var em = new RichEmbed();
    em.setAuthor(`${msg.guild.me.displayName}`, 'https://skycolor.space/logo.png', 'https://skycolor.space/');
    em.setImage(targetUser.displayAvatarURL);
    em.setColor('RANDOM');
    em.setDescription(`Information about <@${targetUser.id}>`);
    em.setTitle('User info');
    em.addField('Registration date', targetUser.createdAt.toDateString(), true);
    em.addField('Id', `\`${targetUser.id}\``, true);
    em.addField('Presence', targetUser.presence.status, true);
    em.addField('Tag', targetUser.tag, true);
    em.addField('Roles', (await msg.guild.fetchMember(targetUser)).roles.filter(c => c.name !== '@everyone').map(c => `${c.name}`).join(', '), true);
    em.setFooter('"yiff me, daddy" (c)');
    msg.channel.send(em);
}