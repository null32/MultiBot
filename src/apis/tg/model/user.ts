export default class User {
    public Id: number;
    public IsBot: boolean;
    public FirstName: string;
    public LastName: string | null;
    public Username: string | null;
    public LangCode: string | null;

    constructor(obj: any) {
        this.Id = obj['id'];
        this.IsBot = obj['is_bot'];
        this.FirstName = obj['first_name'];
        this.LastName = obj['last_name'] || null;
        this.Username = obj['username'] || null;
        this.LangCode = obj['language_code'] || null;
    }
}