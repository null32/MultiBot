import { Message } from "discord.js";

export default class Command {
    public Name: string;
    public Aliases: string[];
    private Action: { (msg: Message, args: string[]): void };
    public Description: string | null;

    constructor(name: string | string[], action: { (msg: Message, args: string[]): void }, description: string | undefined = undefined) {
        if (typeof name === 'string') {
            this.Name = name as string;
            this.Aliases = [this.Name];
        } else {
            this.Aliases = name as string[];
            this.Name = this.Aliases[0];
        }
        this.Action = action;
        this.Description = description ? description as string : null;
    }

    public Execute(msg: Message, args: Array<string>): void {
        this.Action(msg, args);
    }

    public CheckName(q: string): boolean {
        return this.Aliases.findIndex(c => c === q) !== -1;
    }
}