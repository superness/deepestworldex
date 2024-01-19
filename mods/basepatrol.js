// While in my base follow a path around the base

let patrolQueue = []
setInterval(() => {
    if (cache.get(`${dw.c.name}_manualmove`) === true)
        return

    if((dw.c.bag.filter(i => i == null).length == 40 || dw.distance(dw.c, dw.c.spawn) > 10) && dw.c.z == dw.c.spawn.z && movementPriority != 0) {
        movementPriority-- // return movement priority if we left the base
    }

    if ((dw.c.bag.filter(i => i == null).length != 40 && dw.distance(dw.c, dw.c.spawn) < 10) && dw.c.z == dw.c.spawn.z && movementPriority == 0) {
        movementPriority++ // take movement priority if we just entered the base
    }

    if (movementPriority == 0) {
        return
    }

    if (patrolQueue.length == 0) {
        patrolQueue = [
            { x: 599.4, y: 335.5 },
            { x: 603, y: 335.5 },
            { x: 603, y: 339 },
            { x: 599.4, y: 339.2 }]
    }

    let nextSpot = patrolQueue[0]

    // Move to the next spot 
    dw.emit("move", nextSpot)

    // Until we are there
    if(dw.distance(dw.c, nextSpot) < 0.15) {
        // Push the spot to the back of the queue and move to the next one
        patrolQueue.splice(0,1)
        patrolQueue.push(nextSpot)
    }
}, 200)

