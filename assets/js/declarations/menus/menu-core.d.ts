import { KeyboardModifiers } from '../common/events';
import { UIElement } from '../common/ui-element';
import { MenuInterface, MenuItem, RootMenuInterface } from './menu-base';
import { UIMenuItem } from './menu-item-element';
import { UISubmenu } from './submenu-element';
export declare type MenuItemTemplate = {
    onSelect?: (ev: CustomEvent<MenuSelectEvent>) => void;
    type?: 'normal' | 'divider' | 'submenu' | 'checkbox' | 'radio';
    className?: string;
    label?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    ariaLabel?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    ariaDetails?: string | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string);
    submenu?: MenuItemTemplate[];
    hidden?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    disabled?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    checked?: boolean | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean);
    /** Caller defined id string. Passed to the `onSelect()` hook. */
    id?: string;
    /** Caller defined data block. Passed to the `onSelect()` hook. */
    data?: any;
};
/**
 * An instance of `Menu` is a model of a collection of menu items, including
 * submenus.
 *
 *
 */
export declare class Menu implements MenuInterface {
    parentMenu: MenuInterface | null;
    isSubmenuOpen: boolean;
    /**
     * The Element from which menu items will be used as template (optional)
     */
    menuHost?: Element;
    hasCheckbox: boolean;
    hasRadio: boolean;
    protected _element: HTMLElement | null;
    protected _menuItems: MenuItem[];
    private _activeMenuItem;
    private _menuItemsTemplate;
    /**
     * Optional, an HTML element to be used as the container for this menu.
     * Used when this maps to a custom element with a <ul> in its template.
     */
    protected _assignedContainer?: HTMLElement | null;
    /**
     * - host: if the menu is inside an element, the host is this element.
     * This is where a set of <ui-menu-item> elements will be read from.
     * - assignedContainer: the element into which the menu items will be
     * inserted. A <ul>. Could be in a custom element. If none is provided,
     * a new <ul> is created.
     * - wrapper: an element that wraps the container. This elements
     * gets attached to the scrim for display. If none is provided,
     * the container is used directly. Pass the custom element when
     * a custom element wrapper is used (e.g. for <ui-submenu>)
     */
    constructor(menuItems?: MenuItemTemplate[], options?: {
        parentMenu?: MenuInterface;
        host?: Element;
        assignedContainer?: HTMLElement | null;
    });
    handleEvent(event: Event): void;
    get rootMenu(): RootMenuInterface;
    dispatchEvent(ev: Event): boolean;
    /**
     * Update the 'model' of this menu (i.e. list of menu items) based
     * on:
     * - the state of the keyboard, for programmatically specified items
     * - the content of the JSON and elements inside the host element
     * (if there is one)
     */
    updateMenu(keyboardModifiers?: KeyboardModifiers): void;
    get menuItems(): MenuItem[];
    set menuItemTemplates(value: MenuItemTemplate[]);
    /** First activable menu item */
    get firstMenuItem(): MenuItem | null;
    /** Last activable menu item */
    get lastMenuItem(): MenuItem | null;
    /**
     * The active menu is displayed on a colored background.
     */
    get activeMenuItem(): MenuItem | null;
    /**
     * Set to undefined to have no active item.
     * Note that setting the active menu item doesn't automatically
     * open the submenu (e.g. when keyboard navigating).
     * Call `item.submenu.openSubmenu()` to open the submenu.
     */
    set activeMenuItem(value: MenuItem | null);
    nextMenuItem(dir: number): MenuItem | null;
    static _collator: Intl.Collator;
    static get collator(): Intl.Collator;
    findMenuItem(text: string): MenuItem | null;
    makeElement(container?: HTMLElement | null): HTMLElement;
    /**
     * Construct (or return a cached version) of an element representing
     * the items in this menu (model -> view)
     */
    get element(): HTMLElement;
    /**
     * @param parent: where the menu should be attached
     * @return false if no menu to show
     */
    show(options: {
        parent: Node;
        location?: [x: number, y: number];
        alternateLocation?: [x: number, y: number];
        keyboardModifiers?: KeyboardModifiers;
    }): boolean;
    hide(): void;
    /**
     * This method is called to record that one of our submenus has opened.
     * To open a submenu call openSubmenu() on the item with the submenu
     * or show() on the submenu.
     */
    set openSubmenu(submenu: MenuInterface | null);
    appendMenuItem(menuItem: MenuItemTemplate | UIMenuItem, keyboardModifiers?: KeyboardModifiers): void;
    insertMenuItem(pos: number, menuItem: MenuItemTemplate | UIMenuItem, keyboardModifiers?: KeyboardModifiers): void;
}
export declare function evalToBoolean(item: MenuItemTemplate, value: boolean | undefined | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => boolean), keyboardModifiers?: KeyboardModifiers): boolean | undefined;
export declare function evalToString(item: MenuItemTemplate, value: string | undefined | ((item: MenuItemTemplate, keyboardModifiers?: KeyboardModifiers) => string), options?: {
    keyboardModifiers?: KeyboardModifiers;
}): string | undefined;
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
    export interface DocumentEventMap {
        ['select']: CustomEvent<MenuSelectEvent>;
    }
}
export declare class MenuItemFromTemplate extends MenuItem {
    _type: 'normal' | 'divider' | 'submenu' | 'checkbox' | 'radio';
    _label?: string;
    _disabled: boolean;
    _hidden: boolean;
    ariaLabel?: string;
    ariaDetails?: string;
    checked?: boolean;
    onSelect?: (ev: CustomEvent<MenuSelectEvent>) => void;
    submenu?: MenuInterface;
    id?: string;
    data?: any;
    _element: HTMLElement | null;
    constructor(template: MenuItemTemplate, parentMenu: MenuInterface, options?: {
        keyboardModifiers?: KeyboardModifiers;
    });
    get type(): 'normal' | 'divider' | 'submenu' | 'checkbox' | 'radio';
    get label(): string;
    get hidden(): boolean;
    get disabled(): boolean;
    private render;
    get active(): boolean;
    set active(value: boolean);
    get element(): HTMLElement | null;
    dispatchSelect(kbd?: KeyboardModifiers): void;
}
export declare class MenuItemFromElement extends MenuItem {
    _sourceElement: UIElement;
    _sourceElementClone?: UIElement;
    _cachedElement: HTMLElement | null;
    constructor(element: UIMenuItem, parentMenu: MenuInterface);
    get type(): 'normal' | 'divider' | 'submenu' | 'checkbox' | 'radio';
    get label(): string;
    get hidden(): boolean;
    set hidden(value: boolean);
    get disabled(): boolean;
    set disabled(value: boolean);
    get checked(): boolean;
    set checked(value: boolean);
    get divider(): boolean;
    set divider(value: boolean);
    get active(): boolean;
    set active(value: boolean);
    private render;
    get element(): HTMLElement | null;
    dispatchSelect(kbd?: KeyboardModifiers): void;
}
export declare class Submenu extends Menu {
    source: UISubmenu;
    constructor(options: {
        host: UISubmenu;
        parentMenu: MenuInterface;
    });
    get element(): HTMLElement;
    show(options?: {
        location?: [x: number, y: number];
        keyboardModifiers?: KeyboardModifiers;
    }): boolean;
    /**
     */
    hide(): void;
}
