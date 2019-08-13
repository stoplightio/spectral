export interface IMessageVars {
    property: string | number;
    error: string;
    description?: string;
}
export declare type MessageInterpolator = (str: string, values: IMessageVars) => string;
export declare const message: MessageInterpolator;
