/**
 * @module Bootstrapper
 * Entry point for the browser build for sn.at
 */
import { createPrettyLogger } from '../logger/logger'
import { getCleanURI } from '../utils/utils'

/**
 * Special syntax `<CUSTOMER>` is being handled by Webpack
 * NormalModuleReplacementPlugin so webpack doesn't treat env-based imports as
 * dynamic imports.
 */
import config from '../customers/<CUSTOMER>/config.js'

// Standard-implementation loader for the app
import { loadRecommandationsApp } from '../customers/<CUSTOMER>/app'

/**
 * Configuration constants
 */
const {
  NAMESPACE,
  COOKIE_NAME,
  RECOMMENDATION_APP_CUSTOM_ELEMENTS,
  RECOMMENDATION_APP_URL,
  TRACKING_SERVICE_URL,
  ARTICLE_SELECTOR,
  GET_CLEAN_URI,
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
  const { configureTracker } = await import(/* webpackChunkName: "tracker" */ '../tracker/standard')
  const tracker = configureTracker(global, {
    NAMESPACE,
    startTime,
    articleSelector: ARTICLE_SELECTOR,
    endpoint: TRACKING_SERVICE_URL,
    logger,
    getCleanURI: GET_CLEAN_URI || getCleanURI
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
  loadRecommandationsApp(global, {
    RECOMMENDATION_APP_URL,
    RECOMMENDATION_APP_CUSTOM_ELEMENTS,
  })
}

init(global)
