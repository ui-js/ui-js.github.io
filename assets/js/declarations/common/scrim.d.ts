export declare class Scrim {
    private _element?;
    private readonly preventOverlayClose;
    private readonly onClose?;
    private savedOverflow?;
    private savedMarginRight?;
    private savedActiveElement?;
    private state;
    private readonly translucent;
    /**
     * - If `options.preventOverlayClose` is false, the scrim is closed if the
     * user clicks on the scrim. That's the behavior for menus, for example.
     * When you need a fully modal situation until the user has made an
     * explicit choice (validating cookie usage, for example), set
     * `preventOverlayClose` to true.
     * - `onClose()` is called when the scrim is being closed
     * -
     */
    constructor(options?: {
        translucent?: boolean;
        preventOverlayClose?: boolean;
        onClose?: () => void;
    });
    get element(): HTMLElement;
    open(options: {
        root?: Node | null;
        child?: HTMLElement;
    }): void;
    close(): void;
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
export declare function fitInViewport(element: HTMLElement, options: {
    location: [x: number, y: number];
    alternateLocation?: [x: number, y: number];
    verticalPos: 'bottom' | 'top' | 'middle' | 'start' | 'end';
    horizontalPos: 'left' | 'right' | 'middle' | 'start' | 'end';
    width?: number;
    height?: number;
    maxWidth?: number;
    maxHeight?: number;
}): void;
