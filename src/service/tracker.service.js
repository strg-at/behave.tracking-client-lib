import { uuid4, isUuid } from '../util/uuid4'
import { crc32 } from '../util/crc32'

export class TrackerService {
  constructor (dao, storage) {
    this.dao = dao
    this.storage = storage
  }

  /**
   * add all events in events
   * validate events before sending them to dao layer
   * expect events to be an array of well formed event items
   * @param {Event[]} events - an Array of Event items
   * @returns {Number} the number of items properly proceeded
   */
  addEvents (events) {
    console.log(events)
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
      if (event.content) {
        event.crc = crc32(event.content)
        event.content = undefined
      }
      count++
      this.dao.store(event)
    })
    return count
  }

  /**
   * validate an Event
   * @throws Error when input is not an object or null
   * @param {Event} event - the Event to validate
   */
  validateEvent (event) {
    // TODO: check if type, key and value are set properly
    if (typeof event !== 'object' || event === null) {
      throw new Error('empty or invalid event')
    }
    if (!event.key) {
      console.log(event)
      throw new Error('event key is missing')
    }
    if (event.value === undefined) {
      throw new Error('event value is missing')
    }
    // TODO: add key validation
  }

  getClientId () {
    let clientId = this.storage.getItem('local', 'client')
    if (!isUuid(clientId)) {
      clientId = uuid4()
      this.storage.setItem('local', 'client', clientId)
    }
    return clientId
  }

  getSessionId () {
    let sessionId = this.storage.getItem('session', 'session')
    if (!isUuid(sessionId)) {
      sessionId = uuid4()
      this.storage.setItem('session', 'session', sessionId)
    }
    return sessionId
  }

  getWindowId () {
    let windowId = this.storage.getItem('scope', 'window')
    if (!isUuid(windowId)) {
      windowId = this.generateWindowId()
    }2
    return windowId
  }

  generateWindowId () {
    const windowId = uuid4()
    this.storage.setItem('scope', 'window', windowId)
    return windowId
  }
}
