import Song from "./song";
import CachedFile from "../../../cachedFile";
import { GetAudioInfo, AudioInfo } from "../../../util";

export default class SongFile extends Song {
    public Url: string;
    public get Title() {
        return this.Info ? `${this.Info.artist} - ${this.Info.title}` : this.Src.OriginalUrl;
    }
    public get Duration() {
        return this.Info ? this.Info.duration : -1;
    }

    public Path: string;
    private Info: AudioInfo | undefined;
    private Src: CachedFile;

    public constructor(obj: CachedFile) {
        super();

        this.Url = obj.OriginalUrl;
        this.Path = obj.LocalPath;
        this.Src = obj;

        GetAudioInfo(obj.LocalPath).then(info => this.Info = info);
    }
}