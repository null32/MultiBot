import PhotoSize from "./photoSize";

export default class VideoNote {
    public Id: string;
    public Length: number;
    public Duration: number;
    public Thumb: PhotoSize | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Length = obj['length'];
        this.Duration = obj['duration'];
        this.Thumb = 'thumb' in obj ? new PhotoSize(obj['thumb']) : null;
        this.Size = obj['file_size'] || null;
    }
}