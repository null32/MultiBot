import ChatPhoto from "./chatPhoto";
import Message from "./message";

export default class Chat {
    /**
     * Unique identifier for this chat.
     */
    public Id: string;
    /**
     * Type of chat, can be either “private”, “group”, “supergroup” or “channel”
     */
    public Type: string;
    /**
     * Title, for supergroups, channels and group chats
     */
    public Title: string | null;
    /**
     * Username, for private chats, supergroups and channels if available
     */
    public Username: string | null;
    /**
     * First name of the other party in a private chat
     */
    public FirstName: string | null;
    /**
     * Last name of the other party in a private chat
     */
    public LastName: string | null;
    /**
     * True if a group has ‘All Members Are Admins’ enabled.
     */
    public AllAdmins: boolean;
    /**
     * Chat photo.
     * Returned only in `getChat`.
     */
    public Photo: ChatPhoto | null;
    /**
     * Description, for supergroups and channel chats.
     * Returned only in `getChat`.
     */
    public Description: string | null;
    /**
     * Chat invite link, for supergroups and channel chats.
     * Returned only in `getChat`.
     */
    public InviteLink: string | null;
    /**
     * Pinned message, for supergroups and channel chats.
     * Returned only in `getChat`.
     */
    public PinnedMessage: Message | null;
    /**
     * For supergroups, name of group sticker set.
     * Returned only in `getChat`.
     */
    public StickerSetName: string | null;
    /**
     * True, if the bot can change the group sticker set.
     * Returned only in `getChat`.
     */
    public CanSetStickerSet: boolean;

    constructor(obj: any) {
        this.Id = obj['id'];
        this.Type = obj['type'];
        this.Title = obj['title'] || null;
        this.Username = obj['username'] || null;
        this.FirstName = obj['first_name'] || null;
        this.LastName = obj['last_name'] || null;
        this.AllAdmins = 'all_members_are_administrators' in obj;
        this.Photo = 'photo' in obj ? new ChatPhoto(obj['photo']) : null;
        this.Description = obj['description'] || null;
        this.InviteLink = obj['invite_link'] || null;
        this.PinnedMessage = 'pinned_message' in obj ? new Message(obj['pinned_message']) : null;
        this.StickerSetName = obj['sticker_set_name'] || null;
        this.CanSetStickerSet = 'can_set_sticker_set' in obj;
    }
}