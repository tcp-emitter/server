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
  }
}
