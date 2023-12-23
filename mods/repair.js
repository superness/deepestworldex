
function repair() {
    const wrenchIndex = dw.c.toolBag.findIndex(i => i?.md === 'wrench')
    for (let i = 0; i < dw.e.length; i++) {
        const e = dw.e[i]
        if (!('station' in e) || !('owner' in e) || !e.owner || e.hp > 99 || e.z !== dw.c.z) continue

        if (dw.distance(dw.c.x, dw.c.y, e.x, e.y) > dw.constants.INTERACT_RANGE) {
            console.log(`Moving to ${e.qual} ${e.md}#${e.id} (${e.x}, ${e.y}, ${e.z})`)
            dw.move(e.x, e.y)
            setTimeout(repair, 1000)
            return
        }

        if (dw.isSkillReady()) {
            console.log(`Repairing ${e.qual} ${e.md}#${e.id} (${e.x}, ${e.y}, ${e.z})`)
            dw.repair(wrenchIndex, e.id)
        }
        setTimeout(repair, 1000)
        return
    }
}

repair()
