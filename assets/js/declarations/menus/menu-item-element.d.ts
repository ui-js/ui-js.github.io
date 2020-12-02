export declare class UIMenuItemElement extends HTMLElement {
    static get observedAttributes(): string[];
    get checked(): boolean;
    set checked(val: boolean);
    get disabled(): boolean;
    set disabled(val: boolean);
    get active(): boolean;
    set active(val: boolean);
    get type(): string;
    set type(val: string);
    constructor();
}
export default UIMenuItemElement;
declare global {
    /** @internal */
    interface Window {
        UIMenuItemElement: typeof UIMenuItemElement;
    }
}
