/**
 * @module strg/metrics
 */
(function (window) {

  /* eslint-env browser*/
  /* global screen, localStorage, sessionStorage, navigator */

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
   * The global object would already be declared by an inline snippet.
   * Similar to GA we stores a identifier in an other global: `strgMetricsId`.
   * Defaults to 'strg'.
   */
  var GLOBAL_NAME = window.strgMetricsId || 'strg';
  window[GLOBAL_NAME] = window[GLOBAL_NAME] || {};

  /**
   * Prepare life-cycle hashes for client, session and window.
   *   - `clientHash` is bound to `window.localStorage`.
   *   - `sessionHash` is bound to `window.sessionStorage`.
   *   - `windowHash` is bound to the current JS scope `window`.
   */
  var clientHash = localStorage.getItem('strg.metrics.client');
  if (!clientHash) {
    clientHash = uuid4();
    localStorage.setItem('strg.metrics.client', clientHash);
    localStorage.setItem('strg.metrics.client.state', '{}');
  } else if (!localStorage.getItem('strg.metrics.client.state')) {
    localStorage.setItem('strg.metrics.client.state', '{}');
  }

  var sessionHash = sessionStorage.getItem('strg.metrics.session');
  if (!sessionHash) {
    sessionHash = uuid4();
    sessionStorage.setItem('strg.metrics.session', sessionHash);
  }

  var windowHash = window[GLOBAL_NAME].window = window[GLOBAL_NAME].window || uuid4();
  var windowState = {};
  var queue = [];
  var clientState;

  /**
   * Flush events in queue as single frames.
   */
  function flush () {
    flushTimeout = null;
    if (!connection || connection.readyState != window.WebSocket.OPEN) {
      // this function will be called again once the connection is open
      return;
    }
    while (queue.length) {
      connection.send(JSON.stringify(queue[0]));
      queue.shift();
    }
  };

  var endpoint;
  var connection = null;
  var shuttingDown = false;

  /**
   * Open connection to the WebSocket, handle reconnects and first frame.
   */
  function connect() {
    connection = new window.WebSocket(endpoint);

    /**
     * On connection open always send the first frame with the three hashes.
     */
    connection.onopen = function () {
      connection.send(JSON.stringify({
        delta: 1 * new Date() - startTime,
        client: clientHash,
        session: sessionHash,
        window: windowHash
      }));
      flush();
    };

    /**
     * Try to reconnect on close.
     */
    connection.onclose = function () {
      if (!shuttingDown) {
        connection = null;
        window.setTimeout(connect, 500);
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
   * Adds events to the queue and sets the time delta for when the event was triggered.
   * @param {string} key - The event name, e.g. 'article.id'.
   * @param {string|number} value - The events value, e.g. 'Art-123456'
   */
  function enqueue(key, value) {
    queue.push({
      delta: 1 * new Date() - startTime,
      key: key,
      value: value
    });
    flush();  // Immediate flush with no timeout
  };

  var startTime = window[GLOBAL_NAME].t || 1 * new Date();  // Try to fetch from global

  var tracker = {
    /**
     * Initialize metrics.
     * @param {string} url - *endpoint URL* for the websocket server.
     *
     * This is the first thing, that needs to be called when using metrics.
     * It should also be called at most once!
     *
     * The *url* to the websocket server may start with aprotocol description
     * ("wss://..."). If it does not, the protocol will be prepended
     * automatically, depending on the current connection security.
     * If we are on an "https" domain, the protocol will be "wss://",
     * otherwise it will be "ws://".
     */
    init: function init(url) {
      if (!url) {
        throw Error('Configuration Error: Missing endpoint url');
      }
      endpoint = url;
      if (endpoint.indexOf('://') === -1) {
        var protocol = window.location.protocol == 'https:' ? 'wss' : 'ws';
        endpoint = protocol + '://' + endpoint;
      }
      connect();
    },

    /**
     * Unconditionally triggers an event with given key and value.
     * @param {string} key - The event name, e.g. 'article.id'.
     * @param {string|number} value - The events value, e.g. 'Art-123456'
     */
    trigger: function trigger(key, value) {
      enqueue(key, value);
    },

    /**
     * Notifies metrics of a state change within the client.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     *
     * This function is similar to :js:func:`trigger`, but will only
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
     * Notifies metrics of a state change within the window.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     *
     * This function is similar to :js:func:`clientStateChange`, but has a
     * different scope: It will "forget" all previous values on each page
     * load.
     */
    windowStateChange: function windowStateChange(key, value) {
      if (windowState[key] === value) {
        return;
      }
      windowState[key] = value;
      enqueue(key, value);
    },

    /**
     * Sets the initial window state without triggering an event.
     * @param {string} key - The event name.
     * @param {string|number} value - The event value.
     *
     * So calling :js:func:`windowStateChange` will only trigger the event
     * if it differs from the value previously set with this function.
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
