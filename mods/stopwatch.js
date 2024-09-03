class Stopwatch {
    constructor() {
        let sw = this
        let start = null
        let stop = null
        let isRunning = false
        sw.__defineGetter__("ElapsedMilliseconds", function () {
            return (isRunning ? new Date() : stop) - start
        })
        sw.__defineGetter__("IsRunning", function () {
            return isRunning
        })
        sw.Start = function () {
            if (isRunning)
                return
            start = new Date()
            stop = null
            isRunning = true
        }
        sw.Stop = function () {
            if (!isRunning)
                return
            stop = new Date()
            isRunning = false
        }
        sw.Reset = function () {
            start = isRunning ? new Date() : null
            stop = null
        }
        sw.Restart = function () {
            isRunning = true
            sw.Reset()
        }
    }
}