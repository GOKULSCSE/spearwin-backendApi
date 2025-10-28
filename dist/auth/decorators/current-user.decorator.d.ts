export declare const GetCurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export interface CurrentUser {
    id: string;
    email: string;
    role: string;
    [key: string]: any;
}
