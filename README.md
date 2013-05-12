# Telekinesis [![Build Status](https://travis-ci.org/yyx990803/Telekinesis.png?branch=master)](https://travis-ci.org/yyx990803/Telekinesis)

> User input gesture simulation for test automation.

```js
var finger = new Telekinesis.Finger()
finger.drag({
    from: { x:100, y:100 },
    to:   { x:200, y:200 },
    done: function () {
        console.log('done')
    }
})
```