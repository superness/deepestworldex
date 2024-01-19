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