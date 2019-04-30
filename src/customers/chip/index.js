/**
 * @module SnBootstrapper
 * Entry point for the browser build for sn.at
 */
import { createPrettyLogger } from '../../logger/logger'
// import { loadRecommandationsApp } from './app'
import config from './config.js'

/**
 * Configuration constants
 */
const {
  NAMESPACE,
  COOKIE_NAME,
  // APP_NODE_IDS,
  // RECOMMENDATION_APP_URL,
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
  const logger = createPrettyLogger(global, config)

  /**
   *  Init global behave object if it doesn't exist yet
   */
  const behave = global[NAMESPACE] = global[NAMESPACE] || {}

  /**
   * Get start time, try to retrieve from global object (if loder-snippet was
   * used)
   */
  const startTime = global[NAMESPACE].t || 1 * new Date()

  /**
   * Load the tracker asynchronously as webpack-chunk
   */
  const { configureTracker } = await import(/* webpackChunkName: "tracker" */ './tracker')
  const tracker = configureTracker(global, {
    NAMESPACE,
    startTime,
    endpoint: TRACKING_SERVICE_URL,
    logger,
  })

  /**
   * Merge tracker to global namespace
   */
  global[NAMESPACE] = {
    ...behave,
    tracker,
  }

  /**
   * Load the recommendations app
   */
  // loadRecommandationsApp(global, {
  //   APP_NODE_IDS,
  //   RECOMMENDATION_APP_URL,
  // })
}

init(global)
