
// Attack stuff  
function findClosestMonsterTo(target) {
    let closestMonster = null
    let closestDist = 9999999999999
    for (let e of dw.findEntities(e => e.ai && e.id != target.id)) {
        let distMonster = dw.distance(e, target)
        if (distMonster < closestDist) {
            closestDist = distMonster
            closestMonster = e
        }
    }

    return closestMonster
}

setTimeout(() => {cache.set(`${dw.c.name}_skipAttacks`, cache.get(`${dw.c.name}_skipAttacks`) ?? false)}, 100)

async function tryAttack() {

    if(dw.c.casting > Date.now()) return false

    let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
    // if(!dw.c.combat && target && !ComputerVision.isValidTarget(target, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius)) {
    //     logMessages.addMessage(`target is no longer valid, resetting it`)
    //     dw.setTarget(0)
    //     return
    // }

    if (cache.get(`${dw.c.name}_skipAttacks`) == true) {
        return false
    }

    let monsterTargettingMe = dw.findClosestMonster((e) => e.targetId == dw.c.id)

    target = dw.findClosestMonster((m) => m.r != 0 && ComputerVision.isValidTarget(m, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius, cache.get(`${dw.c.name}VBS`)))
    target = target ?? dw.findClosestMonster((m) => ComputerVision.isValidTarget(m, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius, cache.get(`${dw.c.name}VBS`)))

    if (dw.c.party.length > 0) {
        for (let pc of dw.c.party) {
            let pce = dw.e.filter(e => e.name == pc.name).shift()
            if (pce && dw.distance(pce, dw.c) < 10) {
                //console.log('near party', pce)
                let monstersTargettingPC = dw.e.filter(e => e.targetId == pce.id)
                if (monstersTargettingPC.length > 0) {
                    let theMonster = monstersTargettingPC.shift()
                    //console.log('targetting party target', theMonster)
                    target = theMonster
                    break
                }
                // if(pce.targetId) {
                //     // Targetting party target
                //     console.log('targetting party target', pce, pce.targetId)
                //     target = dw.e.filter(e => e.id == pce.targetId)
                // }
            }
        }
    }

    if ((!target || target.hp == target.maxHp) && monsterTargettingMe && target != monsterTargettingMe) {
        target = monsterTargettingMe
    }

    if (!target) {
        return false
    }

    let closest = findClosestMonsterTo(target)
    let distClosest = closest ? dw.distance(closest, target) : 99
    if (!dw.c.combat && target) {
        //logMessages.addMessage(`${dw.c.combat} closest monster to my target is ${distClosest.toFixed(2)} ${closest.md} ${closest.id}`)
        if (distClosest < nearMonsterUnsafeRadius) {
            return false
        }
    }

    let distTarget = dw.distance(target, dw.c)
    if (dw.targetId != target.id) {
        logMessages.addMessage(`${dw.c.combat} setting new target to ${target.md} ${target.id}`)
    }
    dw.setTarget(target.id)
    let skillUse = ComputerVision.getBestSkill(distTarget, dw.c, target)

    // No good skills to use
    if (!skillUse || skillUse === undefined) {
        return false
    }

    optimalMonsterRange = skillUse.range

    if (skillUse.fx?.blink) {
        optimalMonsterRange = Math.max(optimalMonsterRange - 3, 3)

        if (dw.c.combat && distTarget < (skillUse.range - 0.2)) {
            optimalMonsterRange = skillUse.range - 3
        }
    }

    // if(target.targetId != dw.c.id) {
    //     let taunt = dw.c.skills.findIndex(s => s.md == 'taunt');
    //     if(isSkillReadyOverride(taunt)) {
    //         console.log('using taunt', taunt, target.id, target.targetId)
    //         dw.useSkill(taunt, target.id)
    //         return
    //     }
    // }

    // if (dw.c.skillBag.some(s => s?.md == 'painkiller')) {
    //     if (isSkillReadyOverride(dw.c.skillBag.findIndex(s => s.md == 'painkiller'))) {
    //         if (!dw.c.fx.hpToMpDeath || (dw.c.fx.hpToMpDeath.d - (new Date())) < 2000) {
    //             dw.useSkill(dw.c.skillBag.findIndex(s => s.md == 'painkiller'), dw.c.id)
    //             return
    //         }
    //     }
    //}

    let canUseSkill = true
    let skillUseIdx = 0

    //if(((dw.c.hp / dw.c.maxHp) < 0.33) || ((dw.c.maxMp - dw.c.mp) < dw.c.skills[1].cost))
    // if(((dw.c.hp / dw.c.maxHp) < 0.5))
    // {
    //     let timeToReapplyPainkiller = dw.c.fx.hpToMpDeath?.d ?? new Date().getTime()
    //     let timeLeft = new Date().getTime() - timeToReapplyPainkiller
    //     if(timeLeft < 1500)
    //     {
    //         skillUseIdx = 1
    //     }
    // }

    // if((dw.c.hp / dw.c.maxHp) < (dw.c.mp / dw.c.maxMp))
    // {
    //     skillUseIdx = 1
    // }

    let isSkillReady = isSkillReadyOverride(skillUseIdx)//skillUse.skillBagIndex)
    //if (dw.c.mp < (skillUse?.cost ?? 0) || !isSkillReady) {
    if (!isSkillReady) {
        canUseSkill = false
    }

    if (dw.distance(target, dw.c) > (optimalMonsterRange + optimalMonsterRangeBuffer)) {
        canUseSkill = false
    }

    //console.log(canUseSkill, isSkillReadyOverride(skillUseIdx), dw.isSkillReady(skillUseIdx))

    // if (skillUse.fx?.bomb && target.fx?.bomb) {
    //     canUseSkill = false
    // }

    canUseSkill = canUseSkill && isSkillReady

    if (canUseSkill) {
        //console.log(`using skill ${"attack"} ${skillUseIdx} with clostest ${closest?.md} dist ${distClosest}`, dw.isSkillReady(skillUseIdx))
        logMessages.addMessage(`using skill ${dw.c.skills[skillUseIdx].md} ${skillUseIdx}`)

        if(!dw.c.combat) {
            moveToSpot = {x:dw.c.x, y:dw.c.y}
            movingToSpot = {x:dw.c.x, y:dw.c.y}
            await dw.move()
            await sleep(200)
        }
        try
        {
            dw.useSkill(skillUseIdx, target.id)
        }
        catch {}
        
        return true
    }

    return false
}
