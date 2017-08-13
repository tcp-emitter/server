'use strict'

const net = require('net')
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
  const tcpEmitterInst = Object.create(tcpEmitter)

  // Initialize the newly created TCP Emitter.
  tcpEmitterInst.init({ delimiter: opts.delimiter })

  // Create & return a new TCP Server configured such that new connections are
  // handled by TCP Emitter.
  return net.createServer(tcpEmitterInst.handleSocket({
    verifyClient: opts.verifyClient
  }))
}
