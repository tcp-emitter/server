'use strict'

const assert = require('assert')
const utils = require('../src/utils')

describe('TCP-Emitter Utils Tests:', function () {
  describe('Scenario: Parsing a parsable string into an object:', function () {
    describe('Given a parsable string,', function () {
      /**
       * String to be parsed.
       * @type {string}
       */
      let message = null

      /**
       * Object expected once the string is parsed.
       * @type {Object}
       */
      let expected = null

      beforeEach(function () {
        expected = { name: 'luca' }
        message = JSON.stringify(expected)
      })

      describe('when parsing it into an object:', function () {
        /**
         * Object created from parsing.
         * @type {Objec}
         */
        let actual = null

        beforeEach(function () {
          actual = utils.parseJSON(message)
        })

        it('should return an object representation of the string', function () {
          assert.deepStrictEqual(actual, expected)
        })
      })
    })
  })

  describe('Scenario: Parsing a non-parsable string into an object:', function () {
    describe('Given a non-parsable string,', function () {
      /**
       * String to be parsed.
       * @type {string}
       */
      let message = null

      beforeEach(function () {
        message = 'this is not a parsable string'
      })

      describe('when parsing it into an object:', function () {
        /**
         * Object created from parsing.
         * @type {Objec}
         */
        let actual = null

        beforeEach(function () {
          actual = utils.parseJSON(message)
        })

        it('should return an empty object', function () {
          assert.deepStrictEqual(actual, {})
        })
      })
    })
  })
})
