export class TrackerService {
  constructor (dao, conf) {
    this.dao = dao
    this.dataLayer = []
  }

  addEvents (events) {
    console.log(events)
    if (!Array.isArray(events)) {
      return
    }
    events.forEach(event => {
      this.validateEvent(event)
      this.dataLayer.push(event)
    })
    // TODO trigger proceed dataLayer items
    console.log(this.dataLayer)
    return this.dataLayer.length
  }

  validateEvent (event) {
    // TODO: check if type, key and value are set properly
    console.log(typeof event)
    if (typeof event !== 'object' || event === null) {
      throw new Error('empty or invalid event')
    }
    if (!event.type ||
       (event.type !== TrackerService.EVENT_TYPE_WINDOW &&
        event.type !== TrackerService.EVENT_TYPE_SESSION &&
        event.type !== TrackerService.EVENT_TYPE_CLIENT)) {
      throw new Error('invalid tracking event type')
    }
  }
}
TrackerService.EVENT_TYPE_WINDOW = 'window'
TrackerService.EVENT_TYPE_SESSION = 'session'
TrackerService.EVENT_TYPE_CLIENT = 'client'
