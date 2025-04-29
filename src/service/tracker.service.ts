import { ClientStorage } from '../dao/client.storage'
import { TrackerWS } from '../dao/tracker.ws'
import { ClientConfiguration, TrackerEvent } from '../util/types'
import { uuid4, isUuid } from '../util/uuid4'

export class TrackerService {
  dao: TrackerWS
  storage: ClientStorage
  config: ClientConfiguration
  constructor(dao: TrackerWS, storage: ClientStorage, config: ClientConfiguration) {
    this.dao = dao
    this.storage = storage
    this.config = config
  }

  /**
   * Add all events in events
   * validate events before sending them to dao layer
   * expect events to be an array of well formed event items
   * @param {TrackerEvent[]} events - an Array of Event items
   * @returns {number} the number of items properly proceeded
   */
  addEvents(events: TrackerEvent[]): number {
    let count = 0
    if (!Array.isArray(events)) {
      return count
    }
    events.forEach(event => {
      try {
        this.validateEvent(event)
      } catch (err) {
        console.error(err)
        return
      }
      event.client = this.getClientId()
      event.session = this.getSessionId()
      event.window = this.getWindowId()
      event.time = event.time || Date.now()
      count++
      this.dao.store(event)
    })
    return count
  }

  /**
   * Validate a TrackerEvent
   * @throws Error when input is not an object or null
   * or does not have expected keys
   * @param {TrackerEvent} event - the TrackerEvent to validate
   */
  validateEvent(event: TrackerEvent) {
    // TODO: check if type, key and value are set properly
    if (typeof event !== 'object' || event === null) {
      throw new Error('empty or invalid event')
    }
    if (!event.key) {
      throw new Error('event key is missing')
    }
    if (event.value === undefined) {
      throw new Error('event value is missing')
    }
    // TODO: add key validation
  }


  /**
   * Retrieves the client ID from 'local' storage or generates and stores a new one.
   * @returns {string} The client ID, which is a valid UUID.
   */
  getClientId(): string {
    let clientId = this.storage.getItem('local', 'client') as string
    if (!isUuid(clientId)) {
      clientId = uuid4()
      this.storage.setItem('local', 'client', clientId)
    }
    return clientId
  }

  /**
   * Retrieves the session ID from 'session' storage or generates and stores a new one.
   * @returns {string} The session ID, which is a valid UUID.
   */
  getSessionId() {
    let sessionId = this.storage.getItem('session', 'session') as string
    if (!isUuid(sessionId)) {
      sessionId = uuid4()
      this.storage.setItem('session', 'session', sessionId)
    }
    return sessionId
  }
  /**
    * Retrieves the window ID from 'scope' storage or generates and stores a new one.
    * @returns {string} The window ID, which is a valid UUID.
    */
  getWindowId() {
    let windowId = this.storage.getItem('scope', 'window') as string
    if (!isUuid(windowId)) {
      windowId = uuid4()
      this.storage.setItem('scope', 'window', windowId)
    }
    return windowId
  }
}
