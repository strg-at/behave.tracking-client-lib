import { uuid4, isUuid } from '../utils/utils'
import { createNoOpLogger } from '../logger/logger'
import { crc32 } from './crc'

/**
 * @function createTracker
 * @param {*} global
 * @param {*} config
 * TODO:
 * - Move transport/ws to own module
 * - Move storages/persistance to own module
 * - Get rid of final global dependencies
 */
export function createTracker (global, config) {
  const {
    NAMESPACE,
    RECONNECT_TIMEOUT = 2000,
    startTime,
    logger = createNoOpLogger(),
    getCleanURI,
  } = config

  /**
   * Default client storage namespace to global namespace,
   */
  const {
    CLIENT_STORAGE_NAMESPACE = NAMESPACE
  } = config

  /**
   * Init top scope variables
   */
  let connection = null
  let shuttingDown = false
  let windowState = {}
  let queue = []
  let clientState
  let clientHash
  let sessionHash
  let windowHash

  /**
   * @description Prepare life-cycle hashes for client, session and window.
   *   - `clientHash` is bound to `window.localStorage`.
   *   - `sessionHash` is bound to `window.sessionStorage`.
   *   - `windowHash` is bound to the current JS scope `window`.
   */
  function syncHashes () {
    clientHash = localStorage.getItem(`${CLIENT_STORAGE_NAMESPACE}.client`)
    if (!clientHash || !isUuid(clientHash)) {
      clientHash = uuid4()
      localStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.client`, clientHash)
      localStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.client.state`, '{}')
    } else if (!localStorage.getItem(`${CLIENT_STORAGE_NAMESPACE}.client.state`)) {
      localStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.client.state`, '{}')
    }

    sessionHash = sessionStorage.getItem(`${CLIENT_STORAGE_NAMESPACE}.session`)
    if (!sessionHash || !isUuid(sessionHash)) {
      sessionHash = uuid4()
      sessionStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.session`, sessionHash)
    }
    // FIXME: Should not implement global
    windowHash = global[NAMESPACE].window = global[NAMESPACE].window || uuid4()
  }

  /**
   * Remote scripts
   *
   * Scripts that can be called from the server to update client data.
   * Currently used for data migrations e.g. upgrading the client hash.
   */
  let remoteScripts = {
    /**
     * @callback updateClientHash
     * @description Callback triggered by the WebSocket. Update the client
     * hash to a value sent from the server.
     * @param {string} newHash - New hash, must be valid uuid4
     */
    updateClientHash: function updateClientHash (newHash) {
      if (!isUuid(newHash)) {
        throw Error('Value Error: "' + newHash + '" is not a valid UUID')
      }
      clientHash = newHash
      localStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.client`, newHash)
    }
  }

  /**
   * Flush events in queue as single frames.
   */
  function flush () {
    if (!connection || connection.readyState !== global.WebSocket.OPEN) {
      // this function will be called again once the connection is open
      return
    }
    while (queue.length) {
      let msg = JSON.stringify(queue[0])
      logger.log('Send', msg)
      connection.send(msg)
      queue.shift()
    }
  }

  /**
   * Create all search query params for inital get request on WS (deprecated?)
   */
  function createQueryParams () {
    logger.log('Client:', clientHash)
    logger.log('Session:', sessionHash)
    logger.log('Window:', windowHash)
    logger.log('Time:', startTime)
    return [
      '?client=', clientHash,
      '&session=', sessionHash,
      '&window=', windowHash,
      '&time=', startTime,
    ].join('')
  }

  /**
   * Open connection to the WebSocket, handle reconnects and first frame.
   */
  function connect (endpoint) {
    logger.log('Open connection:', endpoint)
    connection = new global.WebSocket(endpoint + createQueryParams())

    /**
     * On connection open always send the first frame with the three hashes.
     */
    connection.onopen = function () {
      flush()
    }

    /**
     * Try to reconnect on close.
     */
    connection.onclose = function () {
      if (!shuttingDown) {
        connection = null
        global.setTimeout(() => connect(endpoint), RECONNECT_TIMEOUT)
      }
    }

    /**
     * Handle server side scripts
     */
    connection.onmessage = function (event) {
      let data = JSON.parse(event.data)
      if (data && typeof remoteScripts[data.fn] === 'function') {
        remoteScripts[data.fn].apply(null, [].concat(data.params))
      }
    }

    /**
     * Handle errors quietly
     */
    connection.onerror = function (e) {
      logger.error('Connection failed', e)
    }
  }

  /**
   * Try to flush remaining events on 'beforeunload'.
   */
  global.addEventListener('beforeunload', function () {
    shuttingDown = true
    flush()
    if (connection) {
      connection.close()
    }
  })

  /**
   * @description Adds events to the queue and sets the time as UTC timestamp.
   * @param {string} key - The event name, e.g. 'article.id'.
   * @param {string|number} value - The events value, e.g. 'Art-123456'
   */
  function enqueue (key, value) {
    logger.log('Enqueue', key, value)
    queue.push({
      time: new Date().getTime(),
      key: key,
      value: value,
      client: clientHash,
      session: sessionHash,
      window: windowHash,
      crc: crc32(getCleanURI(global.location)),
    })
    flush() // Immediate flush with no timeout
  }

  /**
   * @class
   * @name Tracker
   */
  let tracker = {
    /**
     * @function init
     * @memberof strgBeHave#
     * @summary Initialize tracking
     * @param {string} url - *endpoint URL* for the websocket server.
     * @description This is the first thing, that needs to be called when using
     * tracking. It should also be called at most once.
     *
     * The *url* to the websocket server may start with a protocol description
     * ("wss://..."). If it does not, the protocol will be prepended
     * automatically, depending on the current connection security. If we are on
     * an "https" domain, the protocol will be "wss://", otherwise it will be
     * "ws://".
     */
    init (url) {
      if (!url) {
        throw Error('Configuration Error: Missing endpoint url')
      }
      let endpoint = url
      syncHashes()
      if (endpoint.indexOf('://') === -1) {
        let protocol = global.location.protocol === 'https:' ? 'wss' : 'ws'
        endpoint = protocol + '://' + endpoint
      }
      connect(endpoint)
    },

    /**
     * @function trigger
     * @memberof strgBeHave#
     * @description Unconditionally triggers an event with given key and value.
     * @param {string} key - The event name, e.g. 'article.id'.
     * @param {string|number} value - The events value, e.g. 'Art-123456'
     */
    trigger (key, value) {
      enqueue(key, value)
    },

    /**
     * @function clientStateChange
     * @memberof strgBeHave#
     * @summary Notifies tracking of a state change within the client.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description This function is similar to :js:func:`trigger`, but will only
     * trigger the event, if the value is different than the value of the
     * last call.
     */
    clientStateChange (key, value) {
      clientState = JSON.parse(localStorage.getItem(`${CLIENT_STORAGE_NAMESPACE}.client.state`))
      if (clientState[key] === value) {
        return
      }
      clientState[key] = value
      localStorage.setItem(`${CLIENT_STORAGE_NAMESPACE}.client.state`, JSON.stringify(clientState))
      enqueue(key, value)
    },

    /**
     * @function windowStateChange
     * @memberof strgBeHave#
     * @summary Notifies tracking of a state change within the window.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description This function is similar to :js:func:`clientStateChange`,
     * but has a different scope: It will "forget" all previous values on each
     * page load.
     */
    windowStateChange (key, value) {
      if (windowState[key] === value) {
        return
      }
      windowState[key] = value
      enqueue(key, value)
    },

    /**
     * @function windowStateInit
     * @memberof strgBeHave#
     * @summary Sets the initial window state without triggering an event.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description
     * So calling :js:func:`windowStateChange` will only trigger the event if it
     * differs from the value previously set with this function.
     */
    windowStateInit (key, value) {
      windowState[key] = value
    },

    use (namespace, plugin) {
      this[namespace] = plugin
    },

  }

  return tracker
}
