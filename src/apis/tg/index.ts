import FormData from 'form-data';
import fetch from 'node-fetch';
import { Stream } from 'stream';
import Message from './model/message';
import ResultMessage from './model/resultMessage';
import User from './model/user';
import Webhook from './model/webhook';

class TgApi {
    private RequestUrl: string;
    constructor(token: string) {
        this.RequestUrl = `https://api.telegram.org/bot${token}/`;
    }

    /**
     * A simple method for testing your bot's auth token.
     * @returns Returns basic information about the bot in form of a `User` object.
     */
    public GetMe(): Promise<User> {
        return this.GetData('getMe', User);
    }
    /**
     * Use this method to get current webhook status.
     * @returns On success, returns a `WebhookInfo` object.
     */
    public GetWebHookInfo(): Promise<Webhook> {
        return this.GetData('getWebhookInfo', Webhook);
    }
    /**
     * Use this method to remove webhook integration if you decide to switch back to `getUpdates`.
     * @returns Returns `True` on success.
     */
    public DeleteWebHook(): Promise<Boolean> {
        return this.SetData('deleteWebhook', null, Boolean);
    }
    /**
     * Use this method to specify a url and receive incoming updates via an outgoing webhook.
     * @param url HTTPS url to send updates to. Use an empty string to remove webhook integration.
     * @returns Returns `True` on success.
     */
    public SetWebHook(url: string): Promise<Boolean> {
        return this.SetData('setWebhook', { url: url }, Boolean);
    }
    /**
     * Use this method to send text messages.
     * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`).
     * @param text Text of the message to be sent.
     * @param parseMode Send `Markdown` or `HTML`, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in your bot's message.
     * @param disableWebPreview Disables link previews for links in this message.
     * @param disableNotification Sends the message silently. Users will receive a notification with no sound.
     * @param replyToMessageId If the message is a reply, ID of the original message.
     * @returns On success, the sent Message is returned.
     */
    public SendMessage(
        chatId: string,
        text: string,
        parseMode?: string,
        disableWebPreview = false,
        disableNotification = false,
        replyToMessageId?: number): Promise<Message> {
        var params = {
            chat_id: chatId,
            text: text
        };
        if (parseMode) {
            params = Object.assign(params, { parse_mode: parseMode });
        }
        if (disableWebPreview) {
            params = Object.assign(params, { disable_web_page_preview: true });
        }
        if (disableNotification) {
            params = Object.assign(params, { disable_notification: true });
        }
        if (replyToMessageId) {
            params = Object.assign(params, { reply_to_message_id: replyToMessageId });
        }
        return this.SetData('sendMessage', params, Message);
    }
    /**
     * Use this method to forward messages of any kind.
     * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`).
     * @param fromChatId Unique identifier for the chat where the original message was sent (or channel username in the format `@channelusername`).
     * @param msgId Message identifier in the chat specified in `fromChatId`.
     * @param disableNotification Sends the message silently. Users will receive a notification with no sound.
     * @returns On success, the sent Message is returned.
     */
    public ForwardMessage(
        chatId: string,
        fromChatId: string,
        msgId: number,
        disableNotification = false): Promise<Message> {
        var params = {
            chat_id: chatId,
            from_chat_id: fromChatId,
            message_id: msgId
        };
        if (disableNotification) {
            params = Object.assign(params, { disable_notification: true });
        }
        return this.SetData('forwardMessage', params, Message);
    }
    /**
     * Use this method to send photos.
     * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`).
     * @param photo Photo to send. 
     * Pass a file_id as String to send a photo that exists on the Telegram servers (recommended), 
     * pass an HTTP URL as a String for Telegram to get a photo from the Internet, 
     * or upload a new photo
     * @param caption Photo caption (may also be used when resending photos by file_id), 0-200 characters.
     * @param parseMode Send `Markdown` or `HTML`, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in the media caption.
     * @param disableNotification Sends the message silently. Users will receive a notification with no sound.
     * @param replyToMessageId If the message is a reply, ID of the original message.
     * @returns On success, the sent Message is returned.
     */
    public SendPhoto(
        chatId: string,
        photo: string | Stream,
        caption?: string,
        parseMode?: string,
        disableNotification?: string,
        replyToMessageId?: string): Promise<Message> {
        var params: any = {
            chat_id: chatId
        };
        if (caption) {
            params = Object.assign(params, { caption: caption });
        }
        if (parseMode) {
            params = Object.assign(params, { parse_mode: parseMode });
        }
        if (disableNotification) {
            params = Object.assign(params, { disable_notification: true });
        }
        if (replyToMessageId) {
            params = Object.assign(params, { reply_to_message_id: replyToMessageId });
        }
        if (typeof photo === 'string') {
            params = Object.assign(params, { photo: photo });
            return this.SetData('sendPhoto', params, Message);
        }

        var form = new FormData();
        for (const name in params) {
            form.append(name, params[name]);
        }
        form.append('photo', photo as Stream);

        return this.SetDataForm('sendPhoto', form, Message);
    }
    /**
     * Use this method to send audio files, if you want Telegram clients to display them in the music player.
     * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`).
     * @param audio Audio file to send. 
     * Pass a file_id as String to send an audio file that exists on the Telegram servers (recommended), 
     * pass an HTTP URL as a String for Telegram to get an audio file from the Internet, 
     * or upload a new one
     * @param caption Audio caption, 0-200 characters.
     * @param parseMode Send `Markdown` or `HTML`, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in the media caption.
     * @param duration Duration of the audio in seconds.
     * @param performer Performer.
     * @param title Track name.
     * @param disableNotification Sends the message silently. Users will receive a notification with no sound.
     * @param replyToMessageId If the message is a reply, ID of the original message.
     * @returns On success, the sent `Message` is returned.
     */
    public SendAudio(
        chatId: string, 
        audio: string | Stream, 
        caption?: string, 
        parseMode?: string, 
        duration?: number, 
        performer?: string, 
        title?: string, 
        disableNotification = false, 
        replyToMessageId?: number): Promise<Message> {
        let params: any = {
            chat_id: chatId
        };
        if (caption) {
            params = Object.assign(params, { caption: caption });
        }
        if (parseMode) {
            params = Object.assign(params, { parse_mode: parseMode });
        }
        if (disableNotification) {
            params = Object.assign(params, { disable_notification: true });
        }
        if (replyToMessageId) {
            params = Object.assign(params, { reply_to_message_id: replyToMessageId });
        }
        if (duration) {
            params = Object.assign(params, { duration: duration });
        }
        if (performer) {
            params = Object.assign(params, { performer: performer });
        }
        if (title) {
            params = Object.assign(params, { title: title });
        }
        if (typeof audio === 'string') {
            params = Object.assign(params, { audio: audio });
            return this.SetData('sendAudio', params, Message);
        }

        var form = new FormData();
        for (const name in params) {
            form.append(name, params[name]);
        }
        form.append('audio', audio as Stream);

        return this.SetDataForm('sendAudio', form, Message);
    }
    /**
     * Use this method to send general files. 
     * @param chatId Unique identifier for the target chat or username of the target channel (in the format `@channelusername`)
     * @param document File to send. 
     * Pass a file_id as String to send a file that exists on the Telegram servers (recommended), 
     * pass an HTTP URL as a String for Telegram to get a file from the Internet, 
     * or upload a new one. 
     * @param caption Document caption (may also be used when resending documents by `file_id`), 0-200 characters.
     * @param parseMode Send `Markdown` or `HTML`, if you want Telegram apps to show bold, italic, fixed-width text or inline URLs in the media caption.
     * @param disableNotification Sends the message silently. Users will receive a notification with no sound.
     * @param replyToMessageId If the message is a reply, ID of the original message.
     * @returns On success, the sent `Message` is returned.
     */
    public SendDocument(
        chatId: string,
        document: string | Stream,
        caption?: string,
        parseMode?: string,
        disableNotification?: string,
        replyToMessageId?: string): Promise<Message> {
        var params: any = {
            chat_id: chatId
        };
        if (caption) {
            params = Object.assign(params, { caption: caption });
        }
        if (parseMode) {
            params = Object.assign(params, { parse_mode: parseMode });
        }
        if (disableNotification) {
            params = Object.assign(params, { disable_notification: true });
        }
        if (replyToMessageId) {
            params = Object.assign(params, { reply_to_message_id: replyToMessageId });
        }
        if (typeof document === 'string') {
            params = Object.assign(params, { document: document });
            return this.SetData('sendDocument', params, Message);
        }

        var form = new FormData();
        for (const name in params) {
            form.append(name, params[name]);
        }
        form.append('document', document as Stream);

        return this.SetDataForm('sendDocument', form, Message);
    }

    private GetData<T>(methodName: string, t: new (obj: any) => T): Promise<T> {
        return fetch(this.RequestUrl + methodName, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then((resp) => {
            return resp.json();
        }).then((json) => {
            var res = new ResultMessage<T>(json, t);
            if (!res.IsOk) {
                console.error(JSON.stringify(res, null, 2));
                throw new Error(res.Description as string);
            }
            return res.Result as T;
        });
    }
    private SetData<T>(methodName: string, data: any, t: new (obj: any) => T): Promise<T> {
        return fetch(this.RequestUrl + methodName, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then((resp) => {
            return resp.json();
        }).then((json) => {
            var res = new ResultMessage<T>(json, t);
            if (!res.IsOk) {
                console.error(JSON.stringify(res, null, 2));
                throw new Error(res.Description as string);
            }
            return res.Result as T;
        });
    }
    private SetDataForm<T>(methodName: string, data: FormData, t: new (obj: any) => T): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            data.submit(this.RequestUrl + methodName, (err, resp) => {
                if (err) {
                    return reject(err);
                }
                let body = '';
                resp.on('data', chunk => {
                    body += chunk.toString();
                });
                resp.on('end', () => {
                    resolve(new ResultMessage<T>(JSON.parse(body), t).Result as T);
                });
            });
        });
    }
}

export default TgApi;