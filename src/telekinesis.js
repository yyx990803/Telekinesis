var Telekinesis = function () {

    var msPerFrame      = 16,
        eventTypes      = {
            mouse: {
                start: 'mousedown',
                move:  'mousemove',
                end:   'mouseend'
            },
            touch: {
                start: 'touchstart',
                move:  'touchmove',
                end:   'touchend'
            },
            pointer: {
                start: 'pointerdown',
                move:  'pointermove',
                end:   'pointerup'
            }
        }

    var defaultEvents = eventTypes[('ontouchstart' in window) ? 'touch' : 'mouse']

    function simulateDrag (ops) {

        if (!ops.from && !ops.to) {
            console.error('`from` and `to` not specified for Telekinesis.drag()')
            return
        }

        var dx          = ops.to.x - ops.from.x,
            dy          = ops.to.y - ops.from.y,
            dist        = Math.sqrt(dx*dx + dy*dy),
            duration    = ops.duration || dist, // default duration based on 1px/ms
            steps       = Math.round(duration / msPerFrame),
            stepX       = dx / steps,
            stepY       = dy / steps,
            step        = 0,
            x           = ops.from.x,
            y           = ops.from.y

        var events
        if (ops.type && ops.type in eventTypes) {
            events = eventTypes[ops.type]
        } else {
            events = defaultEvents
        }

        synthesizePointerEvent(events.start, x, y)
        loop()
        function loop () {
            if (step >= steps) {
                synthesizePointerEvent(events.end, x, y)
                if (ops.done) ops.done()
                return
            }
            step += 1
            x += stepX
            y += stepY
            synthesizePointerEvent(events.move, x, y)
            setTimeout(loop, msPerFrame)
        }
    }

    function synthesizePointerEvent (eventName, x, y) {
        var elm = document.elementFromPoint(x, y)
        synthesizeEvent(eventName, {
            pageX: x,
            pageY: y,
            clientX: x,
            clientY: y
        }, elm)
    }

    function synthesizeEvent(eventName, extras, target) {
        var event = document.createEvent('CustomEvent')
        event.initEvent(eventName, true, true)
        for (var k in extras) {
            event[k] = extras[k]
        }
        target.dispatchEvent(event)
    }

    return {
        drag: simulateDrag
    }

}()