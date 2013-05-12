window.Telekinesis = function () {

    var eventTypes = {
        mouse: {
            down: 'mousedown',
            move:  'mousemove',
            up:   'mouseup'
        },
        touch: {
            down: 'touchstart',
            move:  'touchmove',
            up:   'touchend'
        },
        pointer: {
            down: 'pointerdown',
            move:  'pointermove',
            up:   'pointerup'
        }
    }

    var fingers      = [],
        id           = 0,
        touchRE      = /^touch.+/,
        mouseRE      = /^mouse.+/

    function Finger (type) {
        this.identifier = id
        id += 1
        this.type = type in eventTypes ? type : getDefaultType()
        fingers.push(this)
        // here the x and y === clientX and clientY
        this.x = 0
        this.y = 0
    }

    Finger.prototype = {

        down: function (x, y, payload) {
            if (x instanceof HTMLElement || typeof x === 'string') {
                if (typeof x === 'string') {
                    x = document.querySelector(x)
                    if (!x) {
                        console.warn('Finger.down() selector matched no target.')
                        return
                    }
                }
                payload = y
                var rect = x.getBoundingClientRect()
                x = rect.left + rect.width / 2
                y = rect.top  + rect.height / 2
            }
            this.active = true
            emit.call(this, 'down', x, y, payload)
            return this
        },

        move: function (x, y, payload) {
            emit.call(this, 'move', x, y, payload)
            return this
        },

        up: function (x, y, payload) {
            this.active = false
            if (Object.prototype.toString.call(x) === '[object Object]') {
                emit.call(this, 'up', null, null, x)
            } else {
                emit.call(this, 'up', x, y, payload)
            }
            return this
        },

        moveBy: function (x, y, payload) {
            this.move(this.x + x, this.y + y, payload)
        }

    }

    // private functions for Finger

    function emit (eventName, x, y, extras) {
        // `this` is a finger instance
        this.x = x || this.x
        this.y = y || this.y
        eventName = eventTypes[this.type][eventName]
        var target = document.elementFromPoint(this.x, this.y)
        if (!target) {
            console.warn('"' + eventName + '" out of bound at x:' + this.x + ', y:' + this.y)
            return
        }
        var payload = createPayload.call(this, target, extras)
        synthesizeEvent(eventName, payload, target)
    }

    function createPayload (target, extras) {
        var left = document.body.scrollLeft || document.documentElement.scrollLeft,
            top = document.body.scrollTop || document.documentElement.scrollTop,
            screenX = window.screenX || window.screenLeft,
            screenY = window.screenY || window.screenTop,
            point = {
                identifier: this.identifier,
                clientX: this.x,
                clientY: this.y,
                screenX: this.x + screenX,
                screenY: this.y + screenY,
                pageX: this.x + left,
                pageY: this.y + top,
                target: target
            },
            payload

        for (var e in extras) {
            if (!(e in point)) {
                point[e] = extras[e]
            }
        }

        this.target = target
        this.point  = point

        if (this.type === 'touch') {
            payload = {
                touches: getAll(),
                changedTouches: [point],
                targetTouches: getAllByTarget(target)
            }
        } else {
            payload = point
        }

        return payload
    }

    function getDefaultType () {
        return ('ontouchstart' in window) ? 'touch' : 'mouse'
    }

    // finger list management

    function getAll () {
        var res = []
        fingers.forEach(function (f) {
            if (f.active) res.push(f.point)
        })
        return res
    }

    function removeAll () {
        fingers = []
        id = 0
    }

    function getAllByTarget (target) {
        var res = []
        fingers.forEach(function (f) {
            if (f.active && f.target === target) res.push(f.point)
        })
        return res
    }

    // general custom event dispatcher

    function synthesizeEvent (eventName, payload, target) {
        var event
        if (eventName.match(mouseRE)) {
            event = document.createEvent('MouseEvents')
            event.initMouseEvent(eventName, true, true, window, 0,
                payload.screenX,
                payload.screenY,
                payload.clientX,
                payload.clientY,
                payload.ctrlKey || false,
                payload.altKey || false,
                payload.shiftKey || false,
                payload.metaKey || false,
                payload.button || 1,
                target
            )
        } else {
            // TouchEvent/PointerEvent not available yet
            event = document.createEvent('CustomEvent')
            event.initEvent(eventName, true, true)
            for (var k in payload) {
               event[k] = payload[k]
            }
        }
        target.dispatchEvent(event)
    }

    return {
        Finger: Finger,
        getAll: getAll,
        removeAll: removeAll
    }

}();
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