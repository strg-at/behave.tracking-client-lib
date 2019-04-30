/**
 * @module SnTracker
 * Tracker DOM-implementation for chip.de
 */

import { createTracker } from '../../tracker/tracker'
import { createScrollTracking } from '../../plugins/plugin.scroll'
import { createVisibilityTracking } from '../../plugins/plugin.visibility'

export function configureTracker (global, config) {
  const { endpoint } = config

  /**
   * Create the tracker
  */
  const tracker = createTracker(global, config)

  tracker.use('scrollTracking', createScrollTracking(global, { tracker }))
  tracker.use('visibilityTracker', createVisibilityTracking(global, { tracker }))

  tracker.init(endpoint)
  tracker.visibilityTracker.init()

  /* WindowState */
  tracker.windowStateChange('url', global.location.href)
  document.referrer &&
  tracker.windowStateChange('referrer', document.referrer)
  global.location.hash &&
  tracker.windowStateInit('url.hash', global.location.hash)
  global.addEventListener('hashchange', function () {
    tracker.windowStateChange('url.hash', global.location.hash)
  })

  let articleSelector = 'div[itemtype="http://schema.org/NewsArticle"]'
  if (document.querySelector(articleSelector)) {
    tracker.scrollTracking.scrollDepth(
      articleSelector,
      {
        eventKey: 'breakpoint.content.percent.max',
      })
  }

  return tracker
}
