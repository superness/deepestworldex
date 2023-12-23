
// Manage the zone the bot moves toward
let lastCombat = new Date()
setInterval(function () {
    let now = new Date()

    if (dw.c.combat) {
        lastCombat = new Date()
        return
    }

    if ((now.getTime() - lastCombat.getTime()) > 1000 * 30) {
        targetZoneLevel = Math.max(1, targetZoneLevel - 1)
        lastCombat = new Date()
        dw.log(`Reducing target zone level to '${targetZoneLevel}' because of stale combat`)
    }

    targetZoneLevel = 50//Math.min(dw.c.level, targetZoneLevel)
}, 1000)

dw.on("hit", (data) => {

    for (let hit of data) {

        if (!hit.amount)
            continue

        let target = dw.findEntities((entity) => entity.id === hit.target).shift()

        if (hit.rip) {
            if (hit.actor == dw.c.id) {
                if (dw.c.hp / dw.c.hpMax > 0.5) {
                    if ((target?.level ?? 0) >= targetZoneLevel) {
                        targetZoneLevel++
                        dw.log(`changing target zone level up to ${targetZoneLevel}`)
                    }
                }
                if (dw.c.hp / dw.c.hpMax < 0.5) {
                    targetZoneLevel--
                    targetZoneLevel = Math.max(1, targetZoneLevel)
                    dw.log(`changing target zone level down to ${targetZoneLevel}`)
                }
            }
        }
    }

    targetZoneLevel = 50//Math.min(dw.c.level, targetZoneLevel)
})


// Target zone debugging
dw.on('drawEnd', (ctx) => {
    ctx.strokeStyle = "black"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.font = "48px system-ui"
    const x = ctx.canvas.width / 2
    const y = 48
    const text = `🎯${targetZoneLevel.toLocaleString()}   🌀${dw.getZoneLevel(dw.c.respawn?.x ?? 0, dw.c.respawn.y ?? 0, dw.c.respawn.l ?? 0)}`
    ctx.strokeText(text, x, y)
    ctx.fillText(text, x, y)
})