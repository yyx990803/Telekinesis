Telekinesis.Finger.prototype.drag = function () {

    var ppm = 1, // default speed 1px/ms
        mpf  = 16 // default trigger rate every 16ms

    return function (ops) {

        var finger = this

        if (!ops.from && !ops.to) {
            console.warn('Insufficient options for Telekinesis.drag()')
            return
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