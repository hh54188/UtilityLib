# Intro:

Inspire by echojs:
- http://toddmotto.com/echo-js-simple-javascript-image-lazy-loading/

And:
- http://css-tricks.com/snippets/javascript/lazy-loading-images/
- https://github.com/fasterize/lazyload/blob/master/lazyload.js
- http://blog.pamelafox.org/2014/01/improving-front-page-performance.html

# How to use

**1.Include the javascript file in head:**

```
<script type="text/javascript" src="../lazyl\oad.js"></script>
```

**2.Add class name `data-lazy-elem` to the element which your want to check if scroll into view:**

```
<div class="data-lazy-elem"></div>
```

**3.Initialize before the `<body>` tag end(or when `DOMContentLoaded` event fired)**

```
Util.lazyload(function () {
	// This is the callback function to be called when element you supervised scroll into view
});
```
or with other parameters

```
Util.lazyload({
	delta: -200,
	selectorClass: "custom",
	scrollIntoView: function () {
		// TODO
	}
});
```

# Options

## delta

- Description: How far to trigger the lazyload event:
- Default: 0
- Usage: 

```
Util.lazyload({
	delta: -200
})
```

## selectorClass

- Description: Custom supervise element class name
- Default: `data-lazy-elem`
- Usage:

```
<li class="custom" id="first"></li>

Util.lazyload(function () {
	selectorClass: "custom"
});
```

## scrollIntoView

- Description: Function to be called when supervised element scroll into view;
- Default: `new Function()`
- Parameters(in order):
	1. cur: Element to trigger this callback function
	2. remain: Elements which have not scroll into view yet.
	3. origin: Total elements(include already have scroll into view elements)
- Usage:

```
Util.lazyload({
	scrollIntoView: function (cur, remain, origin) {

	}
});
```

# Camptibility:

IE6+

