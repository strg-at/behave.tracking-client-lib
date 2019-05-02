/**
 * @module InfrankenTracker
 * Tracker DOM-implementation for InFranken.de
 */

import { createTracker } from '../../tracker/tracker'
import { createScrollTracking } from '../../plugins/plugin.scroll'
import { createVisibilityTracking } from '../../plugins/plugin.visibility'

export function parseArticleId (url) {
  let match = /(?:art[\d]+,)([\d]+)$/g.exec(url)
  return match && match.length >= 2
    ? parseInt(match[1])
    : null
}

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

  let articleId = parseArticleId(location.href)
  articleId && tracker.windowStateChange('content.id', articleId)

  let articleSelector = 'article[id="article-' + articleId + '"]'
  if (document.querySelector(articleSelector)) {
    tracker.scrollTracking.scrollDepth(
      articleSelector,
      {
        eventKey: 'breakpoint.content.percent.max',
      })
  }

  return tracker
}
