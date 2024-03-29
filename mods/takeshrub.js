let forDisenchantList = []

setInterval(async function () {

    if (movementPriority != 0) {
        return
    }

    // if (!farmTrees)
    //     return;

    // if(forDisenchantList.length == 0 && !gearTesting && !dw.c.combat && dw.c.party.length > 0 && (dw.distance(dw.c.spawn, dw.c) < 4)) {
    //     await takePortalToBase()
    // }

    if (dw.c.mission) {
        if (dw.distance(dw.c, dw.c.spawn) < 5) {
            console.log('close to spawn, trying to take a portal')
            let portals = dw.findEntities(e => e.md == 'portal').sort((a, b) => dw.distance(dw.c, a) - dw.distance(dw.c, b))
            if(portals.length > 0) {
                dw.emit('move', portals[0])
                takePortalToBase()
            }
        }
        return
    }

    console.log('look for shrub')

    let shrub = dw.findEntities(e => e.md.toLowerCase().includes('shrub') && dw.distance(e, dw.c) < 2).shift()

    if (shrub && !gearTesting && forDisenchantList.length == 0) {
        console.log('entering shrub')
        dw.enterMagicShrub(shrub.id)
    }
    else if (shrub) {
        console.log('shrub here', shrub, dw.distance(shrub, dw.c), gearTesting, forDisenchantList)
    }
    else {
        console.log('no shrub')
    }
}, 1000)