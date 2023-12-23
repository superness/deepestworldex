setInterval(function () {
    farmTrees = cache.get(`${dw.c.name}_farmTrees`) ?? farmTrees

    if (dw.c.combat) {
        farmTrees = false
    }
    if (!farmTrees && !dw.c.combat && cache.get(`${dw.c.name}_farmTrees`)) {
        farmTrees = true
    }
    if (!farmTrees)
        return;

    let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
    let tree = dw.findEntities((e) => e.md == "maple" || e.md.startsWith("cactus") || e.ore)
        .filter((e) => ComputerVision.hasLineOfSight(e, dw.c, getNonTraversableEntities()))
        .sort((a, b) => { return dw.distance(dw.c, a) - dw.distance(dw.c, b) })
        .shift();
    if (target && (target.md == "maple" || target.md == "cactus" || target.ore)) {
        tree = target
    }

    let skulls = dw.findEntities(e => e.ai && e.r && e.r > 0)
        .filter(e => ComputerVision.hasLineOfSight(e, dw.c, getNonTraversableEntities()))
        .filter(e => ComputerVision.isValidTarget(e, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius))
        .sort((a, b) => dw.distance(dw.c, a) - dw.distance(dw.c, b))

    tree = skulls.shift() ?? tree

    if (!tree) {
        if (!moveToSpot || dw.distance(moveToSpot, dw.c) < 0.5 || !ComputerVision.hasLineOfSight(moveToSpot, dw.c, getNonTraversableEntities()) || !ComputerVision.hasLineOfSafety(moveToSpot, dw.c, dw.e.filter(e => e.ai), dw.c, dw.targetId)) {
            moveToSpot = getGoodSpots(50, true, true).filter((s) => dw.distance(s, dw.c) > searchOffset).shift()
        }
        //console.log("no tree", tree, moveToSpot)
        return;
    }
    let distance = dw.distance(tree, dw.c)
    if (distance > 0.7) {
        //console.log("if")
        moveToSpot = { x: tree.x, y: tree.y }
        dw.setTarget(tree.id)

        if (distance < 3) {

            if ((tree.r ?? 0) > 0) {
                if (isSkillReadyOverride(0)) {
                    dw.useSkill(0, target.id)
                }
            }
        }
    } else {
        //console.log("else")
        if (target && target != tree)
            return
        //console.log("chop")
        if (tree.ai) {

            let lifeShield = dw.c.skills.findIndex(s => s?.md && s.md.toLowerCase().includes('lifeshield'))
            if (lifeShield != -1 && isSkillReadyOverride(lifeShield) && !dw.c.fx.physlifeshield1Bomb && !dw.c.fx.shieldRuneCd) {
                dw.useSkill(lifeShield, dw.c.id)
                return
            }

            if (isSkillReadyOverride(0)) {
                dw.useSkill(0, target.id)
            }
        }
        else if (tree.md == "maple" || tree.md.startsWith("cactus")) {
            if (dw.isSkillReady()) {
                dw.chop(0, tree)
            }
        } else {
            if (dw.isSkillReady()) {
                dw.chop(0, tree)
            }
        }
    }



}, 100)

let farmTrees = false

setTimeout(() => {
    farmTrees = cache.get(`${dw.c.name}_farmTrees`) ?? false;

    addMenuContextMenuButton(farmTrees ? '¡Trees!' : '¿Trees?', (e) => {
        farmTrees = !farmTrees
        if (farmTrees) {
            e.innerText = '¡Trees!'
        }
        else {
            e.innerText = '¿Trees?'
        }
        cache.set(`${dw.c.name}_farmTrees`, farmTrees)
    })
}, 100)