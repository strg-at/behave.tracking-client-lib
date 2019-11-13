import { createNoOpLogger } from '../logger/logger'

const logger = createNoOpLogger()

export class TrackerWS {
  /**
   * initialize a new TrackerWS DAO Layer
   * @param {object} config - the configuration object
   */
  constructor (config) {
    this.config = config
    this.queue = []
    this.connection = null
    this.isShuttingDown = false
    global.addEventListener('beforeunload', this.shutdown.bind(this))
    this.connect()
  }

  /**
   * store an event in this implementation it will be forwarded to the websocket
   * expect event to be an valid event object defined by service layer
   * @param {object} event - the event to store
   */
  store (event) {
    this.queue.push(event)
    this.flush()
  }

  /**
   * open the connection to the websocket and handle events
   */
  connect () {
    logger.log('Open connection:', this.config.ENDPOINT)

    // connect to websocket
    this.connection = new global.WebSocket(this.config.ENDPOINT)

    // when connection is open flush the queue
    this.connection.onopen = () => this.flush()

    // when connection is closed unexpected, reconnect
    this.connection.onclose = () => {
      if (!this.isShuttingDown) {
        logger.log(`connection lost, try recomnnect in ${this.config.RECONNECT_TIMEOUT} ms`)
        this.connection = null
        global.setTimeout(() => this.connect(), this.config.RECONNECT_TIMEOUT)
      }
    }

    // handle errors quietly
    this.connection.onerror = (err) => logger.error('Connection failed', err)
  }

  /**
   * try to shutdown without loosing events
   */
  shutdown () {
    this.isShuttingDown = true
    this.flush()
    if (this.connection) {
      this.connection.close()
    }
  }

  /**
   * flush the queue, send all remaining events to the websocket
   */
  flush () {
    if (!this.connection || this.connection.readyState !== global.WebSocket.OPEN) {
      // this function will be called again once the connection is open
      return
    }

    while (this.queue.length) {
      const msg = JSON.stringify(this.queue[0])
      logger.log('Send', msg)
      this.connection.send(msg)
      this.queue.shift()
    }
  }
}
