'use strict'

/**
 * Stores utilies used in testing.
 * @type {Object}
 */
module.exports = [ 'net', 'payload' ].reduce((utils, name) => {
  utils[name] = require(`./${name}`)
  return utils
}, {})
