'use strict'

const utils = require('./utils')
const eventList = require('./event-list')

/**
 * @module tcp-emitter-client
 * @type {Object}
 */
module.exports = {
  /**
   * Delimiter used to seperate payloads in a single TCP request.
   * @type {module:tcp-emitter.delimiter}
   */
  delimiter: null,

  /**
   * Stores the name of the events which the TCP Emitter client is subscribed
   * to. This is done so that it would be easier and much more efficient for the
   * TCP Emitter to unsubscribe the TCP Emitter client from all of its
   * subscriptions when it is disconnected.
   * @type {Array.<string>}
   */
  subscriptions: null,

  /**
   * Function used to initialize a TCP Emitter client.
   * @param  {Object} opts                        Options for init function.
   * @param  {string} opts.delimiter              Delimiter used to seperate
   *                                              payloads in a single TCP
   *                                              request
   */
  init ({ delimiter }) {
    // Setup subscriptions list.
    this.subscriptions = []

    // Setup delimiter.
    this.delimiter = delimiter

    // Setup default encoding.
    this.setEncoding('utf-8')

    // Listen for any data which might be sent by the TCP Emitter client.
    this.on('data', this.parseData.bind(this))
  },

  /**
   * Function used to parse the data recieved from the connected TCP Emitter
   * client, validate it and if valid emit it to the TCP Emitter Payload Event.
   * @param  {string} data Data recieved from the connected TCP Emitter client.
   */
  parseData (data) {
    // Split the data recieved by the delimiter.
    const payloadsStr = data.split(this.delimiter)

    // Since a TCP Emitter payload is required to end with the specified
    // delimiter, when splitting the data recieved by the TCP Emitter client,
    // the last element in the array will be an empty string, thus we remove it.
    payloadsStr.length -= 1

    // Go through each payload, validate it and if found valid, emit it to the
    // TCP Emitter Payload Event.
    payloadsStr.forEach(payloadStr => {
      const payload = utils.parseJSON(payloadStr)
      /**
       * Indicates whether the payload has a valid 'type' attribute.
       * @type {Boolean}
       */
      const isTypeValid = typeof payload.type !== 'string'

      /**
       * Indicates whether the payload has a valid 'event' attribute.
       * @type {Boolean}
       */
      const isEventValid = typeof payload.event !== 'string'

      // Ignore payload if it is not considered to be valid.
      if (isTypeValid !== false || isEventValid !== false) return

      // Emit payload to TCP Emitter Payload event if found valid.
      this.emit(eventList.payload, payload)
    })
  }
}
