
// Pick where to move
let moveUpdatePeriod = 30
let movePeriod = 100
let searchOffset = 2
let searchOffsetMission = 1
let recencyAvoidanceRadius = 1
let recentSpots = []

let lastMoveToSpotReset = new Date()

setInterval(function () {

    if (farmTrees) return

    if (dw.c.bag.filter(i => !i).length < 4 && dw.distance(dw.c.respawn, dw.c) > 10) {
        tpToBase()
        return
    }

    let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
    let bestSpot = getGoodSpots(15).sort(function (a, b) {
        let closeTo = target ?? dw.c
        let da = dw.distance(closeTo, a)
        let db = dw.distance(closeTo, b)
        return da - db
    }).shift()
    bestSpot = bestSpot ?? getGoodSpots(40).sort(function (a, b) {
        let closeTo = target ?? dw.c
        let da = dw.distance(closeTo, a)
        let db = dw.distance(closeTo, b)
        return da - db
    }).shift()

    moveToSpot = moveToSpot ?? bestSpot

    if (!moveToSpot) return

    let moveToSpotIsClose = dw.distance(moveToSpot ?? dw.c, dw.c) < 0.03

    let isRecentSpot = getSpotRecentlyUsed(moveToSpot.x, moveToSpot.y)

    let isSpotSafe = ComputerVision.hasLineOfSafety(moveToSpot, dw.c, dw.e.filter(e => e.ai), dw.c, dw.targetId)
    let targetIsGoo = target && target.md.toLowerCase().includes("goo")

    if (targetIsGoo) {
        isSpotSafe = isSpotSafe && ComputerVision.hasLineOfSafety(moveToSpot, dw.c, dw.e.filter(e => e.ai), dw.c, dw.targetId, e => e.md.toLowerCase().includes("goo") && e.id != dw.targetId)
    }

    let canSeeSpot = ComputerVision.hasLineOfSight(moveToSpot, dw.c, getNonTraversableEntities())

    let staleMoveToSpot = (new Date().getTime() - lastMoveToSpotReset.getTime()) > 25000

    if (!bestSpot && (moveToSpotIsClose || !isSpotSafe || !canSeeSpot || staleMoveToSpot || isRecentSpot)) {
        let goodSpots = getGoodSpots(50, true, true)

        // Clear the recent spot list if we are trapped under them
        if (goodSpots.length == 0) {
            //console.log('resetting recent spots')
            //targetZoneLevel += 3
            recentSpots = []
        }

        let goodSpotsNoAvoidRecent = getGoodSpots(50, false)
        let goodFartherSpots = goodSpots.filter((p) => dw.distance(p, dw.c) > searchOffset)
        let goodFarSpots = goodSpots.filter((p) => dw.distance(p, dw.c) > searchOffsetMission)
        let zoneLevel = dw.getZoneLevel()
        let targetLevel = dw.c.mission ? dw.c.mission.item.qual : targetZoneLevel
        let zoneDiff = zoneLevel - targetLevel
        let goodAltSpots = []
        let goodTertSpots = []
        let distFromSpawn = dw.distance(dw.c, { x: 0, y: 0 })
        if (zoneDiff > 0 && !dw.c.mission) {
            goodAltSpots = goodFarSpots.filter((p) => dw.distance(p, { x: 0, y: 0 }) < distFromSpawn)
        } else if (zoneDiff < 0 && !dw.c.mission) {
            goodAltSpots = goodFarSpots.filter((p) => dw.distance(p, { x: 0, y: 0 }) > distFromSpawn)
        }
        bestSpot = goodTertSpots.shift() ?? goodAltSpots.shift() ?? goodFartherSpots.shift() ?? goodFarSpots.shift() ?? goodSpots.shift() ?? goodSpotsNoAvoidRecent.shift()
        if (dw.c.mission) {
            bestSpot = goodFartherSpots.shift() ?? goodFarSpots.shift() ?? goodSpots.shift() ?? goodSpotsNoAvoidRecent.shift()
        }

        if (!bestSpot) {
            //console.log('NO BEST SPOT TO MOVE TO')
            //tpToBase()
        }
    }

    if (bestSpot) {
        lastMoveToSpotReset = new Date()
    }

    moveToSpot = bestSpot ?? moveToSpot
}, moveUpdatePeriod)

// Emit the move command
let moveToSpot = { x: dw.c.x, y: dw.c.y }
let movingToSpot = { x: dw.c.x, y: dw.c.y }
let movementPriority = 0

setInterval(function () {
    if (!moveToSpot) {
        return
    }
    if (cache.get(`${dw.c.name}_manualmove`) === true)
        return

    if(movementPriority != 0) {
        return
    }

    movingToSpot = movingToSpot ?? moveToSpot

    if (dw.distance(moveToSpot, movingToSpot) > 11) movingToSpot = moveToSpot

    let dx = moveToSpot.x - movingToSpot.x
    let dy = moveToSpot.y - movingToSpot.y
    movingToSpot.x += dx * 4 / (1000 / movePeriod)
    movingToSpot.y += dy * 4 / (1000 / movePeriod)
    let dist = dw.distance(movingToSpot, dw.c)
    if (dist < 0.1)
        return
    dw.emit("move", movingToSpot)
}, movePeriod)

addMenuContextMenuButton(cache.get(`${dw.c.name}_manualmove`) ? 'Manual' : 'Auto', (e) => {
    let manualMove = !cache.get(`${dw.c.name}_manualmove`)
    if (manualMove) {
        e.innerText = 'Manual'
    }
    else {
        e.innerText = 'Auto'
    }
    cache.set(`${dw.c.name}_manualmove`, manualMove)
})