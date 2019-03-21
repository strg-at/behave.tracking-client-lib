/**
 * @module strgBeHave/tracker/visibility
 * @description Browser tab visibility
 */
export function createVisibilityTracking (global, { tracker }) {
  let hidden
  let visibilityChange

  if (typeof global.document.hidden !== 'undefined') {
    hidden = 'hidden'
    visibilityChange = 'visibilitychange'
  } else if (typeof global.document.msHidden !== 'undefined') {
    hidden = 'msHidden'
    visibilityChange = 'msvisibilitychange'
  } else if (typeof global.document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden'
    visibilityChange = 'webkitvisibilitychange'
  }

  return {
    init () {
      if (visibilityChange) {
        tracker.windowStateChange('window.active', !global.document[hidden])
        global.document.addEventListener(visibilityChange, function () {
          tracker.windowStateChange('window.active', !global.document[hidden])
        }, false)
      }
    }
  }
}
