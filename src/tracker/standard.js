/**
 * @module StandardTracker
 * Standard Tracker DOM-implementation
 */

import { createTracker } from './tracker'
import { createScrollTracking } from '../plugins/plugin.scroll'
import { createVisibilityTracking } from '../plugins/plugin.visibility'

export function configureTracker (global, config) {
  const { endpoint, articleSelector, getCleanURI } = config

  /**
   * Create the tracker
  */
  const tracker = createTracker(global, config)

  tracker.use('scrollTracking', createScrollTracking(global, { tracker }))
  tracker.use('visibilityTracker', createVisibilityTracking(global, { tracker }))

  tracker.init(endpoint)
  tracker.visibilityTracker.init()

  /* WindowState */
  tracker.windowStateChange('url', getCleanURI(global.location))
  document.referrer &&
  tracker.windowStateChange('referrer', document.referrer)
  global.location.hash &&
  tracker.windowStateInit('url.hash', global.location.hash)
  global.addEventListener('hashchange', function () {
    tracker.windowStateChange('url.hash', global.location.hash)
  })

  const articleElement = [].concat(articleSelector) // Cast to array and pick first found
    .map(selector => document.querySelector(selector))
    .filter(el => !!el)
    .shift()
  if (articleElement) {
    tracker.scrollTracking.scrollDepth(
      articleElement,
      {
        eventKey: 'breakpoint.content.percent.max',
      })
  }

  return tracker
}
