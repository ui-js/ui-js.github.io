import { UIMenuItemElement } from './menu-item-element';
import { RootMenu } from './root-menu';
export declare const MENU_TEMPLATE: HTMLTemplateElement;
export declare const MENU_STYLE: HTMLTemplateElement;
export declare type KeyboardModifiers = {
    alt: boolean;
    control: boolean;
    shift: boolean;
    meta: boolean;
};
export declare type MenuItemTemplate = {
    onSelect?: (ev: CustomEvent<MenuSelectEvent>) => void;
    type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    className?: string;
    label?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    ariaLabel?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    ariaDetails?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    submenu: MenuItemTemplate[];
    hidden?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    disabled?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    checked?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    /** Caller defined id string. Passed to the `onSelect()` hook. */
    id?: string;
    /** Caller defined data block. Passed to the `onSelect()` hook.*/
    data?: any;
};
/**
 * An instance of `Menu` is a collection of menu items, including submenus.
 */
export declare class Menu {
    parentMenu: Menu;
    protected _element: HTMLElement;
    protected _menuItems: MenuItem[];
    private _activeMenuItem;
    isSubmenuOpen: boolean;
    hasCheckbox: boolean;
    hasRadio: boolean;
    private _menuItemsTemplate;
    /**
     * Optional, an HTML element to be used as the container for this menu.
     * Used when this maps to a custom element with a <ul> in its template.
     */
    private _assignedContainer;
    constructor(menuItems?: MenuItemTemplate[], options?: {
        parentMenu?: Menu;
        assignedContainer?: HTMLElement;
    });
    get rootMenu(): RootMenu;
    get host(): Element;
    updateMenu(keyboardModifiers?: KeyboardModifiers): void;
    get menuItems(): MenuItem[];
    /** First activable menu item */
    get firstMenuItem(): MenuItem;
    /** Last activable menu item */
    get lastMenuItem(): MenuItem;
    /**
     * The active menu is displayed on a colored background.
     */
    get activeMenuItem(): MenuItem;
    /**
     * Set to undefined to have no active item.
     * Note that setting the active menu item doesn't automatically
     * open the submenu (e.g. when keyboard navigating).
     * Call `item.submenu.openSubmenu()` to open the submenu.
     */
    set activeMenuItem(value: MenuItem);
    nextMenuItem(dir: number): MenuItem;
    static _collator: Intl.Collator;
    static get collator(): Intl.Collator;
    findMenuItem(text: string): MenuItem;
    get element(): HTMLElement;
    /**
     * @param parent: where the menu should be attached
     * @return false if no menu to show
     */
    show(options?: {
        parent: Node;
        clientX?: number;
        clientY?: number;
        keyboardModifiers?: KeyboardModifiers;
    }): boolean;
    hide(): void;
    /**
     * This method is called to record that one of our submenus has opened.
     * To open a submenu call openSubmenu() on the item with the submenu
     * or show() on the submenu.
     */
    set openSubmenu(submenu: Menu);
    appendMenuItem(menuItem: MenuItemTemplate | UIMenuItemElement, keyboardModifiers: KeyboardModifiers): void;
    insertMenuItem(pos: number, menuItem: MenuItemTemplate | UIMenuItemElement, keyboardModifiers: KeyboardModifiers): void;
}
export declare function keyboardModifiersFromEvent(ev: MouseEvent | KeyboardEvent): KeyboardModifiers;
export declare function distance(dx: number, dy: number): number;
export declare function evalToBoolean(item: MenuItemTemplate, value: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean), keyboardModifiers?: KeyboardModifiers): boolean;
export declare function evalToString(item: MenuItemTemplate, value: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string), options: {
    keyboardModifiers?: KeyboardModifiers;
}): string;
export declare function equalKeyboardModifiers(a: KeyboardModifiers, b: KeyboardModifiers): boolean;
export declare function mightProducePrintableCharacter(evt: KeyboardEvent): boolean;
export declare type MenuSelectEvent = {
    keyboardModifiers?: KeyboardModifiers;
    id?: string;
    label?: string;
    data?: any;
    element?: HTMLElement;
};
declare global {
    /**
     * Map the custom event names to types
     * @internal
     */
    interface DocumentEventMap {
        ['select']: CustomEvent<MenuSelectEvent>;
    }
}
/**
 * Base class to represent a menu item.
 * There are two subclasses:
 * - MenuItemFromTemplate for menu items created from a JSON template
 * - MenuItemFromElement for menu items created for a UIMenuItemElement
 */
export declare abstract class MenuItem {
    parentMenu: Menu;
    submenu?: Menu;
    constructor(parentMenu: Menu);
    handleEvent(event: Event): void;
    abstract get type(): 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    abstract get active(): boolean;
    abstract get hidden(): boolean;
    abstract get disabled(): boolean;
    abstract get label(): string;
    abstract set active(val: boolean);
    abstract dispatchSelect(kbd?: KeyboardModifiers): void;
    abstract get element(): HTMLElement;
    get host(): Element;
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
    movingTowardSubmenu(ev: MouseEvent): boolean;
}
export declare class MenuItemFromTemplate extends MenuItem {
    _type: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    _label?: string;
    _disabled: boolean;
    _hidden: boolean;
    className?: string;
    ariaLabel?: string;
    ariaDetails?: string;
    checked?: boolean;
    onSelect?: (ev: CustomEvent<MenuSelectEvent>) => void;
    submenu?: Menu;
    id?: string;
    data?: any;
    _element: HTMLElement;
    constructor(template: MenuItemTemplate, parentMenu: Menu, options?: {
        keyboardModifiers?: KeyboardModifiers;
    });
    get type(): "normal" | "separator" | "submenu" | "checkbox" | "radio";
    get label(): string;
    get hidden(): boolean;
    get disabled(): boolean;
    private render;
    get active(): boolean;
    set active(val: boolean);
    get element(): HTMLElement;
    dispatchSelect(kbd?: KeyboardModifiers): void;
}
export declare class MenuItemFromElement extends MenuItem {
    _sourceElement: HTMLElement;
    _sourceElementClone: HTMLElement;
    _cachedElement: HTMLElement;
    constructor(element: HTMLElement, parentMenu: Menu);
    get type(): 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    get label(): string;
    get hidden(): boolean;
    set hidden(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    get checked(): boolean;
    set checked(value: boolean);
    get separator(): boolean;
    set separator(value: boolean);
    get active(): boolean;
    set active(val: boolean);
    private render;
    get element(): HTMLElement;
    dispatchSelect(kbd?: KeyboardModifiers): void;
}
