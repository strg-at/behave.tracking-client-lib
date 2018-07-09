/**
 * @module strg/metrics
 */
(function(window) {

    /* eslint-env browser*/
    /* global screen, localStorage, sessionStorage, navigator */

    var generateRandomID = function generateRandomID() {
        return Math.floor(Math.random() * Math.pow(36, 5)).toString(36) +
            Math.floor(Math.random() * Math.pow(36, 5)).toString(36) +
            Math.floor(Math.random() * Math.pow(36, 5)).toString(36) +
            Math.floor(Math.random() * Math.pow(36, 5)).toString(36);
    };

    var clientId = localStorage.getItem('strg.metrics.client');
    if (!clientId) {
        clientId = generateRandomID();
        localStorage.setItem('strg.metrics.client', clientId);
        localStorage.setItem('strg.metrics.client.state', '{}');
    } else if (!localStorage.getItem('strg.metrics.client.state')) {
        localStorage.setItem('strg.metrics.client.state', '{}');
    }

    var sessionId = sessionStorage.getItem('strg.metrics.session');
    if (!sessionId) {
        sessionId = generateRandomID();
        sessionStorage.setItem('strg.metrics.session', sessionId);
    }

    var windowId = generateRandomID();

    var windowState = {};

    var queue = [];

    var clientState;

    var flush = function() {
        flushTimeout = null;
        if (!queue.length) {
            return;
        }
        if (!connection || connection.readyState != window.WebSocket.OPEN) {
            // this function wil be called again once the connection is open
            return;
        }
        connection.send(JSON.stringify(queue));
        queue = [];
        window.clearTimeout(keepAliveTimeout);
        queueKeepalive();
    };

    function queueKeepalive() {
        keepAliveTimeout = window.setTimeout(function() {
            connection.send(JSON.stringify([]));
            queueKeepalive();
        }, 10000);
    }

    var endpoint;

    var connection = null;

    var wasConnected = false;

    var keepAliveTimeout = null;

    function connect() {

        if (connection) {
            if (console && typeof console.warn == 'function') {  // eslint-disable-line no-console
                console.warn('Duplicate metrics connect');       // eslint-disable-line no-console
            }
            enqueue('metrics.error', 'Duplicate metrics connect');
            return;
        }

        connection = new window.WebSocket(endpoint);

        connection.onopen = function() {
            connection.send(JSON.stringify([new Date().getTime() - startTime, clientId, windowId, wasConnected]));
            wasConnected = true;
            flush();
        };

        connection.onclose = function() {
            if (!shuttingDown) {
                connection = null;
                window.setTimeout(connect, 500);
            }
        };

    }

    var shuttingDown = false;

    window.addEventListener('beforeunload', function() {
        shuttingDown = true;
        flush();
        if (connection) {
            connection.close();
        }
    });

    var flushTimeout = null;

    var enqueue = function enqueue(key, value) {
        queue.push([new Date().getTime() - startTime, key, value]);
        if (!flushTimeout) {
            flushTimeout = window.setTimeout(flush, 500);
        }
    };

    var initialized = false;

    var startTime = new Date().getTime();

    var tracker = {

        /**
         * Initialize metrics.
         *
         * This is the first thing, that needs to be called when using metrics.
         * It should also be called at most once!
         *
         * The optional *endpointUrl* to the websocket server may start with a
         * protocol description ("wss://..."). If it does not, the protocol
         * will be prepended automatically, depending on the current connection
         * security. If we are on an "https" domain, the protocol will be
         * "wss://", otherwise it will be "ws://".
         *
         * If the value for *endpointUrl* is omitted, it defaults to the
         * current domain, but on port 8081, with an auto-detected protocol as
         * described above.
         */
        init: function init(endpointUrl) {
            if (initialized) {
                if (console && typeof console.warn == 'function') {            // eslint-disable-line no-console
                    console.warn('Duplicate initialization of strg.metrics');  // eslint-disable-line no-console
                }
                enqueue('metrics.error', 'Duplicate metrics init');
                return;
            }
            initialized = true;
            if (endpointUrl) {
                endpoint = endpointUrl;
            } else {
                var hostname = window.location.hostname ? window.location.hostname : 'localhost';
                endpoint = hostname + ':8081';
            }
            if (endpoint.indexOf('://') === -1) {
                var protocol = window.location.protocol == 'https:' ? 'wss' : 'ws';
                endpoint = protocol + '://' + endpoint;
            }
            connect();
        },

        /**
         * Unconditionally triggers an event with given key and value.
         */
        trigger: function trigger(key, value) {
            enqueue(key, value);
        },

        /**
         * Notifies metrics of a state change within the client.
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
         *
         * This function is automatically used for storing the current location
         * hash, for example. The function will the track changes to the
         * location hash and call :js:func:`windowStateChange` once it changes.
         * That function will the trigger the event, but only if it differs
         * from its previous value (which was set here for the first time).
         */
        windowStateInit: function windowStateInit(key, value) {
            windowState[key] = value;
        }

    };

    /* ClientState */

    tracker.clientStateChange('session', sessionId);

    tracker.clientStateChange('screen.resolution', screen.width + "x" + screen.height);

    tracker.clientStateChange('screen.colordepth', screen.colorDepth);

    if (screen.orientation && screen.orientation.type) {
        tracker.clientStateChange('screen.orientation', screen.orientation.type);
    }

    tracker.clientStateChange('navigator.user_agent', navigator.userAgent);

    tracker.clientStateChange('navigator.language', navigator.language);

    if (navigator.systemLanguage) {
        tracker.clientStateChange('navigator.system_language', navigator.systemLanguage);
    }

    /* WindowState */

    tracker.windowStateChange('url', window.location.href);

    if (document.referrer) {
        tracker.windowStateChange('referrer', document.referrer);
    }

    if (window.location.hash) {
        tracker.windowStateInit('url.hash', window.location.hash);
    }

    window.addEventListener("hashchange", function() {
        tracker.windowStateChange('url.hash', window.location.hash);
    });

    window.strg = window.strg || {};
    window.strg.metrics = tracker;

})(this);
