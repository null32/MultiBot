import { existsSync, writeFileSync, readFileSync } from "fs";

class Config {
    public HOST: string = `example.com`;
    public HOST_URL: string = `${this.HOST}/multibot`

    public CACHE_PATH: string = `cache`;
    public CACHE_URL: string = '/cache';

    public MONGO_URL: string  = `mongodb://localhost:27017/`;
    public MONGO_DB_NAME: string = `MultiBot`;

    public TG_BOT_TOKEN: string = ``;
    public TG_HOST_URL: string = `/hooks/tg`;
    public TG_HOOK_URL: string = `https://${this.HOST_URL}${this.TG_HOST_URL}`;

    public DIS_TOKEN: string = ``;
    public DIS_PREFIX: string = `&`;
    public DIS_ADMIN: string = ``;

    public YT_TOKEN: string = ``;
    public YT_HOST: string = `https://www.googleapis.com/youtube/v3/`;
}

if (!existsSync('./config.json')) {
    writeFileSync('./config.json', JSON.stringify(new Config(), null, 4));
    console.error('Setup ./config.json');
    process.exit(-1);
}
const config: Config = JSON.parse(readFileSync('./config.json').toString());

export const HOST: string = config.HOST;       //Fancy name of host
export const HOST_URL: string = config.HOST_URL; //For use behind reverse proxy

export const CACHE_PATH: string = config.CACHE_PATH;
export const CACHE_URL: string = config.CACHE_URL;

export const MONGO_URL: string  = config.MONGO_URL;
export const MONGO_DB_NAME: string = config.MONGO_DB_NAME;

export const TG_BOT_TOKEN: string = config.TG_BOT_TOKEN;
export const TG_HOST_URL: string = config.TG_HOST_URL;
export const TG_HOOK_URL: string = config.TG_HOOK_URL;

export const DIS_TOKEN: string = config.DIS_TOKEN;
export const DIS_PREFIX: string = config.DIS_PREFIX;
export const DIS_ADMIN: string = config.DIS_ADMIN;

export const YT_TOKEN: string = config.YT_TOKEN;
export const YT_HOST: string = config.YT_HOST;