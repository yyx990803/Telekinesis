// TODO draw the two fingers

window.addEventListener('touchstart', function (e) {
    e = e.changedTouches[0]
    console.log(e.clientX, e.clientY, e.target.id)
})

window.addEventListener('touchmove', function (e) {
    e = e.changedTouches[0]
    console.log(e.clientX, e.clientY, e.target.id)
})

window.addEventListener('touchend', function (e) {
    e = e.changedTouches[0]
    console.log(e.clientX, e.clientY, e.target.id)
})

var f = new Telekinesis.Finger()

f.drag({
    on: document.getElementById('test'),
    from: { x: 50, y: 50 },
    by: { x: 60, y: 60 },
    done: function () {
        console.log('drag 1 done')
        next()
    }
})

function next () {

    f.drag({
        from: { x: 150, y: 50 },
        by: { x: 0, y: 100 },
        done: function () {
            console.log('drag 2 done')
        }
    })

}