(function() {

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
            flushTimeout = window.setTimeout(flush, 500);
            return;
        }
        var payload = queue;
        queue = [];
        payload.splice(0, 0, clientId, windowId);
        connection.send(JSON.stringify(payload));
    };

    var connection = new window.WebSocket('ws://localhost:8081');

    connection.onopen = function() {
        flush();
    };

    window.addEventListener('beforeunload', function() {
        flush();
        connection.close();
    });

    var flushTimeout = null;

    var enqueue = function enqueue(key, value) {
        queue.push([new Date().getTime() - startTime, key, value]);
        if (!flushTimeout) {
            flushTimeout = window.setTimeout(flush, 500);
        }
    };

    var startTime = new Date().getTime();

    var tracker = {

        clientStateChange: function clientStateChange(key, value) {
            clientState = JSON.parse(localStorage.getItem('strg.metrics.client.state'));
            if (clientState[key] === value) {
                return;
            }
            clientState[key] = value;
            localStorage.setItem('strg.metrics.client.state', JSON.stringify(clientState));
            enqueue(key, value);
        },

        windowStateInit: function windowStateInit(key, value) {
            windowState[key] = value;
        },

        windowStateChange: function windowStateChange(key, value) {
            if (windowState[key] === value) {
                return;
            }
            windowState[key] = value;
            enqueue(key, value);
        },

        trigger: function trigger(name, data) {
            enqueue(name, data);
        }

    };

    /* ClientState */

    tracker.clientStateChange('session', sessionId);

    tracker.clientStateChange('screen.resolution', screen.width + "x" + screen.height);

    tracker.clientStateChange('screen.colordepth', screen.colorDepth);

    if (screen.orientation && screen.orientation.type) {
        tracker.clientStateChange('screen.orientation', screen.orientation.type);
    }

    tracker.clientStateChange('navigator.language', navigator.language);

    if (navigator.systemLanguage) {
        tracker.clientStateChange('navigator.system_language', navigator.systemLanguage);
    }

    /* WindowState */

    tracker.windowStateChange('url', window.location.href);

    tracker.windowStateChange('pathname', window.location.pathname);

    tracker.windowStateChange('referrer', document.referrer);

    if (window.location.hash) {
        tracker.windowStateInit('url.hash', window.location.hash);
    }

    window.addEventListener("hashchange", function() {
        tracker.windowStateChange('url.hash', window.location.hash);
    });

    window.strg = window.strg || {};
    window.strg.metrics = tracker;

})();
