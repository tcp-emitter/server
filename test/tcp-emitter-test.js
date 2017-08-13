'use strict'

const net = require('net')
const assert = require('assert')
const { payload: payloadUtils } = require('./utils')
const tcpEmitter = require('../src/tcp-emitter')

describe('TCP Emitter Tests:', function () {
  describe('Scenario: Closing the connection of a TCP Emitter client that is subscribed to multiple events:', function () {
    describe('Given a TCP Emitter instance,', function () {
      /**
       * TCP Emitter instance.
       * @type {Object}
       */
      let tcpEmitterInst = null

      beforeEach(function () {
        // Create and initialize the TCP Emitter instance which the TCP Emitter
        // clients will be connecting to.
        tcpEmitterInst = Object.create(tcpEmitter)
        tcpEmitterInst.init()
      })

      describe('with multiple connected TCP Emitter clients,', function () {
        /**
         * TCP Emitter client which will be disconnected.
         * @type {net.Socket}
         */
        let clientOne = null

        /**
         * TCP Emitter client which will represent another client.
         * @type {net.Socket}
         */
        let clientTwo = null

        beforeEach(function () {
          // Create and setup the TCP Emitter clients to work with TCP Emitter
          // server.
          clientOne = new net.Socket()
          clientTwo = new net.Socket()

          const connectionListener = tcpEmitterInst.handleSocket({})

          connectionListener(clientOne)
          connectionListener(clientTwo)
        })

        describe('that are subscribed to multiple events,', function () {
          /**
           * One of the events which the TCP Emitter clients will be listening
           * to.
           * @type {string}
           */
          let eventOne = null

          /**
           * One of the events which the TCP Emitter clients will be listening
           * to.
           * @type {string}
           */
          let eventTwo = null

          beforeEach(function () {
            eventOne = 'event-one-name'
            eventTwo = 'event-two-name'

            // Subscribe the TCP Emitter clients to the events.
            clientOne.emit('data',
              payloadUtils.createSubscribe({ event: eventOne }))
            clientOne.emit('data',
              payloadUtils.createSubscribe({ event: eventTwo }))
            clientTwo.emit('data',
              payloadUtils.createSubscribe({ event: eventOne }))
            clientTwo.emit('data',
              payloadUtils.createSubscribe({ event: eventTwo }))
          })

          describe('when closing the connection of a TCP Emitter client:', function () {
            beforeEach(function () {
              // Close one of the TCP Emitter clients.
              clientOne.emit('close')
            })

            it('should unsubscribe the disconnected TCP Emitter client from all the events it was subscribed to', function () {
              // Assert that there is only one listener for all of the events
              // that the TCP Emitter clients subscribed for.
              assert.strictEqual(
                tcpEmitterInst.subscriptions[eventOne].length, 1)
              assert.strictEqual(
                tcpEmitterInst.subscriptions[eventTwo].length, 1)

              // Assert that the listener for both of the events is the TCP
              // Emitter client that was not disconnected.
              assert.ok(clientTwo.isPrototypeOf(
                tcpEmitterInst.subscriptions[eventOne][0]))
              assert.ok(clientTwo.isPrototypeOf(
                tcpEmitterInst.subscriptions[eventTwo][0]))
            })
          })
        })
      })
    })
  })

  describe('Scenario: Removing the last listener for an event:', function () {
    describe('Given a TCP Emitter instance,', function () {
      /**
       * TCP Emitter instance.
       * @type {Object}
       */
      let tcpEmitterInst = null

      beforeEach(function () {
        // Create and initialize the TCP Emitter instance which the TCP Emitter
        // clients will be connecting to.
        tcpEmitterInst = Object.create(tcpEmitter)
        tcpEmitterInst.init()
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client.
         * @type {net.Socket}
         */
        let clientOne = null

        beforeEach(function () {
          // Create and setup the TCP Emitter client to work with TCP Emitter
          // server.
          clientOne = new net.Socket()
          tcpEmitterInst.handleSocket({})(clientOne)
        })

        describe('that is the only client subscribed to an event,', function () {
          /**
           * Event which the TCP Emitter cliens will be listening to.
           * @type {string}
           */
          let event = null

          beforeEach(function () {
            event = 'event-name'

            // Subscribe the TCP Emitter client to the events.
            clientOne.emit('data', payloadUtils.createSubscribe({ event }))
          })

          describe('when unsubscribing it from the event:', function () {
            beforeEach(function () {
              // Unsubscribe the only listener for the specified event.
              clientOne.emit('data', payloadUtils.createUnsubscribe({ event }))
            })

            it('should remove the event entry from the subscriptions list', function () {
              // Assert that the entry for the event in the TCP Emitter instance
              // subscription list has been removed.
              assert.strictEqual(tcpEmitterInst.subscriptions[event], undefined)
            })
          })
        })
      })
    })
  })
})
