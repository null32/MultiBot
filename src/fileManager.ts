import fs, { WriteStream } from 'fs';
import http from 'http';
import https from 'https';
import { MongoClient } from 'mongodb';
import { clearInterval, setInterval } from 'timers';
import ytdl from 'ytdl-core';
import CachedFile from './cachedFile';
import { MONGO_DB_NAME, MONGO_URL } from './constants';

export default class FileManager {
    private Path: string;
    private UrlAlias: string;
    private Mongo?: MongoClient;
    private Cleaner?: NodeJS.Timer;

    constructor(localPath: string, urlAlias: string) {
        this.Path = localPath;
        this.UrlAlias = urlAlias;

        let parts = localPath.split('/');
        localPath = '';
        while (parts.length > 0) {
            localPath += (parts.shift() as string) + (parts.length > 0 ? '/' : '');
            if (!fs.existsSync(localPath)) {
                fs.mkdirSync(localPath);
            }
        }
    }

    public async Init() {
        this.Mongo = await MongoClient.connect(MONGO_URL, { useNewUrlParser: true });
        
        await this.CleanOld();
        this.Cleaner = setInterval(() => this.CleanOld(), 1000 * 60 * 60); //1 hour

    }

    public async Destroy() {
        if (this.Cleaner) {
            clearInterval(this.Cleaner);
        }
        if (this.Mongo) {
            await this.Mongo.close();
        }
    }

    /**
     * Downloads remote resource and stores it in cache
     * @param url Remote resource address
     * @param ext Remote resource extention
     * @param lifeTime How long to keep it in cache (seconds)
     */
    public async DownloadFile(url: string, ext: string, lifeTime: number, callback: { (done: number, total: number): void } | undefined = undefined): Promise<CachedFile> {
        return this.Download(url, ext, lifeTime, 0, callback);
    }

    /**
     * Download video from youtube as audio
     * USE **SHOULD** THIS ONLY THROUGH YT API
     * @param url YouTube video id
     * @param lifeTime How long to keep in cache (seconds)
     */
    public async DownloadYT(url: string, lifeTime: number): Promise<CachedFile> {
        let res: CachedFile | null;
        if (res = await this.FindFile(`yt://${url}`)) {
            return res;
        }

        await new Promise((resolve) => {
            let fws = fs.createWriteStream(res!.LocalPath);
            fws.on('close', () => {
                resolve();
            });
            ytdl(url, { filter: 'audioonly' }).pipe(fws);
        });
        res = new CachedFile(`yt://${url}`, this.Path, this.UrlAlias, 'webm', 0, lifeTime);
        res.Size = fs.statSync(res.LocalPath).size;

        this.DBAddFile(res);
        return res;
    }

    /**
     * Get cached files
     * @returns Files stored in local cache
     */
    public async DBGetFiles(): Promise<Array<CachedFile>> {
        if (!this.Mongo) {
            throw new Error('Call Init() before using FileManager');
        }

        let coll = this.Mongo.db(MONGO_DB_NAME).collection('CachedFiles');
        return coll.find().toArray();
    }

    /**
     * Removes file from disk and DB
     * @param file File to remove
     */
    public async RemoveFile(file: CachedFile): Promise<void> {
        if (fs.existsSync(file.LocalPath)) {
            fs.unlinkSync(file.LocalPath);
        }
        await this.DBRemFile(file);
    }

    /**
     * Check DB for a file by it's original url
     * @param origUrl Original url of remote resource
     */
    public async FindFile(origUrl: string): Promise<CachedFile | null> {
        if (!this.Mongo) {
            throw new Error('Call Init() before using FileManager');
        }

        let coll = this.Mongo.db(MONGO_DB_NAME).collection('CachedFiles');
        let res = await coll.find({ OriginalUrl: origUrl }, { projection: { '_id': false } }).toArray();
        return res.length > 0 ? res[0] : null;
    }

    /**
     * Actually downloads the file
     * @param file File to process
     * @param redirCount Amount of 302 response codes passed
     */
    private async Download(url: string, ext: string, lifeTime: number, redirCount: number, callback: { (done: number, total: number): void } | undefined = undefined): Promise<CachedFile> {
        let cached = await this.FindFile(url);
        if (cached) {
            //TODO: update file lifetime
            if (callback) {
                callback(cached.Size, cached.Size);
            }
            return cached;
        }

        let file = await new Promise<CachedFile>((resolve, reject) => {
            if (redirCount > 10) {
                reject('Too many redirects');
            }

            let fws: WriteStream | null = null;
            let sz = 0;
            let down = http.get;
            let result: CachedFile;

            if (url.startsWith('https://')) {
                down = https.get;
            }

            if (url.startsWith('http')) {
                let request = down(url, (resp) => {
                    if (!resp) {
                        reject(`Can\'t download ${url}`);
                    }

                    switch (resp.statusCode) {
                        case 200:
                            sz = parseInt(resp.headers['content-length'] as string);
                            break;
                        case 301:
                        case 302:
                            request.abort();
                            resolve(this.Download(resp.headers['location']!, ext, lifeTime, redirCount + 1));
                            break;
                        case 404:
                        default:
                            request.abort();
                            //console.log(`Failed ${resp.statusCode} to download file: ${file.OriginalUrl}`);
                            reject(`Failed ${resp.statusCode} to download file: ${url}`);
                    }

                    resp.on('data', chunk => {
                        if (!fws) {
                            result = new CachedFile(url, this.Path, this.UrlAlias, ext, sz, lifeTime);
                            fws = fs.createWriteStream(result.LocalPath);
                        }

                        done += (chunk as Buffer).length;
                        fws.write(chunk);
                    });

                    resp.on('end', () => {
                        if (fws) {
                            fws.close();
                        }
                        if (callback) {
                            clearInterval(timer);
                            callback(sz, sz);
                        }
                        resolve(result);
                    });

                    let timer: NodeJS.Timer;
                    let done = 0;
                    if (callback) {
                        timer = setInterval(() => callback(done, sz), 2500);
                    }
                });
                request.on('error', (err) => {
                    reject(err);
                });
            } else {
                reject("Unsupported protocol");
            }
        });

        if (file.OriginalUrl === url) {
            await this.DBAddFile(file);
        }
        return file;
    }

    /**
     * Register file in database
     * @param file File to register
     */
    private async DBAddFile(file: CachedFile) {
        if (!this.Mongo) {
            throw new Error('Call Init() before using FileManager');
        }

        let coll = this.Mongo.db(MONGO_DB_NAME).collection('CachedFiles');
        await coll.insertOne(file);
    }

    /**
     * Removes file from the database
     * @param file File to remove
     */
    private async DBRemFile(file: CachedFile) {
        if (!this.Mongo) {
            throw new Error('Call Init() before using FileManager');
        }

        let coll = this.Mongo.db(MONGO_DB_NAME).collection('CachedFiles');
        await coll.deleteOne(file);
    }

    /**
     * Cleans local cache from old files
     */
    private async CleanOld(): Promise<void> {
        let files = await this.DBGetFiles();
        const today = new Date();
        for (let item of files) {
            if (today > item.DeleteAfter) {
                await this.RemoveFile(item);
            }
        }
    }
}