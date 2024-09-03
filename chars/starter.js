dw.log('hello world')
dw.log(`I am referencing things from a mod ${targetZoneLevel}`)

// Simple example loop, attack what you can safely attack, move to what you need to get close to
async function loop() {
    try {
        await innerLoop()
    }
    finally {
        setTimeout(loop, 25)
    }
}
loop()

let lastMove = new Date()
async function innerLoop() {
    // Already attacking
    if (dw.c.casting > Date.now()) {
        return
    }

    // If I can attack a monster I should attack it
    if (await tryAttack()) {
        return
    }

    // If There is no action then I should search for more monsters
    let now = new Date()
    let mssince = now.getTime() - lastMove.getTime()


    if (mssince >= 100) {
        moveToBestSpot()
        lastMove = now
    }
}