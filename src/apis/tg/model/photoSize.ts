export default class PhotoSize {
    public Id: string;
    public Width: number | null;
    public Height: number | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Width = obj['width'] || null;
        this.Height = obj['height'] || null;
        this.Size = obj['file_size'] || null;
    }
}