/**
 * @global
 * @name strg
 */
(function (window) {

  /* eslint-env browser*/
  /* global screen, localStorage, sessionStorage, navigator */

  var RECONNECT_TIMEOUT = 2000;

  /**
   * uuid4 implementation taken from:
   * https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
   * also see https://bocoup.com/blog/random-numbers
   */
  function uuid4() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  /**
   * @description Test for any uuid
   * @param {String} s - UUID string
   */
  function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
  }

  /**
   * The global object would already be declared by an inline snippet. Similar
   * to GA we stores a identifier in an other global: `strgMetricsId`. Defaults
   * to 'strg'.
   */
  var GLOBAL_NAME = window.strgMetricsId || 'strg';
  window[GLOBAL_NAME] = window[GLOBAL_NAME] || {};

  /**
   * Logger can be anything that implements log, info, warn and error functions.
   * So setting e.g. ```window.strg.loggerHandler = console``` will log to browser
   * console in runtime.
   */
  var logger = {
    _msg: function (args) {
      var css = [
        'background: transparent;',  // reset
        'color: #FFF; background: #f2c109; border-radius:2px; padding: 0 6px;',  // log
      ];
      return ['%cstrg%c', css[1], css[0]].concat(args);
    },
    log: function () {
      var args = Array.prototype.slice.call(arguments);
      window[GLOBAL_NAME].loggerHandler &&
        window[GLOBAL_NAME].loggerHandler.log
        .apply(null, this._msg(args));
    },
    info: function () {
      var args = Array.prototype.slice.call(arguments);
      window[GLOBAL_NAME].loggerHandler &&
        window[GLOBAL_NAME].loggerHandler.info
        .apply(null, this._msg(args));
    },
    warn: function () {
      var args = Array.prototype.slice.call(arguments);
      window[GLOBAL_NAME].loggerHandler &&
        window[GLOBAL_NAME].loggerHandler.warn
        .apply(null, this._msg(args));
    },
    error: function () {
      var args = Array.prototype.slice.call(arguments);
      window[GLOBAL_NAME].loggerHandler &&
        window[GLOBAL_NAME].loggerHandler.error
        .apply(null, this._msg(args));
    },
  };

  window[GLOBAL_NAME].logger = logger;

  /**
   * Get start time, try to retrieve from global object (if loder-snippet was
   * used)
   */
  var startTime = window[GLOBAL_NAME].t || 1 * new Date();

  /**
   * Init top scope variables
   */
  var connection = null;
  var shuttingDown = false;
  var windowState = {};
  var queue = [];
  var clientState;
  var clientHash;
  var sessionHash;
  var windowHash;

  /**
   * @description Prepare life-cycle hashes for client, session and window.
   *   - `clientHash` is bound to `window.localStorage`.
   *   - `sessionHash` is bound to `window.sessionStorage`.
   *   - `windowHash` is bound to the current JS scope `window`.
   */
  function syncHashes () {
    clientHash = localStorage.getItem('strg.metrics.client');
    if (!clientHash) {
      clientHash = uuid4();
      localStorage.setItem('strg.metrics.client', clientHash);
      localStorage.setItem('strg.metrics.client.state', '{}');
    } else if (!localStorage.getItem('strg.metrics.client.state')) {
      localStorage.setItem('strg.metrics.client.state', '{}');
    }

    sessionHash = sessionStorage.getItem('strg.metrics.session');
    if (!sessionHash || !isUuid(sessionHash)) {
      sessionHash = uuid4();
      sessionStorage.setItem('strg.metrics.session', sessionHash);
    }

    windowHash = window[GLOBAL_NAME].window = window[GLOBAL_NAME].window || uuid4();
  }

  /**
   * Remote scripts
   *
   * Scripts that can be called from the server to update client data.
   * Currently used for data migrations e.g. upgrading the client hash.
   */
  var remoteScripts = {
    /**
     * @callback updateClientHash
     * @description Callback triggered by the WebSocket. Update the client
     * hash to a value sent from the server.
     * @param {string} newHash - New hash, must be valid uuid4
     */
    updateClientHash: function updateClientHash (newHash) {
      if (!isUuid(newHash)) {
        throw Error('Value Error: "' + newHash + '" is not a valid UUID');
      }
      clientHash = newHash;
      localStorage.setItem('strg.metrics.client', newHash);
    }
  };

  /**
   * Flush events in queue as single frames.
   */
  function flush () {
    if (!connection || connection.readyState !== window.WebSocket.OPEN) {
      // this function will be called again once the connection is open
      return;
    }
    while (queue.length) {
      var msg = JSON.stringify(queue[0]);
      logger.log('Send', msg);
      connection.send(msg);
      queue.shift();
    }
  }

  function createQueryParams() {
    var delta = 1 * new Date() - startTime;
    logger.log('Client:', clientHash);
    logger.log('Session:', sessionHash);
    logger.log('Window:', windowHash);
    logger.log('Delta:', delta);
    return [
      '?client=', clientHash,
      '&session=', sessionHash,
      '&window=', windowHash,
      '&delta=', delta,
    ].join('');
  }

  /**
   * Open connection to the WebSocket, handle reconnects and first frame.
   */
  function connect(endpoint) {
    logger.log('Open connection:', endpoint);
    connection = new window.WebSocket(endpoint + createQueryParams());

    /**
     * On connection open always send the first frame with the three hashes.
     */
    connection.onopen = function () {
      flush();
    };

    /**
     * Try to reconnect on close.
     */
    connection.onclose = function () {
      if (!shuttingDown) {
        connection = null;
        window.setTimeout(connect, RECONNECT_TIMEOUT);
      }
    };

    /**
     * Handle server side scripts
     */
    connection.onmessage = function (event) {
      var data = JSON.parse(event.data);
      if (data && typeof remoteScripts[data.fn] === 'function') {
        remoteScripts[data.fn].apply(null, [].concat(data.params));
      }
    };
  }

  /**
   * Try to flush remaining events on 'beforeunload'.
   */
  window.addEventListener('beforeunload', function () {
    shuttingDown = true;
    flush();
    if (connection) {
      connection.close();
    }
  });

  /**
   * @description Adds events to the queue and sets the time delta for when the
   * event was triggered.
   * @param {string} key - The event name, e.g. 'article.id'.
   * @param {string|number} value - The events value, e.g. 'Art-123456'
   */
  function enqueue(key, value) {
    logger.log('Enqueue', key, value);
    queue.push({
      delta: 1 * new Date() - startTime,
      key: key,
      value: value
    });
    flush();  // Immediate flush with no timeout
  }


  /**
   * @class
   * @name metrics
   */
  var tracker = {
    /**
     * @function init
     * @memberof strg.metrics#
     * @summary Initialize metrics.
     * @param {string} url - *endpoint URL* for the websocket server.
     * @description This is the first thing, that needs to be called when using
     * metrics. It should also be called at most once!
     *
     * The *url* to the websocket server may start with aprotocol description
     * ("wss://..."). If it does not, the protocol will be prepended
     * automatically, depending on the current connection security. If we are on
     * an "https" domain, the protocol will be "wss://", otherwise it will be
     * "ws://".
     */
    init: function init(url) {
      if (!url) {
        throw Error('Configuration Error: Missing endpoint url');
      }
      var endpoint = url;
      syncHashes();
      if (endpoint.indexOf('://') === -1) {
        var protocol = window.location.protocol == 'https:' ? 'wss' : 'ws';
        endpoint = protocol + '://' + endpoint;
      }
      connect(endpoint);
    },

    /**
     * @function trigger
     * @memberof strg.metrics#
     * @description Unconditionally triggers an event with given key and value.
     * @param {string} key - The event name, e.g. 'article.id'.
     * @param {string|number} value - The events value, e.g. 'Art-123456'
     */
    trigger: function trigger(key, value) {
      enqueue(key, value);
    },

    /**
     * @function clientStateChange
     * @memberof strg.metrics#
     * @summary Notifies metrics of a state change within the client.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description This function is similar to :js:func:`trigger`, but will only
     * trigger the event, if the value is different than the value of the
     * last call.
     */
    clientStateChange: function clientStateChange(key, value) {
      clientState = JSON.parse(localStorage.getItem('strg.metrics.client.state'));
      if (clientState[key] === value) {
        return;
      }
      clientState[key] = value;
      localStorage.setItem('strg.metrics.client.state', JSON.stringify(clientState));
      enqueue(key, value);
    },

    /**
     * @function windowStateChange
     * @memberof strg.metrics#
     * @summary Notifies metrics of a state change within the window.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description This function is similar to :js:func:`clientStateChange`,
     * but has a different scope: It will "forget" all previous values on each
     * page load.
     */
    windowStateChange: function windowStateChange(key, value) {
      if (windowState[key] === value) {
        return;
      }
      windowState[key] = value;
      enqueue(key, value);
    },

    /**
     * @function windowStateInit
     * @memberof strg.metrics#
     * @summary Sets the initial window state without triggering an event.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     * @description
     * So calling :js:func:`windowStateChange` will only trigger the event if it
     * differs from the value previously set with this function.
     */
    windowStateInit: function windowStateInit(key, value) {
      windowState[key] = value;
    }

  };

  /**
   * Finally assign the tracker to the global variable
   */
  window[GLOBAL_NAME].metrics = tracker;

})(this);
