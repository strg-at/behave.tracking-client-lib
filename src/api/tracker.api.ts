import { TrackerService } from '../service/tracker.service'
import { ClientConfiguration, TrackerEvent } from '../util/types'

export class TrackerAPI {
  service: TrackerService
  conf: ClientConfiguration

  constructor(service: TrackerService, conf: ClientConfiguration) {
    this.service = service
    this.conf = conf
    this.register()
  }

  push(...events: TrackerEvent[]) {
    // just proxy
    return this.service.addEvents(events)
  }

  register() {
    // register itself to defined namespace move its content to own dataLayer and replace global by exposing dataLayer
    const currentData = window[this.conf.NAMESPACE]
    window[this.conf.NAMESPACE] = this
    if (currentData !== undefined && Array.isArray(currentData)) {
      currentData.forEach((event) => this.push(event))
    }
  }
}
