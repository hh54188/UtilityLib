;
(function(global) {

    global.Util = global.Util || {};
    if (Util.sticky) return;

    var win = window,
        doc = document;

    defalutSelectorClas = "data-sticky-elem",
    defalutStickyToElem = document.documentElement || document.body,

    stickyElem = null,
    isRootElem = false,

    // Sticky Parameter:
    selectorClas = defalutSelectorClas,
    stickyToElement = defalutStickyToElem;

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

    function styleSupport(prop, value, hasPerfix) {
        var perfix = ["-webkit-", "-moz-", "-o-", "-ms-"],
            prop = prop + ":";

        var testdiv = document.createElement("div");
        if (hasPerfix) {
            testdiv.style = prop + perfix.join(value + ";" + prop) + value;
        } else {
            testdiv.style = prop + value;
        }

        if (testdiv.style.cssText.indexOf(value) > -1) return true;

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
        var top = el.offsetTop;
        var parent = el.offsetParent;

        while (parent) {
            top += parent.offsetTop || 0;
            parent = parent.offsetParent;
        }

        return top;
    }

    bindEventHandler(win, "scroll", function() {

        var scorllY = window.scorllY;
        var elem, offsetTop;

        // for (var i = 0; i < stickyElem.length; i++) {
        // 	elem = stickyElem[i];
        // 	offsetTop = getElemOffsetTop(elem);

        // 	if (offsetTop <= scorllY) {
        // 		if(supportFixed) {
        // 			elem.style.position = "fixed";
        // 		} else {
        // 			// If doesn't support potition:fixed;
        // 		}
        // 	}
        // }
    });

    global.Util.sticky = function(options) {
        options = options || {};

        selectorClas = options.selectorClas || defalutSelectorClas;
        stickyToElement = options.stickyToElement || defalutStickyToElem;

        stickyElem = getElemsByClassName(selectorClas);
    }

})(this);