/*
	Inspire by echojs:
	http://toddmotto.com/echo-js-simple-javascript-image-lazy-loading/

	And:
	http://css-tricks.com/snippets/javascript/lazy-loading-images/
	https://github.com/fasterize/lazyload/blob/master/lazyload.js
	http://blog.pamelafox.org/2014/01/improving-front-page-performance.html

	HOW TO USE:
	<img class="data-lazyed-elem">
	
	COMPATIBLE:
	IE6+
*/

;
(function(global, document) {

    global.Util = global.Util || {};

    if (global.Util.lazyload) return;

    var lock = false;
    var viewportHeight;
    var elems, // All lazyload elements in document, reduce itself when loaded
        originElems, // All lazyload elements in document for backup
        delta, // the distance before reach the viewport
        defaultSelectorClass = "data-lazy-elem",
        selectorClass = defaultSelectorClass,
        scrollIntoView;

    /*
        simple deep copy for array(for originElems and elems)
    */
    var deepCopyArr = function (dest, source) {
        if (!dest || !dest.length) dest = [];

        for (var i = 0; i < source.length; i++) {
            dest.push(source[i]);
        }
        return dest;
    };

    var bindEventHandler = function(el, eventType, fn) {
        if (window.addEventListener) {
            el.addEventListener(eventType, fn, false);
        } else if (window.attachEvent) {
            /*
                IE8 and below version doesn't support addEventListener,
                and ensure the `scroll` and `resize` only bind(and work) on `window` object
            */
            el = window;
            el.attachEvent("on" + eventType, fn);
        } else {
            el["on" + eventType] = fn;
        }
    };

    /*
		Polyfill for getElementsByClassName:
		https://gist.github.com/eikes/2299607
	*/
    var getElementsByClassName = function(name) {
        var elements = [],
            temp;

        if (document.querySelectorAll) {
            elements = document.querySelectorAll("." + name);
        } else if (document.getElementsByClassName) {
            elements = document.getElementsByClassName(name);
        } else if (document.evaluate) { // IE6/7
            pattern = ".//*[contains(concat(' ', @class, ' '), ' " + name + " ')]";
            temp = document.evaluate(pattern, document, null, 0, null);
            while ((i = temp.iterateNext())) {
                elements.push(i);
            }
        } else {
            temp = document.getElementsByTagName("*");
            pattern = new RegExp("(^|\\s)" + name + "(\\s|$)");
            for (i = 0; i < temp.length; i++) {
                if (pattern.test(temp[i].className)) {
                    elements.push(temp[i]);
                }
            }
        }
        /*
            Array.prototype.slice.call doesn't work in IE
        */
        try {
            return Array.prototype.slice.call(elements);
        } catch(e) {
            var elems = [];
            for (var i = 0; i < elements.length; i++) {
                elems.push(elements[i]);
            }
            return elems;
        }
    }

    /*
		RequestAnimationFrame polyfill

		Update from requestAnimationFrame polyfill by Erik Möller:
		https://gist.github.com/paulirish/1579671

		**Remove callback timestamp parameter**
	*/
    var vendors = ['', 'ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {

            var id = window.setTimeout(function() {
                callback();
            }); // use the browser default clock interval

            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };

    /*
		http://www.webdeveloper.com/forum/showthread.php?179931-document-documentElement-vs-document-body:

		1. IE 6-8 strict, Mozilla strict and Opera 9.5+ strict
		document.body.clientHeight = document's height
		document.documentElement.clientHeight = window's viewport height

		2. IE 5 and IE 6-8 quirks
		document.body.clientHeight = window's viewport height
		document.documentElement.clientHeight = 0

		3. Opera 7-9.2 and Opera 9.5 quirks
		document.body.clientHeight = window's viewport height
		document.documentElement.clientHeight = document's height

		4.Safari
		document.body.clientHeight = document's height
		document.documentElement.clientHeight = document's height

		-----

		https://developer.mozilla.org/en-US/docs/Web/API/document.documentElement:
		document.documentElement: Returns the Element that is the root element of the document
	*/

    function setViewportHeight() {
        viewportHeight = window.innerHeight // Attention: including scrollbar
        || document.documentElement.clientHeight || document.body.clientHeight || 100 * 100 * 100; // 100 * 100 * 100 is fallback for load all images
    }

    function loadElement(curElement) {
        scrollIntoView(curElement, elems, originElems);
    }

    /*
		Ease check: just check the top level,
		**so the element maybe still out the viewport by negative left or right value**
	*/

    function isInViewport(elem) {
        var elemPos = elem.getBoundingClientRect();
        if (elemPos.top && elemPos.top > 0 && elemPos.top <= viewportHeight + delta) {
            return true;
        }
        return false;
    }


    function checkAvailable() {
        for (var i = 0; i < elems.length; i++) {
            var el = elems[i];
            if (isInViewport(el)) {
                /*
                    if ([]) {return true} // true
                    if ({}) {return true} // true
                    if ("") {return true} // false
                */
                if (elems.length) elems.splice(i--, 1);                
                loadElement(el);
            }
        }

        lock = false;
    }

    function update() {
        if (!lock) {
            window.requestAnimationFrame(checkAvailable);
        }
        lock = true;
    }

    global.Util.lazyload = function(options) {
        options = options || {};

        selectorClass = options.selectorClass || defaultSelectorClass;
        originElems = getElementsByClassName(selectorClass);
        if (!originElems.length) return;

        elems = deepCopyArr(elems, originElems);
        delta = options.delta || 0;
        scrollIntoView = options.scrollIntoView || new Function();

        setViewportHeight();

        /*  Bad idea to attach handlers to the window scroll event:

            http://ejohn.org/blog/learning-from-twitter/
            http://www.html5rocks.com/en/tutorials/speed/animations/
        */
        bindEventHandler(window, "scroll", function() {
            update();
        });

        bindEventHandler(window, "resize", function() {
            setViewportHeight();
        });
    }


    /*
		Support AMD:

		Backbone: https://github.com/jashkenas/backbone/blob/master/backbone.js
		jQuery: http://code.jquery.com/jquery-1.9.1.js
    */
    if (typeof define === 'function' && define.amd) {
        define(function(require, exports, module) {
            return global.Util.lazyload;
        });
    }

})(this, document);