window.Telekinesis = function () {

    var eventTypes = {
        mouse: {
            down : 'mousedown',
            move : 'mousemove',
            up   : 'mouseup'
        },
        touch: {
            down : 'touchstart',
            move : 'touchmove',
            up   : 'touchend'
        },
        pointer: {
            down : 'pointerdown',
            move : 'pointermove',
            up   : 'pointerup'
        }
    }

    var fingers  = [],
        id       = 0,
        mouseRE  = /^mouse.+/

    function Finger (type) {
        this.identifier = id++
        this.type =
            type in eventTypes
            ? type
            : getDefaultType()
        this.x = 0
        this.y = 0
        fingers.push(this)
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
        this.x      = x || this.x
        this.y      = y || this.y
        eventName   = eventTypes[this.type][eventName]
        var target  = document.elementFromPoint(this.x, this.y)
        if (!target) {
            console.warn('"' + eventName + '" out of bound at x:' + this.x + ', y:' + this.y)
            return
        }
        var payload = createPayload.call(this, target, extras)
        synthesizeEvent(eventName, payload, target)
    }

    function createPayload (target, extras) {
        var payload,
            left    = document.body.scrollLeft || document.documentElement.scrollLeft,
            top     = document.body.scrollTop || document.documentElement.scrollTop,
            screenX = window.screenX || window.screenLeft,
            screenY = window.screenY || window.screenTop,
            point   = {
                identifier : this.identifier,
                clientX    : this.x,
                clientY    : this.y,
                screenX    : this.x + screenX,
                screenY    : this.y + screenY,
                pageX      : this.x + left,
                pageY      : this.y + top,
                target     : target
            }

        for (var e in extras) {
            if (!(e in point)) {
                point[e] = extras[e]
            }
        }

        this.target = target
        this.point  = point

        if (this.type === 'touch') {
            payload = {
                touches        : getAll(),
                targetTouches  : getAll(target),
                changedTouches : [point]
            }
        } else {
            payload = point
        }

        return payload
    }

    function getDefaultType () {
        return 'ontouchstart' in window ? 'touch' : 'mouse'
    }

    // finger list management

    function getAll (target) {
        var res = []
        fingers.forEach(function (f) {
            if (target && f.target !== target) return
            if (f.active) res.push(f.point)
        })
        return res
    }

    function removeAll () {
        fingers = []
        id = 0
    }

    // general custom event dispatcher

    function synthesizeEvent (eventName, payload, target) {
        var event
        if (eventName.match(mouseRE)) {
            event = document.createEvent('MouseEvents')
            event.initMouseEvent(
                eventName, true, true, window, 0,
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
        Finger    : Finger,
        getAll    : getAll,
        removeAll : removeAll
    }

}();