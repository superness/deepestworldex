
class LogMessages {
    messages = []

    constructor() {
        this.initialize()
    }

    addMessage(msg) {
        this.messages.push(msg)

        console.log(msg)

        while (this.messages.length > 33) {
            this.messages.shift()
        }
    }

    initialize() {
        dw.on("drawEnd", (ctx, cx, cy) => {
            return
            if (noRender) return

            let i = 0;
            for (let msg of this.messages) {
                this.drawMessage(ctx, msg, 124, 150 + (20 * i++))
            }
        })
    }

    drawMessage(ctx, msg, x, y) {
        ctx.lineWidth = 3
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#000000'
        ctx.font = "16px system-ui"
        ctx.textAlign = "left"
        ctx.strokeText(msg, x, y)
        ctx.fillText(msg, x, y)
    }
}

let logMessages = new LogMessages()