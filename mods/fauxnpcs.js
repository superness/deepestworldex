let fauxnpcdefs = [
    {
        type:"vampire",
        x:24,
        y:0,
        w:24,
        h:42,
        uri:'https://deepestworld.com/images/vampire.png'
    },
    {
        type:"ayy",
        x:24,
        y:0,
        w:24,
        h:42,
        uri:'https://deepestworld.com/images/ayy_green_1x.png'
    },
    {
        type:"orc",
        x:24,
        y:0,
        w:24,
        h:42,
        uri:'https://deepestworld.com/images/orc1.png'
    },
]

let npcimgs = {}

for(let def of fauxnpcdefs) {
    let newImg = new Image
    newImg.src = def.uri

    npcimgs[def.type] = newImg
}

let npcs = dw.get("fauxnpclist") ?? []

class FauxNPCs {
    static addNPC(type, x, y, z) {
        npcs.push({
            type:type,
            x:x,
            y:y,
            z:z
        })
    }

    static saveNPCs() {
        dw.set("fauxnpclist", npcs)
    }
}

function getNpcDef(type) {
    for(let def of fauxnpcdefs) {
        if(def.type == type) {
            return def
        }
    }

    return null
}

setTimeout(() => {
    
    dw.on("drawEnd", (ctx, cx, cy) => {

        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
        for (let npc of npcs) {

            if(npc.z == dw.c.z) {
                let npcDef = getNpcDef(npc.type)
                
                let x = npc.x * 96 - camOffsetX - npcDef.w * 2
                let y = npc.y * 96 - camOffsetY - npcDef.h * 2
    
                ctx.drawImage(npcimgs[npc.type], 
                              npcDef.x, npcDef.y, npcDef.w, npcDef.h,
                              x, y, npcDef.w * 3, npcDef.h * 3)

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
    addMenuContextMenuButton('add vamp', (e) => {
        FauxNPCs.addNPC('vampire', dw.c.x, dw.c.y, dw.c.z)
    })
    addMenuContextMenuButton('add orc', (e) => {
        FauxNPCs.addNPC('orc', dw.c.x, dw.c.y, dw.c.z)
    })
    addMenuContextMenuButton('add ayy', (e) => {
        FauxNPCs.addNPC('ayy', dw.c.x, dw.c.y, dw.c.z)
    })
    addMenuContextMenuButton('save npcs', (e) => {
        FauxNPCs.saveNPCs()
    })
}, 100)