type Message = Request | Notification | Response;
interface Request {
    to: string;
    type: "request";
    id: "string";
    method: string;
    args: Record<string, unknown>;
}
interface Notification {
    to: string;
    type: "notification";
    method: string;
    args: Record<string, unknown>;
}
interface Response {
    type: "response";
    id: string;
    error: unknown;
    result: unknown;
}
interface Handler {
    (args: Record<string, unknown>, sender: unknown): unknown;
}
export declare function makeDispatcher(myAddress: string, handlers: Record<string, Handler>): {
    waitForResponse<T>(requestId: string): Promise<T>;
    dispatch(message: Message, sender: unknown, sendResponse: (res: Response) => void): boolean | void;
};
export {};
