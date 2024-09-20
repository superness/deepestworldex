
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

        let dmg = 10 * Math.pow(1.1, monster.level) + 5 * monster.level
        if (monster.r ?? 0 > 1) {
            let rUse = monster.r
            if ((c.mission?.item.r ?? 0) > 0) {
                rUse += c.mission.item.r
            }
            dmg *= 1 + rUse * 0.5
        }

        let finalDmg = Math.max(1, (dmg * (monster.md.includes('Pow') ? 1.25 : 1))) * 1.1
        
        if(monster.md.toLowerCase().includes('king'))
        {
            finalDmg *= 4
        }
        if(monster.md.toLowerCase().includes('bouncy'))
        {
            finalDmg *= 2
        }
        // if(monster.md.toLowerCase().includes('elemental'))
        // {
        //     finalDmg *= 1.3
        // }
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

        return finalDmg - ((c.stats.hpRegen))
    }

    static getMonsterDmgReduction() {
        return 0.9
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

        let potentialScore = (ComputerVision.getSkillDamage(c.skills[0]) - c.skills[0].cost) * hpScorePart
        let maxTargetLife = ComputerVision.getMaxDamageDealtBeforeOom(c)
        let maxDmgScore = maxTargetLife * (ComputerVision.getSkillDamage(c.skills[0]) - c.skills[0].cost)
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
        let target = dw.findEntities((entity) => entity.id === dw.targetId).shift()
        ctx.lineWidth = 4
        if (moveToSpot) {
            drawLineToPOI(ctx, cx, cy, moveToSpot, `rgb(0, 255, 0, 0.9`)
            drawLineToPOI(ctx, cx, cy, movingToSpot, `rgb(231, 0, 255, 0.9)`)
        }
        drawLineToPOI(ctx, cx, cy, target, `rgb(245, 239, 66, 0.9)`, { x: dw.c.x, y: dw.c.y - 0.5 })

        let monstersTargettingMe = dw.findEntities(e => e.targetId && e.targetId == dw.c.id)
        for (var monster of monstersTargettingMe) {
            drawLineToPOI(ctx, cx, cy, dw.c, 'white', { x: monster.x, y: monster.y - 0.5 })
        }
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
