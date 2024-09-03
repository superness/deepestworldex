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


