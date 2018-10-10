export default class ResultMessage<T> {
    public IsOk: boolean;
    public Result: T | null;
    public ErrorCode: number | null;
    public Description: string | null;

    constructor(obj: any, c: new(obj: any) => T) {
        this.IsOk = obj['ok'] || null;
        this.Result = new c(obj['result']);
        this.ErrorCode = obj['error_code'] || null;
        this.Description = obj['description'] || null;
    }
}