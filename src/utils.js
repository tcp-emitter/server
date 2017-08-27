'use strict'

/**
 * Contains utilities used in `TCP-Emitter`.
 * @module tcp-emitter/utils
 * @type {Object}
 */
module.exports = {
  /**
   * Function used to parse a string into an object, returning an empty object
   * if the string cannot be parsed.
   * @example
   * <caption>Valid Object</caption>
   * const obj = utils.parseJSON('{"name": "luca"}')
   * console.log(typeof obj) // => 'object'
   * console.log(obj)        // => { name: 'luca' }
   *
   * @example
   * <caption>Invalid Object</caption>
   * const obj = utils.parseJSON('luca')
   * console.log(typeof obj) // => 'object'
   * console.log(obj)        // => {}
   * @param  {string} str String to be parsed.
   * @return {Object}     When the string can be parsed into an object, it
   *                      returns the resultant object.
   * @return {Object}     When the string cannot be parsed into an object, it
   *                      returns an empty object.
   */
  parseJSON (str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      return {}
    }
  },

  /**
   * Function used to promisify the 'net.Socket.write' function.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @param  {net.Socket} socket  TCP Emitter client that the message will be
   *                              sent to.
   * @param  {string} message     Message to be sent.
   * @return {Promise}            When the message is sent successfully, it
   *                              returns a resolved promise.
   * @return {Promise.<Error>}    When the message is not sent successfully, it
   *                              returns a promise rejected with an error.
   */
  write (socket, message) {
    return new Promise((resolve, reject) => {
      // When the 'error' event is emitted, it means that the message has not
      // been sent, thus reject the promise with the error.
      socket.on('error', reject)

      // Try sending the message to the TCP Emitter client and if it succeeds,
      // remove the error listener added in this promise and resolve the
      // promise.
      socket.write(message, () => {
        socket.removeListener('error', reject)
        resolve()
      })
    })
  }
}
