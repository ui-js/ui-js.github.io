import { KeyboardModifiers } from '../common/events';
import { Menu, MenuItemTemplate } from './menu-core';
import { MenuInterface, RootMenuInterface } from './menu-base';
export declare class RootMenu extends Menu implements RootMenuInterface {
    lastMoveEvent?: PointerEvent;
    private typingBufferResetTimer;
    private typingBuffer;
    private readonly _scrim;
    private _openTimestamp?;
    private currentKeyboardModifiers?;
    private hysteresisTimer;
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
     * If an `options.assignedElement` is provided, the root menu is
     * attached to that element (the element will be modified
     * to display the menu). Use this when using a popup menu.
     * In this mode, call `show()` and `hide()` to control the
     * display of the menu.
     *
     */
    constructor(menuItems: MenuItemTemplate[], options?: {
        host?: Element;
        assignedElement?: HTMLElement | null;
        keyboardModifiers?: KeyboardModifiers;
    });
    /**
     * The currently active menu: could be the root menu or a submenu
     */
    get activeMenu(): MenuInterface;
    handleKeyupEvent(ev: KeyboardEvent): void;
    handleKeydownEvent(ev: KeyboardEvent): void;
    handleEvent(event: Event): void;
    dispatchEvent(ev: Event): boolean;
    get scrim(): Element;
    private connectScrim;
    private disconnectScrim;
    get rootMenu(): RootMenu;
    show(options?: {
        location?: [x: number, y: number];
        alternateLocation?: [x: number, y: number];
        parent?: Node | null;
        keyboardModifiers?: KeyboardModifiers;
    }): boolean;
    hide(): void;
    scheduleOperation(fn: () => void): void;
    cancelDelayedOperation(): void;
    /**
     * Delay (in milliseconds) before displaying a submenu.
     * Prevents distracting "flashing" of submenus when moving through the
     * options in a menu.
     */
    get submenuHysteresis(): number;
}
