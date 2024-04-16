# message-dispatcher
Dispatch received messages to handlers.  This utility assumes messages are one of three types: request, response, or notification; and follow this format:

```typescript
interface Request {
  from: string
  to: string
  type: "request"
  id: string
  method: string
  args?: Record<string, unknown>
}

interface Notification {
  from: string
  to: string
  type: "notification"
  method: string
  args?: Record<string, unknown>
}

interface Response {
  from: string
  to: string
  type: "response"
  id: string
  error: unknown
  result: unknown
}
```


## Usage
Call `dispatch` to dispatch a received message.  Only messages whose `from` and `to` attributes match those of the dispatcher will be processed.

Requests and notifications are dispatched to handlers provided during construction, while responses are dispatched to response listeners.  To listen for a response, call `waitForResponse` with the request ID.

```typescript
import { makeMessageDispatcher } from "@lsdsoftware/message-dispatcher"

const iframe1MessageDispatcher = makeMessageDispatcher({
  from: "iframe1",
  to: "main",
  requestHandlers: {
    method1(args, sender) {
      //do something
      return result
    },
    async method2(args, sender) {
      //do something
      return result
    }
  }
})

//process messages from iframe1
window.addEventListener("message", event => {
  const sender = {window: event.source, origin: event.origin}
  iframe1MessageDispatcher.dispatch({
    message: event.data,
    sender: sender,
    sendResponse: response => sender.window.postMessage(response, sender.origin)
  })
})

//send a request to iframe1
const id = String(Math.random())
const request = {
  from: "main",
  to: "iframe1",
  type: "request",
  id: id,
  method: "someMethod",
  args: {...}
}
iframe1.contentWindow.postMessage(request, "*")
iframe1MessageDispatcher.waitForResponse(id).then(result => console.log(result))
```
