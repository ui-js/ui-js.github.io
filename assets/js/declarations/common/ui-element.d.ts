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
     * @internal
     */
    protected get json(): any;
    /**
     * @internal
     */
    protected get importedStyle(): any;
}
