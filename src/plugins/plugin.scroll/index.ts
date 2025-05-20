/**
 * @module strgBeHave/tracking/plugin/scroll
 */

import { ScrollDepthMeter } from './scroll-depth-meter'
import { MultiNodeScrollDepthMeter } from './multi-node-scroll-depth-meter'
import { VisibilityMeter } from './visibility-meter'
import { VisibilityMeterFallback } from './visibility-meter-fallback'
import type {
  ScrollDepthEventOptions,
  PluginEventCallbacks,
  VisibilityEventOptions,
  PluginEventCallback,
} from '../../util/types'

export function createScrollTracking() {
  const BREAKPOINT_EVENT = 'breakpoint'
  const VISIBILITY_EVENT = 'visibility'

  const callbacks: PluginEventCallbacks = {
    breakpoint: [],
    visibility: [],
  }

  const DEFAULTS = {
    THROTTLE_DELAY: 200,
    GAUGE_POINT_INTVERVAL: 25,
  }

  return {
    visibility(
      selector: HTMLElement | string,
      { eventKey, eventValue = 1, visibilityThreshold = 65 }: VisibilityEventOptions
    ) {
      const DOMNode = typeof selector === 'string' ? document.querySelector(selector) : selector
      if ('IntersectionObserver' in window) {
        return new VisibilityMeter(
          DOMNode as HTMLElement,
          {
            eventKey,
            eventValue,
            visibilityThreshold,
          },
          callbacks,
          VISIBILITY_EVENT
        )
      }
      return new VisibilityMeterFallback(
        DOMNode as HTMLElement,
        {
          eventKey,
          eventValue,
          visibilityThreshold,
        },
        callbacks,
        VISIBILITY_EVENT,
        DEFAULTS
      )
    },
    scrollDepth(selector: HTMLElement | string, { eventKey, gaugePointInterval = null }: ScrollDepthEventOptions) {
      const DOMNode = typeof selector === 'string' ? document.querySelector(selector) : selector
      return new ScrollDepthMeter(
        DOMNode as HTMLElement,
        {
          eventKey,
          gaugePointInterval,
        },
        callbacks,
        BREAKPOINT_EVENT,
        DEFAULTS
      )
    },
    multiNodeScrollDepth(domNodes: HTMLElement[], { eventKey, gaugePointInterval = null }: ScrollDepthEventOptions) {
      if (!Array.isArray(domNodes) || domNodes.some((node) => !(node instanceof Element))) {
        throw new Error('domNodes must be a list of DOM nodes')
      }
      return new MultiNodeScrollDepthMeter(
        domNodes,
        {
          eventKey,
          gaugePointInterval,
        },
        callbacks,
        BREAKPOINT_EVENT,
        DEFAULTS
      )
    },
    on(event: 'breakpoint' | 'visibility', callback: PluginEventCallback) {
      if (!callbacks[event]) return
      callbacks[event].push(callback)
    },
  }
}
