/**
 * @function throttle
 * @description Throttle with leading/trailing option
 * src: http://underscorejs.org/docs/underscore.html#section-82
 */
export function throttle (func, wait, options) {
  let context; let args; let result
  let timeout = null
  let previous = 0
  if (!options) options = {}
  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }
}

/**
 * @function loadScript
 * @description Asynchronously loads an external javascript file by adding a script-tag to the DOM
 * @param {Object} global Global scope, usually window, must provide `window.document`
 * @param {String} src URL for script to be loaded
 * @param {Function} cb Callback attached to `element.onload`
 */
export function loadScript (global, src, cb) {
  const elem = global.document.createElement('script')
  const node = global.document.getElementsByTagName('script')[0]
  elem.async = 1
  elem.src = src
  if (cb) {
    elem.onload = cb
  }
  node.parentNode.insertBefore(elem, node)
  return elem
}

/**
 * Parse clean url without hashes and query params from location object
 * @param {Location} location - window.location object
 */
export function getCleanURI (location) {
  return location.protocol +
    '//' +
    location.hostname +
    (location.port ? ':' + location.port : '') + location.pathname
}
