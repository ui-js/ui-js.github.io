import { UIElement } from '../common/ui-element';
import { KeyboardModifiers } from '../common/events';
import { MenuItemTemplate } from './menu-core';
export declare class UIPopupMenu extends UIElement {
    position: 'leading' | 'trailing' | 'left' | 'end';
    private rootMenu?;
    private templateMenuItems;
    private _savedTransform?;
    constructor(menuItems?: MenuItemTemplate[]);
    get menuItems(): MenuItemTemplate[];
    set menuItems(menuItems: MenuItemTemplate[]);
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
export default UIPopupMenu;
declare global {
    /** @internal */
    export interface Window {
        UIPopupMenu: typeof UIPopupMenu;
    }
}
