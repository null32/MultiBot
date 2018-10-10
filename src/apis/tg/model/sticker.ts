import PhotoSize from "./photoSize";
import MaskPosition from "./MaskPosition";

export default class Sticker {
    public Id: string;
    public Width: number;
    public Height: number;
    public Thumb: PhotoSize | null;
    public Emoji: string | null;
    public SetName: string | null;
    public MaskPosition: MaskPosition | null;
    public Size: number | null;

    constructor(obj: any) {
        this.Id = obj['file_id'];
        this.Width = obj['width'];
        this.Height = obj['height'];
        this.Thumb = 'thumb' in obj ? new PhotoSize(obj['thumb']) : null;
        this.Emoji = obj['emoji'] || null;
        this.SetName = obj['set_name'] || null;
        this.MaskPosition = 'mask_position' in obj ? new MaskPosition(obj['mask_position']) : null;
        this.Size = obj['file_size'] || null;
    }
}