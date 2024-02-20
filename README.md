# message-dispatcher
This library tries to extract boilerplate message dispatching logic into a reusable module.

It assumes messages follow a basic format (see type definition), and is one of three types: request, response, or notification.

The module provides a method to `dispatch` requests and notifications to predefined handlers, and then generating responses from their return values.

The `dispatch` method will dispatch responses not to the handlers but to response listeners.  The caller registers a response listener by calling the `waitForResponse` method, which returns a promise.

When constructing a dispatcher, caller provides a `myAddress` parameter used to filter messages.  Only requests and notifications whose `to` attribute matches `myAddress` will be processed.

## Usage
```typescript
const handlers = {
  method1({a, b}, sender) {
    //do something
    return result
  },
  async method2({x, y, z}, sender) {
    //do something
    return result
  }
}

const dispatcher = makeDispatcher("myAddress", handlers)

//sample usage

//processing requests and responses
window.addEventListener("message", event => {
  const sender = {window: event.source, origin: event.origin}
  const sendResponse = response => sender.window.postMessage(response, sender.origin)
  dispatcher.dispatch(event.data, sender, sendResponse)
})

//sending requests
const id = String(Math.random())
const request = {to: "someAddress", type: "request", id, method: "someMethod", args: {}}
iframeWindow.postMessage(request, "*")
dispatcher.waitForResponse(id)
  .then(result => console.log(result))
  .catch(console.error)
```
