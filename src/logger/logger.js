/**
 * Logger can be anything that implements log, info, warn and error functions.
 * So setting e.g. ```window.strg.loggerHandler = console``` will log to browser
 * console in runtime.
 */
export function createPrettyLogger (global) {
  const GLOBAL_NAME = process.env.NAMESPACE
  const logger = {
    _msg: function (args) {
      let css = [
        'background: transparent;', // reset
        'color: #FFF; background: #f2c109; border-radius:2px; padding: 0 6px;', // log
      ]
      return ['%cstrg%c', css[1], css[0]].concat(args)
    },
    log: function () {
      let args = Array.prototype.slice.call(arguments)
      global[GLOBAL_NAME].loggerHandler &&
        global[GLOBAL_NAME].loggerHandler.log
          .apply(null, this._msg(args))
    },
    info: function () {
      let args = Array.prototype.slice.call(arguments)
      global[GLOBAL_NAME].loggerHandler &&
        global[GLOBAL_NAME].loggerHandler.info
          .apply(null, this._msg(args))
    },
    warn: function () {
      let args = Array.prototype.slice.call(arguments)
      global[GLOBAL_NAME].loggerHandler &&
        global[GLOBAL_NAME].loggerHandler.warn
          .apply(null, this._msg(args))
    },
    error: function () {
      let args = Array.prototype.slice.call(arguments)
      global[GLOBAL_NAME].loggerHandler &&
        global[GLOBAL_NAME].loggerHandler.error
          .apply(null, this._msg(args))
    },
  }
  return logger
}

export function createNoOpLogger () {
  return {
    log () {},
    info () {},
    warn () {},
    error () {}
  }
}
