/**
 * Function used to verify whether a connection should be allowed or denied.
 * When omitted, all connections are allowed. When specified a connection will
 * be allowed if it returns `true`. When this function requires async processing
 * it should return a `Promise` resolved with `true` to allow a connection or
 * any other value but `true` to deny it.
 *
 * @example
 * <caption>Synchronous Verify Client</caption>
 * socket => allowed.indexOf(socket.address().address) !== -1
 *
 * @example
 * <caption>Asynchronous Verify Client</caption>
 * socket => {
 *   return makeRequest('GET', '/allowed').then(allowed => {
 *     return allowed.indexOf(socket.address().address) !== -1
 *   })
 * }
 *
 * @async
 * @callback module:tcp-emitter~verify-client
 * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|net.Socket}
 * @param  {net.Socket} socket Connection object.
 * @return {boolean}           When the connection is allowed, it should return
 *                             `true`.
 * @return {*}                 When the connection is denied, it should return
 *                             anything but `true`.
 * @return {Promise.<boolean>} When async processing is required and the
 *                             connection is allowed, it should return a
 *                             `Promise` resolved with `true`.
 * @return {Promise.<*>}       When async processing is required and a
 *                             connection is denied, it should return a
 *                             `Promise` resolved with any value but `true`.
 */
