/**
 * Entry point for the browser build
 */

import { createTracker } from './tracker/tracker'
import { createPrettyLogger } from './logger/logger'
import { createBreakPointMeter } from './plugins/plugin.breakpoint'
import { createVisibilityTracking } from './plugins/plugin.visibility'

const NAMESPACE = process.env.NAMESPACE

/**
 *  Init global behave object if it doesn't exist yet
 */
const behave = global[NAMESPACE] = global[NAMESPACE] || {}

/**
 * Get start time, try to retrieve from global object (if loder-snippet was
 * used)
 */
const startTime = global[NAMESPACE].t || 1 * new Date()

const logger = createPrettyLogger(global)

/**
 * Create the tracker
 */
const tracker = createTracker(global, {
  startTime,
  logger,
})

tracker.use('breakpointMeter', createBreakPointMeter(global, { tracker }))
tracker.use('visibilityTracker', createVisibilityTracking(global, { tracker }))

global[NAMESPACE] = {
  ...behave,
  tracker,
}
