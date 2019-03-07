
/**
 * Bootstrapper
 * Entry point for the browser build for InFranken.de
 */
import { createPrettyLogger } from '../../logger/logger'
import { loadScript } from '../../utils/utils'
import config from './config.js'

/**
 * Configuration constants
 */
const {
  NAMESPACE,
  COOKIE_NAME,
  APP_NODE_IDS,
  RECOMMENDATION_APP_URL,
  TRACKING_SERVICE_URL
} = config

async function init (global) {
  /**
   * Test for OptOut-Cookie and abort when set.
   */
  if (global.document.cookie.match(`${COOKIE_NAME}=1`)) {
    return
  }

  /**
   * Enable logging-support for the build
   */
  const logger = createPrettyLogger(global)

  /**
   * Get start time, try to retrieve from global object (if loder-snippet was
   * used)
   */
  const startTime = global[NAMESPACE].t || 1 * new Date()

  /**
   *  Init global behave object if it doesn't exist yet
   */
  const behave = global[NAMESPACE] = global[NAMESPACE] || {}

  const { configureTracker } = await import(/* webpackChunkName: "tracker" */ './tracker')
  const tracker = configureTracker(global, {
    logger,
    startTime,
    endpoint: TRACKING_SERVICE_URL
  })
  global[NAMESPACE] = {
    ...behave,
    tracker,
    loggerHandler: process.env.NODE_ENV === 'development'
      ? global.console
      : undefined,
  }

  let hasAppNodes = APP_NODE_IDS.reduce(function (result, id) {
    if (result) return result
    return !!document.getElementById(id)
  }, false)

  if (
    hasAppNodes &&
    // localStorage.getItem('strg.recommendations.client') &&
    // Abort if custom-element already defined
    document.createElement('strg-recommendations').constructor === HTMLElement
  ) {
    loadScript(global, RECOMMENDATION_APP_URL, function () {
      APP_NODE_IDS.forEach(function (id) {
        let node = document.getElementById(id)
        if (node === null) return
        let appNode = document.createElement('strg-recommendations')
        appNode.setAttribute('data-id', id)
        node.appendChild(appNode)
      })
    })
  }
}

init(global)
