import User from "./user";

export default class MessageEntity {
    public Type: string;
    public Offset: number;
    public Length: number;
    public Url: string | null;
    public User: User | null;

    constructor(obj: any) {
        this.Type = obj['type'];
        this.Offset = obj['offset'];
        this.Length = obj['length'];
        this.Url = obj['url'] || null;
        this.User = 'user' in obj ? new User(obj['user']) : null;
    }
}