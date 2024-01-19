
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

setInterval(function () {

    if (dw.c.combat) {
        gearTesting = false;
    }

    if (!dw.c.combat && farmTrees) return

    let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
    // if(!dw.c.combat && target && !ComputerVision.isValidTarget(target, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius)) {
    //     logMessages.addMessage(`target is no longer valid, resetting it`)
    //     dw.setTarget(0)
    //     return
    // }

    if (cache.get(`${dw.c.name}_skipAttacks`) == true) {
        return
    }

    let monsterTargettingMe = dw.findClosestMonster((e) => e.targetId == dw.c.id)
    if (gearTesting && !dw.c.combat && !monsterTargettingMe) {
        return
    }


    target = dw.findClosestMonster((m) => m.r != 0 && ComputerVision.isValidTarget(m, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius))
    target = target ?? dw.findClosestMonster((m) => ComputerVision.isValidTarget(m, getNonTraversableEntities(), dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius))

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
        if (!recordThat.getIsRecording()) {
            recordThat.start()
        }
    }

    if (!target) {
        return
    }

    let closest = findClosestMonsterTo(target)
    let distClosest = closest ? dw.distance(closest, target) : 99
    if (!dw.c.combat && target) {
        //logMessages.addMessage(`${dw.c.combat} closest monster to my target is ${distClosest.toFixed(2)} ${closest.md} ${closest.id}`)
        if (distClosest < nearMonsterUnsafeRadius) {
            return
        }
    }

    let distTarget = dw.distance(target, dw.c)
    if (dw.targetId != target.id) {
        logMessages.addMessage(`${dw.c.combat} setting new target to ${target.md} ${target.id} with closest dist ${distClosest}`)
    }
    dw.setTarget(target.id)
    let skillUse = ComputerVision.getBestSkill(distTarget, dw.c, target)

    // No good skills to use
    if (!skillUse || skillUse === undefined) {
        if (dw.distance(target, dw.c) > 4 && !(target.targetId != 0 && target.targetId != dw.c.id)) {
            let lifeShield = dw.c.skills.findIndex(s => s?.md?.includes('lifeshield'));
            if (lifeShield > 0 && isSkillReadyOverride(lifeShield) && !(dw.c.skills[lifeShield].mods.bomb && dw.c.fx[`${dw.c.skills[lifeShield].md}Bomb`]) && !dw.c.fx.shieldRuneCd) {

                if (dw.c.skills[lifeShield].cost < dw.c.mp) {
                    let shieldTargetId = dw.c.id
                    console.log('USE LIFESHIELD')
                    dw.useSkill(lifeShield, shieldTargetId)
                    return
                }
            }
        }

        if (doMovementSkills()) {
            return
        }

        return
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

    if (dw.c.skillBag.some(s => s?.md == 'painkiller')) {
        if (isSkillReadyOverride(dw.c.skillBag.findIndex(s => s.md == 'painkiller'))) {
            if (!dw.c.fx.hpToMpDeath || (dw.c.fx.hpToMpDeath.d - (new Date())) < 2000) {
                dw.useSkill(dw.c.skillBag.findIndex(s => s.md == 'painkiller'), dw.c.id)
                return
            }
        }
    }

    let canUseSkill = true
    let isSkillReady = isSkillReadyOverride(skillUse.skillBagIndex)
    //if (dw.c.mp < (skillUse?.cost ?? 0) || !isSkillReady) {
    if (!isSkillReady) {
        canUseSkill = false
    }

    if (dw.distance(target, dw.c) > optimalMonsterRange) {
        canUseSkill = false
    }

    if (skillUse.fx?.bomb && target.fx?.bomb) {
        canUseSkill = false
    }

    canUseSkill = canUseSkill && isSkillReady

    if (canUseSkill) {
        logMessages.addMessage(`using skill ${skillUse.md} ${skillUse.skillBagIndex} with clostest ${closest?.md} dist ${distClosest}`)
        dw.useSkill(skillUse.skillBagIndex, target.id)
    }
    else {
        doMovementSkills()
    }
}, 20)