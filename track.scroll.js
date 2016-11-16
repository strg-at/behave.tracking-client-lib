(function(factory) {
    // Browser globals (root is window)
    if (!window.strg || !window.strg.metrics) {
        throw "strg.metrics not loaded";
    }
    window.strg.metrics.scrollDepthMeter = factory(window.strg);
})(function metricsFactory(strg) {

    var tracking = strg.metrics;

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

    var ScrollDepthMeter = function(DOMNode, options) {
        this.init(DOMNode, options);
        return this;
    };

    ScrollDepthMeter.prototype = {

        init: function(DOMNode, options) {
            this.DOMNode = DOMNode;
            this.options = options = options || {};
            this.id = options.id || DOMNode.nodeName + ((DOMNode.id) ? "." + DOMNode.id : "");
            this.maxPercent = 0;
            if (this.options.breakpoint) {
                this.scrollHandler = throttle(this.trackBreakPoint.bind(this), 200);
            } else {
                this.scrollHandler = throttle(this.track.bind(this), 500);
            }
            // TODO: Corner case, skip first call (for initial scroll event on page reloads etc.)
            window.addEventListener('scroll', this.scrollHandler);
        },

        track: function() {
            var percent = this.gauge();
            if (!percent) { return; }
            if (!this.options.breakpoint) {
                tracking.windowStateChange('scroll.percent.' + this.id, percent);
                //console.log(this.id + '.scroll.percent', percent);
            }
            if (!this.end && percent === 100) {
                this.end = true;
                tracking.windowStateChange('scroll.breakpoint', this.id);
                //console.log('scroll.end', this.id);
                if (this.options.breakpoint) {
                    window.removeEventListener('scroll', this.scrollHandler);
                }
            }
        },

        trackBreakPoint: function() {
            var visible = this.gaugeBreakPoint();
            if (!visible) { return; }
            this.end = true;
            tracking.windowStateChange('scroll.breakpoint', this.id);
            //console.log('scroll.breakpoint', this.id);
            window.removeEventListener('scroll', this.scrollHandler);
        },

        quantize: function(value) {
            return Math.round(value/5)*5;
        },

        gauge: function() {
            var percent;
            var rect = this.DOMNode.getBoundingClientRect();
            // Check visibility
            if (!this.visibleRect(rect)) {
                return false;
            }
            var viewPortHeight = (window.innerHeight || 
                document.documentElement.clientHeight);

            // TODO: check if out of view, then return false;
            var scrollDepthPixels = rect.height ? 
                Math.max(0, Math.min(viewPortHeight - rect.top, rect.height)) : 
                Math.max(0, Math.min(viewPortHeight - rect.top, 1));
            if (rect.height === 0) {
                percent = scrollDepthPixels ? 100 : 0;
            } else {
                percent = this.quantize(scrollDepthPixels / rect.height * 100);
            }
            if (this.maxPercent < percent) {
                this.maxPercent = percent;
            }
            return percent;
        },

        gaugeBreakPoint: function() {
            var rect = this.DOMNode.getBoundingClientRect();
            return this.visibleRect(rect);
        },

        visibleRect: function(rect) {
            return (
                rect.bottom >= 0 && 
                rect.right >= 0 && 
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) && 
                rect.left <= (window.innerWidth || document.documentElement.clientWidth)
            );
        }
    };

    var API = {

        add: function(selector, id) {
            new ScrollDepthMeter(document.querySelector(selector), {id: id});
        },

        addBreakPoint: function(selector, id) {
            new ScrollDepthMeter(document.querySelector(selector), {id: id, breakpoint: true});
        }
    };

    return API;

});
