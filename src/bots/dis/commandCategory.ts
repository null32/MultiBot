import Command from "./command";

export default class CommandCategory {
    public readonly Commands: Array<Command>;
    public readonly Name: string

    constructor(name: string, ...comms: Array<Command>) {
        this.Name = name;
        this.Commands = new Array<Command>(...comms);
    }
}