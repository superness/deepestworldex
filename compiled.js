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



setInterval(() => {
    if (dw.c.skills[0].fx?.blink) {
        nearMonsterUnsafeRadius = scaryMonsterRadius
    }
    else {
        nearMonsterUnsafeRadius = 1.3
    }
}, 1000)
// setInterval(async () => {

//     // move any items in my bag that is stackable and is not in the bottom row
//     // combine the bottom row

//     let idx = -1
//     for (let item of dw.c.bag) {
//         ++idx
//         if (!item) continue

//         if (dw.md.items[item.md]?.s && idx < 32) {
//             let openIdx = dw.c.bag.findLastIndex(i => i == null)
//             dw.moveItem('bag', idx, 'bag', openIdx)
//             await sleep(100)
//         }
//     }
//     dw.combine()

// }, 5000)

class ComputerVision {

    static scaryMonsterRadius = 4
    static terrainThickness = 0.51
    static entityThickness = 0.51
    static GCD_BASE = 1250 // dw.constants.GCD_BASE is not going to be defined when this evaluates

    // Skill and damage calcuation
    static getBestSkill(targetDistance, c, target = null) {
        let sortedSkills = c.skills.filter(s => ComputerVision.getSkillDamage(s) > 0).filter(s => s.range >= targetDistance).sort((a, b) => ComputerVision.getSkillDamage(b) - ComputerVision.getSkillDamage(a))

        sortedSkills = sortedSkills.filter(s => !(s.fx?.bomb && (target?.fx[`${s.md}Bomb`] || (target?.hp < ComputerVision.getSkillDamage(s) * 2.5))))

        if (sortedSkills.length == 0) return null

        let bestSkill = sortedSkills[0]

        if (ComputerVision.getSkillDamage(bestSkill) == 0) return null

        bestSkill.skillBagIndex = c.skills.findIndex(s => s == bestSkill)
        return bestSkill
    }


    static getSkillDamage(skill) {
        let healingRuneParts = ['heal', 'lifeshield', 'blink']
        if (!skill)
            return 0
        if (healingRuneParts.filter(p => skill.md.toLowerCase().includes(p)).length > 0)
            return 0
        let skillDmg = (skill.acid + skill.cold + skill.fire + skill.elec + skill.phys) ?? 0
        let totalDmg = Math.floor(skillDmg * (1.0 - skill.crit) + (skill.crit * skill.critMult * skillDmg))
       
        let gcdmulti = ComputerVision.GCD_BASE / skill.gcd

        return (totalDmg * gcdmulti).toFixed(0)
    }

    static getMonsterBattleScore(monster, c, useFullHp = false) {
        let meleeMulti = 1
        let rangedMulti = 1

        let hpUse = useFullHp ? monster.maxHp : monster.hp

        if ((c.mission?.item.r ?? 0) > 0) {
            hpUse *= (1 + (c.mission.item.r * 1))
        }

        let isDesert = monster.terrain == 4

        let missionMulti = c.mission ? 1 : 1;

        let desertMulti = 1
        if (isDesert) {
            desertMulti = 1
        }
        else
        // if(!useFullHp &&
        // !monster.md.toLowerCase().includes('ranged') && 
        // !monster.md.toLowerCase().includes('spiked') &&
        // !monster.md.toLowerCase().includes('elemental')) {
        {
            // let maxHpUse = monster.maxHp - (5 * ComputerVision.getSkillDamage(c.skills[0]))

            // if (hpUse > maxHpUse) {
            //     hpUse = maxHpUse
            // }

            // hpUse = Math.max(hpUse, 1)
        }

        let finalMulti = 1.0
        // if(monster.md.toLowerCase().includes('orc'))
        // {
        //     finalMulti += 0.25
        // }
        // if(monster.md.toLowerCase().includes('ranged'))
        // {
        //     finalMulti += 0.2
        // }
        // if(monster.md.toLowerCase().includes('spiked'))
        // {
        //     finalMulti += 0.2
        // }
        // if(monster.md.toLowerCase().includes('elemental'))
        // {
        //     finalMulti += 0.65
        // }
        // if(monster.md.toLowerCase().includes('alarm'))
        // {
        //     finalMulti += 10
        // }
        if(monster.mods.strDefMission)
        {
            finalMulti += 1.0
        }
        if(monster.mods.dexDefMission)
        {
            finalMulti += 0.25
        }
        if(monster.mods.resMission)
        {
            finalMulti += 0.15
        }

        return Math.sqrt(hpUse * (ComputerVision.getMonsterDmg(monster, c))) * finalMulti
    }

    static getMonsterDmg(monster, c) {

        if (monster.md.toLowerCase().includes('magicshrub')) {
            return 1
        }

        let dmg = 10 * Math.pow(1.1, monster.level) + (5 * (monster.level - 1))
        if (monster.r ?? 0 > 1) {
            let rUse = monster.r
            if ((c.mission?.item.r ?? 0) > 0) {
                rUse += c.mission.item.r
            }
            dmg *= 1 + rUse * 0.5
        }

        let finalDmg = Math.max(1, (dmg * (monster.md.includes('Pow') ? 1.25 : 1)))
        
        if(monster.md.toLowerCase().includes('king'))
        {
            finalDmg *= 4
        }
        if(monster.md.toLowerCase().includes('bouncy'))
        {
            finalDmg *= 2
        }
        if(monster.md.toLowerCase().includes('elemental'))
        {
            finalDmg *= 1.3
        }
        if(monster.md.toLowerCase().includes('alarm'))
        {
            finalDmg *= 10
        }
        if(monster.md.toLowerCase().includes('orc'))
        {
            finalDmg *= 1.25
        }
        // if(monster.md.toLowerCase().includes('ranged'))
        // {
        //     finalDmg *= 1.2
        // }

        finalDmg -= ((c.stats.hpRegen ?? 0))
        
        if(c.skills[0].mods.conservation) {
            finalDmg -= this.getSkillDamage(c.skills[0]) * 0.33
        }

        return finalDmg
    }

    static getMonsterDmgReduction() {
        return 1
    }

    static getMyDmg(c) {
        let mySkillInfo = c.skills[0]
        return (ComputerVision.getSkillDamage(mySkillInfo) * ComputerVision.getMonsterDmgReduction())
    }

    static getMaxDamageDealtBeforeOom(c) {

        // TODO HACKER
        return 100000000000

        let myBestSkill = c.skills[0]
        let mySkillInfo = myBestSkill

        if (!mySkillInfo) return 1

        if (c.mpRegen > mySkillInfo.cost) return Number.MAX_SAFE_INTEGER

        if (c.mp < mySkillInfo.cost) return 0

        let timeToOom = c.mp / (mySkillInfo.cost - c.mpRegen)
        let myDmg = ComputerVision.getMyDmg(c)

        let maxPossibleDmg = timeToOom * myDmg
        return maxPossibleDmg
    }

    static getMyDmgMultiplier() {
        return 1
    }

    static getMyBattleScore(c, useMaxHp = false, variableBattleScore = 0) {
        //return variableBattleScore

        let hpScorePart = (useMaxHp ? c.maxHp : c.hp)

        let potentialScore = (ComputerVision.getSkillDamage(c.skills[0])) * hpScorePart
        let maxTargetLife = ComputerVision.getMaxDamageDealtBeforeOom(c)
        let maxDmgScore = maxTargetLife * (ComputerVision.getSkillDamage(c.skills[0]))
        let dmgScorePart = Math.min(maxDmgScore, potentialScore)
        let battleScore = Math.sqrt(dmgScorePart)

        if (isNaN(battleScore)) battleScore = 0

        battleScore *= ComputerVision.getMyDmgMultiplier()

        return battleScore
    }

    static getMpRequiredToDefeatMonster(monster, c) {
        let mpRequired = (monster.hp / ComputerVision.getMyDmg(c)) * ((c.skills[0]?.cost ?? 0) - c.mpRegen)
        return mpRequired
    }

    static getMonstersTargettingMeBattleScore(c, monsters) {
        let monstersTargettingMe = monsters.filter(e => e.targetId && e.targetId == c.id)

        let monstersTargettingMeBattleScore = 0
        if (monstersTargettingMe.length > 0) {
            monstersTargettingMeBattleScore = monstersTargettingMe.map(e => ComputerVision.getMonsterBattleScore(e, c)).reduce((accumulator, currentValue) => accumulator + currentValue, monstersTargettingMeBattleScore)
        }

        return monstersTargettingMeBattleScore
    }

    static isValidTarget(entity, nonTraversableEntities, c, monsters, targetZoneLevel, nearMonsterUnsafeRadius, variableBattleScore) {
        if (entity.targetId == c.id) return true

        if(entity.z != c.z) return false

        if(entity.md.startsWith('deer')) return false

        if(entity.md.startsWith('npc')) return false

        // If I have a target, but am not in combat, and it is hostile, and I am in range of it
        //  then no other entity is a valid target to swap to
        if (c.targetId != entity.id) {
            let target = monsters.filter(e => c.targetId == e.id)
            if (target.bad) {
                if (ComputerVision.distance(target, c) < optimalMonsterRange) {
                    return false
                }
            }
        }

        if (c.targetId == entity.id) {
            if (c.combat) return true
            // try to 'un-target' a monster that walked near another monster since we targetted it
            let otherMonsters = monsters.filter((e) => e.ai && e.id != entity.id)
            for (let monster of otherMonsters) {
                if (ComputerVision.distance(monster, entity) < nearMonsterUnsafeRadius) {
                    return false
                }
            }
            return true
        }

        // if(entity.r == 0) {
        //     return false // ONLY FIGHT SKULLS
        // }

        // // never fight skulls
        // if(entity.r != 0) {
        //     return false
        // }

        let now = new Date().getTime()

        if(entity.badCd > now) {
            return false
        }

        if (!ComputerVision.hasLineOfSight(entity, c, nonTraversableEntities)) {
            return false
        }

        // if (entity.level < targetZoneLevel - 2 && entity.r === 0 && !entity.bad)
        // {
        //     return false
        // }

        if ((c.hp < (c.maxHp * 0.85)) || (c.mp < (c.maxMp * 0.85)) && !c.combat) {
            return false
        }

        // if(c.combat && (c.mp < (c.maxMp * 0.9))) return false

        let monsterBattleScore = ComputerVision.getMonsterBattleScore(entity, c)
        let myBattleScore = ComputerVision.getMyBattleScore(c, false, variableBattleScore)
        let monstersTargettingMe = monsters.filter(e => e.targetId && e.targetId == c.id)
        let monstersTargettingMeBattleScore = ComputerVision.getMonstersTargettingMeBattleScore(c, monsters) * monstersTargettingMe.length
        if ((monsterBattleScore + monstersTargettingMeBattleScore) > myBattleScore) {
            return false
        }
        let mpRequired = ComputerVision.getMpRequiredToDefeatMonster(entity, c)
        // if (c.mp < mpRequired) {
        //     //return false
        // }
        monsters = monsters.filter((e) => e.ai && e.id != entity.id)
        for (let monster of monsters) {
            if (ComputerVision.distance(monster, entity) < nearMonsterUnsafeRadius) {
                return false
            }
        }

        // let bestSkill = c.skills[0]
        // if(bestSkill?.range < 3)
        // {
        //     if(entity.md.toLowerCase().includes("ranged") || entity.md.toLowerCase().includes("spiked"))
        //     {
        //         // let dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
        //         // let vecToEntity = { x: entity.dx, y: entity.dy }
        //         // let vecToSpot = { x: entity.x - c.x, y: entity.y - c.y }
        //         // let sameDir = dot([vecToEntity.x, vecToEntity.y], [vecToSpot.x, vecToSpot.y]) < 0

        //         // sameDir = !(entity.dx === undefined || entity.dy === undefined) && sameDir

        //         // if(!sameDir && ((monsterBattleScore * 1.3) > myBattleScore))
        //         // {
        //         //     return false
        //         // }
        //     }
        // }

        return true
    }

    static sqr(x) {
        return x * x
    }
    static dist2(v, w) {
        return ComputerVision.sqr(v.x - w.x) + ComputerVision.sqr(v.y - w.y)
    }
    static distToSegmentSquared(p, v, w) {
        let l2 = ComputerVision.dist2(v, w)
        if (l2 == 0)
            return ComputerVision.dist2(p, v)
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2
        t = Math.max(0, Math.min(1, t))
        return ComputerVision.dist2(p, {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y)
        })
    }
    static distToSegment(p, v, w) {
        return Math.sqrt(ComputerVision.distToSegmentSquared(p, v, w))
    }
    static hasLineOfSight(target, from, nonTraversableEntities = [], thickCheckOverride = null) {
        if (!target)
            return false

        for (let e of nonTraversableEntities) {
            if ("id" in e && "id" in target && e.id === target.id)
                continue
            let thickCheck = this.terrainThickness
            if (e.id)
                thickCheck = this.entityThickness

            thickCheck = thickCheckOverride ?? thickCheck
            if (ComputerVision.distance(e, from) < thickCheck) {
                let dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
                let vecToEntity = { x: e.x - from.x, y: e.y - from.y }
                let vecToSpot = { x: target.x - from.x, y: target.y - from.y }
                let sameDir = dot([vecToEntity.x, vecToEntity.y], [vecToSpot.x, vecToSpot.y]) < 0
                if (sameDir)
                    continue
            }
            if (ComputerVision.distToSegment(e, from, target) < thickCheck) {
                return false
            }
        }
        return true
    }

    static hasLineOfSafety(target, from, monsters, c, targetId, dangerousEnemyPredicate = e => (e.bad || (e.badCd > new Date().getTime())) && e.id != targetId) {
        if (!target)
            return false
        let hostlies = monsters.filter(dangerousEnemyPredicate).filter(m => targetId != m.id)
        let dot = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n)
        for (let monster of hostlies) {
            if (targetId == monster.id)
                continue
            if (ComputerVision.distance(monster, c) <= ComputerVision.scaryMonsterRadius) {
                let vecToMonster = { x: monster.x - from.x, y: monster.y - from.y }
                let vecToSpot = { x: target.x - from.x, y: target.y - from.y }
                let sameDir = dot([vecToMonster.x, vecToMonster.y], [vecToSpot.x, vecToSpot.y]) < 0
                if (sameDir)
                    continue
            }
            let monsterTest = { x: monster.x, y: monster.y }
            let distToTarget = ComputerVision.distToSegment(monster, from, target)
            if (distToTarget < ComputerVision.scaryMonsterRadius) {
                // monster direction vs spot to monster
                if (monster.bad) {
                    // Uncomment this to allow walking behind hostile monsters when wandering

                    // let timeToBad = monster.badCd - new Date().getTime()
                    // if (timeToBad > 3000) continue

                    // let vecDir = { x: monster.dx, y: monster.dy }
                    // let vecPoint = { x: target.x - monster.x, y: target.y - monster.y }
                    // let sameDir = dot([vecDir.x, vecDir.y], [vecPoint.x, vecPoint.y]) < 0
                    // let vecPlayerMonster = { x: monster.x - from.x, y: monster.y - from.y }
                    // let vecPlayerPoint = { x: target.x - from.x, y: target.y - from.y }
                    // let sameDirPlayer = dot([vecPlayerMonster.x, vecPlayerMonster.y], [vecDir.x, vecDir.y]) < 0
                    // let sameDirPlayerPoint = dot([vecPlayerPoint.x, vecPlayerPoint.y], [vecPoint.x, vecPoint.y]) < 0

                    // if (sameDir && !sameDirPlayer && sameDirPlayerPoint) {
                    //     continue
                    // }
                }
                return false
            }
        }
        return true
    }

    static getSpotInfo(x, y, monsters, nonTraversableEntities, c, optimalMonsterRange, optimalMonsterRangeBuffer, targetZoneLevel, targetId, nearMonsterUnsafeRadius, variableBattleScore, followEntity) {
        let nearMonsters = monsters.filter((m) => ComputerVision.distance({ x: x, y: y }, m))
        let target = monsters.filter((entity) => entity.id === targetId).shift()
        let spotValue = 50
        let spotType = "open"
        if (!ComputerVision.hasLineOfSight({ x: x, y: y }, c, nonTraversableEntities)) {
            spotValue = 555
            spotType = "obstructed"
        }
        if (!ComputerVision.hasLineOfSafety({ x: x, y: y }, c, monsters.filter(m => m.id != targetId), c, targetId)) {
            spotValue = 555
            spotType = "dangerous"
        }

        if(followEntity && c.combat) {
            if(ComputerVision.distance(followEntity, { x: x, y: y }) > 3.5) {
                spotValue = 555
                spotType = "obstructed"
            }
        }

        // TODO REMOVE patwalk
        // mission patch to stay in range
        if (c.mission && ComputerVision.distance(c.mission, { x: x, y: y }) > 95) {
            spotValue = 555
            spotType = "obstructed"
        }
        // TODO REMOVE end


        if (spotType != "obstructed" && spotType != "dangerous") {
            for (let monster of nearMonsters) {
                let monsterTest = { x: monster.x, y: monster.y }
                let dist = Math.max(ComputerVision.distance({ x: x, y: y }, monster))

                if (dist < optimalMonsterRange + optimalMonsterRangeBuffer && ComputerVision.isValidTarget(monster, nonTraversableEntities, c, monsters, targetZoneLevel, nearMonsterUnsafeRadius, variableBattleScore)) {
                    let delta = 0
                    if (dist < optimalMonsterRange - 0.25 + optimalMonsterRangeBuffer && optimalMonsterRange + optimalMonsterRangeBuffer > optimalMonsterRange - 0.25) {
                        //delta += 80 * (1 - dist / (optimalMonsterRange + optimalMonsterRangeBuffer))
                        if (spotType == "open") {
                            delta -= 10
                            spotType = "fallback"
                        }
                    } else if (dist < optimalMonsterRange + optimalMonsterRangeBuffer) {
                        delta -= 40
                        if (spotType == "open") {
                            spotType = "preference"
                        }
                    } else if (dist < optimalMonsterRange + optimalMonsterRangeBuffer + 0.5) {
                        //delta += 50
                        if (spotType == "open") {
                            delta -= 10
                            spotType = "fallback"
                        }
                    }
                    if (!ComputerVision.hasLineOfSight({ x, y }, monsterTest, nonTraversableEntities, 0)) {
                        delta += 100
                        spotType = "partially-obstructed"
                    }
                    spotValue += delta
                } else {
                    let targetGooOtherGooCombat = target && target.md.toLowerCase().includes("goo") && monster.md.toLowerCase().includes("goo") && (c.combat == 1)
                    let doAvoid = monster.bad || targetGooOtherGooCombat
                    let prevScaryRadius = this.scaryMonsterRadius
                    if (targetGooOtherGooCombat && !monster.bad) {
                        this.scaryMonsterRadius = 3
                    }
                    if (!ComputerVision.hasLineOfSafety({ x: x, y: y }, c, monsters, c, targetId, e => e.id == monster.id) && doAvoid && ComputerVision.hasLineOfSight({ x: x, y: y }, monster, nonTraversableEntities, 0)) {
                        spotValue += 500
                        spotType = "dangerous"
                    }
                    this.scaryMonsterRadius = prevScaryRadius
                }
            }
        }
        return { positionValue: spotValue, type: spotType, lastUpdate: new Date() }
    }

    static distance(a, b) {
        var distance = Math.sqrt((Math.pow(a.x - b.x, 2)) + (Math.pow(a.y - b.y, 2)))
        return distance;
    };
}

function workerCodeFunc() {
    let gridWidth = 22
    let gridHeight = 14
    let gridArrWidth = gridWidth * 3
    let gridArrHeight = gridHeight * 3

    let visionGrid = new Array(gridArrWidth)
    let gridLeft = 0 - gridWidth / 2
    let gridTop = 0 - gridHeight / 2
    let squareWidth = gridWidth / gridArrWidth
    let squareHeight = gridHeight / gridArrHeight
    squareWidth = gridWidth / gridArrWidth
    squareHeight = gridHeight / gridArrHeight

    for (let i = 0; i < visionGrid.length; ++i) {
        visionGrid[i] = new Array(gridArrHeight)
        for (let j = 0; j < visionGrid[i].length; ++j) {
            let x = gridLeft + i * squareWidth - squareWidth / 2
            let y = gridTop + j * squareHeight - squareHeight / 2
            visionGrid[i][j] = { x, y, threat: 555, type: "dangerous", lastUpdate: new Date() }
        }
    }

    function distance(a, b) {
        var distance = Math.sqrt((Math.pow(a.x - b.x, 2)) + (Math.pow(a.y - b.y, 2)))
        return distance;
    }

    self.addEventListener('message', e => {

        let visionGridEx = []

        for (let i = 0; i < gridArrWidth; ++i) {
            for (let j = 0; j < gridArrHeight; ++j) {
                let distPlayer = distance(visionGrid[i][j], e.data.c)
                let distUse = distPlayer
                distUse /= 16
                distUse += visionGrid[i][j].threat / 555
                visionGridEx.push({ i, j, data: visionGrid[i][j], dist: distUse })
            }
        }

        let fullGridProcessed = false;

        function* yieldVisionGridUpdatesOnOldSpots() {
            while (true) {
                let now = new Date()
                visionGridEx.sort((a, b) => (now.getTime() - b.data.lastUpdate.getTime()) / b.dist - (now.getTime() - a.data.lastUpdate.getTime()) / a.dist)
                for (let spot of visionGridEx) {
                    now = new Date()
                    let gridLeft2 = e.data.c.x - e.data.gridWidth / 2
                    let gridTop2 = e.data.c.y - e.data.gridHeight / 2
                    let squareWidth2 = e.data.gridWidth / gridArrWidth
                    let squareHeight2 = e.data.gridHeight / gridArrHeight
                    squareWidth2 = e.data.gridWidth / e.data.gridArrWidth
                    squareHeight2 = e.data.gridHeight / e.data.gridArrHeight
                    let x = gridLeft2 + spot.i * squareWidth2 - squareWidth2 / 2
                    let y = gridTop2 + spot.j * squareHeight2 - squareHeight2 / 2
                    let spotInfo = ComputerVision.getSpotInfo(x, y, e.data.monsters, e.data.nonTraversableEntities, e.data.c, e.data.optimalMonsterRange, e.data.optimalMonsterRangeBuffer, e.data.targetZoneLevel, e.data.targetId, e.data.nearMonsterUnsafeRadius, e.data.variableBattleScore, e.data.followEntity)
                    visionGrid[spot.i][spot.j] = { x: x, y: y, threat: spotInfo.positionValue, type: spotInfo.type, lastUpdate: new Date() }
                    yield { i: spot.i, j: spot.j, data: { x: x, y: y, threat: spotInfo.positionValue, type: spotInfo.type, lastUpdate: new Date() } }
                }
                fullGridProcessed = true
            }
        }

        let sw = new Stopwatch();
        sw.Start();
        let visionGridUpdateYielderOld = yieldVisionGridUpdatesOnOldSpots();
        fullGridProcessed = false;
        let updates = [];
        while (sw.ElapsedMilliseconds < e.data.gridUpdatePeriod && !fullGridProcessed) {
            let visionGridUpdate = visionGridUpdateYielderOld.next().value;
            let gridLeft2 = e.data.c.x - e.data.gridWidth / 2;
            let gridTop2 = e.data.c.y - e.data.gridHeight / 2;
            let squareWidth2 = e.data.gridWidth / e.data.gridArrWidth;
            let squareHeight2 = e.data.gridHeight / e.data.gridArrHeight;
            let x = gridLeft2 + visionGridUpdate.i * squareWidth2 - squareWidth2 / 2;
            let y = gridTop2 + visionGridUpdate.j * squareHeight2 - squareHeight2 / 2;
            updates.push({ i: visionGridUpdate.i, j: visionGridUpdate.j, x, y, threat: visionGridUpdate.data.threat, type: visionGridUpdate.data.type, lastUpdate: new Date() });
        }
        self.postMessage(updates);
    },
        false);
}


let optimalMonsterRange = dw.c.skills[0]?.range ?? 3
let optimalMonsterRangeBuffer = -0.2
let gridUpdatePeriod = 7
let gridWidth = 22
let gridHeight = 14
let gridArrWidth = gridWidth * 3
let gridArrHeight = gridHeight * 3
let scaryMonsterRadius = ComputerVision.scaryMonsterRadius
let terrainThickness = ComputerVision.terrainThickness
let entityThickness = ComputerVision.entityThickness
let nearMonsterUnsafeRadius = 2// TODO 1.25

let visionGrid = new Array(gridArrWidth)
let gridLeft = dw.c.x - gridWidth / 2
let gridTop = dw.c.y - gridHeight / 2
let squareWidth = gridWidth / gridArrWidth
let squareHeight = gridHeight / gridArrHeight
squareWidth = gridWidth / gridArrWidth
squareHeight = gridHeight / gridArrHeight
for (let i = 0; i < visionGrid.length; ++i) {
    visionGrid[i] = new Array(gridArrHeight)
    for (let j = 0; j < visionGrid[i].length; ++j) {
        let x = gridLeft + i * squareWidth - squareWidth / 2
        let y = gridTop + j * squareHeight - squareHeight / 2
        visionGrid[i][j] = { x, y, threat: 555, type: "dangerous", lastUpdate: new Date() }
    }
}


setTimeout(() => {
    const stopWatchCode = `var Stopwatch = ${Stopwatch.toString()}`
    const workerCode = `${stopWatchCode};var ComputerVision = ${ComputerVision.toString()};${workerCodeFunc.toString()};workerCodeFunc()`

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const visionGridWorker = new Worker(URL.createObjectURL(blob));

    visionGridWorker.addEventListener('message', function (e) {
        e.data.forEach(update => {
            visionGrid[update.i][update.j] = { x: update.x, y: update.y, threat: update.threat, type: update.type, lastUpdate: update.lastUpdate };
        });
    }, false);


    async function updateVisionGridOld() {
        let monsters = dw.e.filter((e) => e.ai)
        for (let m of monsters) {
            m.biome = 0
        }

        let partyEntity = null
        if(dw.c.party.length > 0 ) {
            partyEntity = dw.findClosestEntity(e => e.name == dw.c.party[0].name)
        }

        let msgObj = {
            gridUpdatePeriod: gridUpdatePeriod,
            monsters: monsters,
            nonTraversableEntities: getNonTraversableEntities(),
            c: dw.c,
            gridWidth: gridWidth,
            gridHeight: gridHeight,
            gridArrWidth: gridArrWidth,
            gridArrHeight: gridArrHeight,
            targetId: dw.targetId,
            optimalMonsterRange: optimalMonsterRange,
            optimalMonsterRangeBuffer: optimalMonsterRangeBuffer,
            targetZoneLevel: targetZoneLevel,
            nearMonsterUnsafeRadius: nearMonsterUnsafeRadius,
            variableBattleScore: cache.get(`${dw.c.name}VBS`),
            followEntity: partyEntity
        }
        visionGridWorker.postMessage(JSON.parse(JSON.stringify(msgObj)));

        await sleep(gridUpdatePeriod);
        updateVisionGridOld()
    }

    setTimeout(updateVisionGridOld, 100);

    dw.on("drawEnd", (ctx, cx, cy) => {

        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
        let squareWidth2 = gridWidth / gridArrWidth * 96
        let squareHeight2 = gridHeight / gridArrHeight * 96
        ctx.font = "12px arial"
        let now = new Date()
        for (let i = 0; i < gridArrWidth; ++i) {
            for (let j = 0; j < gridArrHeight; ++j) {
                if (!cache.get("showComputerVision")) {
                    continue
                }
                let threatLevel = Math.max(Math.min(visionGrid[i][j].threat, 100), 0)
                let alpha = threatLevel / 100 * 0.3
                ctx.fillStyle = getGridStyle(visionGrid[i][j].type, 1)
                let x = visionGrid[i][j].x * 96 - camOffsetX
                let y = visionGrid[i][j].y * 96 - camOffsetY
                if (x < -1 * squareWidth2 || x > ctx.canvas.width || y < -1 * squareHeight2 || y > ctx.canvas.height)
                    continue
                let sizeMulti = Math.max(0, (1e3 - (now - visionGrid[i][j].lastUpdate)) / 1e3)
                let widthUse = squareWidth2 / 2 * sizeMulti
                let heightUse = squareHeight2 / 2 * sizeMulti
                ctx.beginPath()
                ctx.rect(x + (squareWidth2 - widthUse) / 2, y + (squareHeight2 - heightUse) / 2, widthUse, heightUse)
                ctx.fill()
                ctx.fillStyle = `rgb(0, 0, 0, 0.5)`
            }
        }
        // let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
        // ctx.lineWidth = 4
        // if (moveToSpot) {
        //     drawLineToPOI(ctx, cx, cy, moveToSpot, `rgb(0, 255, 0, 0.9`)
        //     drawLineToPOI(ctx, cx, cy, movingToSpot, `rgb(231, 0, 255, 0.9)`)
        // }
        // drawLineToPOI(ctx, cx, cy, target, `rgb(245, 239, 66, 0.9)`, { x: dw.c.x, y: dw.c.y - 0.5 })

        // let monstersTargettingMe = dw.findEntities(e => e.targetId && e.targetId == dw.c.id)
        // for (var monster of monstersTargettingMe) {
        //     drawLineToPOI(ctx, cx, cy, dw.c, 'white', { x: monster.x, y: monster.y - 0.5 })
        // }
    })
}, 100)





function getGoodSpots(range, avoidRecent = false, reverseSort = false) {
    let goodSpots = []
    let now = new Date()
    for (let i = 0; i < gridArrWidth; ++i) {
        for (let j = 0; j < gridArrHeight; ++j) {
            if (visionGrid[i][j].threat <= range && (now - visionGrid[i][j].lastUpdate < 300)) {
                if (avoidRecent && getSpotRecentlyUsed(visionGrid[i][j].x, visionGrid[i][j].y))
                    continue
                goodSpots.push(visionGrid[i][j])
            }
        }
    }
    goodSpots.sort(function (a, b) {
        let da = dw.distance(dw.c, a)
        let db = dw.distance(dw.c, b)

        // If we are in a party with duper then closer spots to super are better
        if(dw.c.party.length > 0) {
            let superEntity = dw.findClosestEntity(e => e.name == dw.c.party[0].name)

            if(superEntity) {
                da = dw.distance(superEntity, a)
                db = dw.distance(superEntity, b)
            }
        }

        return reverseSort ? db - da : da - db
    })
    return goodSpots
}





// Visualizations
let gridTypeStyleMap = {
    open: "rgb(0, 100, 255, alpha)",
    obstructed: "rgb(0, 0, 0, alpha)",
    "partially-obstructed": "rgb(33, 33, 33, alpha)",
    preference: "rgb(0, 255, 0, alpha)",
    fallback: "rgb(245, 66, 239, alpha)",
    dangerous: "rgb(207, 0, 41, alpha)",
    "negative-value": "rgb(114, 0, 207, alpha)"
}
function getGridStyle(type, alpha) {
    let styleFormat = gridTypeStyleMap[type]
    if (!styleFormat)
        return "red"
    return styleFormat.replace("alpha", alpha)
}


function combatTextTween(x) {
    return x * easeInOutElastic(x) + (1 - x) * easeInOutQuint(x)
}
function easeInOutElastic(x) {
    const c5 = 2 * Math.PI / 4.5
    return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? -(Math.pow(2, 20 * x - 10) * Math.sin((20 * x - 11.125) * c5)) / 2 : Math.pow(2, -20 * x + 10) * Math.sin((20 * x - 11.125) * c5) / 2 + 1
}
function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2
}
function drawLineToPOI(ctx, cx, cy, target, style, from = dw.c) {
    let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
    let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
    if (target) {
        ctx.fillStyle = style
        ctx.strokeStyle = style
        let spotx = target.x * 96 - camOffsetX - 5
        let spoty = target.y * 96 - camOffsetY - 5
        let playerx = from.x * 96 - camOffsetX
        let playery = from.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.moveTo(playerx, playery)
        ctx.lineTo(spotx + 5, spoty + 5)
        ctx.stroke()
        ctx.beginPath()
        ctx.rect(spotx, spoty, 10, 10)
        ctx.fill()
    }
}

setTimeout(() => {
    addMenuContextMenuButton(cache.get(`showComputerVision`) ? 'VFX �' : 'VFX �', (e) => {
        let showComputerVision = !cache.get(`showComputerVision`)
        if (showComputerVision) {
            e.innerText = 'VFX �'
        }
        else {
            e.innerText = 'VFX �'
        }
        cache.set(`showComputerVision`, showComputerVision)
    })

    let showComputerVision = cache.get("showComputerVision") ?? true
    cache.set("showComputerVision", showComputerVision)

    // initialize variable battle score
    dw.log('VBS ' + cache.get(`${dw.c.name}VBS`))
    console.log('VBS', cache.get(`${dw.c.name}VBS`))
    if(!cache.get(`${dw.c.name}VBS`) || cache.get(`${dw.c.name}VBS`) == 0) {
        cache.set(`${dw.c.name}VBS`, 11000)
    }
}, 100)

let dialogs = {}

class Dialogs {
    static AddDialog(name, x, y, text, onClick) {
        dialogs[name] = {x:x,y:y,text:text,onClick:onClick,visible:true,clicked:false}
    }
    static ShowDialog(name) {
        if(!dialogs[name]) return

        dialogs[name].visible = true
    }
    static HideDialog(name) {
        if(!dialogs[name]) return

        dialogs[name].visible = false
    }
}

setInterval(() => {
    for(let key of Object.keys(dialogs)) {
        let dialog = dialogs[key]
        if(dw.distance(dw.c, dialog) > 2) {
            Dialogs.HideDialog(key)
        }
    }
}, 100)


setTimeout(() => {

    dw.on("drawEnd", (ctx, cx, cy) => {
        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))

        //console.log(dialogs)

        for (let key of Object.keys(dialogs)) {
            let dialog = dialogs[key]
            //console.log(key, dialog)
            if(!dialog.visible) continue

            let x = dialog.x * 96 - camOffsetX
            let y = dialog.y * 96 - camOffsetY

            ctx.lineWidth = 3
            ctx.fillStyle = '#FFFFFF'
            ctx.strokeStyle = '#000000'
            ctx.font = "16px system-ui"
            ctx.textAlign = "left"

            let textWidth = ctx.measureText(dialog.text).width

            let highlighted = false
            if (lastMouse.x > x &&
                lastMouse.x < (x + textWidth) &&
                lastMouse.y > y - 5 &&
                lastMouse.y < (y - 5 + 20)) {
                highlighted = true
            }

            let clicked = false
            if (highlighted && clicksQueue.length > 0) {
                let lastMouseClick = clicksQueue[0]
                if (lastMouseClick.x > x &&
                    lastMouseClick.x < (x + textWidth) &&
                    lastMouseClick.y > y - 5 &&
                    lastMouseClick.y < (y - 5 + 20)) {

                    if(!dialog.clicked) {
                        clicked = true
                        dialog.clicked = true
                        dialog.visible = false
                    }
                }
                else {
                    dialog.clicked = false
                }
            }
            else {
                dialog.clicked = false
            }

            if(highlighted) {
                ctx.fillStyle = 'gold'
            }

            if(clicked) {
                //ctx.fillStyle = 'gold'
                dialog.onClick()
            }

            ctx.strokeText(dialog.text, x, y)
            ctx.fillText(dialog.text, x, y)

            //console.log('drew text', dialog.text, x, y)
        }
    })
}, 200)

// Entity positions that smoothly transition over time
// used for UI display so that entity updates don't cause the nameplates to jump around
let entititiesSmoothPosMap = {}
setInterval(function () {
    for (let entity of dw.findEntities((e) => e.ai || e.player)) {
        if (!(entity.id in entititiesSmoothPosMap)) {
            entititiesSmoothPosMap[entity.id] = { x: entity.x, y: entity.y }
        }
        let dx = entity.x - entititiesSmoothPosMap[entity.id].x
        let dy = entity.y - entititiesSmoothPosMap[entity.id].y
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            entititiesSmoothPosMap[entity.id].x += dx
            entititiesSmoothPosMap[entity.id].y += dy
        } else {
            entititiesSmoothPosMap[entity.id].x += dx / 10
            entititiesSmoothPosMap[entity.id].y += dy / 10
        }
    }
}, 4)

  // const SCALE = 96
  
  // dw.on('drawEnd', (ctx, cx, cy) => {
  //   const {width, height} = ctx.canvas
  //   const mx = width / 2
  //   const my = height / 2
  
  //   const transpose = (wx, wy) => [
  //     mx + Math.floor((wx - cx) * SCALE),
  //     my + Math.floor((wy - cy) * SCALE),
  //   ]
  
  //   for (let i = 0; i < dw.entities.length; i++) {
  //     const entity = dw.entities[i]
  //     if (!('ai' in entity) || entity.z !== dw.c.z || !!entity.targetId) {
  //       continue
  //     }
  
  //     const [x, y] = transpose(
  //       entity.x,
  //       entity.y,
  //     )
  
  //     let dx = entity.dx ?? 0
  //     let dy = entity.dy ?? 1
  //     const dLength = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
  
  //     dx *= entity.moveSpeed / dLength
  //     dy *= entity.moveSpeed / dLength
  
  //     const [tx, ty] = transpose(
  //       entity.x + dx,
  //       entity.y + dy,
  //     )
  
  //     ctx.lineWidth = 4
  //     ctx.strokeStyle = '#ff0000'
  //     ctx.beginPath()
  //     ctx.moveTo(x, y)
  //     ctx.lineTo(tx, ty)
  //     const headLength = 10
  //     const tdx = tx - x
  //     const tdy = ty - y
  //     const tAngle = Math.atan2(tdy, tdx)
  //     ctx.lineTo(tx - headLength * Math.cos(tAngle - Math.PI / 6), ty - headLength * Math.sin(tAngle - Math.PI / 6))
  //     ctx.moveTo(tx, ty)
  //     ctx.lineTo(tx - headLength * Math.cos(tAngle + Math.PI / 6), ty - headLength * Math.sin(tAngle + Math.PI / 6))
  //     ctx.stroke()
  
  //     if (!entity.bad) {
  //       return
  //     }
  
  //     if (entity.dx === undefined || entity.dy === undefined) {
  //       ctx.beginPath()
  //       ctx.fillStyle = '#ffff0040'
  //       ctx.arc(x, y, 3 * SCALE, 0, Math.PI * 2)
  //       ctx.fill()
  //     }
  
  //     if (entity.dx !== undefined && entity.dy !== undefined) {
  //       const angle = Math.atan2(entity.dy, entity.dx)
  //       ctx.beginPath()
  //       ctx.fillStyle = '#ff000040'
  //       ctx.arc(x, y, 3 * SCALE, angle - Math.PI / 2, angle + Mth.PI / 2)
  //       ctx.fill()
  //     }
  //   }
  // })

function getGearScoreSkillDamage(skill) {
    let healingRuneParts = ['heal', 'lifeshield', 'blink']
    if (!skill)
        return 0
    if (healingRuneParts.filter(p => skill.md.toLowerCase().includes(p)).length > 0)
        return 0
    let skillDmg = (skill.acid + skill.cold + skill.fire + skill.elec + skill.phys) ?? 0
    let totalDmg = Math.floor(skillDmg * (1.0 - Math.pow(skill.crit, 2)) + (Math.pow(skill.crit, 2) * Math.pow(skill.critMult, 2) * skillDmg))

    return totalDmg
}

function getMyLowestArmor() {
    return 0//dw.c.physArmor
    //return Math.min(dw.c.physArmor, dw.c.acidArmor, dw.c.fireArmor, dw.c.elecArmor, dw.c.coldArmor)
}

function getMyGearScore(useMaxHp = false) {
    let bestSkill = dw.c.skills[0]

    let hpScorePart = (useMaxHp ? dw.c.maxHp : dw.c.hp) + ((dw.c.skills[0].mods?.mpToHpCost == 1) ? (useMaxHp ? dw.c.maxMp : dw.c.mp) : 0)

    let skillGearScoreDmg = getGearScoreSkillDamage(dw.c.skills[0])// * 1.5 // TODO hack add regen from conservation

    return skillGearScoreDmg + dw.c.stats.hpRegen + dw.c.stats.mpRegen

    // TODO THIS IS JUST MY DMG NOW

    let dmgContribution = Math.pow(skillGearScoreDmg + dw.c.stats.hpRegen, 1.5) + getMyLowestArmor()
    let potentialScore = dmgContribution * hpScorePart
    let maxTargetLife = ComputerVision.getMaxDamageDealtBeforeOom(dw.c)
    let maxDmgScore = maxTargetLife * dmgContribution
    let dmgScorePart = Math.min(maxDmgScore, potentialScore)
    let battleScore = Math.sqrt(dmgScorePart)

    if (isNaN(battleScore)) battleScore = 0

    return battleScore * (bestSkill?.fx?.bomb ? 0.6 : 1)
        * ((bestSkill?.range < 3 || bestSkill?.fx?.blink) ? 0.75 : 1)
        // * (dw.c.party.length > 0 ? 1 : 1)
        * ComputerVision.getMyDmgMultiplier()
}

// Define gearsets
// -SetName
// --Filter {slot:"boots", mods:["hp","moveSpeed", "hpRegen"]}


// When near base check the stash for existing item stats if the cache is stale
// Ensure fresh data before evaluating items
// For any item check if it matches the filter for any item in a set
// Compare it against the existing item's stats if there is one
// If it is better then mark it for stashing
// Otherwise mark it to be disenchanted


// When near disenchanting device and there are items to disenchant, disenchant them

// When near item set stash and have items to stash
// Pull out existing item, put new item in

// Cache items in stash by their highest and lowest mod tiers
// [lowest + highest] / 2 is the score

// In memory store the setname and filter key and the score of the best item for the filter

let gearSets = [
    {
        name:'weapon',
        filters:[
            {
                slot:'mainHand',
                mods:['physDmgIncLocal','physDmgLocal'],
                must:['physDmgIncLocal','physDmgLocal'],
                keep:1,
            },
        ]
    },
    {
        name:'gem',
        filters:[
            {
                slot:'gem',
                mods:['gcdr','crit','critMult','dmgInc','hpInc','physDmgInc'],
                must:['hpInc'],
                keep:1,
            },
        ]
    },
    {
        name:'jewelery',
        filters:[
            {
                slot:'amulet',
                mods:['hp','dmg','physDmg'],
                must:[],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','dmg','physDmg'],
                must:[],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','dmg','physDmg'],
                must:[],
                keep:1,
            },
        ]
    },
    {
        name:'regen',
        filters:[
            {
                slot:'boots',
                mods:['hp','moveSpeed','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'belt',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'chest',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['hp','hpRegen','hpRegenInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gem',
                mods:['hp','hpInc','hpRegen','hpRegenInc'],
                must:[],
                keep:30,
            },
        ]
    },
    {
        name:'crit',
        filters:[
            {
                slot:'boots',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'belt',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'chest',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:1,
            },
            {
                slot:'gem',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:30,
            },
            {
                slot:'mainHand',
                mods:['crit', 'critLocal','critMult','critMultLocal'],
                must:[],
                keep:30,
            },
        ]
    },
    {
        name:'armor',
        filters:[
            {
                slot:'boots',
                mods:['hp','moveSpeed','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'belt',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'chest',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['hp','defIncLocal','defLocal'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gem',
                mods:['hp','defIncLocal','defLocal'],
                must:[],
                keep:30,
            },
        ]
    },
    {
        name:'block',
        filters:[
            {
                slot:'boots',
                mods:['hp','moveSpeed','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'belt',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'chest',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['hp','block'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gem',
                mods:['hp','block'],
                must:[],
                keep:30,
            },
        ]
    },
    {
        name:'versatility',
        filters:[
            {
                slot:'boots',
                mods:['hp','moveSpeed','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'belt',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'chest',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['hp','dexDef','dexDefInc'],
                must:['hp'],
                keep:1,
            },
            {
                slot:'gem',
                mods:['hp','dexDef','dexDefInc'],
                must:[],
                keep:30,
            },
        ]
    },
    {
        name:'efficiency',
        filters:[
            {
                slot:'boots',
                mods:['hp','mp','moveSpeed','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'belt',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'chest',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'helmet',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'gloves',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'ring1',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'ring2',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'amulet',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:1,
            },
            {
                slot:'gem',
                mods:['hp','mp','intDef','intDefInc'],
                must:[''],
                keep:30,
            },
        ]
    },
]

let gearCache = {}

function getIsItemInGearCache(item) {
    if(!item) return false

    let itemJson = JSON.stringify(item)

    for(let key of Object.keys(gearCache)) {
        //console.log(key,gearCache[key])
        //console.log(`gearCache[${key}].some(i => i == ${itemJson})`, gearCache[key].some(i => i == itemJson))
        for(let i of gearCache[key]) {
            if(i.item == itemJson) {
                return true
            }
        }
    }

    return false
}

function getDoesMatchAnyGearSetFilter(item) {
    if(!item) return false

    for(let set of gearSets) {
        for(let filter of set.filters) {
            if(getItemFilterScore(item, filter) > 0) return true
        }
    }

    return false
}

function updateItemInCache(item) {

    if(!item) return

    if(getIsItemInGearCache(item)) return

    for(let set of gearSets) {
        for(let filter of set.filters) {
            let key = `${[set.name,filter.slot,filter.mods]}`
            if(!(key in gearCache)) {
                gearCache[key] = []
            }

            let itemScore = getItemFilterScore(item, filter)

            if(itemScore == 0) continue

            if(getIsItemInGearCache(item)) continue

            //console.log('adding new item to cache', item, gearCache[key], key)

            gearCache[key].push({
                score:itemScore,
                item:JSON.stringify(item)
            })

            gearCache[key] = gearCache[key].sort((a,b) => b.score - a.score).splice(0, filter.keep)

            //console.log(gearCache)

            //console.log('itemScore', itemScore, item.md)

            // if(gearCache[key].score < itemScore) {
            //     gearCache[key].score = itemScore
            //     gearCache[key].item = JSON.stringify(item)
            // }
        }
    }

    //console.log(gearCache)
}

function getItemFilterScore(item, filter) {
    if(!item) return 0
    if(!dw.md.items[item.md]) return 0

    let itemSlot = 'NONE'

    if(dw.md.items[item.md].gearSlots) {
        itemSlot = dw.md.items[item.md].gearSlots[0]
    } else if(dw.md.items[item.md].gem == 1) {
        itemSlot = 'gem'
    }

    if(itemSlot != filter.slot) return 0

    let matchingMods = filter.mods.filter(m => item.mods[m]).map(m => item.mods[m]).sort((a,b) => a - b)

    if(matchingMods.length < 2) return 0

    let matchingMustMods = filter.must.filter(m => item.mods[m]).map(m => item.mods[m])

    if(filter.must.length > matchingMustMods.length) return 0

    return (matchingMods[0] + matchingMods[matchingMods.length - 1]) / 2 * item.qual
}



class LocalCache {
    valueCache = {}
    constructor() {
        this.cachedValues = {}
    }
    get(key) {
        if (this.valueCache[key] == undefined) {
            console.log('adding to local cache', key, this.valueCache, this.valueCache[key], dw.get(key))
            this.valueCache[key] = dw.get(key) ?? false
        }
        return this.valueCache[key]
    }
    set(key, value) {
        console.log('setting cache value', key, value)
        this.valueCache[key] = value
        dw.set(key, value)
    }
}

let cache = new LocalCache()

class LogMessages {
    messages = []

    constructor() {
        this.initialize()
    }

    addMessage(msg) {
        this.messages.push(msg)

        console.log(msg)

        while (this.messages.length > 33) {
            this.messages.shift()
        }
    }

    initialize() {
        dw.on("drawEnd", (ctx, cx, cy) => {
            return

            let i = 0;
            for (let msg of this.messages) {
                this.drawMessage(ctx, msg, 124, 150 + (20 * i++))
            }
        })
    }

    drawMessage(ctx, msg, x, y) {
        ctx.lineWidth = 3
        ctx.fillStyle = '#FFFFFF'
        ctx.strokeStyle = '#000000'
        ctx.font = "16px system-ui"
        ctx.textAlign = "left"
        ctx.strokeText(msg, x, y)
        ctx.fillText(msg, x, y)
    }
}

let logMessages = new LogMessages()
function clearMenuButtons() {
    let tempButtons = window.top.document.getElementsByClassName('temp-btn')

    while (tempButtons.length > 0) {
        tempButtons[0].remove()
    }

    window.top.document.getElementsByClassName('toggle-menu')[0].classList.add('me-1')
    window.top.document.getElementById('menuButtonsContextMenu')?.remove()
}

function addMenuButton(title, onclick, parentDiv = window.top.document.getElementById('minimenu')) {
    var newi = window.top.document.createElement('i')
    newi.class = 'fa-solid'
    newi.innerText = title

    newi.onclick = () => onclick(newi)

    var newMenuButton = window.top.document.createElement('div')
    newMenuButton.className = 'ui-btn px-1 me-1 temp-btn'

    newMenuButton.appendChild(newi)

    parentDiv.appendChild(newMenuButton)
}




function addMenuButtonContextMenu() {
    let menuButtons = window.top.document.getElementById('minimenu')
    let menuButtonsContextMenu = window.top.document.createElement('div')

    menuButtonsContextMenu.className = "ui ui-content invisible"
    menuButtonsContextMenu.style = "position:absolute;bottom:50px;right:5px;"
    menuButtonsContextMenu.id = 'menuButtonsContextMenu'

    menuButtons.appendChild(menuButtonsContextMenu)

}

function toggleMenuButtonContextMenu() {
    let menuButtonsContextMenu = window.top.document.getElementById('menuButtonsContextMenu')
    if (menuButtonsContextMenu.className.includes('invisible')) {
        menuButtonsContextMenu.classList.remove('invisible')
    }
    else {
        menuButtonsContextMenu.classList.add('invisible')
    }
}

function addMenuContextMenuButton(title, onclick) {
    let menuButtonsContextMenu = window.top.document.getElementById('menuButtonsContextMenu')

    addMenuButton(title, onclick, menuButtonsContextMenu)
}



clearMenuButtons()
addMenuButtonContextMenu()
addMenuButton('⚙️', e => {
    toggleMenuButtonContextMenu()
})
// If I am near spawn and I have a mission in my inventory and I don't have a mission active then try to open the highest level mission I have
setInterval(async () => {
    if(dw.c.mission) return
    if(dw.distance(dw.c, dw.c.spawn) > 10) return
    if(!dw.c.bag.some(i => i?.md == 'monsterMission')) return

    let missionTable = dw.e.filter(e => e.md == 'missionTable').shift()
    if(!missionTable) return

    let mission = dw.c.bag.filter(i => i?.md == 'monsterMission').sort((a,b) => a.qual - b.qual).shift()
    
    dw.moveItem('bag', dw.c.bag.findIndex(i => i == mission), 'storage', 0, null, missionTable.id, null)
    await sleep(500)

    dw.openMission(missionTable.id)

    // find the highest level mission
    // move it into the mission table
    // open the mission from the table
}, 500)

setInterval(() => {
    for(let i = 0;i < dw.c.bag.length; ++i) {
        if(dw.c.bag[i]?.md == 'missionBag') {
            dw.openItem(i)
            return
        }
    }
}, 1000)

dw.on("drawEnd", (ctx, cx, cy) => {

    return

    let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
    let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
    let monsters = dw.findEntities((e) => e.ai)
    ctx.lineWidth = 2
    ctx.strokeStyle = "red"
    for (let monster of monsters) {
        let dist = dw.distance(monster, dw.c)
        if (dist > gridWidth / 2) continue

        let x = monster.x * 96 - camOffsetX
        let y = monster.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, scaryMonsterRadius * 96, 0, 2 * Math.PI)
        ctx.stroke()
    }
    ctx.strokeStyle = "orange"
    for (let monster of monsters) {
        let dist = dw.distance(monster, dw.c)
        if (dist > gridWidth / 2) continue

        let x = monster.x * 96 - camOffsetX
        let y = monster.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, nearMonsterUnsafeRadius * 96, 0, 3 * Math.PI)
        ctx.stroke()
    }
    ctx.strokeStyle = "rgba(128,0,128, 0.5)"
    ctx.fillStyle = "rgba(128,0,128, 0.5)"
    for (let spot of recentSpots) {
        let dist = dw.distance(spot, dw.c)
        if (dist > gridWidth / 2) continue

        let x = spot.x * 96 - camOffsetX
        let y = spot.y * 96 - camOffsetY
        ctx.beginPath()
        ctx.arc(x, y, spot.r * 96, 0, 2 * Math.PI)
        //ctx.stroke()
        ctx.fill()
    }
})

let lastMouse = { x: 0, y: 0 }
let clicksQueue = []

parent.addEventListener("mousemove", (e) => {
    //console.log('mousemove', e);
    lastMouse.x = e.clientX;
    lastMouse.y = e.clientY + 10;
});
parent.addEventListener("mousedown", (e) => {
    //console.log('mousedown', e);
    if(e.button == 2) {
        clicksQueue.push({ x: e.clientX, y: e.clientY + 10 })
        setTimeout(() => {clicksQueue.splice(0,1)}, 300)
    }
    //console.log('queue', clicksQueue)
});

// Pick where to move
let moveUpdatePeriod = 50
let movePeriod = 200
let searchOffset = 2
let searchOffsetMission = 1
let recencyAvoidanceRadius = 1
let recentSpots = []

let lastMoveToSpotReset = new Date()

setInterval(function () {

    let manualMove = cache.get(`${dw.c.name}_manualmove`) ?? false

    if(manualMove) return

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
        return db - da
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
            console.log('NO BEST SPOT TO MOVE TO', manualMove, cache.get)
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

function moveToBestSpot(forceMove = false) {

    if (!moveToSpot) {
        console.log("no move to spot")
        return false
    }
    if (cache.get(`${dw.c.name}_manualmove`) === true)
    {
        console.log("manual move")
        return false
    }

    if(movementPriority != 0) {
        console.log("movementpriority", movementPriority)
        return false
    }

    movingToSpot = movingToSpot ?? moveToSpot

    if (dw.distance(moveToSpot, movingToSpot) > 11) movingToSpot = moveToSpot

    let dx = moveToSpot.x - movingToSpot.x
    let dy = moveToSpot.y - movingToSpot.y
    movingToSpot.x += dx * 4 / (1000 / movePeriod)
    movingToSpot.y += dy * 4 / (1000 / movePeriod)
    let dist = dw.distance(movingToSpot, dw.c)
    if (dist < 0.1)
    {
        console.log("close to spot")
        return false
    }

    if(dw.c.combat && !forceMove) {
        console.log("stopped")
        dw.move()

        return false
    }
    
    
    if(dw.c.casting > Date.now() && !forceMove) {
        console.log("combat")
        return false
    }

    dw.emit("move", movingToSpot)
    return true
}

addMenuContextMenuButton(cache.get(`${dw.c.name}_manualmove`) ? 'Manual' : 'Auto', (e) => {
    let manualMove = !(cache.get(`${dw.c.name}_manualmove`) ?? false)
    if (manualMove) {
        e.innerText = 'Manual'
    }
    else {
        e.innerText = 'Auto'
    }
    cache.set(`${dw.c.name}_manualmove`, manualMove)
})

let movementSkillTypeParts = ["dash", "charge", "blink", "greaterBlink"]
let lastMovementSkillUsed = new Date().getTime()
function doMovementSkills() {
    //if(!dw.c.combat) return false
    if (!moveToSpot) return false

    let target = dw.e.filter(e => e.id == dw.targetId).shift()

    if (target?.md.toLowerCase().includes('ranged')) return false

    let timeSinceLastMovementSkill = new Date().getTime() - lastMovementSkillUsed

    if (timeSinceLastMovementSkill < 3000) return false

    if (dw.c.party.length > 0) {
        let pc = dw.e.filter(e => e.name == dw.c.party[0].name)
        //if(!pc || dw.distance(pc, moveToSpot) > 3)
        {
            return false
        }
    }

    if (cache.get(`${dw.c.name}_manualmove`) === true)
        return


    let dist = dw.distance(moveToSpot, dw.c)

    if (dist < 4) return false

    let curDistTarget = dw.distance(target, dw.c)
    let moveToDistTarget = dw.distance(target, moveToSpot)

    if (moveToDistTarget < curDistTarget) {
        //console.log(moveToDistTarget, curDistTarget, 'not moving to closer spot to target')
        return false
    }

    for (let i = 0; i < dw.c.skills.length; ++i) {
        let skill = dw.c.skills[i]

        if (!skill) continue

        if (movementSkillTypeParts.filter(t => skill.md.toLowerCase().includes(t)).length == 0) continue

        // if we are not in combat and we are far from the moveToSpot then use a movement skill in that direction
        if (dist < skill.range) continue

        if (!isSkillReadyOverride(i)) continue

        // find a spot to move skill to
        let d = { x: moveToSpot.x - dw.c.x, y: moveToSpot.y - dw.c.y }
        let len = dw.distance(dw.c, moveToSpot)
        let to = { x: dw.c.x + ((d.x / len) * (skill.range - 0.2)), y: dw.c.y + ((d.y / len) * (skill.range - 0.2)) }
        dw.useSkill(i, to.x, to.y)
        lastMovementSkillUsed = new Date().getTime()

        return true
    }

    return false
}

let nonTraversableEntities = []
function updateNonTraversableEntities() {
  nonTraversableEntities = []
  let blockingEntities = dw.findEntities((e) => !e.ai && !e.player && !e.ore && !e.md.includes("portal"))
  let count = blockingEntities.length
  for (let i = 0; i < count; ++i) {
      let e = blockingEntities[i]
      let hitbox = dw.md.items[e.md]?.hitbox ?? { w: 0, h: 0 }
      nonTraversableEntities.push({ x: e.x - hitbox.w / 2, y: e.y - hitbox.h, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x - hitbox.w / 2, y: e.y - hitbox.h / 2, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x, y: e.y - hitbox.h, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x, y: e.y - hitbox.h / 2, id: e.id, entity:1 })
  }
  let chunkPropertyKeys = Object.keys(dw.chunks).filter((k) => k.startsWith(dw.c.z))
  for (let k of chunkPropertyKeys) {
      let l = k.split(".")[0] - 1
      let r = k.split(".")[2]
      let c = k.split(".")[1]
      let oneBelow = `${l}.${c}.${r}`
      for (let i = 0; i < 16; ++i) {
          for (let j = 0; j < 16; ++j) {
              let isHole = dw.chunks[oneBelow] && dw.chunks[oneBelow][0][i][j] < 1
              if (dw.chunks[k][0][i][j] != 0 || isHole) {
                  let x = r * 16 + j
                  let y = c * 16 + i
                  if (x < dw.c.x - gridWidth / 2 || x > dw.c.x + gridWidth / 2 || y < dw.c.y - gridHeight / 2 || y > dw.c.y + gridHeight / 2) {
                      continue
                  }
                  nonTraversableEntities.push({ x: x + 0.5, y: y + 0.5, chunk: 1 })
                  nonTraversableEntities.push({ x: x + terrainThickness / 2, y: y + terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + 1 - terrainThickness / 2, y: y + terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + terrainThickness / 2, y: y + 1 - terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + 1 - terrainThickness / 2, y: y + 1 - terrainThickness / 2, chunk: 1 })
              }
          }
      }
  }
}

let nonTraversableEntitiesUpdatePeriod = 500
let lastNonTraversableEntitiesUpdate = new Date()
function getNonTraversableEntities() {
  let now = new Date()
  let mssince = now.getTime() - lastNonTraversableEntitiesUpdate.getTime()
  if(mssince > nonTraversableEntitiesUpdatePeriod) {
      updateNonTraversableEntities()
      lastNonTraversableEntitiesUpdate = now
  }
  return nonTraversableEntities
}

// This keeps the character from pulling until it has enough mp to win the fight
setInterval(function () {
    let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
    if (!target) {
        optimalMonsterRangeBuffer = 0
        return
    }

    if (dw.c.combat && !dw.e.some(e => e.name && dw.c.party.some(p => p.name == e.name) && dw.distance(e, dw.c) < 10)) {
        optimalMonsterRangeBuffer = 4
        return
    }

    let mpRequired = ComputerVision.getMpRequiredToDefeatMonster(target, dw.c)
    if (dw.c.mp < mpRequired)
        optimalMonsterRangeBuffer = 0// 1
    else if ((dw.c.hp < dw.c.maxHp * 0.8) && dw.c.combat != 1)
        optimalMonsterRangeBuffer = 1
    else
        optimalMonsterRangeBuffer = -0.1
}, 100)

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


setInterval(function () {
    recentSpots.push({ x: dw.c.x, y: dw.c.y, r: recencyAvoidanceRadius })
}, 1000)

function moveRecentSpotNearChunks(spot) {
    let distConnection = spot.r * 0.9

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



// RecordThat
class RecordThat {
  chunks = []
  mediaRecorder = null
  maxChunks = -1
  recording = false
  discardRequested = false
  stopRequested = false
  constructor(canvas, maxChunks = -1) {
    this.maxChunks = maxChunks

    var videoStream = canvas.captureStream(30)
    this.mediaRecorder = new MediaRecorder(videoStream)

    var a = document.createElement("a")
    a.style = "display: none"

    document.body.appendChild(a)

    this.chunks = []
    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data)

      if (this.stopRequested) {
        this.mediaRecorder.stop()
        this.stopRequested = false
      }
    }

    this.mediaRecorder.onstop = (e) => {
      if (this.chunks.length == 0) {
        return
      }
      if (this.discardRequested) {
        this.discardRequested = false
        this.chunks = []
        return
      }

      var blob = new Blob(this.chunks, { 'type': 'video/mp4' })
      this.chunks = []
      var videoURL = URL.createObjectURL(blob)

      a.style = "display: none"
      a.href = videoURL
      a.download = `capture-${new Date().toJSON().replaceAll(':', '-').replaceAll('.', '-')}.mp4`
      a.click()

      window.URL.revokeObjectURL(videoURL)
    }
  }

  start() {
    this.recording = true
    this.mediaRecorder.start()
  }

  stop() {
    this.recording = false
    this.mediaRecorder.stop()
    this.stopRequested = true
  }

  discard() {
    this.chunks = []
    this.discardRequested = true
    this.stop()
  }

  getIsRecording() {
    return this.recording
  }
}

// Hijack the canvas and create our RecordThat when we can
let recordThat = null

dw.on("drawEnd", (ctx, cx, cy) => {

  if (recordThat == null) {
    recordThat = new RecordThat(ctx.canvas)
  }
})

setInterval(() => {
  if (recordThat == null) return

  // If I am in combat or have a target then start recording if not recording
  let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
  if (dw.c.combat || target) {
    if (!recordThat.getIsRecording()) {
      recordThat.start()
    }
  }
  else {
    // If I am not in combat and don't have a target then discard recording
    if (recordThat.getIsRecording()) {
      recordThat.discard()
    }
  }
}, 100)

// If I die then stop recording
dw.on("hit", (data) => {

  for (let hit of data) {
    if (hit.rip && hit.target == dw.c.id) {
      if (!recordThat.getIsRecording()) {
        return
      }

      recordThat.stop()
    }
  }
})


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


let skillUsedMap = {}
function getMSSinceSkillUsed(skillBagIndex) {
    if (skillUsedMap[`${skillBagIndex}`] == undefined) {
        skillUsedMap[`${skillBagIndex}`] = new Date()
    }

    return (new Date()).getTime() - (skillUsedMap[`${skillBagIndex}`].getTime())
}

function isSkillReadyOverride(skillBagIndex) {
    let mssince = getMSSinceSkillUsed(skillBagIndex)
    //statusMessage = `cd ${mssince}`

    //console.log('isSkillReadyOverride', dw.c.skills[skillBagIndex].md, mssince, getSkillCooldown(skillBagIndex))

    return mssince > getSkillCooldown(skillBagIndex)
}

let latencyHedge = 100
// function getSkillCooldown(skillName) {
//     return (dw.md.skills[skillName]?.cd ?? dw.constants.GCD_BASE) - latencyHedge
// }
function getSkillCooldown(skillIdx) {
    return dw.c.skills[skillIdx].gcd - latencyHedge
}

let lastSkillMsg = "SKILL"
dw.on("skill", data => {
    lastSkillMsg = data
})

dw.on("gcd", data => {
    for (let i = 0; i < dw.c.skills.length; ++i) {
        let skill = dw.c.skills[i]
        if (!skill) continue
        //if (dw.md.skills[skill.md]) continue
        skillUsedMap[i] = new Date()
    }
})
dw.on("cd", data => {
    skillUsedMap[dw.c.skills.findIndex(s => s?.md == lastSkillMsg)] = new Date()
})
async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
class Stopwatch {
    constructor() {
        let sw = this
        let start = null
        let stop = null
        let isRunning = false
        sw.__defineGetter__("ElapsedMilliseconds", function () {
            return (isRunning ? new Date() : stop) - start
        })
        sw.__defineGetter__("IsRunning", function () {
            return isRunning
        })
        sw.Start = function () {
            if (isRunning)
                return
            start = new Date()
            stop = null
            isRunning = true
        }
        sw.Stop = function () {
            if (!isRunning)
                return
            stop = new Date()
            isRunning = false
        }
        sw.Reset = function () {
            start = isRunning ? new Date() : null
            stop = null
        }
        sw.Restart = function () {
            isRunning = true
            sw.Reset()
        }
    }
}

let targetZoneLevel = dw.getZoneLevel()//dw.c.level

// Manage the zone the bot moves toward
let lastCombat = new Date()
setInterval(function () {
    let now = new Date()

    if (dw.c.combat) {
        lastCombat = new Date()
        return
    }

    if ((now.getTime() - lastCombat.getTime()) > 1000 * 30) {
        targetZoneLevel = Math.max(1, targetZoneLevel - 1)
        lastCombat = new Date()
        dw.log(`Reducing target zone level to '${targetZoneLevel}' because of stale combat`)
    }

    //targetZoneLevel = 45
    targetZoneLevel = dw.c.mission?.item?.qual ?? Math.min(dw.c.level, targetZoneLevel)
}, 1000)

dw.on("hit", (data) => {

    for (let hit of data) {

        if (!hit.dem)
            continue

        let target = dw.findEntities((entity) => entity.id === hit.target).shift()

        if (hit.rip) {
            if (hit.actor == dw.c.id) {
                if (dw.c.hp / dw.c.maxHp > 0.5) {
                    if ((target?.level ?? 0) >= targetZoneLevel) {
                        targetZoneLevel++
                        dw.log(`changing target zone level up to ${targetZoneLevel}`)
                    }
                }
                if (dw.c.hp / dw.c.maxHp < 0.5) {
                    targetZoneLevel--
                    targetZoneLevel = Math.max(1, targetZoneLevel)
                    dw.log(`changing target zone level down to ${targetZoneLevel}`)
                }
            }
        }
    }

    //targetZoneLevel = 45
    targetZoneLevel = dw.c.mission?.item?.qual ?? Math.min(dw.c.level, targetZoneLevel)
})















// Your code here
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
