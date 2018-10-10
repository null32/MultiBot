export default class Video {
    public Id: string;
    public PublishedAt: Date;
    public Title: string;
    public Description: string;
    public Duration: number;

    public ChannelTitle: string;
    public ChannelId: string;

    public ThumbNails: {
        [key: string]: Thumb | undefined,
        'default': Thumb,
        'medium'?: Thumb,
        'high'?: Thumb,
        'standard'?: Thumb,
        'maxres'?: Thumb
    }

    constructor(obj: any) {
        this.Id = obj['id'];

        let contentDetails = obj['contentDetails'];
        this.Duration = ((shit: string) => {
            let res = 0;
            shit = shit.slice(2);
            let token = '';

            for (let i = 0; i < shit.length; i++) {
                if (shit.charCodeAt(i) >= 48 && shit.charCodeAt(i) <= 57) {
                    token += shit[i];
                    continue;
                }

                switch (shit[i].toLowerCase()) {
                    case 'h':
                        res += parseInt(token) * 3600;
                        break;
                    case 'm':
                        res += parseInt(token) * 60;                    
                        break;
                    case 's':
                        res += parseInt(token);
                        break
                }
                token = '';
            }
            return res;
        })(contentDetails['duration']);

        let snippet = obj['snippet'];
        this.PublishedAt = new Date(snippet['publishedAt']);
        this.Title = snippet['title'];
        this.Description = snippet['description'];

        this.ChannelTitle = snippet['channelTitle'];
        this.ChannelId = snippet['channelId'];

        this.ThumbNails = { default: { url: '', width: 0, height: 0 } };
        for (const key in snippet['thumbnails']) {
            if (snippet['thumbnails'].hasOwnProperty(key)) {
                const element = snippet['thumbnails'][key];

                this.ThumbNails[key] = {
                    url: element['url'],
                    width: element['width'],
                    height: element['height']
                }
            }
        }
    }
}

type Thumb = {
    url: string,
    width: number,
    height: number,
}