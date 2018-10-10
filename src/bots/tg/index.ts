import * as fs from 'fs';
import Update from "../../apis/tg/model/update";
import TelegramApi from "../../apis/tg";
import Message from '../../apis/tg/model/message';
import { TG_HOOK_URL } from '../../constants';

export default class Bot {
    private TgApi: TelegramApi;

    constructor(tgApi: TelegramApi) {
        this.TgApi = tgApi;
    }

    public async Init() {
        var hook = await this.TgApi.GetWebHookInfo();
        if (hook.Url !== TG_HOOK_URL) {
            var res = this.TgApi.DeleteWebHook();
            if (res) {
                res = this.TgApi.SetWebHook(TG_HOOK_URL);
                if (res) {
                    console.log("Successfuly set webhook for tg");
                }
            }
        } else {
            console.log(`Hook for tg is already set: ${JSON.stringify(hook, null, 2)}`);
        }
    }

    public Handle(upd: Update): void {
        //console.log(JSON.stringify(upd, null, 2));
        fs.appendFileSync('tg.log', `${new Date().toString()}\n${JSON.stringify(upd, null, 2)}\n`);

        if (upd.Message) {
            const msg = upd.Message as Message;
            if (msg.Text) {
                this.TgApi.SendMessage(msg.Chat.Id, 'got it', undefined, false, false, msg.Id);
            } 
        }
    }
}