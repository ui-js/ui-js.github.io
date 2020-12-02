(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.uijs = {}));
}(this, (function (exports) { 'use strict';

    /**
     * @internal
     */
    class UIElement extends HTMLElement {
        constructor(options) {
            super();
            this.attachShadow({ mode: 'open' });
            if ((options === null || options === void 0 ? void 0 : options.template) instanceof HTMLTemplateElement) {
                this.shadowRoot.appendChild(options.template.content.cloneNode(true));
            }
            else if (typeof (options === null || options === void 0 ? void 0 : options.template) === 'string') {
                this.shadowRoot.innerHTML = options.template;
            }
            if ((options === null || options === void 0 ? void 0 : options.style) instanceof HTMLTemplateElement) {
                this.shadowRoot.appendChild(options.style.content.cloneNode(true));
            }
            else if (typeof (options === null || options === void 0 ? void 0 : options.style) === 'string') {
                const style = document.createElement('style');
                style.textContent = options.style;
                this.shadowRoot.append(style);
            }
            // If there is an embedded <style> tag in the slot
            // "import" it in the shadow dom
            if (this.importedStyle) {
                const style = document.createElement('style');
                style.textContent = this.importedStyle;
                this.shadowRoot.append(style);
            }
        }
        /**
         * @internal
         */
        get json() {
            if (typeof this._json === 'undefined') {
                this._json = null;
                const json = this.shadowRoot
                    .querySelector('slot')
                    .assignedElements()
                    .filter((x) => x.tagName === 'SCRIPT' &&
                    x['type'] === 'application/json')
                    .map((x) => x.textContent)
                    .join('');
                if (json) {
                    try {
                        this._json = JSON.parse(json);
                    }
                    catch (e) {
                        // There was an error parsing the JSON.
                        // Display a helpful message.
                        const msg = e.toString();
                        const m = msg.match(/position ([0-9]+)/);
                        if (m) {
                            const index = parseInt(m[1]);
                            const extract = json.substring(Math.max(index - 40, 0), index);
                            throw new Error(msg + '\n' + extract.trim());
                        }
                        else {
                            throw e;
                        }
                    }
                }
            }
            return this._json;
        }
        /**
         * @internal
         */
        get importedStyle() {
            if (typeof this._style === 'undefined') {
                this._style = this.shadowRoot
                    .querySelector('slot')
                    .assignedElements()
                    .filter((x) => x.tagName === 'STYLE')
                    .map((x) => x.textContent)
                    .join('');
            }
            return this._style;
        }
    }

    const MENU_ITEM_TEMPLATE = document.createElement('template');
    MENU_ITEM_TEMPLATE.innerHTML = `<style>
:host {
    display: inline;
    color-scheme: light dark;
    --active-label-color: #fff;
    --label-color: #121212;
    --menu-bg: #e2e2e2;
    --active-bg: #5898ff;
    --active-bg-dimmed: #c5c5c5;
    outline: none;
    fill: currentColor;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    text-align: left;
    color: var(--label-color);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    line-height: 16px;
    letter-spacing: 0.007em;
    background: none;
    outline: none;
    width: 100%;
    margin: 0;
    padding: 1px 2px 1px 1px;
    overflow: visible;
    border: 1px solid transparent;
    white-space: nowrap;
}
:host([hidden]) {
    display: none;
}
:host([disabled]) {
    opacity:  .5;
}
:host[aria-disabled=true] {
    opacity: .5;
}
:host(:focus), :host(:focus-within) {
    outline: Highlight auto 1px;    /* For Firefox */
    outline: -webkit-focus-ring-color auto 1px;
}

:host.indent {
    margin-left: 12px;
}

:host[role=separator] {
    border-bottom: 1px solid #c7c7c7;
    border-radius: 0;
    padding: 0;
    margin-left: 15px;
    margin-right: 15px;
    padding-top: 5px;
    margin-bottom: 5px;
}

:host([active]) {
    background: var(--active-bg);
    background: -apple-system-control-accent;
    color: var(--active-label-color);
}

:host([active]).is-submenu-open {
    background: var(--active-bg-dimmed);
    color: inherit;
}

:host[aria-haspopup=true]>.label {
     padding-right: 0;
}

:host[aria-haspopup=true].active::after {
    color: white;
}
@media (prefers-color-scheme: dark) {
    :host {
        --label-color: #fff;
        --active-label-color: #000;
        --menu-bg: #525252;
        --active-bg: #5898ff;
        --active-bg-dimmed: #5c5c5;
    }
}
</style>
<slot></slot>`;
    class UIMenuItemElement extends HTMLElement {
        static get observedAttributes() {
            return ['disabled', 'checked', 'active', 'type'];
        }
        get checked() {
            return this.hasAttribute('checked');
        }
        set checked(val) {
            if (val) {
                this.setAttribute('checked', '');
            }
            else {
                this.removeAttribute('checked');
            }
        }
        get disabled() {
            return this.hasAttribute('disabled');
        }
        set disabled(val) {
            if (val) {
                this.setAttribute('disabled', '');
            }
            else {
                this.removeAttribute('disabled');
            }
        }
        get active() {
            return this.hasAttribute('active');
        }
        set active(val) {
            if (val) {
                this.setAttribute('active', '');
            }
            else {
                this.removeAttribute('active');
            }
        }
        get type() {
            return this.hasAttribute('type') ? this.getAttribute('type') : 'normal';
        }
        set type(val) {
            if (val) {
                this.setAttribute('type', val);
            }
            else {
                this.removeAttribute('type');
            }
        }
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
            this.shadowRoot.appendChild(MENU_ITEM_TEMPLATE.content.cloneNode(true));
        }
    }
    if (!window.customElements.get('ui-menu-item')) {
        window.UIMenuItemElement = UIMenuItemElement;
        window.customElements.define('ui-menu-item', UIMenuItemElement);
    }

    const MENU_TEMPLATE = document.createElement('template');
    MENU_TEMPLATE.innerHTML = `<ul></ul><slot></slot>`;
    const MENU_STYLE = document.createElement('template');
    MENU_STYLE.innerHTML = `<style>
:host {
    display: none;
    color-scheme: light dark;
    --active-label-color: #fff;
    --label-color: #121212;
    --menu-bg: #e2e2e2;
    --active-bg: #5898ff;
    --active-bg-dimmed: #c5c5c5;
}
:host([hidden]) {
    display: none;
}
:host([disabled]) {
    opacity:  .5;
}
:host(:focus), :host(:focus-within) {
    outline: Highlight auto 1px;    /* For Firefox */
    outline: -webkit-focus-ring-color auto 1px;
}
:host div.scrim {
    position: fixed;
    contain: content;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    outline: none;
    background: transparent;
}
:host slot {
    display: none;
}
ul.menu-container {
    position: absolute;
    width: auto;
    z-index: 10000;
    border-radius: 8px;
    background: var(--menu-bg);
    box-shadow: 0 0 2px rgba(0, 0, 0, .5), 0 0 20px rgba(0, 0, 0, .2);

    list-style: none;
    padding: 6px 0 6px 0;
    margin: 0;
    cursor: initial;
    user-select: none;

    color: var(--label-color);
    font-weight: normal;
    font-style: normal;
    text-shadow: none;
    text-transform: none;
    letter-spacing: 0;
    outline: none;
    opacity: 1;
}
ul > li {
    display: flex;
    flex-flow: row;
    align-items: center;
    padding: 1px 7px 1px 7px;
    margin-top: 0;
    margin-left: 6px;
    margin-right: 6px;
    border-radius: 4px;
    white-space: nowrap;
    position: relative;
    outline: none;
    fill: currentColor;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    text-align: left;
    color: inherit;

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    line-height: 16px;
    letter-spacing: 0.007em;
}
ul > li > .label {
    appearance: none;
    background: none;
    outline: none;
    width: 100%;
    margin: 0;
    padding: 1px 2px 1px 1px;
    overflow: visible;
    border: 1px solid transparent;
    white-space: nowrap;
}
ul > li > .label.indent {
    margin-left: 12px;
}
ul > li[role=separator] {
    border-bottom: 1px solid #c7c7c7;
    border-radius: 0;
    padding: 0;
    margin-left: 15px;
    margin-right: 15px;
    padding-top: 5px;
    margin-bottom: 5px;
}
ul > li[aria-disabled=true] {
    opacity: .5;
}

ul > li.active {
    background: var(--active-bg);
    background: -apple-system-control-accent;
    color: var(--active-label-color);
}

ul > li.active.is-submenu-open {
    background: var(--active-bg-dimmed);
    color: inherit;
}

ul > li[aria-haspopup=true]>.label {
     padding-right: 0;
}

.right-chevron {
    margin-left: 24px;
    width: 10px;
    height: 10px;
    padding-bottom: 4px;
}
.checkmark {
    margin-right: -11px;
    margin-left: -4px;
    margin-top : 2px;
    width: 16px;
    height: 16px;
}

ul > li[aria-haspopup=true].active::after {
    color: white;
}
@media (prefers-color-scheme: dark) {
    :host {
        --label-color: #fff;
        --active-label-color: #000;
        --menu-bg: #525252;
        --active-bg: #5898ff;
        --active-bg-dimmed: #5c5c5;
    }
}
</style>`;
    /**
     * An instance of `Menu` is a collection of menu items, including submenus.
     */
    class Menu {
        constructor(menuItems, options) {
            var _a;
            this.parentMenu = (_a = options === null || options === void 0 ? void 0 : options.parentMenu) !== null && _a !== void 0 ? _a : null;
            this._assignedContainer = options === null || options === void 0 ? void 0 : options.assignedContainer;
            this._menuItemsTemplate = menuItems;
            this.isSubmenuOpen = false;
        }
        get rootMenu() {
            var _a;
            return (_a = this.parentMenu) === null || _a === void 0 ? void 0 : _a.rootMenu;
        }
        get host() {
            return this.rootMenu.host;
        }
        updateMenu(keyboardModifiers) {
            // The state of the keyboard modifiers may have changed and the menu
            // is dynamic: recalculate the menu
            var _a, _b;
            // Save the current menu
            const elem = this._element;
            let saveCurrentItem;
            let clientX;
            let clientY;
            let parent;
            if (elem) {
                // If there is a cached element for this menu,
                // remove it (but save its state)
                saveCurrentItem = this._menuItems.indexOf(this.activeMenuItem);
                parent = elem.parentNode;
                clientX = elem.style.left;
                clientY = elem.style.top;
                parent === null || parent === void 0 ? void 0 : parent.removeChild(elem);
                this._element = null;
            }
            this._menuItems = [];
            this.hasCheckbox = false;
            this.hasRadio = false;
            if (!this._menuItemsTemplate)
                return;
            this._menuItemsTemplate.forEach((x) => this.appendMenuItem(x, keyboardModifiers));
            // Add menu-item-elements
            if ((_a = this.host) === null || _a === void 0 ? void 0 : _a.shadowRoot) {
                const itemElements = this.host.shadowRoot
                    .querySelector('slot')
                    .assignedElements()
                    .filter((x) => x.tagName === 'UI-MENU-ITEM');
                Array.from(itemElements).forEach((x) => this.appendMenuItem(x, keyboardModifiers));
            }
            this.hasCheckbox = this._menuItems.some((x) => x.type === 'checkbox');
            this.hasRadio = this._menuItems.some((x) => x.type === 'radio');
            if (elem) {
                // If there was a previous version of the menu,
                // restore it and its state
                parent === null || parent === void 0 ? void 0 : parent.appendChild(this.element);
                this.element.style.position = 'absolute';
                this.element.style.top = clientY;
                this.element.style.left = clientX;
                this.activeMenuItem = this.menuItems[saveCurrentItem];
                if ((_b = this.activeMenuItem) === null || _b === void 0 ? void 0 : _b.submenu) {
                    this.activeMenuItem.openSubmenu(keyboardModifiers);
                }
            }
        }
        get menuItems() {
            return this._menuItems;
        }
        /** First activable menu item */
        get firstMenuItem() {
            let result = 0;
            let found = false;
            const menuItems = this.menuItems;
            while (!found && result <= menuItems.length - 1) {
                const item = menuItems[result];
                found = item.type !== 'separator' && !item.hidden && !item.disabled;
                result += 1;
            }
            return !found ? null : menuItems[result - 1];
        }
        /** Last activable menu item */
        get lastMenuItem() {
            let result = this.menuItems.length - 1;
            let found = false;
            while (!found && result >= 0) {
                const item = this.menuItems[result];
                found = item.type !== 'separator' && !item.hidden && !item.disabled;
                result -= 1;
            }
            return !found ? null : this.menuItems[result + 1];
        }
        /**
         * The active menu is displayed on a colored background.
         */
        get activeMenuItem() {
            return this._activeMenuItem;
        }
        /**
         * Set to undefined to have no active item.
         * Note that setting the active menu item doesn't automatically
         * open the submenu (e.g. when keyboard navigating).
         * Call `item.submenu.openSubmenu()` to open the submenu.
         */
        set activeMenuItem(value) {
            var _a, _b, _c, _d, _e;
            (_a = this.parentMenu) === null || _a === void 0 ? void 0 : _a.rootMenu.cancelDelayedOperation();
            if (value !== this._activeMenuItem) {
                // Remove previously active element
                if (this.activeMenuItem) {
                    const item = this.activeMenuItem;
                    item.active = false;
                    // If there is a submenu, hide it
                    (_b = item.submenu) === null || _b === void 0 ? void 0 : _b.hide();
                }
                if (value === null || value === void 0 ? void 0 : value.hidden) {
                    this._activeMenuItem = undefined;
                    return;
                }
                this._activeMenuItem = value;
                // Make new element active
                if (value)
                    value.active = true;
            }
            if (value) {
                value.element.focus();
            }
            else {
                (_c = this._element) === null || _c === void 0 ? void 0 : _c.focus();
            }
            // Update secondary state of parent
            (_e = (_d = this.parentMenu) === null || _d === void 0 ? void 0 : _d.activeMenuItem) === null || _e === void 0 ? void 0 : _e.element.classList.toggle('is-submenu-open', !!value);
        }
        nextMenuItem(dir) {
            if (!this._activeMenuItem && dir > 0)
                return this.firstMenuItem;
            if (!this._activeMenuItem && dir < 0)
                return this.lastMenuItem;
            const first = this._menuItems.indexOf(this.firstMenuItem);
            const last = this._menuItems.indexOf(this.lastMenuItem);
            let found = false;
            let result = this._menuItems.indexOf(this._activeMenuItem) + dir;
            while (!found && result >= first && result <= last) {
                const item = this._menuItems[result];
                found = item.type !== 'separator' && !item.hidden && !item.disabled;
                result += dir;
            }
            return found
                ? this._menuItems[result - dir]
                : dir > 0
                    ? this.lastMenuItem
                    : this.firstMenuItem;
        }
        static get collator() {
            if (Menu._collator)
                return Menu._collator;
            Menu._collator = new Intl.Collator(undefined, {
                usage: 'search',
                sensitivity: 'base',
            });
            return Menu._collator;
        }
        findMenuItem(text) {
            const candidates = this._menuItems.filter((x) => x.type !== 'separator' && !x.hidden && !x.disabled);
            if (candidates.length === 0)
                return null;
            const last = Math.max(...candidates.map((x) => x.label.length)) - text.length;
            if (last < 0)
                return null;
            // Find a "contain" match
            let result;
            let i = 0;
            while (i < last && !result) {
                result = candidates.find((x) => Menu.collator.compare(text, x.label.substr(i, text.length)) === 0);
                i++;
            }
            return result;
        }
        get element() {
            var _a, _b;
            if (this._element)
                return this._element;
            const ul = (_a = this._assignedContainer) !== null && _a !== void 0 ? _a : document.createElement('ul');
            ul.classList.add('menu-container');
            ul.setAttribute('part', 'menu-container');
            ul.setAttribute('tabindex', '-1');
            ul.setAttribute('role', 'menu');
            ul.setAttribute('aria-orientation', 'vertical');
            // Remove all items
            ul.textContent = '';
            // Add back all necessary items (after they've been updated if applicable)
            this._menuItems.forEach((x) => {
                const elem = x.element;
                if (elem)
                    ul.appendChild(elem);
            });
            (_b = ul.querySelector('li:first-of-type')) === null || _b === void 0 ? void 0 : _b.setAttribute('tabindex', '0');
            this._element = ul;
            return this._element;
        }
        /**
         * @param parent: where the menu should be attached
         * @return false if no menu to show
         */
        show(options) {
            var _a;
            this.updateMenu(options === null || options === void 0 ? void 0 : options.keyboardModifiers);
            if (this.menuItems.filter((x) => !x.hidden).length === 0)
                return false;
            (_a = options === null || options === void 0 ? void 0 : options.parent) === null || _a === void 0 ? void 0 : _a.appendChild(this.element);
            if (isFinite(options === null || options === void 0 ? void 0 : options.clientY) && isFinite(options === null || options === void 0 ? void 0 : options.clientY)) {
                this.element.style.position = 'absolute';
                this.element.style.top = Number(options.clientY).toString() + 'px';
                this.element.style.left = Number(options.clientX).toString() + 'px';
            }
            this.element.focus();
            // Notify our parent we have opened
            // (so the parent can close any other open submenu and/or
            // change its state to display the active state correctly)
            if (this.parentMenu) {
                this.parentMenu.openSubmenu = this;
            }
            return true;
        }
        hide() {
            var _a, _b;
            // Hide any of our child submenus
            this.openSubmenu = null;
            this.activeMenuItem = undefined;
            // Notify our parent
            if (this.parentMenu) {
                this.parentMenu.openSubmenu = null;
            }
            (_b = (_a = this._element) === null || _a === void 0 ? void 0 : _a.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(this._element);
            this._element = null;
        }
        /**
         * This method is called to record that one of our submenus has opened.
         * To open a submenu call openSubmenu() on the item with the submenu
         * or show() on the submenu.
         */
        set openSubmenu(submenu) {
            var _a, _b;
            const expanded = submenu !== null;
            // We're closing a submenu
            if (((_a = this.activeMenuItem) === null || _a === void 0 ? void 0 : _a.type) === 'submenu') {
                (_b = this.activeMenuItem.element) === null || _b === void 0 ? void 0 : _b.setAttribute('aria-expanded', expanded.toString());
            }
            this.isSubmenuOpen = expanded;
        }
        appendMenuItem(menuItem, keyboardModifiers) {
            this.insertMenuItem(-1, menuItem, keyboardModifiers);
        }
        insertMenuItem(pos, menuItem, keyboardModifiers) {
            if (pos < 0)
                pos = Math.max(0, this._menuItems.length - 1);
            let item;
            if (menuItem instanceof UIMenuItemElement) {
                item = new MenuItemFromElement(menuItem, this);
            }
            else {
                item = new MenuItemFromTemplate(menuItem, this, {
                    keyboardModifiers: keyboardModifiers,
                });
            }
            this._menuItems.splice(pos + 1, 0, item);
        }
    }
    //
    //
    //
    const PRINTABLE_KEYCODE = [
        'Backquote',
        'Digit0',
        'Digit1',
        'Digit2',
        'Digit3',
        'Digit4',
        'Digit5',
        'Digit6',
        'Digit7',
        'Digit8',
        'Digit9',
        'Minus',
        'Equal',
        'IntlYen',
        'KeyQ',
        'KeyW',
        'KeyE',
        'KeyR',
        'KeyT',
        'KeyY',
        'KeyU',
        'KeyI',
        'KeyO',
        'KeyP',
        'BracketLeft',
        'BracketRight',
        'Backslash',
        'KeyA',
        'KeyS',
        'KeyD',
        'KeyF',
        'KeyG',
        'KeyH',
        'KeyJ',
        'KeyK',
        'KeyL',
        'Semicolon',
        'Quote',
        'IntlBackslash',
        'KeyZ',
        'KeyX',
        'KeyC',
        'KeyV',
        'KeyB',
        'KeyN',
        'KeyM',
        'Comma',
        'Period',
        'Slash',
        'IntlRo',
        'Space',
        'Numpad0',
        'Numpad1',
        'Numpad2',
        'Numpad3',
        'Numpad4',
        'Numpad5',
        'Numpad6',
        'Numpad7',
        'Numpad8',
        'Numpad9',
        'NumpadAdd',
        'NumpadComma',
        'NumpadDecimal',
        'NumpadDivide',
        'NumpadEqual',
        'NumpadHash',
        'NumpadMultiply',
        'NumpadParenLeft',
        'NumpadParenRight',
        'NumpadStar',
        'NumpadSubstract',
    ];
    function keyboardModifiersFromEvent(ev) {
        const result = {
            alt: false,
            control: false,
            shift: false,
            meta: false,
        };
        if (ev.altKey)
            result.alt = true;
        if (ev.ctrlKey)
            result.control = true;
        if (ev.metaKey)
            result.meta = true;
        if (ev.shiftKey)
            result.shift = true;
        return result;
    }
    function evalToBoolean(item, value, keyboardModifiers) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'function') {
            return value(item, keyboardModifiers);
        }
        return undefined;
    }
    function evalToString(item, value, options) {
        if (typeof value === 'string') {
            return value;
        }
        else if (typeof value === 'function') {
            return value(item, options.keyboardModifiers);
        }
        return undefined;
    }
    function equalKeyboardModifiers(a, b) {
        if ((!a && b) || (a && !b))
            return false;
        return (a.alt === b.alt &&
            a.control === b.control &&
            a.shift === b.shift &&
            a.meta === b.meta);
    }
    function mightProducePrintableCharacter(evt) {
        if (evt.ctrlKey || evt.metaKey) {
            // ignore ctrl/cmd-combination but not shift/alt-combinations
            return false;
        }
        // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
        if (evt.key === 'Dead')
            return false;
        // When issued via a composition, the `code` field is empty
        if (evt.code === '')
            return true;
        return PRINTABLE_KEYCODE.indexOf(evt.code) >= 0;
    }
    const CHEVRON_RIGHT_TEMPLATE = document.createElement('template');
    CHEVRON_RIGHT_TEMPLATE.innerHTML = `<span aria-hidden="true" class="right-chevron"><svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg></span>`;
    const CHECKMARK_TEMPLATE = document.createElement('template');
    CHECKMARK_TEMPLATE.innerHTML = `<span aria-hidden="true" class="checkmark"><svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"></path></svg>
</span>`;
    /**
     * Base class to represent a menu item.
     * There are two subclasses:
     * - MenuItemFromTemplate for menu items created from a JSON template
     * - MenuItemFromElement for menu items created for a UIMenuItemElement
     */
    class MenuItem {
        constructor(parentMenu) {
            this.parentMenu = parentMenu;
        }
        handleEvent(event) {
            var _a;
            if (event.type === 'mouseenter') {
                const ev = event;
                this.parentMenu.rootMenu.cancelDelayedOperation();
                // If there is a submenu open, and the mouse is moving in the
                // triangle formed from the current mouse location and the two
                // adjacent corners of the open menu, schedule setting the new
                // active menuitem to later
                if (this.parentMenu.isSubmenuOpen && ((_a = this.parentMenu.activeMenuItem) === null || _a === void 0 ? void 0 : _a.movingTowardSubmenu(ev))) {
                    this.parentMenu.rootMenu.scheduleOperation(() => {
                        this.parentMenu.activeMenuItem = this;
                        if (this.submenu) {
                            this.openSubmenu(keyboardModifiersFromEvent(ev));
                        }
                    });
                }
                else {
                    this.parentMenu.activeMenuItem = this;
                    if (this.submenu) {
                        this.openSubmenu(keyboardModifiersFromEvent(ev), {
                            withDelay: true,
                        });
                    }
                }
            }
            else if (event.type === 'mouseleave') {
                if (this.parentMenu.rootMenu.activeMenu === this.parentMenu) {
                    this.parentMenu.activeMenuItem = null;
                }
            }
            else if (event.type === 'mouseup') {
                const ev = event;
                // when modal, the items are activated on click,
                // so ignore mouseup
                if (this.parentMenu.rootMenu.state !== 'modal') {
                    this.select(keyboardModifiersFromEvent(ev));
                }
                ev.stopPropagation();
                ev.preventDefault();
            }
        }
        get host() {
            return this.parentMenu.host;
        }
        /**
         * Called when a menu item is selected:
         * - either dismiss the menu and execute the command
         * - or display the submenu
         */
        select(kbd) {
            this.parentMenu.rootMenu.cancelDelayedOperation();
            if (this.submenu) {
                this.openSubmenu(kbd);
                return;
            }
            // Make the item blink, then execute the command
            setTimeout(() => {
                this.active = false;
                setTimeout(() => {
                    this.active = true;
                    setTimeout(() => {
                        this.parentMenu.rootMenu.hide();
                        setTimeout(() => this.dispatchSelect(kbd), 120);
                    }, 120);
                }, 120);
            }, 120);
        }
        /**
         * Open the submenu of this menu item, with a delay if options.delay
         * This delay improves targeting of submenus with the mouse.
         */
        openSubmenu(kbd, options) {
            var _a;
            if ((_a = options === null || options === void 0 ? void 0 : options.withDelay) !== null && _a !== void 0 ? _a : false) {
                this.parentMenu.rootMenu.scheduleOperation(() => this.openSubmenu(kbd));
                return;
            }
            const maxWidth = window.document.documentElement.clientWidth;
            const maxHeight = window.document.documentElement.clientHeight;
            const bounds = this.element.getBoundingClientRect();
            // Update the items of the submenu so we can lay it out and measure it
            this.submenu.updateMenu(kbd);
            this.element.appendChild(this.submenu.element);
            const submenuBounds = this.submenu.element.getBoundingClientRect();
            this.element.removeChild(this.submenu.element);
            let clientX = bounds.width;
            let clientY = -4;
            if (bounds.right + submenuBounds.width > maxWidth) {
                // Need to adjust horizontally
                clientX = -submenuBounds.width;
            }
            if (bounds.top - 4 + submenuBounds.height > maxHeight) {
                // Need to adjust vertically
                clientY = -4 - (submenuBounds.height - (maxHeight - bounds.top));
            }
            this.submenu.show({
                clientX,
                clientY,
                parent: this.element,
                keyboardModifiers: kbd,
            });
        }
        movingTowardSubmenu(ev) {
            const lastEv = this.parentMenu.rootMenu.lastMouseEvent;
            if (!lastEv)
                return false;
            const deltaT = ev.timeStamp - lastEv.timeStamp;
            if (deltaT > 500)
                return false;
            const deltaX = ev.clientX - lastEv.clientX;
            // Moving too slow?
            const s = speed(deltaX, lastEv.clientY - ev.clientY, deltaT);
            if (s <= 0.2)
                return false;
            // Moving horizontally towards the submenu?
            let position = 'right';
            if (this.submenu.element) {
                const submenuBounds = this.submenu.element.getBoundingClientRect();
                const bounds = this.element.getBoundingClientRect();
                if (submenuBounds.left < bounds.left + bounds.width / 2) {
                    position = 'left';
                }
            }
            return position === 'right' ? deltaX > 0 : deltaX < 0;
        }
    }
    class MenuItemFromTemplate extends MenuItem {
        constructor(template, parentMenu, options) {
            var _a, _b, _c, _d;
            super(parentMenu);
            this.parentMenu = parentMenu;
            this._hidden = (_a = evalToBoolean(template, template.hidden, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _a !== void 0 ? _a : false;
            this._disabled = (_b = evalToBoolean(template, template.disabled, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _b !== void 0 ? _b : false;
            this.checked = (_c = evalToBoolean(template, template.checked, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _c !== void 0 ? _c : false;
            this.id = template.id;
            this.className = template.className;
            this._label = evalToString(template, template.label, options);
            this.ariaLabel = evalToString(template, template.ariaLabel, options);
            this.ariaDetails = evalToString(template, template.ariaDetails, options);
            if (typeof template.onSelect) {
                this.onSelect = template.onSelect;
            }
            this.data = template.data;
            if (Array.isArray(template.submenu)) {
                this._type = 'submenu';
                this.submenu = new Menu(template.submenu, {
                    parentMenu,
                });
            }
            else {
                if (typeof template.type === 'undefined' &&
                    typeof template.checked !== 'undefined') {
                    this._type = 'checkbox';
                }
                else {
                    this._type = (_d = template.type) !== null && _d !== void 0 ? _d : 'normal';
                }
            }
        }
        get type() {
            return this._type;
        }
        get label() {
            var _a;
            return (_a = this._label) !== null && _a !== void 0 ? _a : this.ariaLabel;
        }
        get hidden() {
            return this._hidden;
        }
        get disabled() {
            return this._disabled;
        }
        render() {
            if (this.hidden)
                return null;
            if (this.type === 'separator') {
                const li = document.createElement('li');
                li.setAttribute('part', 'menu-separator');
                li.setAttribute('role', 'separator');
                return li;
            }
            if (this.type !== 'normal' &&
                this.type !== 'submenu' &&
                this.type !== 'radio' &&
                this.type !== 'checkbox') {
                return null;
            }
            const li = document.createElement('li');
            li.setAttribute('part', 'menu-item');
            if (this.className) {
                li.className = this.className;
            }
            li.setAttribute('tabindex', '-1');
            if (this.type === 'radio') {
                li.setAttribute('role', 'menuitemradio');
            }
            else if (this.type === 'checkbox') {
                li.setAttribute('role', 'menuitemcheckbox');
            }
            else {
                li.setAttribute('role', 'menuitem');
            }
            if (this.checked) {
                li.setAttribute('aria-checked', 'true');
                li.appendChild(CHECKMARK_TEMPLATE.content.cloneNode(true));
            }
            if (this.type === 'submenu') {
                li.setAttribute('aria-haspopup', 'true');
                li.setAttribute('aria-expanded', 'false');
            }
            if (this.ariaLabel)
                li.setAttribute('aria-label', this.ariaLabel);
            if (this.ariaDetails)
                li.setAttribute('aria-label', this.ariaDetails);
            if (this.disabled) {
                li.setAttribute('aria-disabled', 'true');
            }
            else {
                li.removeAttribute('aria-disabled');
                li.addEventListener('mouseenter', this);
                li.addEventListener('mouseleave', this);
                li.addEventListener('mouseup', this);
            }
            const span = document.createElement('span');
            span.innerHTML = this.label;
            span.className =
                this.parentMenu.hasCheckbox || this.parentMenu.hasRadio
                    ? 'label indent'
                    : 'label';
            if (!this.disabled) {
                span.addEventListener('click', (ev) => this.select(keyboardModifiersFromEvent(ev)));
            }
            li.appendChild(span);
            if (this.submenu) {
                li.appendChild(CHEVRON_RIGHT_TEMPLATE.content.cloneNode(true));
            }
            return li;
        }
        get active() {
            return this.element.classList.contains('active');
        }
        set active(val) {
            if (val) {
                this.element.classList.add('active');
            }
            else {
                this.element.classList.remove('active');
            }
        }
        get element() {
            if (this._element)
                return this._element;
            this._element = this.render();
            return this._element;
        }
        dispatchSelect(kbd) {
            const ev = new CustomEvent('select', {
                detail: {
                    keyboardModifiers: kbd,
                    id: this.id,
                    label: this.label,
                    data: this.data,
                },
            });
            if (typeof this.onSelect === 'function') {
                this.onSelect(ev);
            }
            else {
                this.host.dispatchEvent(ev);
            }
        }
    }
    class MenuItemFromElement extends MenuItem {
        constructor(element, parentMenu) {
            super(parentMenu);
            this.parentMenu = parentMenu;
            this._sourceElement = element;
        }
        get type() {
            if (this.separator)
                return 'separator';
            // @todo: submenu, radio, checkbox
            return 'normal';
        }
        get label() {
            return this._sourceElement.innerHTML;
        }
        get hidden() {
            return this._sourceElement.hasAttribute('hidden');
        }
        set hidden(value) {
            if (value) {
                this._sourceElement.setAttribute('hidden', '');
            }
            else {
                this._sourceElement.removeAttribute('hidden');
            }
        }
        get disabled() {
            return this._sourceElement.hasAttribute('disabled');
        }
        set disabled(value) {
            if (value) {
                this._sourceElement.setAttribute('disabled', '');
            }
            else {
                this._sourceElement.removeAttribute('disabled');
            }
        }
        get checked() {
            return this._sourceElement.hasAttribute('checked');
        }
        set checked(value) {
            if (value) {
                this._sourceElement.setAttribute('checked', '');
            }
            else {
                this._sourceElement.removeAttribute('checked');
            }
        }
        get separator() {
            return this._sourceElement.hasAttribute('separator');
        }
        set separator(value) {
            if (value) {
                this._sourceElement.setAttribute('separator', '');
            }
            else {
                this._sourceElement.removeAttribute('separator');
            }
        }
        get active() {
            var _a, _b;
            return (_b = (_a = this._cachedElement) === null || _a === void 0 ? void 0 : _a.classList.contains('active')) !== null && _b !== void 0 ? _b : false;
        }
        set active(val) {
            var _a, _b;
            // For the active attribute, set the value on the sourced element
            // (the <ui-menu-item>)
            if (val) {
                (_a = this._cachedElement) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                this._sourceElementClone.setAttribute('active', '');
            }
            else {
                (_b = this._cachedElement) === null || _b === void 0 ? void 0 : _b.classList.remove('active');
                this._sourceElementClone.removeAttribute('active');
            }
        }
        render() {
            if (this.hidden)
                return null;
            if (this.separator) {
                const li = document.createElement('li');
                li.setAttribute('part', 'menu-separator');
                li.setAttribute('role', 'separator');
                return li;
            }
            const li = document.createElement('li');
            li.setAttribute('part', 'menu-item');
            li.setAttribute('tabindex', '-1');
            if (this.type === 'radio') {
                li.setAttribute('role', 'menuitemradio');
            }
            else if (this.type === 'checkbox') {
                li.setAttribute('role', 'menuitemcheckbox');
            }
            else {
                li.setAttribute('role', 'menuitem');
            }
            if (this.checked) {
                li.setAttribute('aria-checked', 'true');
                li.appendChild(CHECKMARK_TEMPLATE.content.cloneNode(true));
            }
            if (this.type === 'submenu') {
                li.setAttribute('aria-haspopup', 'true');
                li.setAttribute('aria-expanded', 'false');
            }
            if (this.disabled) {
                li.setAttribute('aria-disabled', 'true');
            }
            else {
                li.removeAttribute('aria-disabled');
                li.addEventListener('mouseenter', this);
                li.addEventListener('mouseleave', this);
                li.addEventListener('mouseup', this);
            }
            if (!this.disabled) {
                li.addEventListener('click', (ev) => this.select(keyboardModifiersFromEvent(ev)));
            }
            this._sourceElementClone = this._sourceElement.cloneNode(true);
            li.appendChild(this._sourceElementClone);
            return li;
        }
        get element() {
            if (this._cachedElement)
                return this._cachedElement;
            this._cachedElement = this.render();
            return this._cachedElement;
        }
        dispatchSelect(kbd) {
            const ev = new CustomEvent('select', {
                detail: {
                    keyboardModifiers: kbd,
                    id: this._sourceElement.getAttribute('id'),
                    label: this.label,
                    element: this._sourceElement,
                },
            });
            if (typeof this._sourceElement.onselect === 'function') {
                this._sourceElement.onselect(ev);
            }
            else {
                this.host.dispatchEvent(ev);
            }
        }
    }
    function speed(dx, dy, dt) {
        return Math.sqrt(dx * dx + dy * dy) / dt;
    }

    class RootMenu extends Menu {
        /**
         * If an `options.element` is provided, the root menu is
         * attached to that element (the element will be modified
         * to display the menu). Use this when using a popup menu.
         * In this mode, call `show()` and `hide()` to control the
         * display of the menu.
         *
         * Otherwise, if `options.element` is undefined, use `.element` to get
         * back an element representing the menu, and attach this element where
         * appropriate. Use this when displaying the menu inline.
         */
        constructor(menuItems, options) {
            super(menuItems, { assignedContainer: options === null || options === void 0 ? void 0 : options.assignedElement });
            this.isDynamic = menuItems.some(isDynamic);
            this.currentKeyboardModifiers = options === null || options === void 0 ? void 0 : options.keyboardModifiers;
            this.typingBuffer = '';
            this.state = 'closed';
            this._host = options === null || options === void 0 ? void 0 : options.host;
        }
        get host() {
            return this._host;
        }
        /**
         * The currently active menu: could be the root menu or a submenu
         */
        get activeMenu() {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            let result = this;
            while (result.isSubmenuOpen) {
                result = result.activeMenuItem.submenu;
            }
            return result;
        }
        handleKeyupEvent(ev) {
            if (this.isDynamic) {
                const newModifiers = keyboardModifiersFromEvent(ev);
                if (!equalKeyboardModifiers(this.currentKeyboardModifiers, newModifiers)) {
                    this.updateMenu(newModifiers);
                    this.currentKeyboardModifiers = newModifiers;
                }
            }
        }
        handleKeydownEvent(ev) {
            if (ev.key === 'Tab') {
                // Close and bubble
                this.rootMenu.hide();
                return;
            }
            if (this.isDynamic) {
                const newModifiers = keyboardModifiersFromEvent(ev);
                if (!equalKeyboardModifiers(this.currentKeyboardModifiers, newModifiers)) {
                    this.updateMenu(newModifiers);
                    this.currentKeyboardModifiers = newModifiers;
                }
            }
            let handled = true;
            const menu = this.activeMenu;
            const menuItem = menu.activeMenuItem;
            switch (ev.key) {
                case ' ':
                case 'Space':
                case 'Return':
                case 'Enter':
                    menuItem === null || menuItem === void 0 ? void 0 : menuItem.select(keyboardModifiersFromEvent(ev));
                    break;
                case 'ArrowRight':
                    if (menuItem === null || menuItem === void 0 ? void 0 : menuItem.submenu) {
                        menuItem.select(keyboardModifiersFromEvent(ev));
                        this.activeMenu.activeMenuItem = this.activeMenu.firstMenuItem;
                    }
                    else if (!menuItem) {
                        menu.activeMenuItem = menu.firstMenuItem;
                    }
                    break;
                case 'ArrowLeft':
                    if (menu === this.rootMenu) {
                        if (!menuItem) {
                            menu.activeMenuItem = menu.firstMenuItem;
                        }
                    }
                    else {
                        menu.hide();
                        const el = menu.parentMenu.activeMenuItem.element;
                        el.focus();
                        el.classList.remove('is-submenu-open');
                    }
                    break;
                case 'ArrowDown':
                    menu.activeMenuItem = menu.nextMenuItem(+1);
                    break;
                case 'ArrowUp':
                    menu.activeMenuItem = menu.nextMenuItem(-1);
                    break;
                case 'Home':
                case 'PageUp':
                    menu.activeMenuItem = menu.firstMenuItem;
                    break;
                case 'End':
                case 'PageDown':
                    menu.activeMenuItem = menu.lastMenuItem;
                    break;
                case 'Escape':
                    this.rootMenu.hide();
                    break;
                case 'Backspace':
                    if (this.typingBuffer) {
                        this.typingBuffer = this.typingBuffer.slice(0, -1);
                        if (this.typingBuffer) {
                            clearTimeout(this.typingBufferResetTimer);
                            const newItem = menu.findMenuItem(this.typingBuffer);
                            if (newItem)
                                menu.activeMenuItem = newItem;
                            this.typingBufferResetTimer = setTimeout(() => {
                                this.typingBuffer = '';
                            }, 500);
                        }
                    }
                    break;
                default:
                    if (mightProducePrintableCharacter(ev)) {
                        if (isFinite(this.typingBufferResetTimer)) {
                            clearTimeout(this.typingBufferResetTimer);
                        }
                        this.typingBuffer += ev.key;
                        const newItem = menu.findMenuItem(this.typingBuffer);
                        if (newItem)
                            menu.activeMenuItem = newItem;
                        this.typingBufferResetTimer = setTimeout(() => {
                            this.typingBuffer = '';
                        }, 500);
                    }
                    else {
                        handled = false;
                    }
            }
            if (handled) {
                ev.preventDefault();
                ev.stopPropagation();
            }
        }
        handleMouseMoveEvent(event) {
            this.lastMouseEvent = event;
        }
        handleEvent(event) {
            if (event.type === 'keydown') {
                this.handleKeydownEvent(event);
            }
            else if (event.type === 'keyup') {
                this.handleKeyupEvent(event);
            }
            else if (event.type === 'mousemove') {
                this.handleMouseMoveEvent(event);
            }
            else if (event.type === 'mouseup' && event.target === this._scrim) {
                if (isFinite(this.rootMenu._openTimestamp) &&
                    Date.now() - this.rootMenu._openTimestamp < 120) {
                    // Hold mode...
                    this.state = 'modal';
                }
                else {
                    // Cancel
                    this.hide();
                }
            }
            else if (event.type === 'click' && event.target === this._scrim) {
                this.hide();
                event.preventDefault();
                event.stopPropagation();
            }
            else if (event.type === 'contextmenu') {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        get scrim() {
            if (this._scrim)
                return this._scrim;
            this._scrim = document.createElement('div');
            this._scrim.setAttribute('role', 'presentation');
            this._scrim.className = 'scrim';
            return this._scrim;
        }
        connectScrim(el) {
            const scrim = this.scrim;
            el.appendChild(scrim);
            scrim.addEventListener('click', this);
            scrim.addEventListener('mouseup', this);
            scrim.addEventListener('contextmenu', this);
            scrim.addEventListener('keydown', this);
            scrim.addEventListener('keyup', this);
            scrim.addEventListener('mousemove', this);
            // Prevent scrolling in the background
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.marginRight = `${scrollbarWidth}px`;
        }
        disconnectScrim() {
            const scrim = this.scrim;
            scrim.removeEventListener('click', this);
            scrim.removeEventListener('mouseup', this);
            scrim.removeEventListener('contextmenu', this);
            scrim.removeEventListener('keydown', this);
            scrim.removeEventListener('keyup', this);
            scrim.removeEventListener('mousemove', this);
            scrim.parentNode.removeChild(scrim);
            // Restore background scrolling
            document.body.style.marginRight = '';
            document.body.style.overflow = 'visible';
        }
        get rootMenu() {
            // I AM THE ONE WHO KNOCKS
            return this;
        }
        show(options) {
            var _a;
            // Remember the previously focused element. We'll restore it when we close.
            const activeElement = deepActiveElement();
            if (super.show({ ...options, parent: this.scrim })) {
                // Record the opening time.
                // If we receive a mouseup within a small delta of the open time stamp
                // hold the menu open until it is dismissed, otherwise close it.
                this._openTimestamp = Date.now();
                this.state = 'open';
                this.previousActiveElement = activeElement;
                this.connectScrim((_a = options === null || options === void 0 ? void 0 : options.parent) !== null && _a !== void 0 ? _a : document.body);
                return true;
            }
            return false;
        }
        hide() {
            var _a, _b;
            this.cancelDelayedOperation();
            if (this.state !== 'closed') {
                this.activeMenuItem = null;
                super.hide();
                this.disconnectScrim();
                this.state = 'closed';
                // Restore the previously focused element
                (_b = (_a = this.previousActiveElement) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
        }
        scheduleOperation(fn) {
            this.cancelDelayedOperation();
            const delay = this.submenuHysteresis;
            if (delay <= 0) {
                fn();
                return;
            }
            this.hysteresisTimer = setTimeout(() => {
                this.hysteresisTimer = undefined;
                fn();
            }, delay);
        }
        cancelDelayedOperation() {
            if (this.hysteresisTimer) {
                clearTimeout(this.hysteresisTimer);
                this.hysteresisTimer = undefined;
            }
        }
        get submenuHysteresis() {
            return 120;
        }
    }
    function isDynamic(item) {
        const result = typeof item.disabled === 'function' ||
            typeof item.hidden === 'function' ||
            typeof item.checked === 'function' ||
            typeof item.label === 'function' ||
            typeof item.ariaDetails === 'function' ||
            typeof item.ariaLabel === 'function';
        if (item.type === 'submenu' && item.submenu) {
            return result || item.submenu.some(isDynamic);
        }
        return result;
    }
    function deepActiveElement() {
        var _a;
        let a = document.activeElement;
        while ((_a = a === null || a === void 0 ? void 0 : a.shadowRoot) === null || _a === void 0 ? void 0 : _a.activeElement) {
            a = a.shadowRoot.activeElement;
        }
        return a;
    }

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
     */
    class UIContextMenuElement extends UIElement {
        constructor(inMenuItems) {
            super({
                template: MENU_TEMPLATE,
                style: MENU_STYLE,
            });
            // Inline menu items (as a JSON structure in a <script> tag
            // in the markup)
            let jsonMenuItems = this.json;
            if (!Array.isArray(jsonMenuItems))
                jsonMenuItems = [];
            this.rootMenu = new RootMenu([...(inMenuItems !== null && inMenuItems !== void 0 ? inMenuItems : []), ...jsonMenuItems], {
                host: this.shadowRoot.host,
                assignedElement: this.shadowRoot.querySelector('ul'),
            });
        }
        /**
         * @internal
         */
        handleEvent(event) {
            var _a;
            if (event.type === 'contextmenu') {
                const evt = event;
                this.show({
                    clientX: evt.clientX,
                    clientY: evt.clientY,
                    keyboardModifiers: keyboardModifiersFromEvent(evt),
                });
                event.preventDefault();
                event.stopPropagation();
            }
            else if (event.type === 'keydown') {
                const evt = event;
                if (evt.code === 'ContextMenu' ||
                    (evt.code === 'F10' && evt.shiftKey)) {
                    // shift+F10 = contextual menu
                    // Get the middle of the parent
                    const bounds = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect();
                    if (bounds) {
                        this.show({
                            clientX: bounds.left + bounds.width / 2,
                            clientY: bounds.top + bounds.height / 2,
                            keyboardModifiers: keyboardModifiersFromEvent(evt),
                        });
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
            else ;
        }
        /**
         * Custom elements lifecycle hooks
         * @internal
         */
        connectedCallback() {
            // Listen for contextual menu in the parent
            const parent = this.parentNode;
            parent.addEventListener('contextmenu', this);
            parent.addEventListener('keydown', this);
        }
        /**
         * Custom elements lifecycle hooks
         * @internal
         */
        disconnectedCallback() {
            const parent = this.parentNode;
            if (parent) {
                parent.removeEventListener('contextmenu', this);
                parent.removeEventListener('keydown', this);
            }
        }
        /**
         * @internal
         */
        focus() {
            super.focus();
            if (this.rootMenu.state !== 'closed') {
                if (this.rootMenu.activeMenuItem) {
                    this.rootMenu.activeMenuItem.element.focus();
                }
                else {
                    this.rootMenu.element.focus();
                }
            }
        }
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
        show(options) {
            if (this.rootMenu.show({ ...options, parent: this.shadowRoot })) {
                if (!this.hasAttribute('tabindex')) {
                    this.setAttribute('tabindex', '-1');
                }
                this.style.display = 'block';
                this.focus();
            }
        }
        /**
         * Hide the menu.
         *
         * The visibility of the menu is typically controlled by the user
         * interaction: the menu is automatically hidden if the user release the
         * mouse button, or after having selected a command. This is a manual
         * override that should be very rarely needed.
         */
        hide() {
            this.rootMenu.hide();
        }
    }
    if (!window.customElements.get('ui-context-menu')) {
        window.UIContextMenuElement = UIContextMenuElement;
        window.customElements.define('ui-context-menu', UIContextMenuElement);
    }

    exports.UIContextMenuElement = UIContextMenuElement;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ui.js.map
