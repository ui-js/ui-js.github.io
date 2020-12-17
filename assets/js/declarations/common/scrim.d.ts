export declare class Scrim {
    private _element;
    private dismissOnClick;
    private onHide;
    private savedOverflow;
    private savedMarginRight;
    private savedActiveElement;
    private state;
    private translucent;
    /**
     * - If `options.dismissOnClick` is true, the scrim is dismissed if the
     * user clicks on the scrim. That's the behavior for menus, for example.
     * - `onHide()` is called when the scrim is being hidden
     * -
     */
    constructor(options?: {
        translucent?: boolean;
        dismissOnClick?: boolean;
        onHide?: () => void;
    });
    get element(): HTMLElement;
    show(options: {
        root?: Node;
        child?: HTMLElement;
    }): void;
    hide(): void;
    handleEvent(ev: Event): void;
}
export declare function getOppositeEffectivePos(pos: number, length: number, placement: 'start' | 'end' | 'middle' | 'left' | 'right' | 'top' | 'bottom', dir: 'ltr' | 'rtl'): number;
/**
 * Set the position of the element so that it fits in the viewport.
 *
 * The element is first positioned at `location`.
 * If it overflows and there is an alternate location, use the alternate
 * location to fit the topright at the alternate location.
 *
 * If the element still overflows, adjust its location moving it up and to the
 * left as necessary until it fits (and adjusting its width/height as a result)
 */
export declare function fitInViewport(el: HTMLElement, options: {
    location: [x: number, y: number];
    alternateLocation?: [x: number, y: number];
    verticalPos: 'bottom' | 'top' | 'middle' | 'start' | 'end';
    horizontalPos: 'left' | 'right' | 'middle' | 'start' | 'end';
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
}): void;
