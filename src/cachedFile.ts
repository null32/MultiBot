import shortid from 'shortid';
import { HOST_URL } from "./constants";

export default class CachedFile {
    public OriginalUrl: string;
    public WebUrl: string;

    public Name: string;
    public LocalPath: string;
    
    public Size: number;

    public CreatedAt: Date;
    public DeleteAfter: Date;

    constructor(url: string, cachePath: string, urlAlias: string, ext: string, size: number, lifeTime: number) {
        this.Name = `${shortid.generate()}.${ext}`;
        this.OriginalUrl = url;

        this.LocalPath = `${cachePath}/${this.Name}`;
        this.WebUrl = `https://${HOST_URL}${urlAlias}/${this.Name}`;

        this.Size = size;

        this.CreatedAt = new Date();
        this.DeleteAfter = new Date((this.CreatedAt.getTime() / 1000 + lifeTime) * 1000);
    }
}