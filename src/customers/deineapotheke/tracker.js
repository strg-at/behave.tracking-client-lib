/**
 * @module CustomTracker
 * Custom SPA Tracker
 */

import { createTracker } from '../../tracker/tracker'
import { createScrollTracking } from '../../plugins/plugin.scroll'
// FIXME: Do we still want to track tab visibility?
// import { createVisibilityTracking } from '../plugins/plugin.visibility'
import { getCleanURI } from '../../utils/utils'

export function configureTracker (global, config) {
  const { endpoint } = config

  /**
   * Create the tracker
  */
  const tracker = createTracker(global, config)

  tracker.use('scrollTracking', createScrollTracking(global, { tracker }))
  // tracker.use('visibilityTracker', createVisibilityTracking(global, { tracker }))

  /**
   * Extend API to properly log URIs, eg.:
   * tracker.windowStateChange('url', tracker.getCleanURI(window.location))
   */
  tracker.getCleanURI = getCleanURI

  /**
   * Init connection to endpoint and track tab visibility
   */
  tracker.init(endpoint)
  // tracker.visibilityTracker.init()

  return tracker
}