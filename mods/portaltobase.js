
let performingTP = true
setTimeout(() => performingTP = false, 10000)

async function tpToBase() {
    if (performingTP) {
        console.log("currently performing TP, returning")
        return
    }

    performingTP = true

    console.log('opening portal')
    await findAndOpenPortal()
    await new Promise(r => setTimeout(r, 200));
    console.log('taking the portal')
    await takePortalToBase()

    setTimeout(() => performingTP = false, 3000)
}

async function findAndOpenPortal() {
    for (var i = 0; i < dw.c.bag.length; ++i) {
        let item = dw.c.bag[i]
        if (item?.md != 'portalScroll') {
            continue
        }

        dw.openPortal(i)
        break
    }
}

async function takePortalToBase() {
    let portals = dw.findEntities(e => e.md == 'portal').sort((a, b) => dw.distance(dw.c, a) - dw.distance(dw.c, b))
    for (let portal of portals) {
        dw.enterPortal(portal.id)
    }
}