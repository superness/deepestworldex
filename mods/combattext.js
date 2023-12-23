
// Floating combat text
let floatingText = []
dw.on("hit", (data) => {
    for (let hit of data) {
        if (!hit.amount)
            continue

        let target = dw.findEntities((entity) => entity.id === hit.target).shift()

        let newText = { text: hit.amount, x: target?.x ?? 0, y: target?.y ?? 0, target: hit.target, life: 1.3, maxLife: 1.3 }
        if ((target?.id ?? 0) == dw.c.id) {
            newText.x -= 1
            newText.y -= 1
        }
        floatingText.push(newText)
        if (hit.rip && hit.target == dw.c.id) {
            moveToSpot = movingToSpot = dw.c.respawn
            if (farmTrees) {
                cache.set(`${dw.c.name}_manualmove`, true)
                setTimeout(() => cache.set(`${dw.c.name}_manualmove`, false), 6000)
            }
        } else if (hit.rip) {
            if (hit.target in entititiesSmoothPosMap) {
                delete entititiesSmoothPosMap[hit.target]
            }
        }
    }
})


let lastTextUpdate = new Date()
dw.on("drawEnd", (ctx, cx, cy) => {

    //return

    ctx.strokeStyle = "green"
    ctx.fillStyle = "white"
    ctx.font = "18px arial"
    let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
    let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
    let curTextUpdate = new Date()
    let seconds = (curTextUpdate.getTime() - lastTextUpdate.getTime()) / 1000
    lastTextUpdate = curTextUpdate
    for (let text of floatingText) {
        if (text.life < 0)
            continue
        let x = text.x * 96 - camOffsetX
        let y = text.y * 96 - camOffsetY
        ctx.lineWidth = 4
        ctx.fillStyle = "black"
        ctx.strokeStyle = `rgb(255, 0, 0, 0.8)`
        ctx.fillStyle = "white"
        if (text.target == dw.c.id) {
            ctx.lineWidth = 2
            ctx.strokeStyle = `rgb(0, 0, 0, 0.8)`
            ctx.fillStyle = "red"
        }
        let fontSize = 28 * combatTextTween(text.life / text.maxLife)
        drawText(ctx, fontSize, text.text, x, y)
        text.life -= seconds
    }
    floatingText = floatingText.filter((t) => t.life > 0)
})

function drawText(ctx, fontSize, text, x, y) {
    ctx.textAlign = "left"
    ctx.font = `bold ${fontSize}px arial`
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
    let textWidth = ctx.measureText(text).width
    const offscreen = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height)
    const offCtx = offscreen.getContext("2d")
    const offscreen2 = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height)
    const offCtx2 = offscreen2.getContext("2d")
    offCtx.textAlign = "left"
    offCtx2.textAlign = "left"
    offCtx.fillStyle = "blue"
    offCtx2.fillStyle = "blue"
    let squarePath = new Path2D()
    squarePath.rect(x, y - fontSize * 0.2, textWidth, fontSize * 0.6)
    squarePath.closePath()
    offCtx.clip(squarePath)
    offCtx.fillStyle = `rgb(245, 106, 32, 0.6)`
    offCtx.font = `bold ${fontSize}px arial`
    offCtx.fillText(text, x, y)
    let squarePath2 = new Path2D()
    squarePath2.rect(x, y - fontSize * 0.5, textWidth, fontSize)
    squarePath2.closePath()
    offCtx2.clip(squarePath2)
    offCtx2.fillStyle = `rgb(245, 106, 32, 0.3)`
    offCtx2.font = `bold ${fontSize}px arial`
    offCtx2.fillText(text, x - textWidth / 2, y)
    if (offCtx.canvas.width > 0 && offCtx.canvas.height > 0) {
        ctx.drawImage(offscreen2.transferToImageBitmap(), 0, 0)
        ctx.drawImage(offscreen.transferToImageBitmap(), 0, 0)
    }
}