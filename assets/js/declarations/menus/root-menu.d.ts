import { Menu, MenuItemTemplate, KeyboardModifiers } from './menu-core';
export declare class RootMenu extends Menu {
    lastMouseEvent: MouseEvent;
    private typingBufferResetTimer;
    private typingBuffer;
    private _scrim;
    private _openTimestamp;
    private previousActiveElement;
    private currentKeyboardModifiers;
    private hysteresisTimer;
    /**
     * The host is used to dispatch events from
     */
    private _host;
    /**
     * - 'closed': the menu is not visible
     * - 'open': the menu is visible as long as the mouse button is pressed
     * - 'modal': the menu is visible until dismissed, even with the mouse button
     * released
     */
    state: 'closed' | 'open' | 'modal';
    /** If true, the state of some of the menu items in this menu are
     * provide by a function and may need to be updated dynamically
     */
    isDynamic: boolean;
    /**
     * If an `options.element` is provided, the root menu is
     * attached to that element (the element will be modified
     * to display the menu). Use this when using a popup menu.
     * In this mode, call `show()` and `hide()` to control the
     * display of the menu.
     *
     * Otherwise, if `options.element` is undefined, use `.element` to get
     * back an element representing the menu, and attach this element where
     * appropriate. Use this when displaying the menu inline.
     */
    constructor(menuItems?: MenuItemTemplate[], options?: {
        root?: Node;
        host?: Element;
        keyboardModifiers?: KeyboardModifiers;
        assignedElement?: HTMLElement;
    });
    get host(): Element;
    /**
     * The currently active menu: could be the root menu or a submenu
     */
    get activeMenu(): Menu;
    handleKeyupEvent(ev: KeyboardEvent): void;
    handleKeydownEvent(ev: KeyboardEvent): void;
    handleMouseMoveEvent(event: MouseEvent): void;
    handleEvent(event: Event): void;
    private get scrim();
    private connectScrim;
    private disconnectScrim;
    get rootMenu(): RootMenu;
    show(options?: {
        clientX?: number;
        clientY?: number;
        parent?: Node;
        keyboardModifiers?: KeyboardModifiers;
    }): boolean;
    hide(): void;
    scheduleOperation(fn: () => void): void;
    cancelDelayedOperation(): void;
    get submenuHysteresis(): number;
}
