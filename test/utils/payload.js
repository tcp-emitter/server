'use strict'

const utils = require('../../src/utils')

/**
 * Stores payload related utilities used in testing.
 * @type {Object}
 */
module.exports = {
  /**
   * Function used to create the payload for a subscription to an event.
   * @param  {string} options.event     Event which the TCP Emitter client will
   *                                    subscribe to.
   * @param  {string} options.delimiter Delimiter used to seperate payloads in a
   *                                    single TCP request.
   * @return {string}                   Subscription payload to an event.
   */
  createSubscribe ({ event, delimiter = '@@@' }) {
    return JSON.stringify({ event, type: 'subscribe' }) + delimiter
  },

  /**
   * Function used to create the payload for a unsubscription from an event.
   * @param  {[type]} options.event     Event which the TCP Emitter client will
   *                                    unsubscribe from.
   * @param  {string} options.delimiter Delimiter used to seperate payloads in a
   *                                    single TCP request.
   * @return {string}                   Unsubsription payload from an event.
   */
  createUnsubscribe ({ event, delimiter = '@@@' }) {
    return JSON.stringify({ event, type: 'unsubscribe' }) + delimiter
  },

  /**
   * Function used to create the payload for broadcasting data to an event.
   * @param  {string} options.event      Event which the message will be
   *                                     broadcasted to.
   * @param  {Array.<*>} options.args  Data to be broadcasted.
   * @param  {string} options.delimiter  Delimiter used to seperate payloads in
   *                                     a single TCP request.
   * @return {string}                    Broadcasting payload of data to an
   *                                     event.
   */
  createBroadcast ({ event, args, delimiter = '@@@' }) {
    return JSON.stringify({ event, type: 'broadcast', args }) + delimiter
  },

  /**
   * Function used to parse a valid TCP Emitter payload.
   * @param  {string} options.data      Data to be parsed.
   * @param  {string} options.delimiter Delimiter used to seperate payloads in
   *                                    a single TCP request.
   * @return {Array.<Object>}           Array contianing a list of object
   *                                    representation of the parsed payloads.
   */
  parsePayload ({ data, delimiter = '@@@' }) {
    const payloads = data.split(delimiter)
    payloads.length -= 1
    return payloads.map(utils.parseJSON)
  }
}
