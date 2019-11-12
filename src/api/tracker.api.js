export class TrackerAPI {
  constructor (service, conf) {
    this.service = service
    this.conf = conf
    this.register()
  }

  push (...events) {
    // just proxy
    return this.service.addEvents(events)
  }

  register () {
    // register itself to defined namespace move its content to own dataLayer and replace global by exposing dataLayer
    const currentData = global[this.conf.NAMESPACE]
    global[this.conf.NAMESPACE] = this
    if (currentData !== undefined && Array.isArray(currentData)) {
      currentData.forEach(event => this.push(event))
    }
  }
}
