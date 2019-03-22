/**
 * Logger can be anything that implements log, info, warn and error functions.
 * So setting e.g. ```window.strg.loggerHandler = console``` will log to browser
 * console in runtime.
 */
export function createPrettyLogger (global, config) {
  const { NAMESPACE } = config
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
      global[NAMESPACE].loggerHandler &&
        global[NAMESPACE].loggerHandler.log
          .apply(null, this._msg(args))
    },
    info: function () {
      let args = Array.prototype.slice.call(arguments)
      global[NAMESPACE].loggerHandler &&
        global[NAMESPACE].loggerHandler.info
          .apply(null, this._msg(args))
    },
    warn: function () {
      let args = Array.prototype.slice.call(arguments)
      global[NAMESPACE].loggerHandler &&
        global[NAMESPACE].loggerHandler.warn
          .apply(null, this._msg(args))
    },
    error: function () {
      let args = Array.prototype.slice.call(arguments)
      global[NAMESPACE].loggerHandler &&
        global[NAMESPACE].loggerHandler.error
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
