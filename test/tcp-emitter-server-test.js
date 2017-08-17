'use strict'

const net = require('net')
const assert = require('assert')
const eventList = require('../src/event-list')
const tcpEmitterServer = require('../src/index')
const { net: netUtils, payload: payloadUtils } = require('./utils')

describe('TCP Emitter Server Tests:', function () {
  describe('Scenario: Creating a new TCP Emitter server:', function () {
    describe('When creating a new TCP Emitter server:', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        serverInst = tcpEmitterServer()
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      it('should return new instance of `net.Server`', function () {
        assert.ok(serverInst instanceof net.Server)
      })
    })
  })

  describe('Scenario: Subscribing to an event:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create the TCP Emitter server which the TCP Emitter client will be
        // connecting to.
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client that will be subscribing to an event.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          // Create the TCP Emitter client and connect it with the TCP Emitter
          // server for this test.
          return netUtils.createTCPEmitterClient(serverInst.address())
            .then(client => {
              clientInst = client
            })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        describe('when the TCP Emitter client subscribes to an event:', function () {
          /**
           * Event which the TCP Emitter client will be subscribing to.
           * @type {string}
           */
          let event = null

          beforeEach(function () {
            event = 'event-name'
          })

          it('should emit TCP Emitter Subscribe Event with the TCP Emitter client & Event name', function (done) {
            serverInst.on(eventList.subscribe, (socket, eventName) => {
              // Assert that the emitted event name is the same as the event
              // name which the TCP Emitter client subscribed to.
              assert.strictEqual(event, eventName)

              // Assert that socket is of type 'net.Socket'.
              assert.ok(socket instanceof net.Socket)

              done()
            })

            // Subscribe to an event.
            clientInst.write(payloadUtils.createSubscribe({ event }))
          })
        })
      })
    })
  })

  describe('Scenario: Broadcasting to an event:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create the TCP Emitter server which the TCP Emitter client will be
        // connecting to.
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client that will be broadcasting to an event.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          // Create the TCP Emitter client and connect it with the TCP Emitter
          // server for this test.
          return netUtils.createTCPEmitterClient(serverInst.address())
            .then(client => {
              clientInst = client
            })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        describe('when the TCP Emitter client broadcasts to an event:', function () {
          /**
           * Event which the TCP Emitter client will be broadcasting to.
           * @type {string}
           */
          let event = null

          /**
           * Arguments that will be broadcasted.
           * @type {Array.<*>}
           */
          let args = null

          beforeEach(function () {
            event = 'event-name'
            args = [ 1, '2', true, { name: 'luca' } ]
          })

          it('should emit TCP Emitter Broadcast Event with the TCP Emitter client, Event name & Arguments', function (done) {
            // When an assertion fails in a EventEmitter, it will by default
            // emit the 'error' event with the error object. If there are no
            // listeners to the 'error' event it will throw the Error to the
            // process.
            //
            // Such implementation is expected when dealing with syncrhonous
            // processes, however since the Broadcast process uses Promises so
            // that it emits the TCP Emitter Broadcast Event once all the event
            // listeners (TCP Emitter clients) have been notified, when the
            // 'error' event is emitted, apart from the assertion error it will
            // also show the UnhandledPromiseRejectionWarning warning.
            //
            // This is why we are listening for the error event in this test
            // case.
            serverInst.on('error', done)

            serverInst.on(eventList.broadcast,
              (socket, eventName, broadcastedArgs) => {
                // Assert that the emitted event name is the same as the event
                // name which the TCP Emitter client broadcasted to.
                assert.strictEqual(event, eventName)

                // Assert that socket is of type 'net.Socket'.
                assert.ok(socket instanceof net.Socket)

                // Assert that the emitted arguments are the same as the
                // broadcasted arguments.
                assert.deepStrictEqual(args, broadcastedArgs)

                done()
              })

            // Broadcast to an event.
            clientInst.write(payloadUtils.createBroadcast({ event, args }))
          })
        })
      })
    })
  })

  describe('Scenario: Subscribing & broadcasting to an event:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create the TCP Emitter Server which the TCP Emitter clients will be
        // connecting to.
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('with multiple connected TCP Emitter clients,', function () {
        /**
         * TCP Emitter client that will be receiving the payload.
         * @type {net.Socket}
         */
        let receiverOne = null

        /**
         * TCP Emitter client that will be receiving the payload.
         * @type {net.Socket}
         */
        let receiverTwo = null

        /**
         * TCP Emitter client that will be subscribed to another event.
         * @type {net.Socket}
         */
        let otherClient = null

        /**
         * TCP Emitter client that will be broadcasting the payload.
         * @type {net.Socket}
         */
        let broadcaster = null

        beforeEach(function () {
          // Create the TCP Emitter clients and connect them with the TCP
          // Emitter server for this test.
          return Promise.all([
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address())
          ]).then(clients => {
            receiverOne = clients[0]
            receiverTwo = clients[1]
            otherClient = clients[2]
            broadcaster = clients[3]
          })
        })

        afterEach(function () {
          return Promise.all([
            netUtils.closeTCPEmitterClient(receiverOne),
            netUtils.closeTCPEmitterClient(receiverTwo),
            netUtils.closeTCPEmitterClient(otherClient),
            netUtils.closeTCPEmitterClient(broadcaster)
          ])
        })

        describe('that are subscribed to an event,', function () {
          /**
           * Name of the event which the TCP Emitter clients will be subscribing
           * & broadcasting to.
           * @type {string}
           */
          let event = null

          beforeEach(function () {
            event = 'event-name'

            // Subscribe the TCP Emitter clients.
            return Promise.all([
              netUtils.write(receiverOne,
                payloadUtils.createSubscribe({ event })),
              netUtils.write(receiverTwo,
                payloadUtils.createSubscribe({ event })),
              netUtils.write(broadcaster,
                payloadUtils.createSubscribe({ event })),
              netUtils.write(otherClient,
                payloadUtils.createSubscribe({ event: 'other' }))
            ])
          })

          describe('when a TCP Emitter client broadcasts to an event:', function () {
            /**
             * Arguments that will be broadcasted.
             * @type {Array.<*>}
             */
            let args = null

            beforeEach(function () {
              args = [ 1, '2', true, { name: 'luca' } ]
            })

            it('should broadcast the payload to the listeners of the event', function (done) {
              // Wait for any data sent by the TCP Emitter server.
              Promise.all([
                netUtils.waitForData(receiverOne),
                netUtils.waitForData(receiverTwo)
              ]).then(dataArray => {
                dataArray.forEach(data => {
                  // Parse the data retrieved from TCP Emitter server.
                  const payloads = payloadUtils.parsePayload({ data })

                  // Assert that only one payload was received.
                  assert.strictEqual(payloads.length, 1)

                  // Assert 'event' attribute.
                  assert.strictEqual(event, payloads[0].event)

                  // Assert 'args' attribute
                  assert.deepStrictEqual(args, payloads[0].args)
                })

                // Finalize test.
                done()
              }).catch(done)

              // Broadcast payload to the event which the receiver TCP Emitter
              // client is subscriibed to.
              broadcaster.write(payloadUtils.createBroadcast({ event, args }))
            })

            it('should not broadcast the payload to the TCP Emitter client from where the broadcast originated from', function (done) {
              // Wait 500ms for any data sent by TCP Emitter Server before
              // assuming the test case is successful.
              global.setTimeout(done, 500)

              // Wait for any data sent by the TCP Emitter server.
              netUtils.waitForData(broadcaster).then(() => {
                // TCP Emitter clients that broadcasted to the event should not
                // be notified by the TCP Emitter server.
                assert.fail('TCP Emitter clients that broadcasted to the ' +
                  'should not be notified')
              }).catch(done)

              // Broadcast payload to the event which the receiver TCP Emitter
              // client is subscriibed to.
              broadcaster.write(payloadUtils.createBroadcast({ event, args }))
            })

            it('should not broadcast the payload to the TCP Emitter clients that are not subscribed to the event the broadcast was made for', function (done) {
              // Wait 500ms for any data sent by TCP Emitter Server before
              // assuming the test case is successful.
              global.setTimeout(done, 500)

              // Wait for any data sent by the TCP Emitter server.
              netUtils.waitForData(otherClient).then(() => {
                // TCP Emitter clients which are not subscribed to the event
                // which the broadcast was made to, should not be notified.
                assert.fail('TCP Emitter client which is not subscribed to ' +
                  'the event the broadcast was made to, should not be notified')
              }).catch(done)

              // Broadcast payload to the event which the receiver TCP Emitter
              // client is subscriibed to.
              broadcaster.write(payloadUtils.createBroadcast({ event, args }))
            })
          })
        })
      })
    })
  })

  describe('Scenario: Unsubscribing from & broadcasting to an event:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create the TCP Emitter server which the TCP Emitter clients whill be
        // connecting
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('with multiple connected TCP Emitter clients,', function () {
        /**
         * TCP Emitter client that will be receiving the payload.
         * @type {net.Socket}
         */
        let receiver = null

        /**
         * TCP Emitter client that will be broadcasting the payload.
         * @type {net.Socket}
         */
        let broadcaster = null

        /**
         * TCP Emitter client that will be unsubscribing from an event.
         * @type {net.Socket}
         */
        let unsubscriber = null

        beforeEach(function () {
          // Create the TCP Emitter clients and connect them with the TCP
          // Emitter server for this test.
          return Promise.all([
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address())
          ]).then(clients => {
            receiver = clients[0]
            broadcaster = clients[1]
            unsubscriber = clients[2]
          })
        })

        afterEach(function () {
          return Promise.all([
            netUtils.closeTCPEmitterClient(receiver),
            netUtils.closeTCPEmitterClient(broadcaster),
            netUtils.closeTCPEmitterClient(unsubscriber)
          ])
        })

        describe('that are subscribed to an event,', function () {
          /**
           * Name of the event which the TCP Emitter clients will be subscribing
           * & broadcasting to.
           * @type {string}
           */
          let event = null

          beforeEach(function () {
            event = 'event-name'

            // Subscribe the TCP Emitter clients
            return Promise.all([
              netUtils.write(receiver, payloadUtils.createSubscribe({ event })),
              netUtils.write(unsubscriber,
                payloadUtils.createSubscribe({ event }))
            ])
          })

          describe('and a TCP Emitter client unsubscribes from an event,', function () {
            beforeEach(function () {
              return netUtils.write(unsubscriber,
                payloadUtils.createUnsubscribe({ event }))
            })

            describe('when a TCP Emitter client broadcasts to an event:', function () {
              /**
               * Arguments that will be broadcasted.
               * @type {Array.<*>}
               */
              let args = null

              beforeEach(function () {
                args = [ 1, '2', true, { name: 'luca' } ]
              })

              it('should broadcast the payload to the listeners of the event', function (done) {
                // Wait for any data sent by the TCP Emitter server.
                netUtils.waitForData(receiver).then((data) => {
                  // Parse the data retrieved from TCP Emitter server.
                  const payloads = payloadUtils.parsePayload({ data })

                  // Assert that only one payload was received.
                  assert.strictEqual(payloads.length, 1)

                  // Assert 'event' attribute.
                  assert.strictEqual(event, payloads[0].event)

                  // Assert 'args' attribute
                  assert.deepStrictEqual(args, payloads[0].args)

                  // Finalize test.
                  done()
                }).catch(done)

                // Broadcast payload to the event which the TCP Emitter clients
                // have subscribed to.
                broadcaster.write(payloadUtils.createBroadcast({ event, args }))
              })

              it('should not broadcast the payload to the TCP Emitter client that unsubscribed from the event', function (done) {
                // Wait 500ms for any data sent by TCP Emitter Server before
                // assuming the test case is successful.
                global.setTimeout(done, 500)

                // Wait for any data sent by the TCP Emitter server.
                netUtils.waitForData(unsubscriber).then(() => {
                  // The TCP Emitter client which broadcasted the event should not
                  // be notified by the TCP Emitter server.
                  assert.fail('TCP Emitter client that unsubscribed from an ' +
                    'event should not be notified')
                }).catch(done)

                // Broadcast payload to the event which the TCP Emitter clients
                // have subscribed to.
                broadcaster.write(payloadUtils.createBroadcast({ event }))
              })
            })
          })
        })
      })
    })
  })

  describe('Scenario: Broadcasting multiple payloads with a single TCP request:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create the TCP Emitter Server which the TCP Emitter clients will be
        // connecting to.
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('with multiple connected TCP Emitter clients', function () {
        /**
         * TCP Emitter client that will be receiving the payload.
         * @type {net.Socket}
         */
        let receiver = null

        /**
         * TCP Emitter client that will be broadcasting the payload.
         * @type {net.Socket}
         */
        let broadcaster = null

        beforeEach(function () {
          // Create the TCP Emitter clients and connect them with the TCP
          // Emitter server for this test.
          return Promise.all([
            netUtils.createTCPEmitterClient(serverInst.address()),
            netUtils.createTCPEmitterClient(serverInst.address())
          ]).then(clients => {
            receiver = clients[0]
            broadcaster = clients[1]
          })
        })

        afterEach(function () {
          return Promise.all([
            netUtils.closeTCPEmitterClient(receiver),
            netUtils.closeTCPEmitterClient(broadcaster)
          ])
        })

        describe('and one of which is subscribed to an event,', function () {
          /**
           * Name of the event which the TCP Emitter clients will be subscribing
           * & broadcasting to.
           * @type {string}
           */
          let event = null

          beforeEach(function () {
            event = 'event-name'

            // Subscribe the TCP Emitter client which will serve as the
            // receiver.
            return netUtils.write(receiver,
              payloadUtils.createSubscribe({ event }))
          })

          describe('when broadcasting multiple payloads with a single TCP request:', function () {
            /**
             * Arguments that will be broadcasted in the first payload.
             * @type {Array.<*>}
             */
            let argsOne = null

            /**
             * Arguments that will be broadcasted in the second payload.
             * @type {Array.<*>}
             */
            let argsTwo = null

            beforeEach(function () {
              argsOne = [ 1, '2', true, { name: 'luca' } ]
              argsTwo = [ 2, '3', false, { surname: 'tabone' } ]
            })

            it('should broadcast all the payloads to the listeners of the event accordingly', function (done) {
              // Wait for any data sent by the TCP Emitter server.
              netUtils.waitForData(receiver).then(data => {
                // Parse the data retrieved from TCP Emitter server.
                const payloads = payloadUtils.parsePayload({ data })

                // Assert that two payload was received.
                assert.strictEqual(payloads.length, 2)

                assert.deepStrictEqual(event, payloads[0].event)
                assert.deepStrictEqual(event, payloads[1].event)
                assert.deepStrictEqual(argsOne, payloads[0].args)
                assert.deepStrictEqual(argsTwo, payloads[1].args)

                done()
              }).catch(done)

              // Broadcast the first payload at the event which the receiver
              // TCP Emitter client is subscriibed to.
              broadcaster.write(payloadUtils
                .createBroadcast({ event, args: argsOne }))

              // Broadcast the second payload at the event which the receiver
              // TCP Emitter client is subscriibed to.
              broadcaster.write(payloadUtils
                .createBroadcast({ event, args: argsTwo }))
            })
          })
        })
      })
    })
  })
})
