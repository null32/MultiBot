import Location from "./location";

export default class Venue {
    public Location: Location;
    public Title: string;
    public Address: string;
    public FoursquareId: string | null;

    constructor(obj: any) {
        this.Location = obj['location'];
        this.Title = obj['title'];
        this.Address = obj['address'];
        this.FoursquareId = obj['foursquare_id'] || null;
    }
}