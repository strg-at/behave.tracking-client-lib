
/**
 * @module InfrankenBootstrapper
 * Entry point for the browser build for InFranken.de
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

  /**
   * Load the tracker asynchronously as webpack-chunk
   */
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

  /**
   * Load the recommendations app
   */
  // loadRecommandationsApp(global, {
  //   APP_NODE_IDS,
  //   RECOMMENDATION_APP_URL,
  // })
}

init(global)
