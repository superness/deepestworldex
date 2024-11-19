
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