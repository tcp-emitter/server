'use strict'

const net = require('net')
const EventEmitter = require('events')
const eventList = require('./event-list')
const tcpEmitter = require('./tcp-emitter')

/**
 * Function used to create & return a new TCP Server (net.Server) configured
 * such that new connections (a.k.a TCP Emitter clients) are handled by TCP
 * Emitter.
 * @module create-tcp-emitter-server
 *
 * @example
 * <caption>Creating a new TCP Emitter Server</caption>
 * require('tcp-emitter')().listen({ host: 'localhost', port: 8080 })
 *
 * @see {@link https://nodejs.org/api/net.html#net_class_net_server|net.Server}
 * @param {Object} [opts={}]     TCP Emitter server options.
 * @param  {module:tcp-emitter~verify-client} [opts.verifyClient=() => true]
 *                               Function used to determine whether to allow or
 *                               deny a TCP Emitter client connection.
 * @param  {module:tcp-emitter.delimiter} [opts.delimiter='@@@']
 *                               Delimiter used to seperate payloads in a single
 *                               TCP request.
 * @return {net.Server}          TCP Server configured with TCP Emitter.
 */
module.exports = function createTCPEmitterServer (opts = {}) {
  /**
   * TCP Emitter object.
   * @type {module:tcp-emitter}
   */
  const tcpEmitterInst = Object.assign(Object.create(new EventEmitter()),
    tcpEmitter)

  // Initialize the newly created TCP Emitter.
  tcpEmitterInst.init({ delimiter: opts.delimiter })

  // Create & return a new TCP Server configured such that new connections are
  // handled by TCP Emitter.
  const server = net.createServer(tcpEmitterInst.handleSocket({
    verifyClient: opts.verifyClient
  }))

  // Expose events that can be used by the TCP Emitter server user.
  ;[
    eventList.subscribe,
    eventList.broadcast,
    eventList.unsubscribe
  ].forEach(ev => tcpEmitterInst.on(ev, (...args) => server.emit(ev, ...args)))

  // Return the TCP server.
  return server
}
