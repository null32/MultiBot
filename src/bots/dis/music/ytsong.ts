import Song from "./song";
import Video from "../../../apis/yt/model/video";

export default class SongYT extends Song {
    public Title: string;    
    public Duration: number;
    public Url: string;
    
    public Src: Video;

    constructor(obj: Video) {
        super();

        this.Title = obj.Title;
        this.Duration = obj.Duration;
        this.Url = `https://www.youtube.com/watch?v=${obj.Id}`;
        this.Src = obj;
    }
}