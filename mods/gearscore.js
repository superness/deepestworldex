
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

    let hpScorePart = (useMaxHp ? dw.c.maxHp : dw.c.hp) + ((dw.c.skills[0].fx?.mpToHpCost == 1) ? (useMaxHp ? dw.c.maxMp : dw.c.mp) : 0)

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
