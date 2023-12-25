let fauxnpcdefs = [
    {
        type: "vampire",
        x: 24,
        y: 0,
        w: 24,
        h: 42,
        uri: 'https://deepestworld.com/images/vampire.png'
    },
    {
        type: "ayy",
        x: 24,
        y: 0,
        w: 24,
        h: 42,
        uri: 'https://deepestworld.com/images/ayy_green_1x.png'
    },
    {
        type: "orc",
        x: 24,
        y: 0,
        w: 24,
        h: 42,
        uri: 'https://deepestworld.com/images/orc1.png'
    },
    {
        type: "madmouse",
        x: 244,
        y: 280,
        w: 48,
        h: 42,
        uri: 'https://deepestworld.com/images/monster4.png'
    }
]

let npcimgs = {}

for (let def of fauxnpcdefs) {
    let newImg = new Image
    newImg.src = def.uri

    npcimgs[def.type] = newImg
}

let npcs = dw.get("fauxnpclist") ?? {}

class FauxNPCs {
    static addNPC(type, x, y, z, callback = () => { }) {
        if(!npcs[type]) {
            npcs[type] = {
                type: type,
                x: x,
                y: y,
                z: z,
                callback: callback,
                nearPlayer: false
            }
        }

        npcs[type].x = x
        npcs[type].y = y
        npcs[type].z = z
    }

    static saveNPCs() {
        dw.set("fauxnpclist", npcs)
    }
}

function getNpcDef(type) {
    for (let def of fauxnpcdefs) {
        if (def.type == type) {
            return def
        }
    }

    return null
}

// setInterval(() => {
//     for (let npc of npcs) {
//         if (dw.distance(dw.c, npc) < 1) {
//             if (npc.nearPlayer) {
//                 continue
//             }

//             npc.nearPlayer = true

//             npc.callback()
//         }
//         else {
//             npc.nearPlayer = false
//         }
//     }
// }, 100)

setTimeout(() => {

    dw.on("drawEnd", (ctx, cx, cy) => {

        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
        for (let key of Object.keys(npcs)) {
            let npc = npcs[key]
            if (npc.z == dw.c.z) {
                let npcDef = getNpcDef(npc.type)

                let x = npc.x * 96 - camOffsetX - npcDef.w * 2
                let y = npc.y * 96 - camOffsetY - npcDef.h * 2

                let highlighted = false
                if (lastMouse.x > x &&
                    lastMouse.x < (x + npcDef.w * 3) &&
                    lastMouse.y > y &&
                    lastMouse.y < (y + npcDef.h * 3)) {
                    highlighted = true
                }

                
                let clicked = false
                if (dw.distance(dw.c, npc) < 1 && highlighted && clicksQueue.length > 0) {
                    let lastMouseClick = clicksQueue[0]
                    if (lastMouseClick.x > x &&
                        lastMouseClick.x < (x + npcDef.w * 3) &&
                        lastMouseClick.y > y &&
                        lastMouseClick.y < (y + npcDef.h * 3)) {
                            //console.log('we clicked')
                            clicked = true
                        }
                }

                //console.log(lastMouse.x, lastMouse.y, x, y, (x + npcDef.w * 3), (y + npcDef.h * 3))

                ctx.save()

                if (highlighted) {
                    ctx.shadowOffsetX = 0
                    ctx.shadowOffsetY = 0
                    ctx.shadowColor = 'white'
                    ctx.shadowBlur = 4
                }

                if(clicked) {
                    ctx.shadowColor = 'gold'
                    //console.log('clicked')

                    npc.callback()

                    // if(npc.type == 'vampire')
                    // {
                    //     Dialogs.ShowDialog('vampire')
                    // }
                }


                if(highlighted) {
                    ctx.drawImage(npcimgs[npc.type],
                        npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                        x - 1, y - 1, npcDef.w * 3, npcDef.h * 3)
                    ctx.drawImage(npcimgs[npc.type],
                        npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                        x + 1, y - 1, npcDef.w * 3, npcDef.h * 3)
                    ctx.drawImage(npcimgs[npc.type],
                        npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                        x - 1, y + 1, npcDef.w * 3, npcDef.h * 3)
                    ctx.drawImage(npcimgs[npc.type],
                        npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                        x + 1, y + 1, npcDef.w * 3, npcDef.h * 3)
                }

                ctx.drawImage(npcimgs[npc.type],
                    npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                    x, y, npcDef.w * 3, npcDef.h * 3)

                ctx.restore()

                //let textWidth = ctx.measureText(npc.type).width

                //ctx.strokeStyle = "black"
                //ctx.fillStyle = "white"
                //ctx.lineWidth = 4
                //ctx.strokeText(npc.type, x + npcDef.w * 2 + textWidth / 2, y + 12)
                //ctx.fillText(npc.type, x + npcDef.w * 2 + textWidth / 2, y + 12)
            }
        }
    })
}, 200)



setTimeout( () => {
    addMenuContextMenuButton('save npcs', (e) => {
        FauxNPCs.saveNPCs()
    })
}, 100)


