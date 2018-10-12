/**
 * @global
 * @name mock
 * @description Mock implementation ommiting the actual WebSocket connection
 */
(function (window) {
  /* eslint-env browser */
  /* eslint-disable no-console */

  function log() {
    var css = [
      'color: #FFF; background: #f2c109; border-radius:2px; padding: 0 6px;',
      ''
    ];
    console.log.apply(console, ["%cstrg.tracker%c\n%s"].concat(css, Array.prototype.slice.call(arguments)));
  }

  function uuid4() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }

  function isUuid(s) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
  }

  var GLOBAL_NAME = window.strgMetricsId || 'strg';
  window[GLOBAL_NAME] = window[GLOBAL_NAME] || {};

  var clientHash = localStorage.getItem('strg.metrics.client');
  if (!clientHash) {
    clientHash = uuid4();
    localStorage.setItem('strg.metrics.client', clientHash);
    localStorage.setItem('strg.metrics.client.state', '{}');
  } else if (!localStorage.getItem('strg.metrics.client.state')) {
    localStorage.setItem('strg.metrics.client.state', '{}');
  }

  var sessionHash = sessionStorage.getItem('strg.metrics.session');
  if (!sessionHash || !isUuid(sessionHash)) {
    sessionHash = uuid4();
    sessionStorage.setItem('strg.metrics.session', sessionHash);
  }

  var windowHash = window[GLOBAL_NAME].window = window[GLOBAL_NAME].window || uuid4();
  var windowState = {};
  var queue = [];
  var clientState;


  function flush() {
    if (!connection) {
      return;
    }
    while (queue.length) {
      connection.send(JSON.stringify(queue[0], null, 2));
      queue.shift();
    }
  }

  var endpoint;
  var connection = null;

  function connect() {
    if (connection) return;
    log('ws connect', endpoint, JSON.stringify({
      delta: 1 * new Date() - startTime,
      client: clientHash,
      session: sessionHash,
      window: windowHash
    }, null, 2));
    connection = {
      readyState: window.WebSocket.OPEN,
      send: function (msg) {
        log(msg);
      }
    };
    flush();
  }

  window.addEventListener('beforeunload', function () {
    log('shutting down');
  });

  function enqueue(key, value) {
    queue.push({
      delta: 1 * new Date() - startTime,
      key: key,
      value: value
    });
    flush(); // Immediate flush with no timeout
  }

  var startTime = window[GLOBAL_NAME].t || 1 * new Date(); // Try to fetch from global

  var tracker = {
    init: function init(url) {
      if (!url) {
        throw Error('Configuration Error: Missing endpoint url');
      }
      endpoint = url;
      if (endpoint.indexOf('://') === -1) {
        var protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        endpoint = protocol + '://' + endpoint;
      }
      connect();
    },

    trigger: function trigger(key, value) {
      enqueue(key, value);
    },

    clientStateChange: function clientStateChange(key, value) {
      clientState = JSON.parse(localStorage.getItem('strg.metrics.client.state'));
      if (clientState[key] === value) {
        return;
      }
      clientState[key] = value;
      localStorage.setItem('strg.metrics.client.state', JSON.stringify(clientState));
      enqueue(key, value);
    },

    windowStateChange: function windowStateChange(key, value) {
      if (windowState[key] === value) {
        return;
      }
      windowState[key] = value;
      enqueue(key, value);
    },

    windowStateInit: function windowStateInit(key, value) {
      windowState[key] = value;
    }

  };

  window[GLOBAL_NAME].metrics = tracker;
})(this);
