
dw.on("drawEnd", (ctx, cx, cy) => {

    return

    if (noRender) return

    let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
    let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
    let monsters = dw.findEntities((e) => e.ai)
    ctx.lineWidth = 2
    ctx.strokeStyle = "red"
    for (let monster of monsters) {
        let dist = dw.distance(monster, dw.c)
        if (dist > gridWidth / 2) continue

        let x = monster.x * 96 - camOffsetX
        let y = monster.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, scaryMonsterRadius * 96, 0, 2 * Math.PI)
        ctx.stroke()
    }
    ctx.strokeStyle = "orange"
    for (let monster of monsters) {
        let dist = dw.distance(monster, dw.c)
        if (dist > gridWidth / 2) continue

        let x = monster.x * 96 - camOffsetX
        let y = monster.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, nearMonsterUnsafeRadius * 96, 0, 3 * Math.PI)
        ctx.stroke()
    }
    ctx.strokeStyle = "rgba(128,0,128, 0.5)"
    ctx.fillStyle = "rgba(128,0,128, 0.5)"
    for (let spot of recentSpots) {
        let dist = dw.distance(spot, dw.c)
        if (dist > gridWidth / 2) continue

        let x = spot.x * 96 - camOffsetX
        let y = spot.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, spot.r * 96, 0, 2 * Math.PI)
        //ctx.stroke()
        ctx.fill()
    }
})