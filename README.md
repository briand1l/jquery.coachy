# jQuery.Coachy

A simple jQuery plugin for showing coach marks pointing to DOM elements with a text message (depends on RaphaelJS)

## Simple Usage

Create simple Coachy on an element:

```js
    $("#thaButton").coachy({
		            on: "mouseover",
		            off: "mouseout",
		            message: "If you click there you'll see",
		        });
```

## AutoOpen with LifeTime

Create simple Coachy on an element that is opened upon instantiation:

```js
    $("#thaButton").coachy({
		            message: "Welcome, click here to begin",
					autoOpen: true,
					life: 5000
		        });
```