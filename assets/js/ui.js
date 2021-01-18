(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.uijs = {}));
}(this, (function (exports) { 'use strict';

  // We use a class to encapsulate the state that needs to be tracked and,
  // more importantly, to avoid memory leaks by using the `handleEvent()` hook
  // to ensure proper disposal of event handlers
  class LongPressDetector {
      constructor(triggerEvent, onLongPress) {
          this.onLongPress = onLongPress;
          this.startPoint = eventLocation(triggerEvent);
          this.lastPoint = this.startPoint;
          this.timer = setTimeout(() => {
              this.dispose();
              if (distance(this.lastPoint, this.startPoint) < 10) {
                  this.onLongPress();
              }
          }, LongPressDetector.DELAY);
          ['pointermove', 'pointerup', 'pointercancel'].forEach((x) => window.addEventListener(x, this, { passive: true }));
      }
      dispose() {
          clearTimeout(this.timer);
          this.timer = undefined;
          ['pointermove', 'pointerup', 'pointercancel'].forEach((x) => window.removeEventListener(x, this));
      }
      handleEvent(event) {
          if (event.type === 'pointerup') {
              this.dispose();
              event.stopPropagation();
          }
          else if (event.type === 'pointermove') {
              this.lastPoint = eventLocation(event);
              event.stopPropagation();
          }
          else if (event.type === 'pointercancel') {
              this.dispose();
              event.stopPropagation();
          }
      }
  }
  LongPressDetector.DELAY = 300; // in ms
  function distance(p1, p2) {
      const dx = p2[0] - p1[0];
      const dy = p2[1] - p1[1];
      return Math.sqrt(dx * dx + dy * dy);
  }
  function eventLocation(evt) {
      if (evt instanceof MouseEvent) {
          return [evt.clientX, evt.clientY];
      }
      else if (evt instanceof TouchEvent) {
          const result = Array.from(evt.touches).reduce((acc, x) => [acc[0] + x.clientX, acc[1] + x.clientY], [0, 0]);
          const l = evt.touches.length;
          return [result[0] / l, result[1] / l];
      }
      return undefined;
  }
  function keyboardModifiersFromEvent(ev) {
      const result = {
          alt: false,
          control: false,
          shift: false,
          meta: false,
      };
      if (ev instanceof MouseEvent ||
          ev instanceof TouchEvent ||
          ev instanceof KeyboardEvent) {
          if (ev.altKey)
              result.alt = true;
          if (ev.ctrlKey)
              result.control = true;
          if (ev.metaKey)
              result.meta = true;
          if (ev.shiftKey)
              result.shift = true;
      }
      return result;
  }
  function equalKeyboardModifiers(a, b) {
      if ((!a && b) || (a && !b))
          return false;
      return (a.alt === b.alt &&
          a.control === b.control &&
          a.shift === b.shift &&
          a.meta === b.meta);
  }
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
      }
      /**
       * Declare that an attribute should be reflected as a property
       */
      reflectStringAttribute(attrName, propName = attrName) {
          // Attributes should be all lower case, kebab-case.
          console.assert(attrName.toLowerCase() === attrName);
          Object.defineProperty(this, propName, {
              enumerable: true,
              get() {
                  return this.getAttribute(attrName);
              },
              set(value) {
                  this.setAttribute(attrName, value);
              },
          });
      }
      /**
       * Declare that an attribute should be reflected as a property
       */
      reflectBooleanAttribute(attrName, propName = attrName) {
          // Attributes should be all lower case, kebab-case.
          console.assert(attrName.toLowerCase() === attrName);
          Object.defineProperty(this, propName, {
              enumerable: true,
              get() {
                  return this.hasAttribute(attrName);
              },
              set(value) {
                  if (value) {
                      this.setAttribute(attrName, '');
                  }
                  else {
                      this.removeAttribute(attrName);
                  }
              },
          });
      }
      /**
       * Declare that an attribute should be reflected as a property
       */
      reflectEnumAttribute(attrName, attrValues, propName = attrName) {
          // Attributes should be all lower case, kebab-case.
          console.assert(attrName.toLowerCase() === attrName);
          Object.defineProperty(this, propName, {
              enumerable: true,
              get() {
                  let value;
                  attrValues.forEach((x) => {
                      if (this.hasAttribute(x)) {
                          console.assert(typeof value === 'undefined', `inconsistent ${attrName} attributes on ${this}`);
                          value = x;
                      }
                  });
                  if (typeof value === 'string')
                      return value;
                  return this.getAttribute(attrName);
              },
              set(value) {
                  this.setAttribute(attrName, value);
                  this.setAttribute(value, '');
                  attrValues.forEach((x) => {
                      if (x !== value) {
                          this.removeAttribute(x);
                      }
                  });
              },
          });
      }
      reflectBooleanAttributes(attrNames) {
          attrNames.forEach((x) => {
              if (typeof x === 'string') {
                  this.reflectBooleanAttribute(x);
              }
              else {
                  this.reflectBooleanAttribute(x[0], x[1]);
              }
          });
      }
      reflectStringAttributes(attrNames) {
          attrNames.forEach((x) => {
              if (typeof x === 'string') {
                  this.reflectStringAttribute(x);
              }
              else {
                  this.reflectStringAttribute(x[0], x[1]);
              }
          });
      }
      get computedDir() {
          return getComputedDir(this);
      }
      /**
       * @internal
       */
      connectedCallback() {
          return;
      }
      /**
       * @internal
       */
      disconnectedCallback() {
          return;
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
                  .filter((x) => x.tagName === 'SCRIPT' && x['type'] === 'application/json')
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
      /** If there is an embedded <style> tag in the slot
       *  "import" it in the shadow dom
       */
      importStyle() {
          if (this.importedStyle) {
              const style = document.createElement('style');
              style.textContent = this.importedStyle;
              this.shadowRoot.append(style);
          }
      }
  }
  /**
   * An element can have multiple 'parts', which function as a kind of
   * parallel classList.
   *
   * Add a part name to the part list of this element.
   */
  function addPart(el, part) {
      var _a;
      if (!el)
          return;
      const current = (_a = el.getAttribute('part')) !== null && _a !== void 0 ? _a : '';
      if (!current.includes(part)) {
          el.setAttribute('part', `${current} ${part}`);
      }
  }
  /**
   * Remove a part name from the part list of this element.
   */
  function removePart(el, part) {
      var _a;
      if (!el)
          return;
      const current = (_a = el.getAttribute('part')) !== null && _a !== void 0 ? _a : '';
      if (current.includes(part)) {
          el.setAttribute('part', current.replace(new RegExp('\\bs*' + part + 's*\\b', 'g'), ''));
      }
  }
  function getComputedDir(el) {
      if (el.dir && el.dir !== 'auto')
          return el.dir;
      if (el.parentElement)
          return getComputedDir(el.parentElement);
      return 'ltr';
  }
  function getOppositeEdge(bounds, position, direction) {
      if (position === 'left' ||
          (position === 'leading' && direction === 'ltr') ||
          (position === 'trailing' && direction === 'rtl')) {
          return bounds.right;
      }
      return bounds.left;
  }
  function getEdge(bounds, position, direction) {
      if (position === 'left' ||
          (position === 'leading' && direction === 'ltr') ||
          (position === 'trailing' && direction === 'rtl')) {
          return bounds.left;
      }
      return bounds.right;
  }

  const MENU_TEMPLATE = document.createElement('template');
  MENU_TEMPLATE.innerHTML = `<ul></ul><slot></slot>`;
  const MENU_STYLE = document.createElement('template');
  MENU_STYLE.innerHTML = `<style>
*,
::before,
::after {
    box-sizing: border-box;
}
:host {
    display: none;
    color-scheme: light dark;
    -webkit-user-select: none;  /* Important: Safari iOS doesn't respect user-select */
    user-select: none;
    cursor: default;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: rgba(0 0 0 0);
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
    pointer-events: none;
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
    height: auto;
    z-index: 10000;
    border-radius: 8px;
    background: var(--menu-bg);
    box-shadow: 0 0 2px rgba(0, 0, 0, .5), 0 0 20px rgba(0, 0, 0, .2);

    list-style: none;
    padding: 6px 0 6px 0;
    margin: 0;
    user-select: none;
    cursor: default;

    color: var(--label-color);
    font-weight: normal;
    font-style: normal;
    text-shadow: none;
    text-transform: none;
    letter-spacing: 0;
    outline: none;
    opacity: 1;
}
ul.menu-container > li {
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
    user-select: none;
    cursor: default;
    text-align: left;
    color: inherit;

    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    line-height: 16px;
    letter-spacing: 0.007em;
}
ul.menu-container > li > .label {
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

ul.menu-container > li > .label.indent {
    margin-left: 12px;
}
ul.menu-container > li[role=divider] {
    border-bottom: 1px solid #c7c7c7;
    border-radius: 0;
    padding: 0;
    margin-left: 15px;
    margin-right: 15px;
    padding-top: 5px;
    margin-bottom: 5px;
    width: calc(100% - 30px);
}
ul.menu-container > li[aria-disabled=true] {
    opacity: .5;
}

ul.menu-container > li.active {
    background: var(--active-bg);
    background: -apple-system-control-accent;
    color: var(--active-label-color);
}

ul.menu-container > li.active.is-submenu-open {
    background: var(--active-bg-dimmed);
    color: inherit;
}

ul.menu-container > li[aria-haspopup=true]>.label {
     padding-right: 0;
}

.right-chevron {
    margin-left: 24px;
    width: 10px;
    height: 10px;
    margin-bottom: 4px;
}
.checkmark {
    margin-right: -11px;
    margin-left: -4px;
    margin-top : 2px;
    width: 16px;
    height: 16px;
}

ul.menu-container > li[aria-haspopup=true].active::after {
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

  class Scrim {
      /**
       * - If `options.preventOverlayClose` is false, the scrim is closed if the
       * user clicks on the scrim. That's the behavior for menus, for example.
       * When you need a fully modal situation until the user has made an
       * explicit choice (validating cookie usage, for example), set
       * `preventOverlayClose` to true.
       * - `onClose()` is called when the scrim is being closed
       * -
       */
      constructor(options) {
          var _a, _b;
          this.preventOverlayClose = (_a = options === null || options === void 0 ? void 0 : options.preventOverlayClose) !== null && _a !== void 0 ? _a : false;
          this.translucent = (_b = options === null || options === void 0 ? void 0 : options.translucent) !== null && _b !== void 0 ? _b : false;
          this.state = 'closed';
      }
      get element() {
          if (this._element)
              return this._element;
          const el = document.createElement('div');
          el.setAttribute('role', 'presentation');
          el.style.position = 'fixed';
          el.style['contain'] = 'content';
          el.style.top = '0';
          el.style.left = '0';
          el.style.right = '0';
          el.style.bottom = '0';
          el.style.zIndex = '9999';
          el.style.outline = 'none';
          if (this.translucent) {
              el.style.background = 'rgba(255, 255, 255, .2)';
              el.style['backdropFilter'] = 'contrast(40%)';
          }
          else {
              el.style.background = 'transparent';
          }
          this._element = el;
          return el;
      }
      open(options) {
          var _a;
          if (this.state !== 'closed')
              return;
          this.state = 'opening';
          // Remember the previously focused element. We'll restore it when we close.
          this.savedActiveElement = deepActiveElement();
          const el = this.element;
          ((_a = options === null || options === void 0 ? void 0 : options.root) !== null && _a !== void 0 ? _a : document.body).appendChild(el);
          el.addEventListener('click', this);
          document.addEventListener('touchmove', this, false);
          document.addEventListener('scroll', this, false);
          // Prevent (some) scrolling
          // (touch scrolling will still happen)
          const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
          this.savedMarginRight = document.body.style.marginRight;
          this.savedOverflow = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
          const marginRight = parseFloat(getComputedStyle(document.body).marginRight);
          document.body.style.marginRight = `${marginRight + scrollbarWidth}px`;
          if (options === null || options === void 0 ? void 0 : options.child) {
              el.appendChild(options.child);
          }
          this.state = 'open';
      }
      close() {
          var _a, _b;
          if (this.state !== 'open')
              return;
          this.state = 'closing';
          if (typeof this.onClose === 'function')
              this.onClose();
          const el = this.element;
          el.removeEventListener('click', this);
          document.removeEventListener('touchmove', this, false);
          document.removeEventListener('scroll', this, false);
          el.parentNode.removeChild(el);
          // Restore body state
          document.body.style.overflow = this.savedOverflow;
          document.body.style.marginRight = this.savedMarginRight;
          // Restore the previously focused element
          (_b = (_a = this.savedActiveElement) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
          // Remove all children
          el.innerHTML = '';
          this.state = 'closed';
      }
      handleEvent(ev) {
          if (!this.preventOverlayClose) {
              if (ev.target === this._element && ev.type === 'click') {
                  this.close();
                  ev.preventDefault();
                  ev.stopPropagation();
                  return;
              }
              else if (ev.target === document &&
                  (ev.type === 'touchmove' || ev.type === 'scroll')) {
                  // This is an attempt at scrolling on a touch-device
                  this.close();
                  ev.preventDefault();
                  ev.stopPropagation();
                  return;
              }
          }
      }
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
   * Calculate the effective position (width or height) given a starting pos,
   * a placement (left, top, middle, etc...) and dir (ltr/rtl).
   */
  function getEffectivePos(pos, length, placement, dir) {
      if (placement === 'middle') {
          return pos - length / 2;
      }
      else if ((placement === 'start' && dir === 'ltr') ||
          (placement === 'end' && dir === 'rtl') ||
          placement === 'top' ||
          placement === 'left') {
          return Math.max(0, pos - length);
      }
      return pos;
  }
  function getOppositeEffectivePos(pos, length, placement, dir) {
      if (placement === 'middle') {
          return pos - length / 2;
      }
      else if ((placement === 'start' && dir === 'ltr') ||
          (placement === 'end' && dir === 'rtl') ||
          placement === 'top' ||
          placement === 'left') {
          return pos;
      }
      return pos - length;
  }
  /**
   * Set the position of the element so that it fits in the viewport.
   *
   * The element is first positioned at `location`.
   * If it overflows and there is an alternate location, use the alternate
   * location to fit the topright at the alternate location.
   *
   * If the element still overflows, adjust its location moving it up and to the
   * left as necessary until it fits (and adjusting its width/height as a result)
   */
  function fitInViewport(el, options) {
      var _a, _b, _c;
      const dir = (_a = getComputedDir(el)) !== null && _a !== void 0 ? _a : 'ltr';
      // Reset any location, so we can get the natural width/height
      el.style.display = 'block';
      el.style.position = 'absolute';
      el.style.left = 'auto';
      el.style.top = 'auto';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.height = 'auto';
      el.style.width = 'auto';
      const elementBounds = el.getBoundingClientRect();
      //
      // Vertical positioning
      //
      const maxHeight = isFinite(options.maxHeight)
          ? Math.min(options.maxHeight, window.innerHeight)
          : window.innerHeight;
      let height = Math.min(maxHeight, (_b = options.height) !== null && _b !== void 0 ? _b : elementBounds.height);
      let top = getEffectivePos(options.location[1], height, options.verticalPos, dir);
      if (top + height > window.innerHeight - 8) {
          if (options.alternateLocation) {
              top = getEffectivePos(options.alternateLocation[1], height, options.verticalPos, dir);
              if (top + height > window.innerHeight - 8) {
                  top = undefined;
              }
          }
          else {
              top = undefined;
          }
      }
      if (!isFinite(top)) {
          // Move element as high as possible
          top = Math.max(8, window.innerHeight - 8 - height);
          if (8 + height > window.innerHeight - 8) {
              // Still doesn't fit, we'll clamp it
              el.style.bottom = '8px';
          }
      }
      height = Math.min(top + height, window.innerHeight - 8) - top;
      //
      // Horizontal positioning
      //
      const maxWidth = isFinite(options.maxWidth)
          ? Math.min(options.maxWidth, window.innerWidth)
          : window.innerWidth;
      let width = Math.min(maxWidth, (_c = options.width) !== null && _c !== void 0 ? _c : elementBounds.width);
      let left = getEffectivePos(options.location[0], width, options.horizontalPos, dir);
      if (left + width > window.innerWidth - 8) {
          if (options.alternateLocation) {
              left = getOppositeEffectivePos(options.alternateLocation[0], width, options.verticalPos, dir);
              if (left + width > window.innerWidth - 8) {
                  left = undefined;
              }
          }
          else {
              left = undefined;
          }
      }
      if (!isFinite(left)) {
          // Move element as high as possible
          left = Math.max(8, window.innerWidth - 8 - width);
          if (8 + width > window.innerWidth - 8) {
              // Still doesn't fit, we'll clamp it
              el.style.right = '8px';
          }
      }
      width = Math.min(left + width, window.innerWidth - 8) - left;
      el.style.left = `${Math.round(left).toString()}px`;
      el.style.top = `${Math.round(top).toString()}px`;
      el.style.height = `${Math.round(height).toString()}px`;
      el.style.width = `${Math.round(width).toString()}px`;
  }

  /**
   * Base class to represent a menu item.
   * There are two subclasses:
   * - MenuItemFromTemplate for menu items created from a JSON template
   * - MenuItemFromElement for menu items created for a UIMenuItem
   */
  class MenuItem {
      constructor(parentMenu) {
          this.parentMenu = parentMenu;
      }
      handleEvent(event) {
          var _a;
          if (event.type === 'pointerenter') {
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
          else if (event.type === 'pointerleave') {
              if (this.parentMenu.rootMenu.activeMenu === this.parentMenu) {
                  this.parentMenu.activeMenuItem = null;
              }
          }
          else if (event.type === 'pointerup') {
              // when modal, the items are activated on click,
              // so ignore mouseup
              if (this.parentMenu.rootMenu.state !== 'modal') {
                  this.select(keyboardModifiersFromEvent(event));
              }
              event.stopPropagation();
              event.preventDefault();
          }
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
          this.active = false;
          setTimeout(() => {
              this.active = true;
              setTimeout(() => {
                  this.active = false;
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
          const bounds = this.element.getBoundingClientRect();
          this.submenu.show({
              location: [bounds.right, bounds.top - 4],
              alternateLocation: [bounds.left, bounds.top - 4],
              parent: this.parentMenu.rootMenu.element.parentNode,
              keyboardModifiers: kbd,
          });
      }
      movingTowardSubmenu(ev) {
          const lastEv = this.parentMenu.rootMenu.lastMoveEvent;
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
  function speed(dx, dy, dt) {
      return Math.sqrt(dx * dx + dy * dy) / dt;
  }

  const MENU_ITEM_STYLE = document.createElement('template');
  MENU_ITEM_STYLE.innerHTML = `<style>
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

:host([active]) {
    color: var(--active-label-color);
}

@media (prefers-color-scheme: dark) {
    :host {
        --label-color: #fff;
        --active-label-color: #000;
        --menu-bg: #525252;
        --active-bg: #5898ff;
        --active-bg-dimmed: #5c5c5;
    }
}</style>`;
  const MENU_ITEM_TEMPLATE = document.createElement('template');
  MENU_ITEM_TEMPLATE.innerHTML = '<slot></slot>';
  /**
   * Each `UIMenuItemElement` is wrapped inside a `<li>` tag.
   * A `UIMenuItemElement` represents the label part of a menu item.
   * Other elements such as the checkmark and the submenu indicator
   * are rendered by the menu container.
   */
  class UIMenuItem extends UIElement {
      constructor() {
          super({ template: MENU_ITEM_TEMPLATE, style: MENU_ITEM_STYLE });
          this.reflectBooleanAttributes([
              'active',
              'divider',
              'disabled',
              'checked',
          ]);
      }
      set menuItem(value) {
          this._menuItem = value;
      }
      get menuItem() {
          return this._menuItem;
      }
  }
  if (!window.customElements.get('ui-menu-item')) {
      window.UIMenuItem = UIMenuItem;
      window.customElements.define('ui-menu-item', UIMenuItem);
  }

  /**
   * An instance of `Menu` is a model of a collection of menu items, including
   * submenus.
   *
   *
   */
  class Menu {
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
      constructor(menuItems, options) {
          var _a;
          this.parentMenu = (_a = options === null || options === void 0 ? void 0 : options.parentMenu) !== null && _a !== void 0 ? _a : null;
          this._assignedContainer = options === null || options === void 0 ? void 0 : options.assignedContainer;
          this._menuItemsTemplate = menuItems;
          this.isSubmenuOpen = false;
          this.menuHost = options === null || options === void 0 ? void 0 : options.host;
      }
      handleEvent(event) {
          if (event.type === 'wheel' && this._element) {
              const ev = event;
              // Scroll wheel: adjust scroll position
              this._element.scrollBy(0, ev.deltaY);
              event.preventDefault();
              event.stopPropagation();
          }
      }
      get rootMenu() {
          var _a;
          return (_a = this.parentMenu) === null || _a === void 0 ? void 0 : _a.rootMenu;
      }
      dispatchEvent(ev) {
          return this.rootMenu.dispatchEvent(ev);
      }
      /**
       * Update the 'model' of this menu (i.e. list of menu items) based
       * on:
       * - the state of the keyboard, for programmatically specified items
       * - the content of the JSON and elements inside the host element
       * (if there is one)
       */
      updateMenu(keyboardModifiers) {
          var _a, _b;
          // Save the current menu
          const elem = this._element;
          let saveCurrentItem;
          let left;
          let top;
          let parent;
          if (elem) {
              // If there is a cached element for this menu,
              // remove it (but save its state)
              saveCurrentItem = this._menuItems.indexOf(this.activeMenuItem);
              parent = elem.parentNode;
              left = elem.style.left;
              top = elem.style.top;
              parent === null || parent === void 0 ? void 0 : parent.removeChild(elem);
              this._element = null;
          }
          this._menuItems = [];
          this.hasCheckbox = false;
          this.hasRadio = false;
          if (this._menuItemsTemplate) {
              this._menuItemsTemplate.forEach((x) => this.appendMenuItem(x, keyboardModifiers));
          }
          // Add menu-item-elements
          if ((_a = this.menuHost) === null || _a === void 0 ? void 0 : _a.shadowRoot) {
              const itemElements = this.menuHost.shadowRoot
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
              fitInViewport(this.element, {
                  location: [parseInt(left), parseInt(top)],
                  verticalPos: 'bottom',
                  horizontalPos: 'right',
              });
              this.activeMenuItem = this.menuItems[saveCurrentItem];
              if ((_b = this.activeMenuItem) === null || _b === void 0 ? void 0 : _b.submenu) {
                  this.activeMenuItem.openSubmenu(keyboardModifiers);
              }
          }
      }
      get menuItems() {
          return this._menuItems;
      }
      set menuItemTemplates(value) {
          this._menuItemsTemplate = value;
          if (this._element) {
              if (this.menuItems.filter((x) => !x.hidden).length === 0) {
                  this.hide();
                  return;
              }
              this.updateMenu();
          }
      }
      /** First activable menu item */
      get firstMenuItem() {
          let result = 0;
          let found = false;
          const menuItems = this.menuItems;
          while (!found && result <= menuItems.length - 1) {
              const item = menuItems[result];
              found = item.type !== 'divider' && !item.hidden && !item.disabled;
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
              found = item.type !== 'divider' && !item.hidden && !item.disabled;
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
              found = item.type !== 'divider' && !item.hidden && !item.disabled;
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
          const candidates = this._menuItems.filter((x) => x.type !== 'divider' && !x.hidden && !x.disabled);
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
      makeElement(container) {
          var _a;
          const ul = container !== null && container !== void 0 ? container : document.createElement('ul');
          ul.classList.add('menu-container');
          ul.setAttribute('part', 'menu-container');
          ul.setAttribute('tabindex', '-1');
          ul.setAttribute('role', 'menu');
          ul.setAttribute('aria-orientation', 'vertical');
          ul.addEventListener('wheel', this);
          // Remove all items
          ul.textContent = '';
          // Add back all necessary items (after they've been updated if applicable)
          this._menuItems.forEach((x) => {
              const elem = x.element;
              if (elem)
                  ul.appendChild(elem);
          });
          (_a = ul.querySelector('li:first-of-type')) === null || _a === void 0 ? void 0 : _a.setAttribute('tabindex', '0');
          return ul;
      }
      /**
       * Construct (or return a cached version) of an element representing
       * the items in this menu (model -> view)
       */
      get element() {
          if (!this._element) {
              this._element = this.makeElement(this._assignedContainer);
          }
          return this._element;
      }
      /**
       * @param parent: where the menu should be attached
       * @return false if no menu to show
       */
      show(options) {
          this.updateMenu(options === null || options === void 0 ? void 0 : options.keyboardModifiers);
          if (this.menuItems.filter((x) => !x.hidden).length === 0)
              return false;
          options.parent.appendChild(this.element);
          if (options.location) {
              fitInViewport(this.element, {
                  location: options.location,
                  alternateLocation: options.alternateLocation,
                  verticalPos: 'bottom',
                  horizontalPos: 'right',
              });
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
          if ((_a = this.activeMenuItem) === null || _a === void 0 ? void 0 : _a.submenu) {
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
          if (menuItem instanceof UIMenuItem) {
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
  const CHEVRON_RIGHT_TEMPLATE = document.createElement('template');
  CHEVRON_RIGHT_TEMPLATE.innerHTML = `<span aria-hidden="true" class="right-chevron"><svg focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg></span>`;
  const CHECKMARK_TEMPLATE = document.createElement('template');
  CHECKMARK_TEMPLATE.innerHTML = `<span aria-hidden="true" class="checkmark"><svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M435.848 83.466L172.804 346.51l-96.652-96.652c-4.686-4.686-12.284-4.686-16.971 0l-28.284 28.284c-4.686 4.686-4.686 12.284 0 16.971l133.421 133.421c4.686 4.686 12.284 4.686 16.971 0l299.813-299.813c4.686-4.686 4.686-12.284 0-16.971l-28.284-28.284c-4.686-4.686-12.284-4.686-16.97 0z"></path></svg>
</span>`;
  class MenuItemFromTemplate extends MenuItem {
      constructor(template, parentMenu, options) {
          var _a, _b, _c, _d;
          super(parentMenu);
          this.parentMenu = parentMenu;
          this._hidden = (_a = evalToBoolean(template, template.hidden, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _a !== void 0 ? _a : false;
          this._disabled = (_b = evalToBoolean(template, template.disabled, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _b !== void 0 ? _b : false;
          this.checked = (_c = evalToBoolean(template, template.checked, options === null || options === void 0 ? void 0 : options.keyboardModifiers)) !== null && _c !== void 0 ? _c : false;
          this.id = template.id;
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
          if (this.type === 'divider') {
              const li = document.createElement('li');
              li.setAttribute('part', 'menu-divider');
              li.setAttribute('role', 'divider');
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
          if (this.submenu) {
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
              li.addEventListener('pointerenter', this);
              li.addEventListener('pointerleave', this);
              li.addEventListener('pointerup', this);
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
              this.parentMenu.dispatchEvent(ev);
          }
      }
  }
  class MenuItemFromElement extends MenuItem {
      constructor(element, parentMenu) {
          super(parentMenu);
          this.parentMenu = parentMenu;
          this._sourceElement = element;
          element.menuItem = this;
          // Read a <ui-submenu> element if there is one
          if (element.shadowRoot) {
              const submenuElements = element.shadowRoot
                  .querySelector('slot')
                  .assignedElements()
                  .filter((x) => x.tagName === 'UI-SUBMENU');
              console.assert((submenuElements === null || submenuElements === void 0 ? void 0 : submenuElements.length) <= 1, 'Expected no more than one submenu');
              if (submenuElements && submenuElements.length >= 1) {
                  this.submenu = new Submenu({
                      host: submenuElements[0],
                      parentMenu: parentMenu,
                  });
              }
          }
      }
      get type() {
          if (this.divider)
              return 'divider';
          if (this.submenu)
              return 'submenu';
          // @todo:  radio, checkbox
          return 'normal';
      }
      get label() {
          return this._sourceElement.innerHTML;
      }
      get hidden() {
          return this._sourceElement.hasAttribute('hidden');
      }
      set hidden(value) {
          var _a;
          if (value) {
              (_a = this._sourceElementClone) === null || _a === void 0 ? void 0 : _a.setAttribute('hidden', '');
          }
          else {
              this._sourceElementClone.removeAttribute('hidden');
          }
      }
      get disabled() {
          return this._sourceElement.hasAttribute('disabled');
      }
      set disabled(value) {
          var _a, _b;
          if (value) {
              (_a = this._sourceElementClone) === null || _a === void 0 ? void 0 : _a.setAttribute('disabled', '');
              addPart(this._cachedElement, 'disabled');
          }
          else {
              (_b = this._sourceElementClone) === null || _b === void 0 ? void 0 : _b.removeAttribute('disabled');
              removePart(this._cachedElement, 'disabled');
          }
      }
      get checked() {
          return this._sourceElement.hasAttribute('checked');
      }
      set checked(value) {
          var _a, _b;
          if (value) {
              (_a = this._sourceElementClone) === null || _a === void 0 ? void 0 : _a.setAttribute('checked', '');
              addPart(this._cachedElement, 'checked');
          }
          else {
              (_b = this._sourceElementClone) === null || _b === void 0 ? void 0 : _b.removeAttribute('checked');
              removePart(this._cachedElement, 'checked');
          }
      }
      get divider() {
          return this._sourceElement.hasAttribute('divider');
      }
      set divider(value) {
          var _a, _b;
          if (value) {
              (_a = this._sourceElementClone) === null || _a === void 0 ? void 0 : _a.setAttribute('divider', '');
          }
          else {
              (_b = this._sourceElementClone) === null || _b === void 0 ? void 0 : _b.removeAttribute('divider');
          }
      }
      get active() {
          var _a, _b;
          return (_b = (_a = this._cachedElement) === null || _a === void 0 ? void 0 : _a.classList.contains('active')) !== null && _b !== void 0 ? _b : false;
      }
      set active(val) {
          var _a, _b, _c, _d;
          // For the active attribute, set the value on the sourced element
          // (the <ui-menu-item>)
          if (val) {
              (_a = this._cachedElement) === null || _a === void 0 ? void 0 : _a.classList.add('active');
              addPart(this._cachedElement, 'active');
              (_b = this._sourceElementClone) === null || _b === void 0 ? void 0 : _b.setAttribute('active', '');
          }
          else {
              (_c = this._cachedElement) === null || _c === void 0 ? void 0 : _c.classList.remove('active');
              removePart(this._cachedElement, 'active');
              (_d = this._sourceElementClone) === null || _d === void 0 ? void 0 : _d.removeAttribute('active');
          }
      }
      render() {
          if (this.hidden)
              return null;
          if (this.divider) {
              const li = document.createElement('li');
              li.setAttribute('part', 'menu-divider');
              li.setAttribute('role', 'divider');
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
          if (this.submenu) {
              li.setAttribute('aria-haspopup', 'true');
              li.setAttribute('aria-expanded', 'false');
          }
          if (this.disabled) {
              li.setAttribute('aria-disabled', 'true');
          }
          else {
              li.removeAttribute('aria-disabled');
              li.addEventListener('pointerenter', this);
              li.addEventListener('pointerleave', this);
              li.addEventListener('pointerup', this);
          }
          if (!this.disabled) {
              li.addEventListener('click', (ev) => this.select(keyboardModifiersFromEvent(ev)));
          }
          this._sourceElementClone = this._sourceElement.cloneNode(true);
          li.appendChild(this._sourceElementClone);
          if (this.submenu) {
              li.appendChild(CHEVRON_RIGHT_TEMPLATE.content.cloneNode(true));
          }
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
              this.parentMenu.dispatchEvent(ev);
          }
      }
  }
  class Submenu extends Menu {
      constructor(options) {
          super([], {
              parentMenu: options.parentMenu,
              host: options.host,
          });
          this.source = options.host;
      }
      get element() {
          if (this._element)
              return this._element;
          const clone = this.source.cloneNode(true);
          // clone.style.display = 'block';
          clone.importStyle();
          this.makeElement(clone.shadowRoot.querySelector('ul'));
          this._element = clone;
          return clone;
      }
      show(options) {
          return super.show({
              ...options,
              parent: this.parentMenu.rootMenu.scrim,
          });
      }
      /**
       */
      hide() {
          super.hide();
      }
  }

  class RootMenu extends Menu {
      /**
       * If an `options.assignedElement` is provided, the root menu is
       * attached to that element (the element will be modified
       * to display the menu). Use this when using a popup menu.
       * In this mode, call `show()` and `hide()` to control the
       * display of the menu.
       *
       */
      constructor(menuItems, options) {
          super(menuItems, {
              host: options === null || options === void 0 ? void 0 : options.host,
              assignedContainer: options === null || options === void 0 ? void 0 : options.assignedElement,
          });
          this.isDynamic = menuItems.some(isDynamic);
          this.currentKeyboardModifiers = options === null || options === void 0 ? void 0 : options.keyboardModifiers;
          this.typingBuffer = '';
          this.state = 'closed';
          this._scrim = new Scrim({ onClose: () => this.hide() });
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
      handleEvent(event) {
          if (event.type === 'keydown') {
              this.handleKeydownEvent(event);
          }
          else if (event.type === 'keyup') {
              this.handleKeyupEvent(event);
          }
          else if (event.type === 'pointermove') {
              this.lastMoveEvent = event;
          }
          else if (event.type === 'pointerup' && event.target === this.scrim) {
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
          else if (event.type === 'contextmenu') {
              event.preventDefault();
              event.stopPropagation();
              return;
          }
          super.handleEvent(event);
      }
      dispatchEvent(ev) {
          return this.menuHost.dispatchEvent(ev);
      }
      get scrim() {
          return this._scrim.element;
      }
      connectScrim(root) {
          const scrim = this.scrim;
          scrim.addEventListener('pointerup', this);
          scrim.addEventListener('contextmenu', this);
          scrim.addEventListener('keydown', this);
          scrim.addEventListener('keyup', this);
          scrim.addEventListener('pointermove', this);
          this._scrim.open({ root });
      }
      disconnectScrim() {
          const scrim = this.scrim;
          scrim.removeEventListener('pointerup', this);
          scrim.removeEventListener('contextmenu', this);
          scrim.removeEventListener('keydown', this);
          scrim.removeEventListener('keyup', this);
          scrim.removeEventListener('pointermove', this);
          this._scrim.close();
      }
      get rootMenu() {
          // I AM THE ONE WHO KNOCKS
          return this;
      }
      show(options) {
          // Connect the scrim now, so that the menu can be measured and placed
          this.connectScrim(options === null || options === void 0 ? void 0 : options.parent);
          if (!super.show({ ...options, parent: this.scrim })) {
              // There was nothing to show: remove the scrim
              this.disconnectScrim();
              return false;
          }
          // Record the opening time.
          // If we receive a mouseup within a small delta of the open time stamp
          // hold the menu open until it is dismissed, otherwise close it.
          this._openTimestamp = Date.now();
          this.state = 'open';
          return true;
      }
      hide() {
          this.cancelDelayedOperation();
          if (this.state !== 'closed') {
              this.activeMenuItem = null;
              super.hide();
              this.state = 'closed';
              this.disconnectScrim();
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
      /**
       * Delay (in milliseconds) before displaying a submenu.
       * Prevents distracting "flashing" of submenus when moving through the
       * options in a menu.
       */
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
   * - argument to the UIContextMenu constructor
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
  class UIContextMenu extends UIElement {
      constructor(menuItems) {
          super({
              template: MENU_TEMPLATE,
              style: MENU_STYLE,
          });
          this.templateMenuItems = menuItems !== null && menuItems !== void 0 ? menuItems : [];
      }
      set menuItems(menuItems) {
          this.templateMenuItems = menuItems;
          if (this.rootMenu) {
              this.rootMenu.menuItemTemplates = menuItems;
          }
      }
      get menuItems() {
          return this.templateMenuItems;
      }
      /**
       * @internal
       */
      handleEvent(event) {
          var _a, _b;
          (_a = this.longPressDetector) === null || _a === void 0 ? void 0 : _a.dispose();
          this.longPressDetector = undefined;
          if (event.type === 'contextmenu') {
              const evt = event;
              this.show({
                  location: [Math.round(evt.clientX), Math.round(evt.clientY)],
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
                  // Get the center of the parent
                  const bounds = (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect();
                  if (bounds) {
                      this.show({
                          location: [
                              Math.round(bounds.left + bounds.width / 2),
                              Math.round(bounds.top + bounds.height / 2),
                          ],
                          keyboardModifiers: keyboardModifiersFromEvent(evt),
                      });
                      event.preventDefault();
                      event.stopPropagation();
                  }
              }
          }
          else if (event.type === 'pointerdown') {
              if (event.target === this.shadowRoot.host.parentNode) {
                  const pt = eventLocation(event);
                  this.longPressDetector = new LongPressDetector(event, () => {
                      this.show({
                          location: pt,
                          keyboardModifiers: keyboardModifiersFromEvent(event),
                      });
                  });
                  event.preventDefault();
                  event.stopPropagation();
              }
          }
      }
      /**
       * Custom elements lifecycle hooks
       * @internal
       */
      connectedCallback() {
          super.connectedCallback();
          // Listen for contextual menu in the parent
          const parent = this.parentNode;
          parent.addEventListener('contextmenu', this);
          parent.addEventListener('keydown', this);
          parent.addEventListener('pointerdown', this);
      }
      /**
       * Custom elements lifecycle hooks
       * @internal
       */
      disconnectedCallback() {
          super.disconnectedCallback();
          const parent = this.parentNode;
          if (parent) {
              parent.removeEventListener('contextmenu', this);
              parent.removeEventListener('keydown', this);
              parent.removeEventListener('pointerdown', this);
          }
      }
      /**
       * @internal
       */
      focus() {
          var _a;
          super.focus();
          if (((_a = this.rootMenu) === null || _a === void 0 ? void 0 : _a.state) !== 'closed') {
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
          if (!this.rootMenu) {
              // Import inline (in the component) style sheet
              this.importStyle();
              // Inline menu items (as a JSON structure in a <script> tag
              // in the markup)
              let jsonMenuItems = this.json;
              if (!Array.isArray(jsonMenuItems))
                  jsonMenuItems = [];
              this.rootMenu = new RootMenu([...this.templateMenuItems, ...jsonMenuItems], {
                  host: this.shadowRoot.host,
                  assignedElement: this.shadowRoot.querySelector('ul'),
              });
          }
          this.style.display = 'block';
          if (this.rootMenu.show({ ...options, parent: this.shadowRoot })) {
              if (!this.hasAttribute('tabindex')) {
                  this.setAttribute('tabindex', '-1');
              }
              this.focus();
          }
          else {
              this.style.display = 'none';
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
          var _a;
          (_a = this.rootMenu) === null || _a === void 0 ? void 0 : _a.hide();
          this.style.display = 'none';
      }
  }
  if (!window.customElements.get('ui-context-menu')) {
      window.UIContextMenu = UIContextMenu;
      window.customElements.define('ui-context-menu', UIContextMenu);
  }

  class UIPopupMenu extends UIElement {
      constructor(menuItems) {
          super({
              template: MENU_TEMPLATE,
              style: MENU_STYLE,
          });
          this.templateMenuItems = menuItems !== null && menuItems !== void 0 ? menuItems : [];
          this.reflectStringAttribute('position');
      }
      set menuItems(menuItems) {
          this.templateMenuItems = menuItems;
          if (this.rootMenu) {
              this.rootMenu.menuItemTemplates = menuItems;
          }
      }
      get menuItems() {
          return this.templateMenuItems;
      }
      /**
       * @internal
       */
      handleEvent(event) {
          if (event.type === 'keydown' && event.target === this.parentElement) {
              const evt = event;
              if (evt.code === 'Return' || evt.code === 'Enter') {
                  this.show({
                      keyboardModifiers: keyboardModifiersFromEvent(evt),
                  });
                  event.preventDefault();
                  event.stopPropagation();
              }
          }
          else if (event.type === 'pointerdown') {
              console.assert(this.shadowRoot.host.parentNode === this.parentElement);
              if (event.target === this.shadowRoot.host.parentNode) {
                  this.show({
                      keyboardModifiers: keyboardModifiersFromEvent(event),
                  });
                  event.preventDefault();
                  event.stopPropagation();
              }
          }
      }
      /**
       * Custom elements lifecycle hooks
       * @internal
       */
      connectedCallback() {
          super.connectedCallback();
          // Listen for contextual menu in the parent
          const parent = this.parentNode;
          parent.addEventListener('keydown', this);
          parent.addEventListener('pointerdown', this);
      }
      /**
       * Custom elements lifecycle hooks
       * @internal
       */
      disconnectedCallback() {
          super.disconnectedCallback();
          const parent = this.parentNode;
          if (parent) {
              parent.removeEventListener('keydown', this);
              parent.removeEventListener('pointerdown', this);
          }
      }
      /**
       * @internal
       */
      focus() {
          var _a;
          super.focus();
          if (((_a = this.rootMenu) === null || _a === void 0 ? void 0 : _a.state) !== 'closed') {
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
          var _a, _b;
          if (!this.parentElement)
              return;
          if (!this.rootMenu) {
              // Import inline (in the component) style sheet
              this.importStyle();
              // Inline menu items (as a JSON structure in a <script> tag
              // in the markup)
              let jsonMenuItems = this.json;
              if (!Array.isArray(jsonMenuItems))
                  jsonMenuItems = [];
              this.rootMenu = new RootMenu([...this.templateMenuItems, ...jsonMenuItems], {
                  host: this.shadowRoot.host,
                  assignedElement: this.shadowRoot.querySelector('ul'),
              });
          }
          this.style.display = 'inline-block';
          // This is yucky...
          // The 'fixed' display mode (used by the scrim to position itself over
          // the viewport) becomes 'relative' when a transform is specified
          // on a parent element in WebKit and Chromium.
          // See https://stackoverflow.com/revisions/15256339/2
          // So we have to remove any transform that might be present to prevent
          // the scrim from being displayed incorrectly.
          this._savedTransform = window.getComputedStyle(this.parentElement).transform;
          if (this._savedTransform !== 'none') {
              this.parentElement.style.transform = 'none';
          }
          const bounds = this.parentElement.getBoundingClientRect();
          if (this.rootMenu.show({
              ...options,
              location: [
                  getEdge(bounds, (_a = this.position) !== null && _a !== void 0 ? _a : 'leading', this.computedDir),
                  bounds.bottom,
              ],
              alternateLocation: [
                  getOppositeEdge(bounds, (_b = this.position) !== null && _b !== void 0 ? _b : 'leading', this.computedDir),
                  bounds.bottom,
              ],
              parent: this.shadowRoot,
          })) {
              if (!this.hasAttribute('tabindex')) {
                  this.setAttribute('tabindex', '-1');
              }
              this.focus();
          }
          else {
              this.style.display = 'none';
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
          var _a;
          (_a = this.rootMenu) === null || _a === void 0 ? void 0 : _a.hide();
          this.style.display = 'none';
          if (this._savedTransform !== 'none') {
              this.parentElement.style.transform = this._savedTransform;
          }
      }
  }
  if (!window.customElements.get('ui-popup-menu')) {
      window.UIPopupMenu = UIPopupMenu;
      window.customElements.define('ui-popup-menu', UIPopupMenu);
  }

  /**
   * Use `<ui-submenu>` as a child of a `<ui-menuitem>`.
   *
   * This element is used as a "template" for a submenu when a
   * menu is displayed: it displays nothing by itself.
   *
   * It can include a `<style>` tag.
   */
  class UISubmenu extends UIElement {
      constructor() {
          super({
              template: MENU_TEMPLATE,
              style: MENU_STYLE,
          });
      }
  }
  if (!window.customElements.get('ui-submenu')) {
      window.UISubmenu = UISubmenu;
      window.customElements.define('ui-submenu', UISubmenu);
  }

  exports.UIContextMenu = UIContextMenu;
  exports.UIPopupMenu = UIPopupMenu;
  exports.UISubmenu = UISubmenu;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=ui.js.map
