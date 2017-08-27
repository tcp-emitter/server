[![Build Status](https://travis-ci.org/tcp-emitter/server.svg?branch=master)](https://travis-ci.org/tcp-emitter/server)

# TCP Emitter Server

`TCP Emitter Server` is a [net.Server](https://nodejs.org/api/net.html#net_class_net_server) object that acts as an [Event Emitter](https://nodejs.org/api/events.html#events_class_eventemitter) router for different processes. These processes (known as `TCP Emitter clients`) can be implemented in any language and interact with `TCP Emitter server` via the [TCP Protocol](https://tools.ietf.org/html/rfc793).

# Installation

```
npm install --save tcp-emitter
```

# API
## require('tcp-emitter')(options)

Options                | Type       | Default      | Description
---------------------- | ---------- | ------------ | -----------
`options.delimiter`    | `string`   | '@@@'        | Delimiter used to seperate payloads in a single TCP request. [More info here](#delimiter).
`options.verifyClient` | `function` | `() => true` | Function used to determine whether to allow or deny a `TCP Emitter client` connection. By default all connections are allowed. [More info here](#verify-client).

### Delimiter
Delimiter used to seperate payloads in a single TCP request. Apart from making it possible for `TCP Emitter clients` to combine multiple payloads in a single TCP request, this was mainly implemented due to the use of [Nagle's algorithm](https://en.wikipedia.org/wiki/Nagle%27s_algorithm) in NodeJS [net](https://nodejs.org/api/net.html) module. When sending data through TCP while using `net` module in seperate [.write()](https://nodejs.org/api/net.html#net_socket_write_data_encoding_callback) invocations, it will try to combine the messages together and send them in a single TCP request. For this reason when sending a payload (even when a TCP message consist of one payload), it should end with the specified delimiter.

#### Nagle's algorithm in NodeJS
```javascript
// Sending a message from the client side.
clientSocket.write('hello')
clientSocket.write('world')

// Receiving the message from the server side.
serverSocket.on('data', console.log) // => 'helloworld'
```

### Verify Client
Function used to verify whether a connection should be allowed or denied. When omitted, all connections are allowed. When specified a connection will be allowed if it returns `true`. When this function requires async processing it should return a `Promise` resolved with `true` to allow a connection or any other value but `true` to deny it.

### Synchronous Verify Client.
```javascript
const verifyClient = socket => allowed.indexOf(socket.address().address) !== -1
require('tcpEmitter')(verifyClient).listen({ host: 'localhost', port: 8080 })
```

### Asynchronous Verify Client
```javascript
const verifyClient = socket => {
  return makeRequest('GET', '/allowed').then(allowed => {
    return allowed.indexOf(socket.address().address) !== -1
  })
}

require('tcpEmitter')(verifyClient).listen({ host: 'localhost', port: 8080 })
```

# Events

The following table contains the events emitted by TCP Emitter server

Name        | Description
----------- | -----------
`subscribe`   | Event emitted when a `TCP Emitter client` subscribes to a TCP Emitter event. The listeners of this event are invoked with the `TCP Emitter client` & `event name`. Note when a `TCP Emitter client` requests to subscribe to an event that it is already subscribed to, this event is not emitted.
`unsubscribe` | Event emitted when a `TCP Emitter client` unsubscribes to a TCP Emitter event. The listeners of this event are invoked with the TCP Emitter client & event name. Note when a `TCP Emitter client` requests to unsubscribe from an event that it is not subscribed to, this event is not emitted.
`broadcast`   | Event emitted when a `TCP Emitter client` broadcasts to a TCP Emitter event. The listeners of this event are invoked with the `TCP Emitter client`, `event name` & `broadcast arguments`.

# TCP Emitter Clients
As specified in the introduction, these can be implemented in any language as long as they follow the TCP Emitter Payload spec. A TCP Emitter client can do the following three different interactions with the `TCP Emitter server`:

> Examples assume that '@@@' delimiter is used. For more info about why delimiter is used please [refer to this section](#delimiter).

Name        | Description
----------- | -------------------------------------------------------------------------------
subscribe   | Subscribe (Listen) to an event.
unsubscribe | Unsubscribe from an event.
broadcast   | Broadcast (notify) the listeners (i.e. other `TCP Emitter clients`) of an event.

## Payload Spec

### Subscribe
Attribute | Type     | Description
--------- | -------- | --------------------
`type`    | `string` | Type of interaction, for a subscription this should be set to `subscribe`.
`event`   | `string` | Name of event to subscribe to.

### Example
``` json
{"type": "subscribe", "event": "event-name"}@@@
```

### Unsubscribe
Attribute | Type     | Description
--------- | -------- | --------------------
`type`    | `string` | Type of interaction, for an unsubscription this should be set to `unsubscribe`.
`event`   | `string` | Name of event to unsubscribe from.

### Example
``` json
{"type": "unsubscribe", "event": "event-name"}@@@
```

### Broadcast
Attribute | Type          | Description
--------- | ------------- | --------------------
`type`    | `string`      | Type of interaction, for a broadcast this should be set to `broadcast`.
`event`   | `string`      | Name of event to broadcast to.
`args`    | `Array.<any>` | Arguments that will be broadcasted to the TCP Emitter clients with the event.

> When a TCP Emitter client broadcasts to an event which itself is subscribed to, it won't be notified by TCP Emitter server.

### Example
``` json
{"type": "broadcast", "event": "event-name", "args": [1, "text", true, {"name": "luca"}]}@@@
```

## Multi-Payload TCP Request
As mentioned in the delimiter section, TCP Emitter clients can send multiple payloads in a single TCP Request. The following is an example of a TCP Request message containing multiple payloads.

```json
{"type": "subscribe", "event": "new-user"}@@@{"type": "unsubscribe", "event": "new-admin"}@@@{"type": "broadcast", "event": "access-change", "args": ["user"]}@@@
```

# Example
TCP Emitter server configured with a delimiter set to `!!!`
```javascript
require('tcp-emitter')({
  delimiter: '!!!'
}).listen({ host: 'localhost', port: 8080 })
```

> Note in this example `TCP Emitter clients` are implemented in JavaScript, however as mentioned in the introduction these can be implemented in any language.

TCP Emitter client 1.
```javascript
const clientOne = require('net').createConnection({
  host: 'localhost',
  port: 8080
}, () => {
  clientOne.on('data', console.log)
  
  clientOne.setEncoding('utf-8')

  clientOne.write(JSON.stringify({
    type: 'subscribe',
    event: 'got-episode'
  }) + '!!!')
})
```

TCP Emitter client 2.
```javascript
const clientTwo = require('net').createConnection({
  host: 'localhost',
  port: 8080
}, () => {
  clientTwo.on('data', console.log)
  
  clientTwo.setEncoding('utf-8')

  clientTwo.write(JSON.stringify({
    type: 'subscribe',
    event: 'got-episode'
  }) + '!!!')
})
```

When TCP Emitter 1 broadcasts to `got-episode` event:

```javascript
clientOne.write(JSON.stringify({
  type: 'broadcast',
  event: 'got-episode',
  args: ['S7E5 - Eastwatch']
}) + '!!!')
```

TCP Emitter 2 'data' listener will be invoked with the following string:
```javascript
'{"event":"got-episode","args":["S7E5 - Eastwatch"]}!!!'
```

# Tests
```
npm install
npm test
```

# Generate Documentation
```
npm install
npm run docs
```

# License
ISC
