/*
	This plugin work for simulating `position:stikcy` effect



	When I write this plugin(2014.4.29), almost no PC browser support 
	this feature(please check http://caniuse.com/#search=sticky for insurance).

	Only in Chrome 34 could support the feature by enable 
	`#enable-experimental-web-platform-features` in `chrome://flags`.

	Please view `./test/native.html` for native feature test.


	
	With the native test above and https://github.com/filamentgroup/fixed-sticky mentioned
	, there are some native caveats to be noticed:

    - Please don't add any sytle to element directly

	- `bottom` property doesn't work;

	- `sticky` elements are constrained to the dimensions of their parents.

    - If two elements in the same container, they will not stack

    - The `position:fixed` fallback would effected by `margin-top`, but `sticky` doesn't

    - If `sticky` elements change their height in half way.The browser know it
    **But in this plugin, we ignored(Considering...cuz comupted need lots of performance cost)**

    - `sticky` element's margin-top doesn't matter, 
    but margin-bottom will effect how disappeared(both negative or positive)

	- Any non-default value (not visible) for overflow, overflow-x, 
	or overflow-y on the parent element(not offsetParent) will disable position: sticky.
	**But in this plugin, we ignored**

	- Element with `inline` and `inline-block` doesn't work;
	**But in this plugin, we ignored**
*/
;
(function(global) {

    global.Util = global.Util || {};
    if (Util.sticky) return;

    var win = window,
        doc = document;

    defalutSelectorClas = "data-sticky-elem",
    stickInfo = [],
    selectorClas = defalutSelectorClas;

    function getElemsByClassName(className) {
        var elements = [];
        if (doc.querySelectorAll) {
            elements = doc.querySelectorAll("." + className);
        } else if (doc.getElementsByClassName) {
            elements = doc.getElementsByClassName(className);
        } else if (doc.evaluate) { // IE6/7
            pattern = ".//*[contains(concat(' ', @class, ' '), ' " + name + " ')]";
            temp = doc.evaluate(pattern, doc, null, 0, null);
            while ((i = temp.iterateNext())) {
                elements.push(i);
            }
        } else {
            var temp = doc.getElementsByTagName("*");
            var reg = new RegExp("(^|\\s)" + className + "(\\s|$)");

            for (var i = 0; i < temp.length; i++) {
                if (reg.test(temp[i].className)) {
                    elements.push(temp[i]);
                }
            }
        }

        try {
            return Array.prototype.slice.call(elements);
        } catch (e) {
            var arr = [];
            for (var i = 0; i < elements.length; i++) {
                arr.push(elements[i]);
            }

            return arr;
        }
    }

    function bindEventHandler(el, evtType, handler) {
        if (window.addEventListener) {
            el.addEventListener(evtType, handler, false);
        } else if (window.attachEvent) {
            el.attachEvent("on" + evtType, handler);
        } else {
            el["on" + evtType] = handler;
        }
    }
    /*  
        Check style feature support:

        https://github.com/filamentgroup/fixed-sticky/blob/master/fixedsticky.js#L3-L15
        Modernizr! https://github.com/phistuck/Modernizr/commit/3fb7217f5f8274e2f11fe6cfeda7cfaf9948a1f5
    */
    function styleSupport(property, value, hasPerfix) {
        var perfix = ["-webkit-", "-moz-", "-o-", "-ms-"],
            prop = property + ":";

        var testdiv = document.createElement("div");
        if (hasPerfix) {
            testdiv.style.cssText = prop + perfix.join(value + ";" + prop) + value;
        } else {
            testdiv.style.cssText = prop + value;
        }

        if (testdiv.style[property].indexOf(value) > -1) return true;

        return false;
    }
    /*
		Check if support positoin:stick/fixed
	*/
    var supportSticky = styleSupport("position", "sticky", true),
        supportFixed = styleSupport("position", "fixed");

    /*
		RequestAnimationFrame polyfill

		Update from requestAnimationFrame polyfill by Erik Möller:
		https://gist.github.com/paulirish/1579671

		**Remove callback timestamp parameter**
	*/
    var perfix = ["webkit", "moz", "o", "ms"];
    for (var i = 0; i < perfix.length && !win.requestAnimationFrame; i++) {
        win.requestAnimationFrame = win[perfix[i] + 'RequestAnimationFrame'];
        win.cancelAnimationFrame = win[perfix[i] + 'CancelRequestAnimationFrame'] || win[perfix[i] + 'CancelRequestAnimationFrame'];
    }

    if (!win.requestAnimationFrame) {
        win.requestAnimationFrame = function(callback) {
            return setTimeout(function() {
                callback();
            });
        };
    }

    if (!win.cancelAnimationFrame) {
        win.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        }
    }

    function getElemOffsetTop(el) {
        /*
            https://developer.mozilla.org/zh-CN/docs/DOM/element
            OffsetTop: The distance from this element's **top border** to its offsetParent's **top border**.
        */
        var top = el.offsetTop;
        var parent = el.offsetParent;

        while (parent) {
            top += parent.offsetTop || 0;
            parent = parent.offsetParent;
        }

        return top;
    }

    function getCurStyle(element, prop) {
        /*
            Getstyle compatibility:
            http://www.quirksmode.org/dom/getstyles.html
        */
        return win.getComputedStyle ?
            win.getComputedStyle(element).getPropertyValue(prop) :
            element.currentStyle(prop);
    }

    function addStickStyleToEle(elems) {
        var stickyText = "position:sticky;position:-webkit-sticky;position:-moz-sticky;position:-o-sticky;position:-ms-sticky;";
        for (var i = 0; i < elems.length; i++) {
            var temp = elems[i];
            var positionStyle = getCurStyle(element, "position");

            if (positionStyle.indexOf("sticky") > -1) {
                continue;
            } else {
                temp.style.cssText = stickyText;
            }
        }
    }

    var initSticky = function(options) {
        options = options || {};

        selectorClas = options.selectorClas || defalutSelectorClas;
        stickyElems = getElemsByClassName(selectorClas);

        if (!stickyElems.length) return;

        if (supportSticky) {
            addStickStyleToEle(stickyElems);
            return;
        }

        for (var i = 0; i < stickyElems.length; i++) {
            var temp = stickyElems[i];
            var parent = temp.parentNode;
            /*
                outerHeight: height + padding + border
                http://www.quirksmode.org/dom/w3c_cssom.html#t34
                https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.offsetHeight                    
            */
            var targetOffsetTop = getElemOffsetTop(temp),
                targetTop = temp.getAttribute("data-sticky-top") || 0;

            var start = targetOffsetTop - targetTop;

            stickInfo.push({
                target: temp,
                targetTop: targetTop,
                start: start,
                clone: null
            });
        }
    }

    /*
        Check Per Frame:
    */

    var lastScrollY,
        waitNextFrame = false;

    function updatePosition() {
        if (!waitNextFrame) {
            win.requestAnimationFrame(checkPerFrame); // Async
        }
        waitNextFrame = true;
    }

    function checkPerFrame() {
        stickInfo.forEach(function(item) {
            var target = item.target,
                start = item.start,
                top = item.targetTop,
                clone = item.clone;

            if (lastScrollY >= start) {
                if (supportFixed) {
                    target.style.position = "fixed";
                    target.style.top = top + "px";
                    target.style.marginTop = 0; // `position:fixed/absoluted` will be effected by marginTop                    
                } else {
                    clone = clone ? clone :
                        target.parentNode.tagName.toLowerCase() == "body" ? target : target.cloneNode(true);
                    target.style.display = "none";

                    clone.style.position = "absolute";
                    clone.style.top = lastScrollY + top + "px";
                    clone.style.marginTop = 0;
                }


            } else {

                target.style.position = "";
                target.style.marginTop = "";
                target.style.top = "";
            }
        });
        waitNextFrame = false;
    }


    /*
        Initialize DOM Event:
    */
    var TIMER,
        LOADED = false;

    function whenDOMContentLoaded() {

        if (doc.addEventListener) {
            doc.removeEventListener("DOMContentLoaded", whenDOMContentLoaded);
        }

        if (TIMER) {
            win.clearInterval(TIMER);
        }

        initSticky();

        bindEventHandler(win, "scroll", function() {
            lastScrollY = win.scrollY;
            updatePosition();
        });        
    }
    /*
        DOMContentLoaded and its polyfill
    */

    function checkReadyState () {
        if (doc.readyState == "complete") {
            doc.detachEvent("onreadystatechange", checkReadyState);
            whenDOMContentLoaded();
        }        
    }

    function tryDoScroll() {
        try {
            document.documentElement.doScroll("left");
            return true;
        } catch (e) {
            return false;    
        }
    }

    if (doc.addEventListener) {
        doc.addEventListener("DOMContentLoaded", whenDOMContentLoaded, false);
    } else {
        doc.attachEvent("onreadystatechange", checkReadyState);
    }
    // If 1) Not a frame; 2) Have `doscroll` method
    if (win == win.top && document.documentElement.doScroll && !tryDoScroll()) {
        TIMER = setInterval(function () {
            if (tryDoScroll()) {
                win.clearInterval(TIMER);
                whenDOMContentLoaded();
            }
        });
    }













})(this);