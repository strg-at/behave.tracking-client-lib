(function(window) {

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


    ScrollDepthMeter.prototype.init = function(DOMNode, options) {
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
    };

    ScrollDepthMeter.prototype.track = function() {
        var percent = this.gauge();
        if (!percent) { return; }
        if (!this.options.breakpoint) {
            tracking.windowStateChange('scroll.percent.' + this.id, percent);
        }
        if (!this.end && percent === 100) {
            this.end = true;
            tracking.windowStateChange('scroll.breakpoint', this.id);
            if (this.options.breakpoint) {
                window.removeEventListener('scroll', this.scrollHandler);
            }
        }
    };

    ScrollDepthMeter.prototype.trackBreakPoint = function() {
        var visible = this.gaugeBreakPoint();
        if (!visible) { return; }
        this.end = true;
        tracking.windowStateChange('scroll.breakpoint', this.id);
        window.removeEventListener('scroll', this.scrollHandler);
    };

    ScrollDepthMeter.prototype.quantize = function(value) {
        return Math.round(value/5)*5;
    };

    ScrollDepthMeter.prototype.gauge = function() {
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
    };

    ScrollDepthMeter.prototype.gaugeBreakPoint = function() {
        var rect = this.DOMNode.getBoundingClientRect();
        return this.visibleRect(rect);
    };

    ScrollDepthMeter.prototype.visibleRect = function(rect) {
        return (
            this.DOMNode.offsetParent !== null &&
            rect.bottom >= 0 && 
            rect.right >= 0 && 
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) && 
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };

    tracking.scrollDepthMeter = {

        add: function(selector, id) {
            new ScrollDepthMeter(document.querySelector(selector), {
                id: id
            });
        },

        addBreakPoint: function(selector, id) {
            new ScrollDepthMeter(document.querySelector(selector), {
                id: id,
                breakpoint: true
            });
        }
    };

})(this);
