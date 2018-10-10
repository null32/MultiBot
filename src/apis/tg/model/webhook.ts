export default class Webhook {
    public Url: string | null;
    public HasCustomCert: boolean;
    public PendingUpdateCount: number;
    public LastErrorDate: Date | null;
    public LastErrorMsg: string | null;
    public MaxConnections: number | null;
    public AllowedUpdates: Array<string>;

    constructor(obj: any) {
        this.Url = obj['url'] || null;
        this.HasCustomCert = obj['has_custom_certificate'] || false;
        this.PendingUpdateCount = obj['pending_update_count'] || 0;
        this.LastErrorDate = 'last_error_date' in obj ? new Date(obj['last_error_date'] * 1000) : null;
        this.LastErrorMsg = obj['last_error_message'] || null;
        this.MaxConnections = obj['max_connections'] || null;
        this.AllowedUpdates = obj['allowed_updates'] || new Array<string>();
    }
}