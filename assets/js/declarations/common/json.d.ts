declare type JsonPrimitive = string | number | boolean | null;
interface JsonMap {
    [member: string]: JsonPrimitive | JsonArray | JsonMap;
}
export declare type JsonArray = (JsonPrimitive | JsonArray | JsonMap)[];
export declare type Json = JsonPrimitive | JsonMap | JsonArray;
export {};
