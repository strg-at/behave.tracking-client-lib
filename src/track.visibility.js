/**
 * @module strg/metrics/visibility
 */
(function() {

    /* eslint-env browser*/

    var GLOBAL_NAME = window.strgMetricsId || 'strg';
    var tracker = window[GLOBAL_NAME].metrics;

    tracker.visibility = {};

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

    tracker.visibility.init = function() {
      if (visibilityChange) {
          tracker.windowStateChange('window.active', !document[hidden]);
          document.addEventListener(visibilityChange, function() {
              tracker.windowStateChange('window.active', !document[hidden]);
          }, false);
      }
    };

})();
