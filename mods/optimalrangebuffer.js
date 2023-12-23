
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
    else if (gearTesting)
        optimalMonsterRangeBuffer = 1
    else if ((dw.c.hp < dw.c.hpMax * 0.8) && dw.c.combat != 1)
        optimalMonsterRangeBuffer = 1
    else
        optimalMonsterRangeBuffer = -0.1
}, 100)