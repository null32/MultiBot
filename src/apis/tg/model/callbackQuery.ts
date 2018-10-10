import User from "./user";
import Message from "./message";

export default class CallbackQuery {
    public Id: string;
    public From: User;
    public Message: Message | null;
    public InlineMessageId: string | null;
    public ChatInstance: string;
    public Data: string | null;
    public GameShortName: string | null;

    constructor(obj: any) {
        this.Id = obj['id'];
        this.From = new User(obj['from']);
        this.Message = 'message' in obj ? new Message(obj['message']) : null;
        this.InlineMessageId = obj['inline_message_id'] || null;
        this.ChatInstance = obj['chat_instance'];
        this.Data = obj['data'] || null;
        this.GameShortName = obj['game_short_name'] || null;
    }
}