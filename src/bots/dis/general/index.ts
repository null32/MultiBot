import CommandCategory from "../commandCategory";
import ping from "./ping";
import Command from "../command";
import info from "./info";
import del from "./del";
import help from "./help";
import DisBot from "..";

export default class GeneralStuff {
    private Bot: DisBot;

    constructor(bot: DisBot) {
        this.Bot = bot;
    }

    public GetCommands() {
        return new CommandCategory('general',
            new Command('ping', (a) => ping(a, this.Bot), 'Test, if bot works'),
            new Command('info', (a, b) => info(a, b), 'Display information about user'),
            new Command('del', (a, b) => del(a, b, this.Bot), 'Delete messages in text channel'),
            new Command('help', (a, b) => help(a, b, this.Bot), 'Show help'),
        );
    }
}