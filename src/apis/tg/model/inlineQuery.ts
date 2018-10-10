import User from "./user";
import Location from "./location";

export default class InlineQuery {
    public Id: string;
    public From: User;
    public Location: Location | null;
    public Query: string;
    public Offset: string;

    constructor(obj: any) {
        this.Id = obj['id'];
        this.From = new User(obj['from']);
        this.Location = 'location' in obj ? new Location(obj['location']) : null;
        this.Query = obj['query'];
        this.Offset = obj['offset'];
    }
}