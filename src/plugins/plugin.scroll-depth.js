/**
 * @module strgBeHave/tracker/breakpoint
 */

import { throttle } from '../utils/utils'

export function createScrollDepthMeter (global, { tracker }) {
  const DEFAULTS = {
    THROTTLE_DELAY: 200,
    GAUGE_POINT_INTVERVAL: 25
  }

  class BreakpointMeter {
    constructor (DOMNode, {
      id,
      key,
      value = null,
      gaugePointInterval,
    }) {
      this.DOMNode = DOMNode
      this.id = id
      this.key = key
      this.value = value
      this.gaugePointInterval = gaugePointInterval || DEFAULTS.GAUGE_POINT_INTVERVAL

      this.updateGaugePointsArray()
      this.scrollHandler = throttle(this.trackGaugePoints.bind(this),
        DEFAULTS.THROTTLE_DELAY)
      global.addEventListener('scroll', this.scrollHandler)
      this.scrollHandler()
    }

    trackGaugePoints () {
      const rect = this.DOMNode.getBoundingClientRect()
      if (!this.isRectVisible(rect)) {
        return false
      }
      const viewPortHeight = (global.innerHeight ||
        document.documentElement.clientHeight)
      const scrollDepthPixelsBottom = rect.height
        ? Math.max(0, Math.min(viewPortHeight - rect.top, rect.height))
        : Math.max(0, Math.min(viewPortHeight - rect.top, 1))
      console.log(scrollDepthPixelsBottom, this.gaugePoints, this.gaugePointInterval)

      this.gaugePoints
        .filter(gp => gp && gp[0] <= scrollDepthPixelsBottom)
        .forEach(gp => {
          tracker.windowStateChange('breakpoint.' + this.id + '.percent.max', gp[1])
        })
      this.gaugePoints = this.gaugePoints
        .filter(function (gp) {
          return gp && gp[0] > scrollDepthPixelsBottom
        })

      if (this.gaugePoints.length === 0) {
        global.removeEventListener('scroll', this.scrollHandler)
      }
    }

    updateGaugePointsArray () {
      const rect = this.DOMNode.getBoundingClientRect()
      const interval = this.gaugePointInterval
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
      this.gaugePoints = result
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
    percent ({ selector, eventKey, gaugePointInterval = null }) {
      const DOMNode = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector
      return new BreakpointMeter(DOMNode, {
        id: eventKey,
        gaugePointInterval,
      })
    },
  }
}
