;(function (global) {

	global.Util = global.Util || {};

	var win = window,
		doc = document,

		selector,
		animation,

		defaultSelector = "data-scroll2top",
		defaultAnimate = true,

		btns;

	/*
		At first I consider using `transition` to achieve animate effect,
		So I write this `checkStyle` function to check if element support `transition` style,
		then I found the `scrollTop` is not a style property, the `transition` doesn't work on it

		But I still left the function here to commemorate
	*/

	/*
		Refer to sticky plugin styleSupport polyfill
	*/	
	var checkStyleSupport = function (property, value, hasPrefix) {
		var perfixs = ["-moz-", "-webkit-", "-o-", "-ms-"];
		var testElement = doc.createElement("div");
		var propVal = property + ":" + value + ";";

		if (hasPrefix) {
			testElement.style.cssText = propVal + perfixs.join(propVal) + propVal;
		} else {
			testElement.style.cssText = propVal;
		}

		return testElement.style.cssText.indexOf(property) > -1? true: false;
	}


	/*
		Refer to lazyload plugin rAF polyfill
	*/
	;(function () {
		
		if (win.requestAnimationFrame) return;

		var perfixs = ["webkit", "moz", "o", "ms"];
		for (var i = 0; i < perfixs.length && !win.requestAnimationFrame; i++) {
			win.requestAnimationFrame = win[perfixs[i] + "requestAnimationFrame"];
			win.cancelAnimationFrame = win[perfixs[i] + "CancelAnimationFrame"];

		}

		if (!win.requestAnimationFrame) {
			win.requestAnimationFrame = function (callback) {
			 	return setTimeout(function () {
			 		if (callback) callback();
				}, 16);
			}
		}

		if (!win.cancelAnimationFrame) {
			win.cancelAnimationFrame = function (id) {
				win.clearTimeout(id);
			}
		}

	})();

	var getElementsByClassName = function (name) {
		var selector = name || defaultSelector;
		var results = [], elements;
		var reg;

		if (doc.querySelectorAll) {
			results = doc.querySelectorAll("." + selector);
		} else if (doc.getElementsByClassName) {
			results = doc.getElementsByClassName(selector);
		} else {
			elements = doc.getElementsByTagName("*");
			reg = new RegExp("^|\\s" + selector + "$|\\s");
			for (var i = 0; i < elements.length; i++) {
				var temp = elements[i];
				if (reg.test(temp.className)) {
					results.push(temp);
				}
			}
		}

		try {
			return Array.prototype.slice.call(results);	
		} catch(e) {
			var temp = [];
			for (var i = 0; i < results.length; i++) {
				temp.push(results[i]);
			}
			return temp;
		}

		
	};

	var bindEventHandler = function (targets, event, handler) {

		for (var i = 0; i < targets.length; i++) {

			var target = targets[i];

			if (win.addEventListener) {
				target.addEventListener(event, handler, false);
			} else if (win.attachEvent) {
				target.attachEvent("on" + event, handler);
			} else {
				target["on" + event] = handler;
			}			
		}
	};

	var animate = function (to, seconds) {
		seconds  = seconds || 0.3;
		var from = document.documentElement.scrollTop || win.pageYOffset;
		var curPageXOffset = document.documentElement.scrollLeft || win.pageXOffset;

		if (from == to) return;

		var rAF = win.requestAnimationFrame;
		var perFrameDelta = ((to - from) / (seconds * 1000)) * 15;

        /*
			rAF is a nice tool, solve lots of problem:
			http://www.infoq.com/cn/articles/javascript-high-performance-animation-and-page-rendering

			Achieve animation in specify seconds without css transition, I have to calculate increase increment for each fame(16ms)
			AND THIS CAN'T BE ACCURATE!

			I use `window.performance.mark`/`window.performance.measure` to calculate total animation cost, there are some deviation
        */
		rAF(function frameCallback() {
			from = from + perFrameDelta;
			if (Math.abs(to - from) <= Math.abs(perFrameDelta)) {
				/*
					Because the `document.documentElement.scrollTop` doesn't support in quirk mode	
					I turn to `window.scroll()` method
				*/

				// document.documentElement.scrollTop = to;

				/*
					Q: What's the differences between `window.scroll()` and `window.scrollTo()`
					A: No differences // http://stackoverflow.com/questions/1925671/javascript-window-scroll-vs-window-scrollto
				*/
				win.scrollTo(curPageXOffset, to);
			} else {
				// document.documentElement.scrollTop = from;
				win.scrollTo(curPageXOffset, from);
				rAF(frameCallback);
			}
		});
	};

	var init = function () {
		btns = getElementsByClassName(selector);
		bindEventHandler(btns, "click", function () {
			if (animation) {
				animate(0);	
			} else {
				document.documentElement.scrollTop = 0;
			}
			
		});
	};

	global.Util.scroll2top = function (options) {
		options = options || {};

		try {
			selector = options.classSelector || defaultSelector,
			animation = options.animation == false? false: defaultAnimate;
		} catch(e) {
			return;
		}

		init();
	}

	if (typeof define == "function" && define.amd) {
		define(function (deps, exports, module) {
			exports = global.Util.scroll2top;
		});
	}

})(this);