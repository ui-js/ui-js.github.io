import { Json } from './json';
import { Updatable } from './updatable';
/**
 * In general, the 'source of truth' should be a property rather than an
 * attribute.
 *
 * When that's the case, the property definition specifies how the attribute
 * and property should coordinate:
 * - read initial property value from attribute (or not if attribute = false)
 * - observe attribute: update property value when attribute is changed (or not )
 * - reflect property: update attribute value when property value is changed (or not)
 *
 * If the source of truth is an attribute, simply declare a get/set accessor
 * for the property that reads/write to the attribute.
 */
export declare type PropertyDefinition = {
    type: String | Boolean | Number | Function | string[];
    default: string;
    /** If a string, reflect property to attribute with specified name
     * If true, reflect property to attribute named from property name (kebab-case
     * variant)
     * If false, don't initialize property with attribute value, attribute
     * changes will not affect property
     * Default: true
     */
    attribute: boolean | string;
    /**
     * When attribute is updated => property is updated
     * When property is updated:
     * If true => the attribute is updated
     * If false => the attribute is *not* updated
     * Default: false
     */
    reflect: boolean;
};
/**
 * - When the 'source of truth' is an attribute
 * - Adds property getter/setter reflecting the value of the attribute
 * - Use when the attribute is readonly (used for the construction of the element)
 * or rarely changed
 */
/**
 * @internal
 */
export declare abstract class UIElement extends HTMLElement implements Updatable {
    static registry: Record<string, CustomElementConstructor>;
    static properties: Readonly<Record<string, PropertyDefinition>>;
    private _json?;
    private _style?;
    constructor(options?: {
        template: string | HTMLTemplateElement;
        style: string | HTMLTemplateElement;
    });
    static register(options: {
        tag: string;
        className: string;
        constructor: CustomElementConstructor;
    }): Promise<void>;
    private static getAttributeNameForProperty;
    static get observedAttributes(): string[];
    set dirty(value: boolean);
    /**
     * Declare that an attribute should be reflected as a property
     */
    reflectStringAttribute(attrName: string, propName?: string): void;
    /**
     * Declare that an attribute should be reflected as a property
     */
    reflectBooleanAttribute(attrName: string, propName?: string): void;
    /**
     * Declare that an attribute should be reflected as a property
     */
    reflectEnumAttribute(attrName: string, attrValues: string[], propName?: string): void;
    reflectBooleanAttributes(attrNames: (string | [attrName: string, propName: string])[]): void;
    reflectStringAttributes(attrNames: (string | [attrName: string, propName: string])[]): void;
    get computedDir(): 'rtl' | 'ltr';
    /**
     * @internal
     */
    connectedCallback(): void;
    /**
     * @internal
     */
    disconnectedCallback(): void;
    /**
     * @internal
     */
    protected get json(): Json;
    /**
     * @internal
     */
    protected get importedStyle(): HTMLStyleElement | null;
    /** If there is an embedded <style> tag in the slot
     *  "import" it in the shadow dom
     */
    importStyle(): void;
    update(): void;
    /**
     * Return a `HTMLElement` that will get attached to the root of
     * this element.
     * Event handlers should get added as well.
     */
    render(): HTMLElement | null;
}
/**
 * An element can have multiple 'parts', which function as a kind of
 * parallel classList.
 *
 * Add a part name to the part list of this element.
 */
export declare function addPart(element: HTMLElement, part: string): void;
/**
 * Remove a part name from the part list of this element.
 */
export declare function removePart(element: HTMLElement, part: string): void;
export declare function getComputedDir(element: HTMLElement): 'ltr' | 'rtl';
export declare function getOppositeEdge(bounds: DOMRectReadOnly, position: 'leading' | 'trailing' | 'left' | 'end', direction: 'ltr' | 'rtl'): number;
export declare function getEdge(bounds: DOMRectReadOnly, position: 'leading' | 'trailing' | 'left' | 'end', direction: 'ltr' | 'rtl'): number;
export declare function toCamelCase(s: string): string;
