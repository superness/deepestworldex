let dialogs = {}

class Dialogs {
    static AddDialog(name, x, y, text, onClick) {
        dialogs[name] = {x:x,y:y,text:text,onClick:onClick,visible:true,clicked:false}
    }
    static ShowDialog(name) {
        if(!dialogs[name]) return

        dialogs[name].visible = true
    }
    static HideDialog(name) {
        if(!dialogs[name]) return

        dialogs[name].visible = false
    }
}

setInterval(() => {
    for(let key of Object.keys(dialogs)) {
        let dialog = dialogs[key]
        if(dw.distance(dw.c, dialog) > 2) {
            Dialogs.HideDialog(key)
        }
    }
}, 100)


setTimeout(() => {

    dw.on("drawEnd", (ctx, cx, cy) => {
        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))

        //console.log(dialogs)

        for (let key of Object.keys(dialogs)) {
            let dialog = dialogs[key]
            //console.log(key, dialog)
            if(!dialog.visible) continue

            let x = dialog.x * 96 - camOffsetX
            let y = dialog.y * 96 - camOffsetY

            ctx.lineWidth = 3
            ctx.fillStyle = '#FFFFFF'
            ctx.strokeStyle = '#000000'
            ctx.font = "16px system-ui"
            ctx.textAlign = "left"

            let textWidth = ctx.measureText(dialog.text).width

            let highlighted = false
            if (lastMouse.x > x &&
                lastMouse.x < (x + textWidth) &&
                lastMouse.y > y - 5 &&
                lastMouse.y < (y - 5 + 20)) {
                highlighted = true
            }

            let clicked = false
            if (highlighted && clicksQueue.length > 0) {
                let lastMouseClick = clicksQueue[0]
                if (lastMouseClick.x > x &&
                    lastMouseClick.x < (x + textWidth) &&
                    lastMouseClick.y > y - 5 &&
                    lastMouseClick.y < (y - 5 + 20)) {

                    if(!dialog.clicked) {
                        clicked = true
                        dialog.clicked = true
                        dialog.visible = false
                    }
                }
                else {
                    dialog.clicked = false
                }
            }
            else {
                dialog.clicked = false
            }

            if(highlighted) {
                ctx.fillStyle = 'gold'
            }

            if(clicked) {
                //ctx.fillStyle = 'gold'
                dialog.onClick()
            }

            ctx.strokeText(dialog.text, x, y)
            ctx.fillText(dialog.text, x, y)

            //console.log('drew text', dialog.text, x, y)
        }
    })
}, 200)
