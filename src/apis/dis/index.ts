import Discord from "discord.js";

export default class DisApi {
    public Client: Discord.Client;

    constructor(token: string) {
        this.Client = new Discord.Client();
        this.Client.on('ready', () => {
            console.log('Discord bot ready.');
        });
        this.Client.login(token);
        this.Client.on('error', (err) => {
            console.log(`Internal error in discord.js: ${err}`);
        })
    }
}