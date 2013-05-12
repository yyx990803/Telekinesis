// Options:
// - on     : a target element.
// - from   : the starting clientX and clientY for the drag. If `on` is set, will be relative to the `on` element.
// - to     : the ending clientX and clientY for the drag. Will always be relative to the client viewport.
// - by     : the x and y distance to drag relative to the values in `from`. If set, will ignore values of `to`.

Telekinesis.Finger.prototype.drag = function () {

    var ppm = 0.75, // default speed 75px/ms
        mpf  = 16 // default trigger rate every 16ms

    return function (ops) {

        var finger = this

        if (!ops.from && (!ops.to || !ops.by)) {
            console.warn('Insufficient options for Telekinesis.drag()')
            return
        }

        if (ops.on instanceof HTMLElement) {
            var rect = ops.on.getBoundingClientRect()
            ops.from.x += rect.left
            ops.from.y += rect.top
        }

        if (ops.by && !ops.to) {
            ops.to = {
                x: ops.from.x + ops.by.x,
                y: ops.from.y + ops.by.y
            }
        }

        var dx          = ops.to.x - ops.from.x,
            dy          = ops.to.y - ops.from.y,
            dist        = Math.sqrt(dx * dx + dy * dy),
            duration    = ops.duration || (dist / ppm),
            steps       = Math.round(duration / mpf),
            stepX       = dx / steps,
            stepY       = dy / steps,
            step        = 0,
            x           = ops.from.x,
            y           = ops.from.y

        finger.down(x, y)
        loop()
        function loop () {
            if (step >= steps) {
                finger.up(x, y)
                if (ops.done) ops.done()
                return
            }
            step += 1
            x += stepX
            y += stepY
            finger.move(x, y)
            setTimeout(loop, mpf)
        }

    }

}();