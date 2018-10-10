import User from "./user";
import Location from "./location";

export default class ChosenInlineResult {
    public ResultId: string;
    public From: User;
    public Location: Location | null;
    public InlineMessageId: string | null;
    public Query: string;

    constructor(obj: any) {
        this.ResultId = obj['result_id'];
        this.From = new User(obj['from']);
        this.Location = 'location' in obj ? new Location(obj['location']) : null;
        this.InlineMessageId = obj['inline_message_id'] || null;
        this.Query = obj['query'];
    }
}