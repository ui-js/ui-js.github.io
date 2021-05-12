export { UIContextMenu, UIPopupMenu, UISubmenu } from './menus/menus';
/**
 * To insure that all the web components are ready to use, and in particular
 * that custom methods on web components can be called, use:
 * ```
 * try {
 *  await ready();
 * // Ready to use the web components...
 * } catch (e) {
 *  // web components are not supported
 * }
 * ```
 *
 */
export declare function ready(): Promise<unknown>;
