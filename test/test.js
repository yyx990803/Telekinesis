Telekinesis.drag({
    from: {
        x: window.innerWidth / 2,
        y: 60
    },
    to: {
        x: window.innerWidth / 2,
        y: 300
    },
    done: function () {
        console.log('done!')
    }
})