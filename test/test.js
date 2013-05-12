// TODO draw the two fingers

window.addEventListener('touchstart', function (e) {
    console.log(e)
})

window.addEventListener('touchmove', function (e) {
    console.log(e)
})

window.addEventListener('touchend', function (e) {
    console.log(e)
})

var f1 = new Telekinesis.Finger('touch'),
    f2 = new Telekinesis.Finger('touch')

// finger1
f1.drag({
    from: {
        x: window.innerWidth / 2,
        y: 60
    },
    to: {
        x: window.innerWidth / 2,
        y: 300
    },
    done: function () {
        console.log('touch 1 done!')
    }
})

// finger2
f2.drag({
    from: {
        x: window.innerWidth / 2 + 100,
        y: 60
    },
    to: {
        x: window.innerWidth / 2 + 100,
        y: 300
    },
    done: function () {
        console.log('touch 2 done!')
    }
})