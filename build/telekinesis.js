window.Telekinesis = function () {

    var eventTypes = {
        mouse: {
            down: 'mousedown',
            move:  'mousemove',
            up:   'mouseend'
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
        touchRE      = /^touch/

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

        down: function (x, y) {
            if (x instanceof HTMLElement) {
                var rect = x.getBoundingClientRect()
                x = rect.left + rect.width / 2
                y = rect.top  + rect.height / 2
            }
            this.active = true
            emit.call(this, 'down', x, y)
            return this
        },

        move: function (x, y) {
            emit.call(this, 'move', x, y)
            return this
        },

        up: function (x, y) {
            this.active = false
            emit.call(this, 'up', x, y)
            return this
        },

        moveBy: function (x, y) {
            this.move(this.x + x, this.y + y)
        }

    }

    // private functions for Finger

    function emit (eventName, x, y) {
        // `this` is a finger instance
        this.x = x || this.x
        this.y = y || this.y
        eventName = eventTypes[this.type][eventName]
        var target = document.elementFromPoint(this.x, this.y)
        if (!target) {
            console.warn('"' + eventName + '" out of bound at x:' + this.x + ', y:' + this.y)
            return
        }
        var payload = createPayload.call(this, event, target)
        synthesizeEvent(eventName, payload, target)
    }

    function createPayload (event, target) {
        var left = document.documentElement.scrollLeft || document.body.scrollLeft,
            top = document.documentElement.scrollTop || document.body.scrollTop,
            point = {
                identifier: this.identifier,
                clientX: this.x,
                clientY: this.y,
                pageX: this.x + left,
                pageY: this.y + top,
                target: target
            },
            payload

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

    function getAllByTarget (target) {
        var res = []
        fingers.forEach(function (f) {
            if (f.active && f.target === target) res.push(f.point)
        })
        return res
    }

    // general custom event dispatcher

    function synthesizeEvent (eventName, payload, target) {
        var event = document.createEvent('CustomEvent')
        event.initEvent(eventName, true, true)
        for (var k in payload) {
            event[k] = payload[k]
        }
        target.dispatchEvent(event)
    }

    return {
        Finger: Finger
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