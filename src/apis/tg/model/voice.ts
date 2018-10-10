export default class Voice {
    public Id: string;
    public Duration: number;
    public Mime: string | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Duration = obj['duration'];
        this.Mime = obj['mime_type'] || null;
        this.Size = obj['file_size'] || null;
    }
}