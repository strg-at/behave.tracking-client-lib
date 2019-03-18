/**
 * @module strg/metrics/breakpoint
 */

import { throttle } from '../utils/utils'

export function createBreakPointMeter (global, { tracker }) {
  const DEFAULTS = {
    THROTTLE_DELAY: 200,
    GAUGE_POINT_INVERVAL: 25
  }

  class BreakpointMeter {
    constructor (DOMNode, options) {
      this.DOMNode = DOMNode
      this.options = options || {}
      this.id = options.id || DOMNode.nodeName +
        ((DOMNode.id) ? '.' + DOMNode.id : '')
      this.key = options.key || 'breakpoint.' + this.id
      this.value = options.value || null
      this.gaugePointInterval = (typeof options.gaugePointInterval === 'number')
        ? options.gaugePointInterval : DEFAULTS.GAUGE_POINT_INVERVAL
      if (this.options.simple) {
        this.scrollHandler = throttle(this.trackBreakPoint.bind(this), 200)
        global.addEventListener('scroll', this.scrollHandler)
        this.scrollHandler()
      } else {
        this.gaugePoints = this.makeGaugePointsArray(
          this.DOMNode.getBoundingClientRect(),
          this.gaugePointInterval)
        this.scrollHandler = throttle(this.trackGaugePoints.bind(this),
          DEFAULTS.THROTTLE_DELAY)
        global.addEventListener('scroll', this.scrollHandler)
        this.scrollHandler()
      }
    }

    trackBreakPoint () {
      const rect = this.DOMNode.getBoundingClientRect()
      if (!this.isRectVisible(rect)) { return }
      tracker.windowStateChange(this.key, this.value)
      global.removeEventListener('scroll', this.scrollHandler)
    }

    trackGaugePoints () {
      const self = this
      const rect = self.DOMNode.getBoundingClientRect()
      if (!self.isRectVisible(rect)) {
        return false
      }
      const viewPortHeight = (global.innerHeight ||
        document.documentElement.clientHeight)
      const scrollDepthPixelsBottom = rect.height
        ? Math.max(0, Math.min(viewPortHeight - rect.top, rect.height))
        : Math.max(0, Math.min(viewPortHeight - rect.top, 1))
      self.gaugePoints.filter(function (gp) {
        return gp && gp[0] <= scrollDepthPixelsBottom
      }).forEach(function (gp) {
        tracker.windowStateChange('breakpoint.' + self.id + '.percent.max', gp[1])
      })
      self.gaugePoints = self.gaugePoints.filter(function (gp) {
        return gp && gp[0] > scrollDepthPixelsBottom
      })
      if (self.gaugePoints.length === 0) {
        global.removeEventListener('scroll', this.scrollHandler)
      }
    }

    makeGaugePointsArray (rect, interval) {
      const result = []
      let percent
      let i
      for (i = interval; i <= 100; i += interval) {
        percent = i / 100
        result.push([
          rect.height * percent,
          percent * 100
        ])
      }
      if (i !== 100 + interval) {
        result.push([
          rect.height,
          100
        ])
      }
      return result
    }

    isRectVisible (rect) {
      return (
        this.DOMNode.offsetParent !== null &&
        rect.bottom >= 0 &&
        rect.right >= 0 &&
        rect.top <= (global.innerHeight || document.documentElement.clientHeight) &&
        rect.left <= (global.innerWidth || document.documentElement.clientWidth)
      )
    }
  }

  return {
    percent: function (selector, id, gaugePointInterval) {
      const DOMNode = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector
      return new BreakpointMeter(DOMNode, {
        id: id,
        gaugePointInterval: gaugePointInterval
      })
    },

    simple: function (selector, key, value) {
      const DOMNode = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector
      return new BreakpointMeter(DOMNode, {
        id: key,
        key: key,
        simple: true,
        value: typeof value !== 'undefined'
          ? value
          : '1'
      })
    }
  }
}
