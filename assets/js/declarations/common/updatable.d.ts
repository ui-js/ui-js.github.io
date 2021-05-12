export interface Updatable {
    update(): void;
}
export declare function dirty(updatable: Updatable): void;
