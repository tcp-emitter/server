'use strict'

/**
 * Enum for the event names emitted by this module.
 * @readonly
 * @enum {string}
 */
module.exports = {
  /**
   * Event emitted by TCP Emitter client when it receives and parses a valid
   * TCP Emitter payload
   * @type {string}
   */
  payload: 'tcp-emitter-payload',

  /**
   * Event emitted by TCP Emitter server when a TCP Emitter client subscribes to
   * an event.
   * @type {string}
   */
  subscribe: 'tcp-emitter-subscribe',

  /**
   * Event emitted by TCP Emitter server when a TCP Emitter client unsubscribes
   * from an event.
   * @type {string}
   */
  broadcast: 'tcp-emitter-broadcast',

  /**
   * Event emitted by TCP Emitter server when a TCP Emitter client broadcasts to
   * an event.
   * @type {string}
   */
  unsubscribe: 'tcp-emitter-unsubscribe'
}
