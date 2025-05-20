/**
 * @module strgBeHave/tracking/plugin/scroll/VisibilityMeterFallback
 */

import type {
  VisibilityEventOptions,
  PluginEventCallbacks,
  ScrollTrackingDefaults,
  TrackingRect,
} from '../../util/types'
import { throttle } from './throttle'

export class VisibilityMeterFallback {
  DOMNode: HTMLElement
  eventKey: string
  eventValue: number
  VISIBILITY_EVENT: string
  callbacks: PluginEventCallbacks
  DEFAULTS: ScrollTrackingDefaults
  scrollHandler: () => void | boolean | undefined

  constructor(
    DOMNode: HTMLElement,
    eventOptions: VisibilityEventOptions,
    callbacks: PluginEventCallbacks,
    VISIBILITY_EVENT: string,
    DEFAULTS: ScrollTrackingDefaults
  ) {
    this.eventKey = eventOptions.eventKey
    this.eventValue = Number(eventOptions.eventValue)
    this.DOMNode = DOMNode
    this.callbacks = callbacks
    this.VISIBILITY_EVENT = VISIBILITY_EVENT
    this.DEFAULTS = DEFAULTS

    this.scrollHandler = throttle(this.trackVisibility.bind(this), DEFAULTS.THROTTLE_DELAY)

    window.addEventListener('scroll', this.scrollHandler)
    window.addEventListener('resize', this.scrollHandler)

    this.scrollHandler()
  }

  trackVisibility() {
    const rect = this.DOMNode.getBoundingClientRect()
    if (this.isRectVisible(rect)) {
      const event = {
        key: this.eventKey,
        value: this.eventValue,
        time: Date.now(),
      }
      this.callbacks[this.VISIBILITY_EVENT].forEach((callback) => callback(event))
      window.removeEventListener('scroll', this.scrollHandler)
      window.removeEventListener('resize', this.scrollHandler)
    }
  }

  isRectVisible(rect: TrackingRect): boolean {
    return (
      this.DOMNode.offsetParent !== null &&
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
