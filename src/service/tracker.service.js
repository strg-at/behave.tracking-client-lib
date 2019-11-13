export class TrackerService {
  constructor (dao, conf) {
    this.dao = dao
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
      count++
      this.dao.store(event)
    })
    return count
  }

  /**
   * validate an Event
   * @throws Error when input is not an object or null
   * @throws Error when event.type is not present or invalid
   * @param {Event} event - the Event to validate
   */
  validateEvent (event) {
    // TODO: check if type, key and value are set properly
    if (typeof event !== 'object' || event === null) {
      throw new Error('empty or invalid event')
    }
    if (!event.type ||
       (event.type !== TrackerService.EVENT_TYPE_WINDOW &&
        event.type !== TrackerService.EVENT_TYPE_SESSION &&
        event.type !== TrackerService.EVENT_TYPE_CLIENT)) {
      throw new Error('invalid tracking event type')
    }
    // TODO: add key validation
  }
}
TrackerService.EVENT_TYPE_WINDOW = 'window'
TrackerService.EVENT_TYPE_SESSION = 'session'
TrackerService.EVENT_TYPE_CLIENT = 'client'
