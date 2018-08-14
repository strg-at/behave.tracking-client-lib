/**
 * @module strg/metrics/breakpoint
 */
(function(window) {

    /* eslint-env browser*/

    var GLOBAL_NAME = window.strgMetricsId || 'strg';
    var tracker = window[GLOBAL_NAME].metrics;

    var DEFAULTS = {
        THROTTLE_DELAY: 200,
        GAUGE_POINT_INVERVAL: 25
    };

    // TODO: move to helpers?
    // Throttle with leading/trailing option
    // src: http://underscorejs.org/docs/underscore.html#section-82
    var throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = Date.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    var BreakpointMeter = function(DOMNode, options) {
        this.DOMNode = DOMNode;
        this.options = options || {};
        this.id = options.id || DOMNode.nodeName +
            ((DOMNode.id) ? "." + DOMNode.id : "");
        this.gaugePointInterval = (typeof options.gaugePointInterval === 'number') ?
            options.gaugePointInterval : DEFAULTS.GAUGE_POINT_INVERVAL;
        if (this.options.simple) {
            this.scrollHandler = throttle(this.trackBreakPoint.bind(this), 200);
            this.scrollHandler();
        } else {
            this.gaugePoints = this.makeGaugePointsArray(
                this.DOMNode.getBoundingClientRect(),
                this.gaugePointInterval);
            this.scrollHandler = throttle(this.trackGaugePoints.bind(this),
                DEFAULTS.THROTTLE_DELAY);
            this.scrollHandler();
        }
        window.addEventListener('scroll', this.scrollHandler);
    };

    BreakpointMeter.prototype.trackBreakPoint = function() {
        var rect = this.DOMNode.getBoundingClientRect();
        if (!this.isRectVisible(rect)) { return; }
        tracker.windowStateChange('breakpoint', this.id);
        window.removeEventListener('scroll', this.scrollHandler);
    };

    BreakpointMeter.prototype.trackGaugePoints = function() {
        var self = this;
        var rect = self.DOMNode.getBoundingClientRect();
        if (!self.isRectVisible(rect)) {
            return false;
        }
        var viewPortHeight = (window.innerHeight ||
            document.documentElement.clientHeight);
        var scrollDepthPixelsBottom = rect.height ?
            Math.max(0, Math.min(viewPortHeight - rect.top, rect.height)) :
            Math.max(0, Math.min(viewPortHeight - rect.top, 1));
        self.gaugePoints.filter(function(gp) {
            return gp && gp[0] <= scrollDepthPixelsBottom;
        }).forEach(function(gp) {
            tracker.windowStateChange('breakpoint.' + self.id + '.percent.max', gp[1]);
        });
        self.gaugePoints = self.gaugePoints.filter(function(gp) {
            return gp && gp[0] > scrollDepthPixelsBottom;
        });
        if (self.gaugePoints.length === 0) {
            window.removeEventListener('scroll', this.scrollHandler);
        }
    };

    BreakpointMeter.prototype.makeGaugePointsArray = function(rect, interval) {
        var result = [], percent, i;
        for (i = interval; i <= 100; i += interval) {
            percent = i / 100;
            result.push([
                rect.height * percent,
                percent * 100
            ]);
        }
        if (i != 100 + interval) {
            result.push([
                rect.height,
                100
            ]);
        }
        return result;
    };

    BreakpointMeter.prototype.isRectVisible = function(rect) {
        return (
            this.DOMNode.offsetParent !== null &&
            rect.bottom >= 0 &&
            rect.right >= 0 &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };


    tracker.breakpointMeter = {

        percent: function(selector, id, gaugePointInterval) {
            new BreakpointMeter(document.querySelector(selector), {
                id: id,
                gaugePointInterval: gaugePointInterval
            });
        },

        simple: function(selector, id) {
            new BreakpointMeter(document.querySelector(selector), {
                id: id,
                simple: true
            });
        }

    };

})(this);
