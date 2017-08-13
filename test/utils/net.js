'use strict'

const net = require('net')
const tcpEmitterServer = require('../../src/index')

/**
 * Stores net related utilities used in testing.
 * @type {Object}
 */
module.exports = {
  /**
   * Function used to create a new TCP Emitter server on an available port.
   * @param  {module:tcp-emitter~verify-client} [opts.verifyClient=() => true]
   *                                 Function used to determine whether to allow
   *                                 or deny a TCP Emitter client connection.
   * @param  {module:tcp-emitter~delimiter} [opts.delimiter='@@@']
   *                                 Delimiter used to seperate payloads in a
   *                                 single TCP request.
   * @return {Promise.<net.Server>}  When the TCP Emitter server starts, it
   *                                 returns a `Promise` resolved with the TCP
   *                                 Emitter server.
   * @return {Promise.<Error>}       When the TCP Emitter server doesn't start
   *                                 due to an error that is not related to a
   *                                 conflict of host/port, it returns a
   *                                 rejected `Promise` with the error.
   */
  createTCPEmitterServer (opts) {
    return new Promise((resolve, reject) => {
      /**
       * Host of TCP Emitter server.
       * @type {string}
       */
      const host = 'localhost'

      /**
       * Port of TCP Emitter server.
       * @type {number}
       */
      let port = 8080

      /**
       * Function to be used as a listener for the 'error' event of a TCP
       * Emitter server. It checks whether the error has occured due to a
       * host/port conflict and if it is the case it tries to start the TCP
       * Emitter server on another port. If it is not the case, it rejects the
       * promise sent by this function.
       * @param  {Error} e Error object
       */
      function errorListener (e) {
        // If error is not because of a host/port conflict, stop trying to
        // restart the server and reject the promise.
        if (e.code !== 'EADDRINUSE') return reject(e)

        // Try restarting the server on another port.
        server.listen({ host: 'localhost', port: ++port })
      }

      /**
       * TCP Emitter Server.
       * @type {net.Server}
       */
      const server = tcpEmitterServer(opts)

      // When the server starts listening, remove the error listener used to
      // check for errors related to host/port conflict, and resolve the promise
      // with the TCP Emitter Server.
      server.once('listening', () => {
        server.removeListener('error', errorListener)
        resolve(server)
      })

      // Include the 'error' listener used to try restarting the server on another
      // port.
      server.on('error', errorListener)

      // Try starting the TCP Emitter Server.
      server.listen({ host, port })
    })
  },

  /**
   * Function used to close a TCP Emitter server.
   * @param  {net.Server} server TCP Emitter Server to be closed.
   * @return {Promise}           When the server is closed successfully, it
   *                             returns a resolved `Promise`.
   * @return {Promise.<Error>}   When the server is not closed successfully, it
   *                             returns a `Promise` rejected with the error.
   */
  closeTCPEmitterServer (server) {
    return new Promise((resolve, reject) => {
      // When the 'error' event is emitted, it means an error had occured while
      // trying to close the server, thus reject the promise.
      server.once('error', reject)

      // When the 'close' event is emitted, it means that the server has been
      // closed, thus resolve the promise.
      server.once('close', resolve)

      // Try closing server.
      server.close()
    })
  },

  /**
   * Function used to create a new TCP Emitter client and connect it with a
   * TCP Emitter server.
   * @param  {string} options.address Host of TCP Emitter server which the newly
   *                                  created TCP Emitter client will be
   *                                  connecting to.
   * @param  {number} options.port    Port of TCP Emitter server which the newly
   *                                  created TCP Emitter client will be
   *                                  connecting to.
   * @return {Promise.<net.Socket>}   When the TCP Emitter client connects with
   *                                  the TCP Emitter server, it returns a
   *                                  `Promise` resolved with the newly created
   *                                  TCP Emitter client.
   * @return {Promise.<Error>}        When the TCP Emitter client fails to
   *                                  connect with the TCP Emitter server, it
   *                                  returns a `Promise` rejected with the
   *                                  error.
   */
  createTCPEmitterClient ({ address, port }) {
    return new Promise((resolve, reject) => {
      /**
       * TCP Emitter client
       * @type {net.Socket}
       */
      const client = new net.Socket()

      // Set TCP Emitter client encoding.
      client.setEncoding('utf-8')

      // When the 'connect' event is emitted, it means that the TCP Emitter client
      // has successfully connected with TCP Emitter server, thus resolve the
      // promise with the client & remove the error event listener.
      client.once('connect', () => {
        client.removeListener('error', reject)
        resolve(client)
      })

      // When the 'error' event is emitted, it means that the TCP Emitter client
      // has failed to connect with the TCP Emitter server, thus reject the
      // promise with the error.
      client.once('error', reject)

      // Try to connect with the TCP Emitter server.
      client.connect({ host: address, port })
    })
  },

  /**
   * Function used to close a TCP Emitter client.
   * @param  {net.Socket} client TCP Emitter client to be closed.
   * @return {Promise}           When the TCP Emitter client is successfully
   *                             closed, it returns a resolved `Promise`.
   * @return {Promise.<Error>}   When the TCP Emitter client is not successfully
   *                             closed, it returns a `Promise` rejected with
   *                             the error.
   */
  closeTCPEmitterClient (client) {
    return new Promise((resolve, reject) => {
      // If the TCP Emitter client connection has already been closed, do
      // nothing.
      if (client.destroyed === true) return resolve()

      // When the 'error' event is emitted, it means an error had occured while
      // trying to close the TCP Emitter client, thus reject the promise with
      // the error.
      client.once('error', reject)

      // When the 'close' event is emitted, it means that the client has been
      // closed, thus resolve the promise.
      client.once('close', resolve)

      // Try closing the TCP Emitter client.
      client.end()
    })
  },

  /**
   * Function used to send a TCP request.
   * @param  {net.Socket} client  TCP Emitter client to be sending the payload.
   * @param  {string} payload     Payload to be sent.
   * @return {Promise}            When the payload is successfully sent, it
   *                              returns a resolved `Promise`.
   * @return {Promise.<Error>}    When the payload is not successfully sent, it
   *                              returns a `Promise` rejected with the error.
   */
  write (client, payload) {
    return new Promise((resolve, reject) => {
      // When the 'error' event is emitted, it means that the payload wasn't
      // successfully sent, thus reject the promise.
      client.once('error', reject)

      // Try sending the payload and if it succeed remove the 'error' listener
      // and resolve the promise.
      client.write(payload, () => {
        client.removeListener('error', reject)
        resolve()
      })
    })
  },

  /**
   * Function used to return a promise which is resolved once the TCP Emitter
   * client recieves any data.
   * @param  {net.Socket} client TCP Emitter client which will be receiving the
   *                             data.
   * @return {Promise}           Promise resolved with the data recieved by the
   *                             TCP Emitter server.
   */
  waitForData (client) {
    return new Promise(resolve => client.once('data', resolve))
  }
}
