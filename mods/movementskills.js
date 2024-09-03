
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