import { KeyboardModifiers } from '../common/events';
/**
 * Base class to represent a menu item.
 * There are two subclasses:
 * - MenuItemFromTemplate for menu items created from a JSON template
 * - MenuItemFromElement for menu items created for a UIMenuItem
 */
export declare abstract class MenuItem {
    parentMenu: MenuInterface;
    submenu?: MenuInterface;
    constructor(parentMenu: MenuInterface);
    handleEvent(event: Event): void;
    abstract get type(): 'normal' | 'divider' | 'submenu' | 'checkbox' | 'radio';
    abstract get active(): boolean;
    abstract get hidden(): boolean;
    abstract get disabled(): boolean;
    abstract get label(): string;
    abstract set active(val: boolean);
    abstract dispatchSelect(kbd?: KeyboardModifiers): void;
    abstract get element(): HTMLElement;
    /**
     * Called when a menu item is selected:
     * - either dismiss the menu and execute the command
     * - or display the submenu
     */
    select(kbd?: KeyboardModifiers): void;
    /**
     * Open the submenu of this menu item, with a delay if options.delay
     * This delay improves targeting of submenus with the mouse.
     */
    openSubmenu(kbd: KeyboardModifiers, options?: {
        withDelay: boolean;
    }): void;
    movingTowardSubmenu(ev: PointerEvent): boolean;
}
export interface MenuInterface {
    parentMenu: MenuInterface;
    readonly rootMenu: RootMenuInterface;
    readonly element: HTMLElement;
    readonly isSubmenuOpen: boolean;
    activeMenuItem: MenuItem;
    readonly firstMenuItem: MenuItem;
    readonly lastMenuItem: MenuItem;
    openSubmenu: MenuInterface;
    readonly hasRadio: boolean;
    readonly hasCheckbox: boolean;
    hide(): void;
    show(options: {
        parent: Node;
        location?: [x: number, y: number];
        alternateLocation?: [x: number, y: number];
        keyboardModifiers?: KeyboardModifiers;
    }): void;
    nextMenuItem(dir: number): MenuItem;
    findMenuItem(text: string): MenuItem;
    dispatchEvent(ev: Event): boolean;
}
export interface RootMenuInterface extends MenuInterface {
    lastMoveEvent: PointerEvent;
    activeMenu: MenuInterface;
    state: 'closed' | 'open' | 'modal';
    readonly scrim: Element;
    cancelDelayedOperation(): void;
    scheduleOperation(op: () => void): void;
}
