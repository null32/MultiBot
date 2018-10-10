export default class Location {
    public Longitude: number;
    public Latitude: number;

    constructor(obj: any) {
        this.Longitude = obj['longitude'];
        this.Latitude = obj['latitude'];
    }
}