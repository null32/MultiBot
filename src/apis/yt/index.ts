import fetch from "node-fetch";
import { Readable } from "stream";
import ytdl from 'ytdl-core';
import CachedFile from "../../cachedFile";
import { YT_HOST } from "../../constants";
import FileManager from "../../fileManager";
import Video from "./model/video";

export default class YTApi {
    private Token: string;
    private FileMgr: FileManager;

    constructor(token: string, fm: FileManager) {
        this.Token = token;
        this.FileMgr = fm;
    }

    /**
     * Search for a video
     * @param q Search query
     */
    public async Search(q: string): Promise<Array<Video>> {
        let resp = await this.MakeRequest('search', { part: ['id'], type: ['video'], q: q, maxResults: 50 });
        resp = await this.MakeRequest('videos', {
            part: ['id', 'snippet', 'contentDetails'],
            id: resp['items'].map((e: any) => e['id']['videoId'])
        });

        let res = new Array<Video>();
        resp['items'].forEach((item: any) => {
            res.push(new Video(item));
        });

        return res;
    }

    public async GetById(id: string): Promise<Video> {
        let resp = await this.MakeRequest('videos', { part: ['id', 'snippet', 'contentDetails'], id: [id] });
        return new Video(resp['items'][0]);
    }

    /**
     * Get videos from playlist
     * @param id Playlist id
     * @param maxItems How many items to receive (def: 100)
     */
    public async GetPlaylist(id: string, maxItems = 100): Promise<Array<Video>> {
        let itemsRecieved = 0;
        let itemsTotal = maxItems;
        let res = new Array<Video>();
        let pageToken: string | null = null;
        let params: RequestParams = {
            part: ['id', 'snippet'],
            playlistId: id,
            maxResults: 50
        }

        try {
            do {
                if (pageToken) {
                    params.pageToken = pageToken;
                }
                let resp = await this.MakeRequest('playlistItems', params);                
    
                itemsRecieved += resp['pageInfo']['resultsPerPage'];
                itemsTotal = resp['pageInfo']['totalResults'] < maxItems ? resp['pageInfo']['totalResults'] : maxItems;
                pageToken = resp['nextPageToken'] ? resp['nextPageToken'] : null;
                resp = await this.MakeRequest('videos', { part: ['id', 'snippet', 'contentDetails'], id: resp['items'].map((e: any) => e['snippet']['resourceId']['videoId']) });
    
                resp['items'].forEach((item: any) => {
                    res.push(new Video(item));
                });
            } while (itemsRecieved < itemsTotal)
        } catch (err) {
            console.log(err);
        }

        return res;
    }

    /**
     * Get `Readable` for video
     * @param id Video url or id
     */
    public StreamVideo(id: string): Readable {
        return ytdl(id, { filter: 'audioonly' });
    }

    /**
     * Download video to cache
     * @param {string} url Video indenifier, can be one of theese:
     * ```
     * 'https://www.youtube.com/watch?v=RSX2o7EhtcE' Direct url
     * 'https://youtu.be/RSX2o7EhtcE' Short url
     * 'RSX2o7EhtcE' Id only```
     */
    public async CacheVideo(url: string): Promise<CachedFile> {
        const prefixes = [
            'https://youtu.be/',
            'https://www.youtube.com/watch?v='
        ]
        let id: string | null = null;
        for (const pref of prefixes) {
            if (url.startsWith(pref)) {
                id = url.slice(pref.length);
                break;
            }
        }

        if (!id) {
            id = url;
        }

        return await this.FileMgr.DownloadYT(id, 60 * 60 * 2);
    }


    /**
     * Make an api request
     * @param method Api method name
     * @param params Arguments that are being passed in url
     */
    private MakeRequest(method: string, params: RequestParams): Promise<any> {
        let url = `${YT_HOST}${method}?key=${this.Token}`;

        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const val = params[key];
                if (typeof val === 'string' || typeof val === 'number') {
                    url += `&${key}=${escape(val.toString())}`;
                } else if (val instanceof Array) {
                    url += `&${key}=${escape(val.join(','))}`;
                }
            }
        }

        return fetch(url).then(resp => {
            return resp.json();
        });
    }
}

type RequestParams = {
    [key: string]: string[] | string | number | undefined,
    part: string[],
    id?: string[],
    q?: string,
    playlistId?: string,
    type?: string[],
    maxResults?: number,
    pageToken?: string,
}