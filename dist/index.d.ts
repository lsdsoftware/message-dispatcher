export type Message = Request | Notification | Response;
interface Request {
    from: string;
    to: string;
    type: "request";
    id: string;
    method: string;
    args?: Record<string, unknown>;
}
interface Notification {
    from: string;
    to: string;
    type: "notification";
    method: string;
    args?: Record<string, unknown>;
}
interface Response {
    from: string;
    to: string;
    type: "response";
    id: string;
    error: unknown;
    result: unknown;
}
interface Handler<Sender> {
    (args: Record<string, unknown>, sender: Sender): unknown;
}
export declare function makeMessageDispatcher<Sender>({ from, to, requestHandlers }: {
    from: string;
    to: string;
    requestHandlers: Record<string, Handler<Sender>>;
}): {
    waitForResponse<T>(requestId: string): Promise<T>;
    dispatch({ message, sender, sendResponse }: {
        message: Message;
        sender: Sender;
        sendResponse(res: Response): void;
    }): boolean | void;
    updateHandlers(newHandlers: typeof requestHandlers): void;
};
export {};
