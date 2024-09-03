

setInterval(() => {
    if (dw.c.skills[0].fx?.blink) {
        nearMonsterUnsafeRadius = scaryMonsterRadius
    }
    else {
        nearMonsterUnsafeRadius = 1.3
    }
}, 1000)