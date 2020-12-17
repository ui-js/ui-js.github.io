/**
 * @internal
 */
export declare class UIElement extends HTMLElement {
    private _json;
    private _style;
    constructor(options?: {
        template: string | HTMLTemplateElement;
        style: string | HTMLTemplateElement;
    });
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
    protected get json(): any;
    /**
     * @internal
     */
    protected get importedStyle(): any;
    /** If there is an embedded <style> tag in the slot
     *  "import" it in the shadow dom
     */
    importStyle(): void;
}
/**
 * An element can have multiple 'parts', which function as a kind of
 * parallel classList.
 *
 * Add a part name to the part list of this element.
 */
export declare function addPart(el: HTMLElement, part: string): void;
/**
 * Remove a part name from the part list of this element.
 */
export declare function removePart(el: HTMLElement, part: string): void;
export declare function getComputedDir(el: HTMLElement): 'ltr' | 'rtl';
export declare function getOppositeEdge(bounds: DOMRectReadOnly, position: 'leading' | 'trailing' | 'left' | 'end', direction: 'ltr' | 'rtl'): number;
export declare function getEdge(bounds: DOMRectReadOnly, position: 'leading' | 'trailing' | 'left' | 'end', direction: 'ltr' | 'rtl'): number;
