
// xp tracker
const limitMinutes = 180

function formatRemainingDuration(durationInSeconds) {
    const secondsInMinute = 60
    const secondsInHour = secondsInMinute * 60
    const secondsInDay = secondsInHour * 24

    const days = Math.floor(durationInSeconds / secondsInDay)
    const hours = Math.floor((durationInSeconds % secondsInDay) / secondsInHour)
    const minutes = Math.floor((durationInSeconds % secondsInHour) / secondsInMinute)
    const seconds = durationInSeconds % secondsInMinute

    let formattedDuration = ''
    if (days > 0) {
        formattedDuration += `${days} day${days > 1 ? 's' : ''}, `
    }

    if (hours > 0) {
        formattedDuration += `${hours} hour${hours > 1 ? 's' : ''}, `
    }

    if (minutes > 0) {
        formattedDuration += `${minutes} minute${minutes > 1 ? 's' : ''}, `
    }

    if (seconds > 0 || formattedDuration === '') {
        formattedDuration += `${seconds} second${seconds !== 1 ? 's' : ''}`
    }

    return formattedDuration
}

cache.set(cache.get('xpTracker') ?? [0])
setInterval(() => {
    const xp = cache.get('xpTracker') ?? [0]
    xp.push(dw.c.xp)
    while (xp.length > limitMinutes) xp.shift()
    cache.set('xpTracker', xp)
}, 60 * 1000)

dw.on('levelUp', () => {
    cache.set('xpTracker', [0])
})

dw.on('drawEnd', (ctx) => {
    const deviceWidth = ctx.canvas.width//parent.window.innerWidth

    const xp = cache.get('xpTracker') ?? [0]
    const max = Math.floor(1500 * Math.pow(1.1, dw.c.level - 1))

    ctx.lineWidth = 1
    ctx.strokeStyle = '#636363'
    ctx.fillStyle = '#151515'

    const border = 2
    ctx.beginPath()
    ctx.rect(deviceWidth - xp.length * 2 - 16 - border, 64 - border, xp.length * 2 + border * 2, 64 + border * 2)
    ctx.stroke()
    ctx.fill()

    ctx.fillStyle = '#00FF00'

    for (let i = 1; i <= xp.length; i++) {
        const value = Math.floor(xp[xp.length - i] / max * 64)
        ctx.beginPath()
        ctx.rect(deviceWidth - 16 - 2 * i, 128 - value, 2, value)
        ctx.fill()
    }

    const xpPerHour = Math.floor(Math.max(0, xp[xp.length - 1] - xp[0]) / xp.length * 60)

    ctx.lineWidth = 3
    ctx.fillStyle = '#FFFFFF'
    ctx.strokeStyle = '#000000'
    ctx.textAlign = "center"
    ctx.font = "16px system-ui"
    ctx.textAlign = "right"
    let text = `XP/h: ${xpPerHour.toLocaleString()}`
    ctx.strokeText(text, deviceWidth - 16, 150)
    ctx.fillText(text, deviceWidth - 16, 150)

    if (xpPerHour > 0) {
        text = `${formatRemainingDuration(Math.ceil((max - dw.c.xp) / xpPerHour * 3600))} to level up`
        ctx.strokeText(text, deviceWidth - 16, 174)
        ctx.fillText(text, deviceWidth - 16, 174)
    }
})
