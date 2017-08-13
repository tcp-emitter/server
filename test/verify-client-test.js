'use strict'

const assert = require('assert')
const { net: netUtils } = require('./utils')

describe('Verify Client Tests:', function () {
  describe('Scenario: Connecting to a TCP Emitter server that does not use `verifyClient`:', function () {
    describe('Given a TCP Emitter server that does not use `verifyClient`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        // Create a TCP Emitter server that doesn't use verifyClient.
        return netUtils.createTCPEmitterServer().then(server => {
          serverInst = server
        })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the TCP Emitter server when
         * verifyClient is omitted.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should allow the TCP Emitter client connection', function (done) {
          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === false)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 1)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses an invalid `verifyClient`:', function () {
    describe('Given a TCP Emitter server that uses an invalid `verifyClient`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Invalid verifyClient, it should be a function.
         * @type {String}
         */
        const verifyClient = 'this is an invalid verifyClient'

        // Create a TCP Emitter server that uses an invalid verifyClient.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should allow the TCP Emitter client connection', function (done) {
          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === false)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 1)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that returns `true`:', function () {
    describe('Given a TCP Emitter server that uses a `verifyClient` that returns `true`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will return `true` thus allowing all connections.
         * @return {Boolean} `true` to allow all connections.
         */
        const verifyClient = () => true

        // Create a TCP Emitter server that uses a verifyClient that returns
        // `true`.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should allow the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === false)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 1)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that returns anything but `true`:', function () {
    describe('Given a TCP Emitter server that uses a `verifyClient` that returns anything but `true`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will return anything but `true` thus denying all
         * connections.
         * @return {string} Something that is not `true` to deny all
         *                  connections.
         */
        const verifyClient = () => 'any value'

        // Create a TCP Emitter Server that uses a verifyClient that returns
        // anything but `true`.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should deny the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === true)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 0)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that returns a Promise resovled with `true`:', function () {
    describe('Given a TCP Emitter Server that uses a `verifyClient` that returns a Promise resolved with `true`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will return a Promise resolved with `true`, thus
         * allowing all connections.
         * @return {Promise.<Boolean>} Promise resolved with `true`.
         */
        const verifyClient = () => Promise.resolve(true)

        // Create a TCP Emitter server that uses a verifyClient that returns
        // a Promise resovled with `true`.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should allow the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === false)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 1)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that returns a Promise resovled with anything but `true`:', function () {
    describe('Given a TCP Emitter Server that uses a `verifyClient` that returns a Promise resolved with anything but `true`,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will return a Promise resolved with anything but `true`,
         * thus denying all connections.
         * @return {Promise.<string>} Promise resolved with anything but `true`.
         */
        const verifyClient = () => Promise.resolve('any value')

        // Create a TCP Emitter server that uses a verifyClient that returns
        // a Promise resolved with anything but `true`.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should deny the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === true)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 0)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that throws an Error:', function () {
    describe('Given a TCP Emitter Server that uses a `verifyClient` that throws an Error,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will throw an error.
         */
        const verifyClient = () => { throw new Error('test error') }

        // Create a TCP Emitter server that uses a verifyClient that throws an
        // error.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should deny the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === true)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 0)
              done()
            })
          }, 500)
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server that uses a `verifyClient` that returns a rejected Promise:', function () {
    describe('Given a TCP Emitter Server that uses a `verifyClient` that returns a rejected Promise,', function () {
      /**
       * TCP Emitter server.
       * @type {Object}
       */
      let serverInst = null

      beforeEach(function () {
        /**
         * Function used to determine whether to allow or deny a connection. In
         * this case it will return a rejected Promise.
         */
        const verifyClient = () => Promise.reject(new Error('test error'))

        // Create a TCP Emitter server that uses a verifyClient that returns a
        // rejected Promise.
        return netUtils.createTCPEmitterServer({ verifyClient })
          .then(server => {
            serverInst = server
          })
      })

      afterEach(function () {
        return netUtils.closeTCPEmitterServer(serverInst)
      })

      describe('when trying to connect with TCP Emitter client:', function () {
        /**
         * TCP Emitter client used to test the verifyClient of the TCP Emitter
         * server.
         * @type {net.Socket}
         */
        let clientInst = null

        beforeEach(function () {
          /**
           * TCP Emitter server address details.
           * @type {Object}
           */
          const address = serverInst.address()

          // Create a new TCP Emitter client & try to connect with the TCP
          // Emitter server.
          return netUtils.createTCPEmitterClient(address).then(client => {
            clientInst = client
          })
        })

        afterEach(function () {
          return netUtils.closeTCPEmitterClient(clientInst)
        })

        it('should deny the TCP Emitter client connection', function (done) {
          assert.ok(clientInst.connecting === false)

          global.setTimeout(() => {
            assert.ok(clientInst.destroyed === true)
            serverInst.getConnections((err, numberOfConnections) => {
              assert.strictEqual(err, null)
              assert.strictEqual(numberOfConnections, 0)
              done()
            })
          }, 500)
        })
      })
    })
  })
})
