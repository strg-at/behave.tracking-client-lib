
/**
 * @function uuid4
 * @description UUID4 standard implementation taken from:
 * https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
 * also see https://bocoup.com/blog/random-numbers
 * @returns {String} Random UUID4
 */
export function uuid4 () {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

/**
 * @function isUUid
 * @description Simple regexp-validation for UUIDs
 * @param {String} s - UUID string
 */
export function isUuid (s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
}

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
  let later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return function () {
    let now = Date.now()
    if (!previous && options.leading === false) previous = now
    let remaining = wait - (now - previous)
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
