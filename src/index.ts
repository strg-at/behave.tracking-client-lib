import { TrackerAPI } from './api/tracker.api'

declare global {
    interface Window {
        [namespace: string]: TrackerAPI
    }
}

export { TrackerAPI } from './api/tracker.api'
export { TrackerService } from './service/tracker.service'
export { ClientStorage } from './dao/client.storage'
export { TrackerWS } from './dao/tracker.ws'

export { createScrollTracking, createUrlTracking, createReferrerTracking } from './plugins'

