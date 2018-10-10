export default class MaskPosition {
    public Point: string;
    public XShift: number;
    public YShift: number;
    public Scale: number;

    constructor(obj: any) {
        this.Point = obj['point'];
        this.XShift = obj['x_shift'];
        this.YShift = obj['y_shift'];
        this.Scale = obj['scale'];
    }
}