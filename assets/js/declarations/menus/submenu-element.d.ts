import { UIElement } from '../common/ui-element';
/**
 * Use `<ui-submenu>` as a child of a `<ui-menuitem>`.
 *
 * This element is used as a "template" for a submenu when a
 * menu is displayed: it displays nothing by itself.
 *
 * It can include a `<style>` tag.
 */
export declare class UISubmenuElement extends UIElement {
    constructor();
}
export default UISubmenuElement;
declare global {
    /** @internal */
    export interface Window {
        UISubmenuElement: typeof UISubmenuElement;
    }
}
