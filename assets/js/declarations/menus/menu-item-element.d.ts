import { UIElement } from '../common/ui-element';
import { MenuItem } from './menu-base';
/**
 * Each `UIMenuItemElement` is wrapped inside a `<li>` tag.
 * A `UIMenuItemElement` represents the label part of a menu item.
 * Other elements such as the checkmark and the submenu indicator
 * are rendered by the menu container.
 */
export declare class UIMenuItem extends UIElement {
    private _menuItem?;
    get menuItem(): MenuItem | undefined;
    set menuItem(value: MenuItem | undefined);
    constructor();
}
export default UIMenuItem;
declare global {
    /** @internal */
    export interface Window {
        UIMenuItem: typeof UIMenuItem;
    }
}
