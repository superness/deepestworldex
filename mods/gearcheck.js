

// let forDisenchantList = [];
// async function cleanBag() {
//     //if (forDisenchantList.length < 0)
//     return;

//     // for (let i of forDisenchantList) {
//     //     console.log("deleteItem", { i: i });
//     //     dw.emit("deleteItem", { i: i });
//     // }
//     // forDisenchantList = [];

//     // return
    

//     let enchantingDevice = dw.findEntities((e) => e.owner && e.md.includes("enchantingDevice") && dw.distance(e, dw.c) < 2).shift();
//     if (enchantingDevice) {
//         if (forDisenchantList.length < 0)
//             return;
//         if (dw.distance(enchantingDevice, dw.c) > 2) {
//             moveToSpot = enchantingDevice;
//             return;
//         }
//         for (let i of forDisenchantList) {
//             if (!dw.c.bag[i]) continue
//             if (dw.c.bag[i].r == 0) {
//                 console.log("deleteItem", { i: i });
//                 dw.emit("deleteItem", { i: i });
//             }
//             else {
//                 console.log("sacItem", { id: enchantingDevice.id, i });
//                 dw.emit("sacItem", { id: enchantingDevice.id, i });
//             }
//             await sleep(20)
//         }
//         forDisenchantList = [];
//         cache.set('forDisenchantList', forDisenchantList)
//     }
//     await sleep(500)
//     cleanBag()
// }
// cleanBag()


let gearItemTypes = ["boomerang", /*"shield", */"scepter", "axe", "boots", "bow", "chest", "dagger", "gloves", "helmet", "mace", "pickaxe", "spear", "staff", "sword", "wand", "ring", "amulet", "belt"];
let gemItemTypes = ["amethyst", "sapphire", "ruby", "diamond", "emerald", "topaz"]
let skillItemTypes = ["physbolt", "attack", "bolt"]
let deleteItemTypes = ["taunt", "dash", "heal", "charge", "shield"]

 let gearTesting = false;

let gearChangeCD = 500

async function tryoutFoundGear() {

    if (gearTesting) return

    console.log("gonnna try gear");
    if (!dw.c.combat) {
        moveToSpot = dw.c;
        console.log("gear no combat lets wait to double confirm");
        gearTesting = true;
        await new Promise((r) => setTimeout(r, 10000));
        if (dw.c.combat) {
            console.log("oops we pulled");
            gearTesting = false;
        }
    }
    let inARow = 0;
    while (gearTesting) {
        let currentScore = getMyGearScore(true);
        await tryGearLoop();
        let newScore = getMyGearScore(true);
        if (currentScore == newScore) {
            ++inARow;
        } else {
            inARow = 0;
        }
        console.log("in a row", inARow, currentScore, newScore);
        if (inARow == 2) {
            console.log("two in a row - gear is solved!");
            for (let i = 0; i < dw.c.bag.length - 8; ++i) {
                if (forDisenchantList.includes(i))
                    continue;
                let item = dw.c.bag[i];

                if (!item) continue

                if (item.md.toLowerCase().includes('steel') && item.level >= 50) continue
                if (item.md.toLowerCase().includes('diamond') && item.level >= 50) continue

                if (deleteItemTypes.filter(t => item && item.md && item.md.toLowerCase().includes(t)).length > 0) {
                    console.log("disenchant", i, item);

                    forDisenchantList.push(i)
                    console.log(forDisenchantList);
                    cache.set('forDisenchantList', forDisenchantList)
                }
                else if (gearItemTypes.filter((t) => item && item.md && item.md.toLowerCase().includes(t)).length > 0 ||
                    gemItemTypes.filter((t) => item && item.md && item.md.toLowerCase().includes(t)).length > 0 ||
                    skillItemTypes.filter((t) => item && item.md && item.md.toLowerCase().includes(t)).length > 0) {

                    console.log("disenchant", i, item);

                    forDisenchantList.push(i);
                    console.log(forDisenchantList);
                    cache.set('forDisenchantList', forDisenchantList)
                }
            }
            break;
        }
    }
    gearTesting = false;
    console.log("waiting 180000");
    await new Promise((r) => setTimeout(r, 180000));
    //console.log("trying the gear again");
    //tryoutFoundGear();
    cache.set('forDisenchantList', forDisenchantList)

    async function tryGearLoop() {
        console.log(forDisenchantList)
        for (let i = 0; i < dw.c.bag.length; ++i) {
            if (forDisenchantList.includes(i))
                continue;
            if (dw.c.combat) {
                gearTesting = false;
                continue;
            }
            let item = dw.c.bag[i];
            if (!item || !item.md)
                continue;

            let matchingTypes = gearItemTypes.filter((t) => item.md.toLowerCase().includes(t));
            if (matchingTypes.length > 0) {
                console.log("trying item", i, item, matchingTypes);
                await tryoutItem(i, item);
            }
            let matchingGemTypes = gemItemTypes.filter((t) => item.md.toLowerCase().includes(t));
            if (matchingGemTypes.length > 0 && !item.md.toLowerCase().includes("ring") && !item.md.toLowerCase().includes("amulet")) {
                console.log("trying gem", i, item, matchingGemTypes);
                await tryoutGem(i);
                await sleep(gearChangeCD);
            }
            let matchingSkillTypes = skillItemTypes.filter((t) => item.md.toLowerCase().includes(t));
            if (matchingSkillTypes.length > 0) {
                console.log("trying skill", i, item);
                await tryoutSkill(i);
                await sleep(gearChangeCD);
            }
        }
    }
}
let skillTestSlot = 0;
async function tryoutSkill(i) {
    let currentBattleScore = getMyGearScore(true);
    console.log("trying skill in index", i);
    dw.moveItem("bag", i, "skillBag", skillTestSlot);
    await sleep(gearChangeCD);
    let newBattleScore = getMyGearScore(true);
    console.log(currentBattleScore, " -> ", newBattleScore);
    if (newBattleScore > currentBattleScore) {
        console.log('keeping skill because it is better')
        currentBattleScore = newBattleScore;
        return;
    }
    console.log('putting it back because it was worse')
    dw.moveItem("skillBag", skillTestSlot, "bag", i);
}
async function tryoutGem(i) {
    let currentBattleScore = getMyGearScore(true);
    for (let index = 0; index < dw.c.cardBag.length; ++index) {
        try {
            console.log("trying gem in index", i, index);
            dw.moveItem("bag", i, "cardBag", index);
            await sleep(250);
            let newBattleScore = getMyGearScore(true);
            console.log(currentBattleScore, " -> ", newBattleScore);
            if (newBattleScore > currentBattleScore) {
                currentBattleScore = newBattleScore;
                console.log('gem was better so I am keeping it')
                continue;
            }
            console.log('putting that gem back where it was')
            dw.moveItem("bag", i, "cardBag", index);
        } catch (e) {
            console.log("exception in tryoutGemInIndex", e);
        }
    }
}
async function tryoutItem(i, item) {
    if (item.r == 0) return

    let currentBattleScore = getMyGearScore(true)
    dw.emit("equip", { i })
    await sleep(gearChangeCD)
    let newBattleScore = getMyGearScore(true)
    console.log(currentBattleScore, " -> ", newBattleScore)
    if (newBattleScore > currentBattleScore)
        return;
    dw.emit("equip", { i })
    await sleep(gearChangeCD)
    if (item.md.toLowerCase().includes("ring")) {
        currentBattleScore = getMyGearScore(true)
        dw.emit("equip", { slot: "ring2", i })
        await sleep(gearChangeCD)
        newBattleScore = getMyGearScore(true)
        console.log(currentBattleScore, " -> ", newBattleScore)
        if (newBattleScore > currentBattleScore)
            return;
        dw.emit("equip", { slot: "ring2", i })
        await sleep(gearChangeCD)
    }
}

setTimeout(() => {
    addMenuContextMenuButton('Sort', e => {
        tryoutFoundGear()
    })
}, 100)