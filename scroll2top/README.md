# How to use

**1. Include js libirary file into page**

```
<script type="text/javascript" src="../scroll2top.js"></script>
```

**2. Put default specify class name `data-scroll2top` into the button class attribute**

```
<input type="button" value="CLICK" class="data-scroll2top">
```

**3. Put this initialize function into any where of the page**

```
<script type="text/javascript">
	Util.scroll2top();
</script>
```

# Options

## classSelector

- Description: Custom element selector class name
- Defalut: `data-scroll2top`
- Usage:

```
<input type="button" value="CLICK" class="btn">

Util.scroll2top({
	classSelector: "btn"
});
```

## animation

- Description: Enable animation or not
- Defalut: `true`
- Usage:

```
Util.scroll2top({
	animation: false
});
```



# Camptibility:

IE6+

