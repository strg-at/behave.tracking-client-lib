/**
 * @class strgBeHave/tracking/plugin/scroll/MultiScrollDepthMeter
 */

import { throttle } from './throttle'
import type {
  ScrollDepthEventOptions,
  PluginEventCallbacks,
  ScrollTrackingDefaults,
  TrackingRect,
} from '../../util/types'

export class MultiNodeScrollDepthMeter {
  DOMNodes: HTMLElement[]
  id: string
  eventKey: string
  value: string | number
  gaugePointInterval: number

  BREAKPOINT_EVENT: string
  callbacks: PluginEventCallbacks
  DEFAULTS: ScrollTrackingDefaults

  gaugePoints: [number, number][]
  trackedGaugePoints: Record<number, boolean>
  scrollHandler: () => void | boolean | undefined

  constructor(
    DOMNodes: HTMLElement[],
    eventOptions: ScrollDepthEventOptions,
    callbacks: PluginEventCallbacks,
    BREAKPOINT_EVENT: string,
    DEFAULTS: ScrollTrackingDefaults
  ) {
    this.DOMNodes = DOMNodes
    this.id = eventOptions.id ?? ''
    this.eventKey = eventOptions.eventKey
    this.value = eventOptions.value ?? ''
    this.gaugePointInterval = eventOptions.gaugePointInterval || DEFAULTS.GAUGE_POINT_INTVERVAL

    this.BREAKPOINT_EVENT = BREAKPOINT_EVENT
    this.callbacks = callbacks
    this.DEFAULTS = DEFAULTS

    this.gaugePoints = []
    this.trackedGaugePoints = {}

    this.updateGaugePoints()

    this.scrollHandler = throttle(this.trackGaugePoints.bind(this), DEFAULTS.THROTTLE_DELAY)
    window.addEventListener('scroll', this.scrollHandler)
    window.addEventListener('resize', this.scrollHandler)
    this.scrollHandler()
  }

  getBoundingClientRectMinMax(): TrackingRect {
    const rect: TrackingRect = this.DOMNodes.reduce(
      (acc, DOMNode) => {
        const rect = DOMNode.getBoundingClientRect()
        return {
          top: Math.min(acc.top, rect.top),
          right: Math.max(acc.right, rect.right),
          bottom: Math.max(acc.bottom, rect.bottom),
          left: Math.min(acc.left, rect.left),
          height: Infinity,
        }
      },
      { top: Infinity, right: -Infinity, bottom: -Infinity, left: Infinity, height: Infinity }
    )
    rect.height = rect.bottom - rect.top
    return rect
  }

  trackGaugePoints() {
    const rect = this.getBoundingClientRectMinMax()
    this.updateGaugePoints()
    if (!this.isRectVisible(rect)) {
      return false
    }
    const viewPortHeight = window.innerHeight || document.documentElement.clientHeight
    const scrollDepthPixelsBottom = rect.height
      ? Math.max(0, Math.min(viewPortHeight - rect.top, rect.height))
      : Math.max(0, Math.min(viewPortHeight - rect.top, 1))
    this.gaugePoints
      .filter((gp) => gp && gp[0] <= scrollDepthPixelsBottom)
      .forEach((gp) => {
        if (this.trackedGaugePoints[gp[1]]) return
        const event = {
          key: this.eventKey,
          value: gp[1],
          time: Date.now(),
        }
        this.callbacks[this.BREAKPOINT_EVENT].forEach((callback) => callback(event))
        this.trackedGaugePoints[gp[1]] = true
      })

    if (this.gaugePoints.length === 0) {
      window.removeEventListener('scroll', this.scrollHandler)
      window.removeEventListener('resize', this.scrollHandler)
    }
  }

  updateGaugePoints() {
    const rect = this.getBoundingClientRectMinMax()
    const interval = this.gaugePointInterval
    const result = []
    let percent
    let i
    for (i = interval; i <= 100; i += interval) {
      percent = i / 100
      result.push([rect.height * percent, percent * 100] as [number, number])
    }
    if (i !== 100 + interval) {
      result.push([rect.height, 100] as [number, number])
    }
    this.gaugePoints = result
  }

  isAtLeastOneDOMNodeVisible(): boolean {
    return this.DOMNodes.some((DOMNode) => {
      return DOMNode.offsetParent !== null
    })
  }

  isRectVisible(rect: TrackingRect): boolean {
    return (
      this.isAtLeastOneDOMNodeVisible() !== null &&
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  unbind() {
    window.removeEventListener('scroll', this.scrollHandler)
    window.removeEventListener('resize', this.scrollHandler)
  }
}
