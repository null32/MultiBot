export default class ChatPhoto {
    public SmallFileId: string;
    public BigFileId: string;

    constructor(obj: any) {
        this.SmallFileId = obj['small_file_id'];
        this.BigFileId = obj['big_file_id'];
    }
}