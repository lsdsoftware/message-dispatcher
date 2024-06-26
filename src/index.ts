
export type Message = Request|Notification|Response

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

interface Handler<Sender> {
  (args: Record<string, unknown>, sender: Sender): unknown
}

interface PendingRequest {
  promise: Promise<unknown>
  fulfill: (result: unknown) => void
  reject: (error: unknown) => void
}


export function makeMessageDispatcher<Sender>({from, to, requestHandlers}: {
  from: string
  to: string
  requestHandlers: Record<string, Handler<Sender>>
}) {
  const pendingRequests = new Map<string, PendingRequest>()
  return {
    waitForResponse<T>(requestId: string): Promise<T> {
      let pending = pendingRequests.get(requestId)
      if (!pending) pendingRequests.set(requestId, pending = makePending())
      return pending.promise as Promise<T>
    },
    dispatch({message, sender, sendResponse}: {
      message: Message
      sender: Sender
      sendResponse(res: Response): void
    }) {
      if (message.from == from && message.to == to) {
        switch (message.type) {
          case "request": return handleRequest(message, sender, sendResponse)
          case "notification": return handleNotification(message, sender)
          case "response": return handleResponse(message)
        }
      }
    },
    updateHandlers(newHandlers: typeof requestHandlers) {
      requestHandlers = newHandlers
    }
  }



  function makePending(): PendingRequest {
    const pending = {} as PendingRequest
    pending.promise = new Promise((fulfill, reject) => {
      pending.fulfill = fulfill
      pending.reject = reject
    })
    return pending
  }

  function handleRequest(req: Request, sender: Sender, sendResponse: (res: Response) => void): boolean|undefined {
    if (requestHandlers[req.method]) {
      Promise.resolve()
        .then(() => requestHandlers[req.method](req.args || {}, sender))
        .then(
          result => sendResponse({from: req.to, to: req.from, type: "response", id: req.id, result, error: undefined}),
          error => sendResponse({from: req.to, to: req.from, type: "response", id: req.id, result: undefined, error})
        )
      //let caller know that sendResponse will be called asynchronously
      return true
    }
    else {
      console.error("No handler for method", req)
    }
  }

  function handleNotification(ntf: Notification, sender: Sender): void {
    if (requestHandlers[ntf.method]) {
      Promise.resolve()
        .then(() => requestHandlers[ntf.method](ntf.args || {}, sender))
        .catch(error => console.error("Failed to handle notification", ntf, error))
    }
    else {
      console.error("No handler for method", ntf)
    }
  }

  function handleResponse(res: Response): void {
    const pending = pendingRequests.get(res.id)
    if (pending) {
      pendingRequests.delete(res.id)
      if (res.error) pending.reject(res.error)
      else pending.fulfill(res.result)
    }
    else {
      console.error("Stray response", res)
    }
  }
}
