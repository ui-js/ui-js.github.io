import { KeyboardModifiers } from '../common/events';
import { UIElement } from '../common/ui-element';
import { MenuItemTemplate } from './menu-core';
/**
 * This web component display a contextual menu when the user performs the
 * appropriate gesture (right-click, control+click, shift+F10, etc...),
 * handles the user interaction to navigate the items in the menu and submenus
 * and either invoke the `onSelect()` hook associated with the selected menu item
 * or dispatches a 'select' event when the user completes their selection.
 *
 * Place this element inside a container and the contextual menu will be
 * displayed when a right-click/control+click/long tap is performed in the
 * container or if the container is keyboard focused when shift+f10 is pressed.
 * In the former case, the menu is diplayed where the click/tap occured.
 * In the later case, the menu is displayed in the center of the parent container.
 *
 * This component is:
 * - screen-reader compatible
 * - keyboard navigable
 * - dark-theme aware
 * - responsive (the menu and submenus will attempt to avoid being displayed
 *   outside of the viewport boundary)
 *
 * Principles of Operation
 *
 * The content of a menu (menu items and submenus) is represented by a 'model',
 * an instance of the Menu class.
 * The model is created from:
 * - argument to the UIContextMenuElement constructor
 * - setting the `menuItems` property
 * - a `<script>` tag containing a JSON description of menu items
 * - a set of child `<ui-menu-item>` elements.
 *
 * A menu can also have a `<style>` tag, which is applied to style the menu
 * once it is open.
 *
 * The `<ui-context-menu>` and its child elements are kept hidden.
 *
 * When the menu is invoked (with `show()`) a scrim element is created
 * and added as a child of the `<ui-context-menu>`, and a new `<ul>` element
 * is created and attached as a child of the scrim.
 *
 * A set of `<li>` element is added as children of the `<ul>` element, one
 * for each visible menu item, whether this menu item was specified in
 * JSON or with a `<menu-item>` element. The `<li>` element are made of
 * the following components:
 * - a checkmark (optional)
 * - a text label (as a text node, if specified from JSON or as a cloned
 * `UIMenuItemElement` if specified from the `<ui-menu-item>`)
 * - a submenu indicator
 *
 */
export declare class UIContextMenuElement extends UIElement {
    private rootMenu;
    private templateMenuItems;
    private longPressDetector;
    constructor(menuItems?: MenuItemTemplate[]);
    set menuItems(menuItems: MenuItemTemplate[]);
    get menuItems(): MenuItemTemplate[];
    /**
     * @internal
     */
    handleEvent(event: Event): void;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    connectedCallback(): void;
    /**
     * Custom elements lifecycle hooks
     * @internal
     */
    disconnectedCallback(): void;
    /**
     * @internal
     */
    focus(): void;
    /**
     * Display the menu at the specified location.
     * If provided, the `keyboardModifiers` option can change what commands
     * are visible, enabled, or what their label is.
     *
     * The contextual menu is shown automatically when the appropriate UI gesture
     * is performed by the user (right-click, shift+F10, etc...). This method
     * only needs to be called to trigger the menu manually (for example to
     * trigger it on click of an item).
     */
    show(options?: {
        location?: [x: number, y: number];
        keyboardModifiers?: KeyboardModifiers;
    }): void;
    /**
     * Hide the menu.
     *
     * The visibility of the menu is typically controlled by the user
     * interaction: the menu is automatically hidden if the user release the
     * mouse button, or after having selected a command. This is a manual
     * override that should be very rarely needed.
     */
    hide(): void;
}
export default UIContextMenuElement;
declare global {
    /** @internal */
    export interface Window {
        UIContextMenuElement: typeof UIContextMenuElement;
    }
}
