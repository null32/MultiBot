export default class Audio {
    public Id: string;
    public Duration: number;
    public Performer: string | null;
    public Title: string | null;
    public Mime: string | null;
    public Size: string | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Duration = obj['duration'];
        this.Performer = obj['performer'] || null;
        this.Title = obj['title'] || null;
        this.Mime = obj['mime_type'] || null;
        this.Size = obj['file_size'] || null;
    }
}