export default class Contact {
    public PhoneNumber: string;
    public FirstName: string;
    public LastName: string | null;
    public UserId: string | null;

    constructor(obj: any) {
        this.PhoneNumber = obj['phone_number'];
        this.FirstName = obj['first_name'];
        this.LastName = obj['last_name'] || null;
        this.UserId = obj['user_id'] || null;
    }
}