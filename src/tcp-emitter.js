'use strict'

const eventList = require('./event-list')
const tcpEmitterClient = require('./client')

/**
 * @module tcp-emitter
 * @type {Object}
 */
module.exports = {
  /**
   * Delimiter used to seperate payloads in a single TCP request. Apart from
   * making it possible for TCP Emitter clients to combine multiple payloads in
   * a single TCP request, this was mainly implemented due to the use of
   * 'Nagle's algorithm' in NodeJS 'net' module. When sending data through TCP
   * while using 'net' module in seperate '.write()' invocations, it will try to
   * combine the messages together and send them in a single TCP request. For
   * this reason when sending a payload (even when a TCP message consist of one
   * payload), it should end with the specified delimiter.
   *
   * @example
   * <caption>Nagle's algorithm in 'net' module</caption>
   * // Sending a message from the client side.
   * clientSocket.write('hello')
   * clientSocket.write('world')
   *
   * // Receiving the message from the server side.
   * serverSocket.on('data', console.log) // => 'helloworld'
   *
   * @example
   * <caption>Payload example when delimiter is '@@@'</caption>
   * // Single Payload
   * '{"type": "subscribe", "event": "load"}@@@'
   *
   * // Multiple Payloads
   * '{"type": "subscribe", "event": "load"}@@@{"type": "unsubscribe", "event":"
   * load"}@@@'
   * @see {@link https://en.wikipedia.org/wiki/Nagle%27s_algorithm|
   *      Nagle's algorithm}
   * @see {@link https://nodejs.org/api/net.html|net}
   * @type {string}
   */
  delimiter: null,

  /**
   * Stores info about which events the connected TCP Emitter clients are
   * subscribed to.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @type {Object.<string, Array.<net.Socket>>}
   */
  subscriptions: null,

  /**
   * Function used to initialize a TCP Emitter instance.
   * @param {Object} [opts={}]       TCP Emitter options.
   * @param  {module:tcp-emitter.delimiter} [opts.delimiter="@@@"]
   *                                 Delimiter used to seperate payloads in a
   *                                 single TCP request.
   */
  init (opts = {}) {
    // Setup subscriptions.
    this.subscriptions = {}

    // Setup delimiter.
    this.delimiter = (typeof opts.delimiter === 'string')
      ? opts.delimiter
      : '@@@'
  },

  /**
   * Function used to configure the TCP Emitter client connection to work with
   * TCP Emitter.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {net.Socket} socket TCP Emitter client connection.
   */
  setupSocket (socket) {
    // Create a new instance of TCP Emitter client.
    const tcpEmitterClientInst = Object.assign(Object.create(socket),
      tcpEmitterClient)

    // Initialize the newly created TCP Emitter client.
    tcpEmitterClientInst.init({
      delimiter: this.delimiter
    })

    // Listen for & parse new TCP Emitter payloads sent by the TCP Emitter
    // client.
    tcpEmitterClientInst.on(eventList.payload, payload => {
      this.parsePayload({ payload, socket: tcpEmitterClientInst })
    })

    // When the TCP Emitter client connection is closed, unsubscribe the TCP
    // Emitter client from all of its subscriptions
    tcpEmitterClientInst.on('close', () => {
      // Unsubscribe the TCP Emitter client from all of its subscriptions. Clone
      // the subscriptions list since we will be altering it while unsubscribing
      // the disconnected TCP Emitter client.
      tcpEmitterClientInst.subscriptions.slice(0).forEach(event => {
        this.unsubscribe({ event, socket: tcpEmitterClientInst })
      })
    })
  },

  /**
   * Function used to parse a valid TCP Emitter payload.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {Object} opts             Options for parsePayload function
   * @param  {Object} opts.payload     Payload to be parsed.
   * @param  {net.Socket} opts.socket  TCP Emitter client which the payload
   *                                   originated from.
   */
  parsePayload ({ payload, socket }) {
    switch (payload.type) {
      case 'broadcast':
        return this.broadcast({
          socket,
          args: payload.args,
          event: payload.event
        })

      case 'subscribe':
        return this.subscribe({
          socket,
          event: payload.event
        })

      case 'unsubscribe':
        return this.unsubscribe({
          socket,
          event: payload.event
        })
    }
  },

  /**
   * Function used to subscribe a TCP Emitter client to an event.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {Object} opts            Options for subscribe function.
   * @param  {net.Socket} opts.socket TCP Emitter client to be subscribed.
   * @param  {stirng}     opts.event  Event name which the TCP Emitter client
   *                                  will be subscribing to.
   */
  subscribe ({ socket, event }) {
    // First we will be including the name of the event in the events list
    // inside the TCP Emitter, if it isn't already present.
    if (socket.subscriptions.indexOf(event) === -1) {
      socket.subscriptions.push(event)
    }

    // Next we will be including the TCP Emitter in the event's list of
    // listeners.

    // Try to retrieve the array storing the list of TCP Emitter clients that
    // are subscribed to the specified event. If the event has not yet been
    // subscribed to, create a new entry for it.
    const listeners = (event in this.subscriptions)
      ? this.subscriptions[event]
      : this.subscriptions[event] = []

    // Finally include the TCP Emitter client in the event's list of listeners.
    listeners.push(socket)
  },

  /**
   * Function used to unsubscribe a TCP Emitter client from an event.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {Object} opts            Options for unsubscribe function.
   * @param  {net.Socket} opts.socket TCP Emitter client to be unsubscribed.
   * @param  {string} opts.event      Event name which the TCP Emitter client
   *                                  will be unsubscribed from.
   */
  unsubscribe ({ socket, event }) {
    // First we will be removing the name of the event from the events list
    // stored inside the TCP Emitter client.

    /**
     * The position of the event name in the TCP Emitter client's list.
     * @type {number}
     */
    const subPosition = socket.subscriptions.indexOf(event)

    // Remove the specified event from the list inside TCP Emitter client if it
    // is present.
    if (subPosition !== -1) socket.subscriptions.splice(subPosition, 1)

    // Next we will remove the TCP Emitter client from the list of listeners of
    // the specified event.

    /**
     * Retrieve the specified event's list of listeners.
     * @type {Array.<net.Socket>}
     */
    const listeners = this.subscriptions[event]

    // Stop process if the specified event has no listeners.
    if (listeners === undefined) return

    // Next we will be removing the TCP Emitter client from the event's list of
    // listeners.

    /**
     * The position of the TCP Emitter client inside the event's list of
     * listeners.
     * @type {number}
     */
    const socketPosition = listeners.indexOf(socket)

    // Stop process if the TCP Emitter client is not subscribed to the specified
    // event.
    if (socketPosition === -1) return

    // Remove the TCP Emitter client from the event's list of listeners.
    listeners.splice(socketPosition, 1)

    // Remove the event's entry if it doesn't have any listeners left.
    if (listeners.length === 0) return delete this.subscriptions[event]
  },

  /**
   * Function used to broadcast a payload to the TCP Emitter clients subscribed
   * to an event. Note that when a TCP Emitter client broadcasts to an event
   * which itself is subscribed to, it won't be notified.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {Object} opts            Options for broadcast function.
   * @param  {net.Socket} opts.socket TCP Emitter client broadcasting the
   *                                  payload.
   * @param  {string} opts.event      Event which the payload will be
   *                                  broadcasted to.
   * @param  {Array.<*>} opts.args    Data to be broadcasted.
   */
  broadcast ({ socket, event, args }) {
    /**
     * The list of TCP Emitter clients subscribed to the specified event.
     * @type {Array.<net.Socket>}
     */
    const listeners = this.subscriptions[event]

    // Stop process if the specified event has no listeners.
    if (listeners === undefined) return

    // Broadcast the payload to all the listeners of the specified event
    // ignoring the TCP Emitter client which the payload originated from.
    listeners.forEach(listener => {
      if (listener === socket) return
      listener.write(JSON.stringify({ event, args }) + this.delimiter)
    })
  },

  /**
   * Function used to return the listener for the net.Server 'connection' event.
   * @param  {Object} [opts={}]  Options for handleSocket function.
   * @param  {module:tcp-emitter~verify-client} [opts.verifyClient=() => true]
   *                             Function used to determine whether to allow or
   *                             deny a TCP Emitter client connection.
   * @return {Function}          net.Server 'connection' listener.
   * @see {@link https://nodejs.org/api/net.html#net_event_connection|
   *      net.Server 'connection' event}
   */
  handleSocket ({ verifyClient }) {
    /**
     * Listener for net.Server 'connection' event.
     * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
     *      net.Socket}
     * @param  {net.Socket} socket TCP Emitter client.
     */
    return async socket => {
      /**
       * Indicates whether the connection is allowed or not.
       * @type {Boolean}
       */
      let isConnectionAllowed = null

      try {
        // Connection is allowed when:
        //   * verifyClient function is omitted.
        //   * verifyClient function returns `true`.
        //   * verifyClient function returns a Promise resolved with `true`.
        isConnectionAllowed = typeof verifyClient !== 'function' ||
          await verifyClient(socket) === true
      } catch (e) {
        // If an error occurs when verifyClient function is invoked, deny the
        // connection.
        isConnectionAllowed = false
      }

      // Close the TCP Emitter client connection if the connection is denied.
      if (isConnectionAllowed === false) return socket.end()

      // Setup TCP Emitter client to work with TCP Emitter if the connection is
      // allowed.
      this.setupSocket(socket)
    }
  }
}
