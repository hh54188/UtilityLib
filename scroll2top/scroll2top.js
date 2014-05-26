;(function (global) {

	global.Util = global.Util || {};

	var win = window,
		doc = document,
		defaultSelector = "data-scroll2top",
		button;

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

	var getElementsByClassName = function (name) {
		var selector = name || defaultSelector;
		var results = [];
		var reg;

		if (doc.querySelectorAll) {
			results = doc.querySelectorAll("." + selector);
		} else if (doc.getElementsByClassName) {
			results = doc.getElementsByClassName(selector);
		} else {
			results = doc.getElementsByTagName("*");
			reg = new RegExp("^|\\s" + selector + "$|\\s");
			for (var i = 0; i < results.length; i++) {
				var temp = results[i];
				if (reg.test(temp.className)) {
					results.push(temp);
				}
			}
		}

		return Array.prototype.slice.call(results);
	}

	var bindEventHandler = function (target, event, handler) {
		if (win.addEventListener) {
			target.addEventListener(event, handler, false);
		} else if (win.attachEvent) {
			target.attachEvent("on" + event, handler);
		} else {
			target["on" + event] = handler;
		}
	}

	var animate = 

})(this);