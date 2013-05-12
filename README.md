# Telekinesis

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