/*
	Note: 
	1. Delegate on body or document, bucause the 
	
	How to use
	1. Put element on page:
	<div class="data-tooltip" title="This is sample test"></div>
*/

;(function (global) {

	var win = window,
		doc = document;

	global.Util = global.Util || {};

	var bindEventHandler = function (el, type, fn) {
		if (win.addEventListener) {
			el.addEventListener(type, fn, false);
		} else if (win.attachEvent) {
			el.attachEvent(type, fn);
		} else {
			el["on" + type] = fn;
		}
	};

	bindEventHandler(document, "mouseover", function (e) {
		console.log(e.target);
	});

})(this);