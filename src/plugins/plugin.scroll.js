/**
 * @module strgBeHave/tracker/breakpoint
 */

import { throttle } from '../utils/utils'

export function createScrollTracking (global, { tracker }) {
  const DEFAULTS = {
    THROTTLE_DELAY: 200,
    GAUGE_POINT_INTVERVAL: 25
  }

  class VisibilityMeter {
    constructor (DOMNode, {
      eventKey,
      eventValue,
      threshold,
    }) {
      this.eventKey = eventKey
      this.eventValue = eventValue
      if (!threshold) {
        threshold = []
        for (let i = 0; i <= 1.0; i += 0.1) {
          threshold.push(i)
        }
      }
      this.observer = new IntersectionObserver(
        (entries) => this.observerCallback(entries),
        {
          root: null,
          rootMargin: '0px',
          threshold,
        })
      this.observer.observe(DOMNode)
    }

    observerCallback (entries) {
      // console.log('Observer', this.eventKey, entries.map(e => e))
      const perc = entries[0].intersectionRatio * 100
      if (perc > 80) {
        tracker.windowStateChange(this.eventKey, this.eventValue)
        this.observer.disconnect()
      }
    }
  }

  class ScrollDepthMeter {
    constructor (DOMNode, {
      id,
      eventKey,
      value = null,
      gaugePointInterval,
    }) {
      this.DOMNode = DOMNode
      this.id = id
      this.eventKey = eventKey
      this.value = value
      this.gaugePointInterval = gaugePointInterval || DEFAULTS.GAUGE_POINT_INTVERVAL

      this.gaugePoints = []
      this.trackedGaugePoints = {}

      this.updateGaugePoints()

      this.scrollHandler = throttle(this.trackGaugePoints.bind(this),
        DEFAULTS.THROTTLE_DELAY)
      global.addEventListener('scroll', this.scrollHandler)
      global.addEventListener('resize', this.scrollHandler)
      this.scrollHandler()
    }

    trackGaugePoints () {
      const rect = this.DOMNode.getBoundingClientRect()
      this.updateGaugePoints()
      if (!this.isRectVisible(rect)) {
        return false
      }
      const viewPortHeight = (global.innerHeight ||
        document.documentElement.clientHeight)
      const scrollDepthPixelsBottom = rect.height
        ? Math.max(0, Math.min(viewPortHeight - rect.top, rect.height))
        : Math.max(0, Math.min(viewPortHeight - rect.top, 1))
      this.gaugePoints
        .filter(gp => gp && gp[0] <= scrollDepthPixelsBottom)
        .forEach(gp => {
          if (this.trackedGaugePoints[gp[1]]) return
          tracker.windowStateChange(this.eventKey, gp[1])
          this.trackedGaugePoints[gp[1]] = true
        })

      // // Reduce gaugePoints, fails when gaugepoints actually change.
      // // We use trackedGaugePoints instead
      // this.gaugePoints = this.gaugePoints
      //   .filter(function (gp) {
      //     return gp && gp[0] > scrollDepthPixelsBottom
      //   })

      if (this.gaugePoints.length === 0) {
        global.removeEventListener('scroll', this.scrollHandler)
        global.removeEventListener('resize', this.scrollHandler)
      }
    }

    updateGaugePoints () {
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
    visibility ({ selector, eventKey, eventValue = 1, threshold }) {
      const DOMNode = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector
      return new VisibilityMeter(DOMNode, {
        eventKey,
        eventValue,
        threshold,
      })
    },
    scrollDepth ({ selector, eventKey, gaugePointInterval = null }) {
      const DOMNode = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector
      return new ScrollDepthMeter(DOMNode, {
        eventKey,
        gaugePointInterval,
      })
    },

    // percent ({ selector, eventKey, gaugePointInterval = null }) {
    //   const DOMNode = typeof selector === 'string'
    //     ? document.querySelector(selector)
    //     : selector
    //   return new BreakpointMeter(DOMNode, {
    //     id: eventKey,
    //     gaugePointInterval,
    //   })
    // },
  }
}
