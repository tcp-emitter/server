'use strict'

const net = require('net')
const assert = require('assert')
const tcpEmitterClient = require('../src/client')

describe('TCP Emitter Client Tests:', function () {
  describe('Scenario: Receiving a valid payload:', function () {
    describe('Given a TCP Emitter Client,', function () {
      /**
       * Delimiter used to seperate payloads in a TCP request.
       * @type {string}
       */
      let delimiter = null

      /**
       * TCP Emitter client to be tested.
       * @type {net.Socket}
       */
      let clientInst = null

      /**
       * Name of event emitted by TCP Emitter client upon the receival of a
       * valid payload.
       * @type {string}
       */
      let tcpEmitterPayloadEvent = null

      beforeEach(function () {
        delimiter = '@@@'
        tcpEmitterPayloadEvent = 'tcp-emitter-payload'
        clientInst = Object.assign(new net.Socket(), tcpEmitterClient)
        clientInst.init({ delimiter, tcpEmitterPayloadEvent })
      })

      describe('when receiving a valid payload:', function () {
        /**
         * Payload to be received.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = {
            type: 'broadcast',
            event: 'event-name',
            args: [ 1, '2', true, { name: 'luca' } ]
          }
        })

        it('should parse the payload to an object and emit it to the TCP Emitter Payload Event', function (done) {
          clientInst.on(tcpEmitterPayloadEvent, data => {
            // Assert that the data emitted by the TCP Emitter client is an
            // object.
            assert.strictEqual(typeof data, 'object')

            // Assert that the data emitted contains the received info.
            assert.deepStrictEqual(payload, data)
            done()
          })

          // Mock TCP request by emitting the 'data' event with the payload.
          clientInst.emit('data', JSON.stringify(payload) + delimiter)
        })
      })
    })
  })

  describe('Scenario: Receiving a payload without a delimiter:', function () {
    describe('Given a TCP Emitter Client,', function () {
      /**
       * Delimiter used to seperate payloads in a TCP request.
       * @type {string}
       */
      let delimiter = null

      /**
       * TCP Emitter client to be tested.
       * @type {net.Socket}
       */
      let clientInst = null

      /**
       * Name of event emitted by TCP Emitter client upon the receival of a
       * valid payload.
       * @type {string}
       */
      let tcpEmitterPayloadEvent = null

      beforeEach(function () {
        delimiter = '@@@'
        tcpEmitterPayloadEvent = 'tcp-emitter-payload'
        clientInst = Object.assign(new net.Socket(), tcpEmitterClient)
        clientInst.init({ delimiter, tcpEmitterPayloadEvent })
      })

      describe('when receiving a payload without a delimiter:', function () {
        /**
         * Payload to be received.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = {
            type: 'broadcast',
            args: [ 1, '2', true, { name: 'luca' } ]
          }
        })

        it('should not emit it to the TCP Emitter Payload Event', function (done) {
          global.setTimeout(done, 500)

          clientInst.on(tcpEmitterPayloadEvent, data => {
            assert.fail('TCP Emitter clients should not emit payloads that' +
              'do not end with the specified delimiter')
            done()
          })

          // Mock TCP request by emitting the 'data' event with the payload.
          clientInst.emit('data', JSON.stringify(payload))
        })
      })
    })
  })

  describe('Scenario: Receiving a payload without the `event` info:', function () {
    describe('Given a TCP Emitter Client,', function () {
      /**
       * Delimiter used to seperate payloads in a TCP request.
       * @type {string}
       */
      let delimiter = null

      /**
       * TCP Emitter client to be tested.
       * @type {net.Socket}
       */
      let clientInst = null

      /**
       * Name of event emitted by TCP Emitter client upon the receival of a
       * valid payload.
       * @type {string}
       */
      let tcpEmitterPayloadEvent = null

      beforeEach(function () {
        delimiter = '@@@'
        tcpEmitterPayloadEvent = 'tcp-emitter-payload'
        clientInst = Object.assign(new net.Socket(), tcpEmitterClient)
        clientInst.init({ delimiter, tcpEmitterPayloadEvent })
      })

      describe('when receiving a payload without the `event` info:', function () {
        /**
         * Payload to be received.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = {
            type: 'broadcast',
            args: [ 1, '2', true, { name: 'luca' } ]
          }
        })

        it('should not emit it to the TCP Emitter Payload Event', function (done) {
          global.setTimeout(done, 500)

          clientInst.on(tcpEmitterPayloadEvent, data => {
            assert.fail('TCP Emitter clients should not emit payloads that ' +
              'lack event info')
            done()
          })

          // Mock TCP request by emitting the 'data' event with the payload.
          clientInst.emit('data', JSON.stringify(payload) + delimiter)
        })
      })
    })
  })

  describe('Scenario: Receiving a payload without the `type` info:', function () {
    describe('Given a TCP Emitter Client,', function () {
      /**
       * Delimiter used to seperate payloads in a TCP request.
       * @type {string}
       */
      let delimiter = null

      /**
       * TCP Emitter client to be tested.
       * @type {net.Socket}
       */
      let clientInst = null

      /**
       * Name of event emitted by TCP Emitter client upon the receival of a
       * valid payload
       * @type {string}
       */
      let tcpEmitterPayloadEvent = null

      beforeEach(function () {
        delimiter = '@@@'
        tcpEmitterPayloadEvent = 'tcp-emitter-payload'
        clientInst = Object.assign(new net.Socket(), tcpEmitterClient)
        clientInst.init({ delimiter, tcpEmitterPayloadEvent })
      })

      describe('when receiving a payload without the `type` info:', function () {
        /**
         * Payload to be received.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = {
            event: 'event-name',
            args: [ 1, '2', true, { name: 'luca' } ]
          }
        })

        it('should not emit it to the TCP Emitter Payload Event', function (done) {
          global.setTimeout(done, 500)

          clientInst.on(tcpEmitterPayloadEvent, data => {
            assert.fail('TCP Emitter clients should not emit payloads that ' +
              'lack type info')
            done()
          })

          // Mock TCP request by emitting the 'data' event with the payload.
          clientInst.emit('data', JSON.stringify(payload) + delimiter)
        })
      })
    })
  })

  describe('Scenario: Receiving multiple payloads in a single TCP request:', function () {
    describe('Given a TCP Emitter Client,', function () {
      /**
       * Delimiter used to seperate payloads in a TCP request.
       * @type {string}
       */
      let delimiter = null

      /**
       * TCP Emitter client to be tested.
       * @type {net.Socket}
       */
      let clientInst = null

      /**
       * Name of event emitted by TCP Emitter client upon the receival of a
       * valid payload.
       * @type {string}
       */
      let tcpEmitterPayloadEvent = null

      beforeEach(function () {
        delimiter = '@@@'
        tcpEmitterPayloadEvent = 'tcp-emitter-payload'
        clientInst = Object.assign(new net.Socket(), tcpEmitterClient)
        clientInst.init({ delimiter, tcpEmitterPayloadEvent })
      })

      describe('when receiving multiple payloads (some of which are invalid) in a single TCP request:', function () {
        /**
         * One of the valid payloads to be received
         * @type {string}
         */
        let payloadOne = null

        /**
         * One of the invalid payloads to be received
         * @type {string}
         */
        let payloadTwo = null

        /**
         * One of the valid payloads to be received
         * @type {string}
         */
        let payloadThree = null

        beforeEach(function () {
          payloadOne = {
            type: 'broadcast',
            event: 'event-name',
            args: [ 1, '2', true, { name: 'luca' } ]
          }

          payloadTwo = {
            event: 'event-name',
            args: [ 2, '3', false, { surname: 'tabone' } ]
          }

          payloadThree = {
            type: 'broadcast',
            event: 'event-name',
            args: [ 3, '4', false, { allegiance: 'stark' } ]
          }
        })

        it('should parse the payloads to an object and emit the valid payloads separately to the TCP Emitter Payload Event', function (done) {
          /**
           * Stores the number of emits done by the TCP Emitter client to the
           * TCP Emitter Payload Event.
           * @type {number}
           */
          let emitNumber = 0

          clientInst.on(tcpEmitterPayloadEvent, data => {
            // Increment emit counter.
            emitNumber++

            // Assert that the data emitted by the TCP Emitter client is an
            // object.
            assert.strictEqual(typeof data, 'object')

            // Refer to the expected payload based on the emit number.
            const expectedPayload = emitNumber === 1 ? payloadOne : payloadThree

            // Assert that the data emitted contains the received info.
            assert.deepStrictEqual(expectedPayload, data)

            // Complete test case if it is the last emit.
            if (emitNumber === 2) done()
          })

          /**
           * TCP request message
           * @type {string}
           */
          let data = JSON.stringify(payloadOne) + delimiter +
            JSON.stringify(payloadTwo) + delimiter +
            JSON.stringify(payloadThree) + delimiter

          // Mock TCP request by emitting the 'data' event with the payload.
          clientInst.emit('data', data)
        })
      })
    })
  })
})
