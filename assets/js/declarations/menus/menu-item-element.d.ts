import { UIElement } from '../common/ui-element';
import { MenuItem } from './menu-base';
/**
 * Each `UIMenuItemElement` is wrapped inside a `<li>` tag.
 * A `UIMenuItemElement` represents the label part of a menu item.
 * Other elements such as the checkmark and the submenu indicator
 * are rendered by the menu container.
 */
export declare class UIMenuItemElement extends UIElement {
    private _menuItem;
    set menuItem(value: MenuItem);
    get menuItem(): MenuItem;
    constructor();
}
export default UIMenuItemElement;
declare global {
    /** @internal */
    export interface Window {
        UIMenuItemElement: typeof UIMenuItemElement;
    }
}
