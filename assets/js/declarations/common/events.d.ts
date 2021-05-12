export declare type KeyboardModifiers = {
    alt: boolean;
    control: boolean;
    shift: boolean;
    meta: boolean;
};
export declare class LongPressDetector {
    static DELAY: number;
    private readonly onLongPress;
    private readonly startPoint?;
    private lastPoint?;
    private timer;
    constructor(triggerEvent: Event, onLongPress: () => void);
    dispose(): void;
    handleEvent(event: Event): void;
}
export declare function eventLocation(evt: Event): [x: number, y: number] | undefined;
export declare function eventPointerCount(evt: Event): number;
/**
 * When the potential start of a long press event (`pointerdown`)
 * event is detected, this function will invoke the `fn` callback if the
 * user performs a long press.
 */
export declare function onLongPress(triggerEvent: Event, fn: () => void): void;
export declare function keyboardModifiersFromEvent(ev: Event): KeyboardModifiers;
export declare function equalKeyboardModifiers(a?: KeyboardModifiers, b?: KeyboardModifiers): boolean;
export declare function mightProducePrintableCharacter(evt: KeyboardEvent): boolean;
