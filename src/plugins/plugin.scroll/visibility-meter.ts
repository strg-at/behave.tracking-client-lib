/**
 * @module strgBeHave/tracking/plugin/scroll/VisibilityMeter
 */

import type { VisibilityEventOptions, PluginEventCallbacks } from '../../util/types'

export class VisibilityMeter {
  eventKey: string
  eventValue: string | number
  VISIBILITY_EVENT: string
  callbacks: PluginEventCallbacks
  visibilityThreshold: number
  observer: IntersectionObserver

  constructor(
    DOMNode: HTMLElement,
    eventOptions: VisibilityEventOptions,
    callbacks: PluginEventCallbacks,
    VISIBILITY_EVENT: string
  ) {
    this.eventKey = eventOptions.eventKey
    this.eventValue = eventOptions.eventValue
    this.visibilityThreshold = eventOptions.visibilityThreshold !== undefined ? eventOptions.visibilityThreshold : 65
    this.callbacks = callbacks
    this.VISIBILITY_EVENT = VISIBILITY_EVENT

    // Threshold for the callback, measuring every 10%
    const threshold = []
    for (let i = 0; i <= 1.0; i += 0.1) {
      threshold.push(i)
    }
    this.observer = new IntersectionObserver((entries) => this.observerCallback(entries), {
      root: null,
      rootMargin: '0px',
      threshold,
    })
    this.observer.observe(DOMNode)
  }

  observerCallback(entries: IntersectionObserverEntry[]) {
    const perc = entries[0].intersectionRatio * 100
    if (perc > this.visibilityThreshold) {
      const event = {
        key: this.eventKey,
        value: this.eventValue,
        time: Date.now(),
      }
      this.callbacks[this.VISIBILITY_EVENT].forEach((callback) => callback(event))
      this.observer.disconnect()
    }
  }

  unbind() {
    this.observer.disconnect()
  }
}
