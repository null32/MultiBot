import DisBot from "..";
import Command from "../command";
import CommandCategory from "../commandCategory";
import cache from "./cache";

export default class AdminStuff {
    private readonly Bot: DisBot;

    constructor(bot: DisBot) {
        this.Bot = bot;
    }

    public GetCommands() {
        return new CommandCategory('admin',
            new Command('cache', (a, b) => cache(a, b, this.Bot), 'Manage cached files'),
        );
    }
}