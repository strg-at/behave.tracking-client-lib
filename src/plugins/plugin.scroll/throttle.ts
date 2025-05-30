import type { ThrottleOptions } from '../../util/types'

/**
 * @function throttle
 * @description Throttle with leading/trailing option
 * src: http://underscorejs.org/docs/underscore.html#section-82
 */
export function throttle(func: () => boolean | undefined | void, wait: number, options: ThrottleOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let context: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let args: any
  let result: boolean | undefined | void
  let timeout: NodeJS.Timeout | null = null
  let previous = 0
  if (!options) options = {}
  const later = function () {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }
  return () => {
    const now = Date.now()
    if (!previous && options.leading === false) previous = now
    const remaining = wait - (now - previous)
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    context = this
    // eslint-disable-next-line prefer-rest-params
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
