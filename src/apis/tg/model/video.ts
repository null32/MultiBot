import PhotoSize from "./photoSize";

export default class Video {
    public Id: string;
    public Width: number;
    public Height: number;
    public Duration: number;
    public Thumb: PhotoSize | null;
    public Mime: string | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Width = obj['width'];
        this.Height = obj['height'];
        this.Duration = obj['duration'];
        this.Thumb = 'thumb' in obj ? new PhotoSize(obj['thumb']) : null;
        this.Mime = obj['mime_type'] || null;
        this.Size = obj['file_size'] || null;
    }
}