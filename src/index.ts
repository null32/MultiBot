import express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import DiscordApi from './apis/dis';
import TelegramApi from './apis/tg';
import Update from './apis/tg/model/update';
import DiscordBot from './bots/dis';
import TelegramBot from './bots/tg';
import * as Constants from './constants';
import FileManager from './fileManager';
import YTApi from './apis/yt';
import { createInterface } from 'readline';

const REVERSE_PROXY = true;

async function main() {
    const app = express();
    app.use(express.json());

    let serv: https.Server | http.Server;
    if (REVERSE_PROXY) {
        serv = http.createServer(app);
    } else {
        const options: https.ServerOptions = {
            key: fs.readFileSync('/etc/letsencrypt/live/skycolor.space/privkey.pem'),
            cert: fs.readFileSync('/etc/letsencrypt/live/skycolor.space/fullchain.pem')
        };
        serv = https.createServer(options, app);
    }


    function logReq(req: express.Request, res: express.Response, method: string) {
        var logStr = `[\t${method}@${new Date().toString()}\n\tip: ${req.ip}\n\turl: ${req.url}\n]\n`;
        fs.appendFileSync('main.log', logStr);
    }

    app.get('/*', (req, res, next) => {
        logReq(req, res, 'GET');
        next();
    });
    app.post('/*', (req, res, next) => {
        logReq(req, res, 'POST');
        next();
    })
    app.get('/', (req, res) => {
        res.send('Someday i\'ll put website here');
    });

    app.use(express.static('static'));
    app.use(Constants.CACHE_URL, express.static(Constants.CACHE_PATH));

    const tgApi = new TelegramApi(Constants.TG_BOT_TOKEN);
    const disApi = new DiscordApi(Constants.DIS_TOKEN);
    const fm = new FileManager(Constants.CACHE_PATH, Constants.CACHE_URL);
    await fm.Init();
    const ytApi = new YTApi(Constants.YT_TOKEN, fm);

    const tgBot = new TelegramBot(tgApi);
    const disBot = new DiscordBot(Constants.DIS_PREFIX, disApi.Client, fm, ytApi);

    tgBot.Init();
    disBot.Init();

    app.post(Constants.TG_HOST_URL, (req, res) => {
        res.status(200);
        res.send('ok');
        tgBot.Handle(new Update(req.body));
    });

    let port = REVERSE_PROXY ? 80 : 443;
    if (process.argv.length > 2) {
        let temp = parseInt(process.argv[2]);
        if (temp) {
            port = temp;
        }
    }
    serv.listen(port, () => {
        console.log(`MultiBot running on port ${port}`);
    });

    let rl = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Press Enter to stop\n', () => {
        serv.close(() => {
            console.log('Web Server stopped');
        })
        fm.Destroy();
        disApi.Client.destroy().then(() => {
            console.log('Discord client stopped');
        });
        rl.close();
    })
}
main();