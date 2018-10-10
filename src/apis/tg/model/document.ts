import PhotoSize from "./photoSize";

export default class Documnet {
    public Id: string;
    public Thumb: PhotoSize | null;
    public Name: string | null;
    public Mime: string | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Thumb = 'thumb' in obj ? new PhotoSize(obj['thumb']) : null;
        this.Name = obj['file_name'] || null;
        this.Mime = obj['mime_type'] || null;
        this.Size = obj['file_size'] || null;
    }
}