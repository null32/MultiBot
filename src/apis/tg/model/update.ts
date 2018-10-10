import Message from "./message";
import InlineQuery from "./inlineQuery";
import ChosenInlineResult from "./chosenInlineResult";
import CallbackQuery from "./callbackQuery";

export default class Update {
    public Id: number;
    public Message: Message | null;
    public EditedMessage: Message | null;
    public ChannelPost: Message | null;
    public EditedChannelPost: Message | null;
    public InlineQuery: InlineQuery | null;
    public ChosenInlineResult: ChosenInlineResult | null;
    public CallbackQuery: CallbackQuery | null;
    //Not implemented
    public ShippingQuery: null;
    //Not implemented
    public PreCheckoutQuery: null;

    constructor(obj: any) {
        this.Id = obj['update_id'];
        this.Message = 'message' in obj ? new Message(obj['message']) : null;
        this.EditedMessage = 'edited_message' in obj ? new Message(obj['edited_message']) : null;
        this.ChannelPost = 'channel_post' in obj ? new Message(obj['channel_post']) : null;
        this.EditedChannelPost = 'edited_channel_post' in obj ? new Message(obj['edited_channel_post']) : null;
        this.InlineQuery = 'inline_query' in obj ? new InlineQuery(obj['inline_query']) : null;
        this.ChosenInlineResult = 'chosen_inline_result' in obj ? new ChosenInlineResult(obj['chosen_inline_result']) : null;
        this.CallbackQuery = 'callback_query' in obj ? new CallbackQuery(obj['callback_query']) : null;
        if ('shipping_query' in obj) {
            throw new Error('Not implemented yet');
        }
        if ('pre_checkout_query' in obj) {
            throw new Error('Not implemented yet');
        }
    }
}