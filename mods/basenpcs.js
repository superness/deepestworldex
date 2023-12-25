// let npcSpots = {
//     'ayy': {x:599.9, y:339.6, z:0},
//     'vampire': {x:600, y:335.2, z:0},
//     'orc': {x:603, y:335.2, z:0},
//     'madmouse': {x:602.8, y:339.6, z:0},
// }

// setTimeout(() => {
//     FauxNPCs.addNPC('ayy', npcSpots.ayy.x, npcSpots.ayy.y, npcSpots.ayy.z, () => {console.log('click ayyylien'); Dialogs.ShowDialog('ayy');})
//     FauxNPCs.addNPC('vampire', npcSpots.vampire.x, npcSpots.vampire.y, npcSpots.vampire.z, () => {console.log('click vampire'); Dialogs.ShowDialog('vampire'); })
//     FauxNPCs.addNPC('orc', npcSpots.orc.x, npcSpots.orc.y, npcSpots.orc.z, () => {console.log('click orc'); Dialogs.ShowDialog('orc'); })
//     FauxNPCs.addNPC('madmouse', npcSpots.madmouse.x, npcSpots.madmouse.y, npcSpots.madmouse.z, () => {console.log('click mouse');disenchanter()})

//     Dialogs.AddDialog('vampire', npcSpots.vampire.x + 0.3, npcSpots.vampire.y - 0.5, 'Curate', gearCurator)
//     Dialogs.HideDialog('vampire')

//     Dialogs.AddDialog('ayy', npcSpots.ayy.x + 0.3, npcSpots.ayy.y - 0.5, 'Take junk', materialCollector)
//     Dialogs.HideDialog('ayy')

//     Dialogs.AddDialog('orc', npcSpots.orc.x + 0.3, npcSpots.orc.y - 0.5, 'Take materials', temporalStorage)
//     Dialogs.HideDialog('orc')
// }, 100)


setTimeout( () => {
    addMenuContextMenuButton('+vamp', (e) => {
        FauxNPCs.addNPC('vampire', dw.c.x, dw.c.y, dw.c.z)
        Dialogs.AddDialog('vampire', dw.c.x + 0.3, dw.c.y - 0.5, 'Curate', gearCurator)
        Dialogs.HideDialog('vampire')
    })
    addMenuContextMenuButton('+orc', (e) => {
        FauxNPCs.addNPC('orc', dw.c.x, dw.c.y, dw.c.z)
    
        Dialogs.AddDialog('orc', dw.c.x + 0.3, dw.c.y - 0.5, 'Take materials', materialCollector)
        Dialogs.HideDialog('orc')
    })
    addMenuContextMenuButton('+ayy', (e) => {
        FauxNPCs.addNPC('ayy', dw.c.x, dw.c.y, dw.c.z)
    
        Dialogs.AddDialog('ayy', dw.c.x + 0.3, dw.c.y - 0.5, 'Take junk', junkCollector)
        Dialogs.HideDialog('ayy')
    })
    // addMenuContextMenuButton('+madmouse', (e) => {
    //     FauxNPCs.addNPC('madmouse', dw.c.x, dw.c.y, dw.c.z)
    // })

    // If any npcs loaded from local storage then reconnect their callbacks
    if(npcs.vampire) {
        Dialogs.AddDialog('vampire', npcs.vampire.x + 0.3, npcs.vampire.y - 0.5, 'Curate', gearCurator)
        npcs.vampire.callback = () => Dialogs.ShowDialog('vampire')
    }
    if(npcs.orc) {
        Dialogs.AddDialog('orc', npcs.orc.x + 0.3, npcs.orc.y - 0.5, 'Take materials', materialCollector)
        npcs.orc.callback = () => Dialogs.ShowDialog('orc')
    }
    if(npcs.ayy) {
        Dialogs.AddDialog('ayy', npcs.ayy.x + 0.3, npcs.ayy.y - 0.5, 'Take junk', junkCollector)
        npcs.ayy.callback = () => Dialogs.ShowDialog('ayy')
    }
}, 100)



async function gearCurator() {

    for(let e of dw.e) {
        if(e.storage && e.storage.length) {
            for(let i of e.storage) {
                if(!i) continue

                updateItemInCache(i)
            }
        }
    }

    for(let i of dw.c.bag) {
        if(!i) continue

        updateItemInCache(i)
    }
    
    let idx = -1
    for(let i of dw.c.bag) {
        idx++

        if(!i) continue

        if(getIsItemInGearCache(i)) {
            // find a nearby chest to send the item to
            let closestStorage = 
                dw.e.filter(e => 
                    e.storage && 
                    (e.storage.length && e.storage.some(i => !i)) && 
                    e.md.match('(.*)box(.*)') && 
                    e.md.match('(.*)box(.*)')[2])
                        .sort((a,b) => {return dw.distance(dw.c, a) - dw.distance(dw.c, b)}).shift()

            if(!closestStorage) continue

            dw.moveItem('bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            await sleep(100)
        }
    }

    let nearbyBoxes = dw.e.filter(e => 
        e.storage && 
        e.storage.length && 
        e.md.match('(.*)box(.*)') && 
        e.md.match('(.*)box(.*)')[2] &&
        dw.distance(dw.c, e) < 3)

    for(let box of nearbyBoxes) {
        idx = -1
        for(let i of box.storage) {
            ++idx
            if(!i) continue

            if(!getIsItemInGearCache(i)) {
                dw.moveItem('storage', idx, 'bag', dw.c.bag.findIndex(i => i == null), box.id, null, null)
                await sleep(100)
            }
        }
    }

    // look in the book box 
    // update the gear cache for every item in there
    // look in the player's inventory
    // update the gear cache for every item in there
    // take item from the player's inventory that should be in the gear cache
    // give the player items in the gear cache chests that don't belong there
}

async function materialCollector() {

    for(let e of dw.e) {
        if(e.storage && e.storage.length) {
            for(let i of e.storage) {
                if(!i) continue

                updateItemInCache(i)
            }
        }
    }

    for(let i of dw.c.bag) {
        if(!i) continue

        updateItemInCache(i)
    }

    let idx = -1
    for(let item of dw.c.bag) {
        ++idx
        if(!item) continue
        //console.log('temp storage', getDoesMatchAnyGearSetFilter(item), getIsItemInGearCache(item))
        if(getDoesMatchAnyGearSetFilter(item) && !getIsItemInGearCache(item)) {
            let closestStorage = 
                dw.e.filter(e => 
                    e.storage && 
                    (e.storage.length && e.storage.some(i => !i)) && 
                    e.md.match('(.*)box(.*)') && 
                    e.md.match('(.*)box(.*)')[2])
                        .sort((a,b) => {return dw.distance(dw.c, a) - dw.distance(dw.c, b)}).shift()

            if(!closestStorage) continue

            //console.log(closestStorage)
            //console.log('moving item', 'bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            dw.moveItem('bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            await sleep(100)
        }
    }
    
    idx = -1
    for(let item of dw.c.bag) {
        ++idx
        if(!item) continue
        //console.log('temp storage', getDoesMatchAnyGearSetFilter(item), getIsItemInGearCache(item))
        if(dw.md.items[item.md]?.mat || dw.md.items[item.md]?.s) {
            let closestStorage = 
                dw.e.filter(e => 
                    e.storage && 
                    (e.storage.length && e.storage.some(i => !i)) && 
                    e.md.match('(.*)box(.*)') && 
                    e.md.match('(.*)box(.*)')[2])
                        .sort((a,b) => {return dw.distance(dw.c, a) - dw.distance(dw.c, b)}).shift()

            if(!closestStorage) continue

            //console.log(closestStorage)
            //console.log('moving item', 'bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            dw.moveItem('bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            await sleep(100)
        }
    }
    
    let nearbyBoxes = dw.e.filter(e => 
        e.storage && 
        e.storage.length && 
        e.md.match('(.*)box(.*)') && 
        e.md.match('(.*)box(.*)')[2] &&
        dw.distance(dw.c, e) < 3)

    for(let box of nearbyBoxes) {
        idx = -1
        for(let i of box.storage) {
            ++idx
            if(!i) continue

            if(getIsItemInGearCache(i)) {
                dw.moveItem('storage', idx, 'bag', dw.c.bag.findIndex(i => i == null), box.id, null, null)
                await sleep(100)
            }
        }
    }


    // look in the player's inventory
    // take any items that could match a filter in the cache but is not in the gear cache
    // give the player any items in these chests that should be in the gear cache
}

function disenchanter() {
    // look in the player's inventory
    // mark items for disenchanting that do not match a gear set filter and are not material
    // disenchant any items tagged for disenchantment
}

async function junkCollector() {

    for(let e of dw.e) {
        if(e.storage && e.storage.length) {
            for(let i of e.storage) {
                if(!i) continue

                updateItemInCache(i)
            }
        }
    }

    for(let i of dw.c.bag) {
        if(!i) continue

        updateItemInCache(i)
    }
    
    let idx = -1
    for(let item of dw.c.bag) {
        ++idx
        if(!item) continue
        if(!getDoesMatchAnyGearSetFilter(item) && !dw.md.items[item.md]?.mat && !dw.md.items[item.md]?.s) {
            let closestStorage = 
                dw.e.filter(e => 
                    e.storage && 
                    (e.storage.length && e.storage.some(i => !i)) && 
                    e.md.match('(.*)box(.*)') && 
                    e.md.match('(.*)box(.*)')[2])
                        .sort((a,b) => {return dw.distance(dw.c, a) - dw.distance(dw.c, b)}).shift()

            if(!closestStorage) continue

            //console.log(closestStorage)
            //console.log('moving item', 'bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            dw.moveItem('bag', idx, 'storage', closestStorage.storage.findIndex(i => i == null), null, closestStorage.id, null)
            await sleep(100)
        }
    }

    let nearbyBoxes = dw.e.filter(e => 
        e.storage && 
        e.storage.length && 
        e.md.match('(.*)box(.*)') && 
        e.md.match('(.*)box(.*)')[2] &&
        dw.distance(dw.c, e) < 3)

    for(let box of nearbyBoxes) {
        idx = -1
        for(let i of box.storage) {
            ++idx
            if(!i) continue

            //console.log(i, dw.md.items[i.md])
            if(getIsItemInGearCache(i) || dw.md.items[i.md]?.mat || dw.md.items[i.md]?.s) {
                dw.moveItem('storage', idx, 'bag', dw.c.bag.findIndex(i => i == null), box.id, null, null)
                await sleep(100)
            }
        }
    }

    // look in the player's inventory
    // take any materials
    // give the player any items in these chests that should be in the gear cache
}
