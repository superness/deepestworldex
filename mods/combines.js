setInterval(async () => {

    // move any items in my bag that is stackable and is not in the bottom row
    // combine the bottom row

    let idx = -1
    for(let item of dw.c.bag) {
        ++idx
        if(!item) continue

        console.log('try combine', item, idx)

        if(dw.md.items[item.md].s && idx < 32) {
            let openIdx = dw.c.bag.findLastIndex(i => i == null)
            dw.moveItem('bag', idx, 'bag', openIdx)
            await sleep(100)
        }
    }
    dw.combine()

}, 5000)