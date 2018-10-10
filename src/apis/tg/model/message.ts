import Audio from "./audio";
import Chat from "./chat";
import Contact from "./contact";
import Documnet from "./document";
import Location from "./location";
import MessageEntity from "./messageEntity";
import PhotoSize from "./photoSize";
import Sticker from "./sticker";
import User from "./user";
import Venue from "./venue";
import Video from "./video";
import VideoNote from "./videoNote";
import Voice from "./voice";

export default class Message {
    /**
     * Unique message identifier inside this chat
     */
    public Id: number;
    /**
     * Sender, empty for messages sent to channels
     */
    public From: User | null;
    /**
     * Date the message was sent in Unix time
     */
    public Date: Date;
    /**
     * Conversation the message belongs to
     */
    public Chat: Chat;
    /**
     * For forwarded messages, sender of the original message
     */
    public ForwardFrom: User | null;
    /**
     * For messages forwarded from channels, information about the original channel
     */
    public ForwardFromChat: Chat | null;
    /**
     * For messages forwarded from channels, identifier of the original message in the channel
     */
    public ForwardFromMessageId: number | null;
    /**
     * For messages forwarded from channels, signature of the post author if present
     */
    public ForwardSignature: string | null;
    /**
     * For forwarded messages, date the original message was sent in Unix time
     */
    public ForwardDate: Date | null;
    /**
     * For replies, the original message.
     * Note that the Message object in this field will not contain further reply_to_message fields even if it itself is a reply
     */
    public ReplyToMessage: Message | null;
    /**
     * Date the message was last edited in Unix time
     */
    public EditDate: Date | null;
    /**
     * The unique identifier of a media message group this message belongs to
     */
    public MediaGroupId: string | null;
    /**
     * Signature of the post author for messages in channels
     */
    public AuthorSignature: string | null;
    /**
     * For text messages, the actual UTF-8 text of the message, 0-4096 characters
     */
    public Text: string | null;
    /**
     * For text messages, special entities like usernames, URLs, bot commands, etc. that appear in the text
     */
    public Entities: Array<MessageEntity>;
    /**
     * For messages with a caption, special entities like usernames, URLs, bot commands, etc. that appear in the caption
     */
    public CaptionEntities: Array<MessageEntity>;
    /**
     * Message is an audio file, information about the file
     */
    public Audio: Audio | null;
    /**
     * Message is a general file, information about the file
     */
    public Document: Documnet | null;
    /**
     * Message is a game, information about the game
     * NOT IMPLEMENTED YET
     */
    public Game: null;
    /**
     * Message is a photo, available sizes of the photo
     */
    public Photo: Array<PhotoSize>;
    /**
     * Message is a sticker, information about the sticker
     */
    public Sticker: Sticker | null;
    /**
     * Message is a video, information about the video
     */
    public Video: Video | null;
    /**
     * Message is a voice message, information about the file
     */
    public Voice: Voice | null;
    /**
     * Message is a video note, information about the video message
     */
    public VideoNote: VideoNote | null;
    /**
     * Caption for the audio, document, photo, video or voice, 0-200 characters
     */
    public Caption: string | null;
    /**
     * Message is a shared contact, information about the contact
     */
    public Contact: Contact | null;
    /**
     * Message is a shared location, information about the location
     */
    public Location: Location | null;
    /**
     * Message is a venue, information about the venue
     */
    public Venue: Venue | null;
    /**
     * New members that were added to the group or supergroup and information about them (the bot itself may be one of these members)
     */
    public NewChatMembers: Array<User>;
    /**
     * A member was removed from the group, information about them (this member may be the bot itself)
     */
    public LeftChatMember: User | null;
    /**
     * A chat title was changed to this value
     */
    public NewChatTitle: string | null;
    /**
     * A chat photo was change to this value
     */
    public NewChatPhoto: Array<PhotoSize>;
    /**
     * Service message: the chat photo was deleted
     */
    public DeleteChatPhoto: boolean;
    /**
     * Service message: the group has been created
     */
    public GroupChatCreated: boolean;
    /**
     * Service message: the supergroup has been created.
     * This field can‘t be received in a message coming through updates, because bot can’t be a member of a supergroup when it is created.
     * It can only be found in reply_to_message if someone replies to a very first message in a directly created supergroup.
     */
    public SupergroupChatCreated: boolean;
    /**
     * Service message: the channel has been created.
     * This field can‘t be received in a message coming through updates, because bot can’t be a member of a channel when it is created.
     * It can only be found in reply_to_message if someone replies to a very first message in a channel.
     */
    public ChannelChatCreated: boolean;
    /**
     * The group has been migrated to a supergroup with the specified identifier.
     */
    public MigrateToChatId: string | null;
    /**
     * The supergroup has been migrated from a group with the specified identifier.
     */
    public MigrateFromChatId: string | null;
    /**
     * Specified message was pinned.
     * Note that the Message object in this field will not contain further reply_to_message fields even if it is itself a reply.
     */
    public PinnedMessage: Message | null;
    /**
     * Message is an invoice for a payment, information about the invoice.
     * NOT IMPLEMENTED YET
     */
    public Invoice: null;
    /**
     * Message is a service message about a successful payment, information about the payment.
     * NOT IMPLEMENTED YET
     */
    public SuccessfulPayment: null;
    /**
     * The domain name of the website on which the user has logged in.
     */
    public ConnectedWebsite: string | null;

    constructor(obj: any) {
        this.Id = obj['message_id'];
        this.From = new User(obj['from']);
        this.Date = new Date(obj['date'] * 1000);
        this.Chat = new Chat(obj['chat']);
        this.ForwardFrom = 'forward_from' in obj ? new User(obj['forward_from']) : null;
        this.ForwardFromChat = 'forward_from_chat' in obj ? new Chat(obj['forward_from_chat']) : null;
        this.ForwardFromMessageId = obj['forward_from_message_id'] || null;
        this.ForwardSignature = obj['forward_signature'] || null;
        this.ForwardDate = 'forward_date' in obj ? new Date(obj['forward_date'] * 1000) : null;
        this.ReplyToMessage = 'reply_to_message' in obj ? new Message(obj['reply_to_message']) : null;
        this.EditDate = 'edit_date' in obj ? new Date(obj['edit_date'] * 1000) : null;
        this.MediaGroupId = obj['media_group_id'] || null;
        this.AuthorSignature = obj['author_signature'] || null;
        this.Text = obj['text'] || null;
        this.Entities = new Array<MessageEntity>();
        if ('entities' in obj) {
            obj['entities'].forEach((el: any) => {
                this.Entities.push(new MessageEntity(el));
            });
        }
        this.CaptionEntities = new Array<MessageEntity>();
        if ('caption_entities' in obj) {
            obj['caption_entities'].forEach((el: any) => {
                this.CaptionEntities.push(new MessageEntity(el));
            });
        }
        this.Audio = 'audio' in obj ? new Audio(obj['audio']) : null;
        this.Document = 'document' in obj ? new Documnet(obj['document']) : null;
        if ('game' in obj) {
            throw new Error('Not implemented yet');
        }
        this.Photo = new Array<PhotoSize>();
        if ('photo' in obj) {
            obj['photo'].forEach((el: any) => {
                this.Photo.push(new PhotoSize(el));
            });
        }
        this.Sticker = 'sticker' in obj ? new Sticker(obj['sticker']) : null;
        this.Video = 'video' in obj ? new Video(obj['video']) : null;
        this.Voice = 'voice' in obj ? new Voice(obj['voice']) : null;
        this.VideoNote = 'video_note' in obj ? new VideoNote(obj['video_note']) : null;
        this.Caption = obj['caption'] || null;
        this.Contact = 'contact' in obj ? new Contact(obj['contact']) : null;
        this.Location = 'location' in obj ? new Location(obj['location']) : null;
        this.Venue = 'venue' in obj ? new Venue(obj['venue']) : null;
        this.NewChatMembers = new Array<User>();
        if ('new_chat_members' in obj) {
            obj['new_chat_members'].forEach((el: any) => {
                this.NewChatMembers.push(new User(el));
            });
        }
        this.LeftChatMember = 'left_chat_member' in obj ? new User(obj['left_chat_member']) : null;
        this.NewChatTitle = obj['new_chat_title'] || null;
        this.NewChatPhoto = new Array<PhotoSize>();
        if ('new_chat_photo' in obj) {
            obj['new_chat_photo'].forEach((el: any) => {
                this.NewChatPhoto.push(new PhotoSize(el));
            });
        }
        this.DeleteChatPhoto = 'delete_chat_photo' in obj;
        this.GroupChatCreated = 'group_chat_created' in obj;
        this.SupergroupChatCreated = 'supergroup_chat_created' in obj;
        this.ChannelChatCreated = 'channel_chat_created' in obj;
        this.MigrateToChatId = obj['migrate_to_chat_id'] || null;
        this.MigrateFromChatId = obj['migrate_from_chat_id'] || null;
        this.PinnedMessage = 'pinned_message' in obj ? new Message(obj['pinned_message']) : null;
        if ('invoice' in obj) {
            throw new Error('Not implemented yet');
        }
        if ('successful_payment' in obj) {
            throw new Error('Not implemented yet');
        }
        this.ConnectedWebsite = obj['connected_website'] || null;
    }
}