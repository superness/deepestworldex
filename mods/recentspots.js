

setInterval(function () {
    recentSpots.push({ x: dw.c.x, y: dw.c.y, r: recencyAvoidanceRadius })
}, 1000)

function moveRecentSpotNearChunks(spot) {


    // TODO - move toward chunk
    // THEN resolve collisions


    // but like where do I wanna go?
    // it's N distance from me to the connection
    let distConnection = spot.r * 0.9

    // TODO move near the closest other recent spot or nontraversable entity
    //  target a position at a distance from that to form a boundary around visited spots :)  
    //  it will be great!
    let nonTraversableEntities = getNonTraversableEntities()
    //let canSeeNonTraversables = nonTraversableEntities.filter(e => ComputerVision.hasLineOfSight(e, spot, nonTraversableEntities, 0))
    let closestConnection = nonTraversableEntities.filter(e => e.chunk)
        .sort((a, b) => dw.distance(a, spot) - dw.distance(b, spot))
        .shift()

    if (closestConnection) {
        let dx = spot.x - closestConnection.x
        let dy = spot.y - closestConnection.y

        let len = dw.distance(closestConnection, spot)

        dx *= 1 / len
        dy *= 1 / len

        if (isNaN(dx)) dx = 0
        if (isNaN(dy)) dy = 0

        let targetPos = { x: closestConnection.x + (dx * distConnection), y: closestConnection.y + (dy * distConnection) }

        dx = targetPos.x - spot.x
        dy = targetPos.y - spot.y

        len = dw.distance(targetPos, spot)

        //dx /= len
        //dy /= len

        dx = Math.min(dx, dx * 1 / len)
        dy = Math.min(dy, dy * 1 / len)

        if (isNaN(dx)) dx = 0
        if (isNaN(dy)) dy = 0
        spot.x += dx * 0.1
        spot.y += dy * 0.1
    }

}

function resolveRecentSpotCollisions(spot) {
    let collisionSpots = recentSpots.filter(t => spot != t)
        .filter(t => dw.distance(t, spot) < (t.r + spot.r) / 2)

    let distplace = { x: 0, y: 0 }
    for (let closestConnection of collisionSpots) {
        let distConnection = (spot.r + closestConnection.r) / 2

        let dx = spot.x - closestConnection.x
        let dy = spot.y - closestConnection.y

        let len = dw.distance(closestConnection, spot)

        dx *= 1 / len * distConnection
        dy *= 1 / len * distConnection

        if (isNaN(dx)) dx = 0
        if (isNaN(dy)) dy = 0

        let targetPos = { x: closestConnection.x + dx, y: closestConnection.y + dy }

        dx = targetPos.x - spot.x
        dy = targetPos.y - spot.y

        // len = dw.distance(targetPos, currentSpot)

        // dx /= len
        // dy /= len

        // dx = Math.min(dx, dx * 1/len * 0.01)
        // dy = Math.min(dy, dy * 1/len * 0.01)

        if (isNaN(dx)) dx = 0
        if (isNaN(dy)) dy = 0
        distplace.x += dx //* (1.0 - (spot.r / (closestConnection.r + spot.r)))
        distplace.y += dy //* (1.0 - (spot.r / (closestConnection.r + spot.r)))
        // closestConnection.x -= dx * (1.0 - (spot.r / (closestConnection.r + spot.r))) * 0.5
        // closestConnection.y -= dy * (1.0 - (spot.r / (closestConnection.r + spot.r))) * 0.5
    }

    spot.x += distplace.x
    spot.y += distplace.y
}

setInterval(function () {
    let nonTraversableEntities = getNonTraversableEntities().filter(e => e.chunk)

    let inRangeSpots = recentSpots.filter(s => dw.distance(dw.c, s) < s.r)
    if (recentSpots.length == 0 || inRangeSpots.length == 0) {
        let dx = 0
        let dy = 0
        // if (recentSpots.length > 0) {
        //     let clostestSpot = [...nonTraversableEntities,...recentSpots].sort((a,b) => dw.distance(dw.c, a) - dw.distance(dw.c, b))[0]
        //     dx = dw.c.x - clostestSpot.x
        //     dy = dw.c.y - clostestSpot.y
        // }
        recentSpots.push({ x: dw.c.x - dx * 1 / 5, y: dw.c.y - dy * 1 / 5, r: recencyAvoidanceRadius })
    }

    let connectToTargets = nonTraversableEntities//[...nonTraversableEntities,...recentSpots]
    let numUpdates = 0
    for (let i = recentSpots.length - 1; i >= 0; --i) {
        let currentSpot = recentSpots[i]
        currentSpot.r = Math.min(2.5, currentSpot.r *= 1.03)

        if (numUpdates++ > 20) continue;

        moveRecentSpotNearChunks(currentSpot)
        resolveRecentSpotCollisions(currentSpot)
    }
}, 100)

setInterval(function () {
    // if(recentSpots.length > 1) {
    //     recentSpots.shift()
    // }
    while (recentSpots.length > 1000) {
        recentSpots.shift()
    }
}, 6000)

function getSpotRecentlyUsed(x, y, notThisOne = null) {
    for (let recentSpot of recentSpots) {
        if (recentSpot == notThisOne) continue
        let distSpot = dw.distance({ x, y }, recentSpot)
        if (distSpot < recentSpot.r) {
            return true
        }
    }
    return false
}