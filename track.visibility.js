(function() {

    var tracker = strg.metrics;

    var hidden, visibilityChange;

    if (typeof document.hidden !== "undefined") {
        hidden = "hidden";
        visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        hidden = "msHidden";
        visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        hidden = "webkitHidden";
        visibilityChange = "webkitvisibilitychange";
    }

    if (visibilityChange) {
        if (!document[hidden]) {
            tracker.windowStateChange('window.active', !document[hidden]);
        }
        document.addEventListener(visibilityChange, function() {
            tracker.windowStateChange('window.active', !document[hidden]);
        }, false);
    }

})();
