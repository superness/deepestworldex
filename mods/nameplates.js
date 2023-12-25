setTimeout(() => {
    
    dw.on("drawEnd", (ctx, cx, cy) => {

        ctx.strokeStyle = "green"
        ctx.fillStyle = "white"
        ctx.font = "18px arial"
        let monsters = dw.findEntities((e) => e.ai)
        let camOffsetX = Math.round(cx * 96 - Math.floor(ctx.canvas.width / 2))
        let camOffsetY = Math.round(cy * 96 - Math.floor(ctx.canvas.height / 2))
        let myBattleScore = Math.round(ComputerVision.getMyBattleScore(dw.c, true))
        let myGearScore = Math.round(getMyGearScore(true))
        let nonTraversableEntities = getNonTraversableEntities()
        for (let monster of monsters) {

            let smoothPos = monster.id in entititiesSmoothPosMap ? entititiesSmoothPosMap[monster.id] : monster
            let x2 = smoothPos.x * 96 - camOffsetX
            let y2 = smoothPos.y * 96 - camOffsetY - 110

            let squareWidth2 = gridWidth / gridArrWidth * 96
            let squareHeight2 = gridHeight / gridArrHeight * 96
            if (x2 < -1 * squareWidth2 || x2 > ctx.canvas.width || y2 < -1 * squareHeight2 || y2 > ctx.canvas.height)
                continue

            ctx.fillStyle = `rgb(0, 0, 0, 0.5)`
            ctx.beginPath()
            ctx.rect(x2 - 96 / 2, y2, 96, 8)
            ctx.fill()
            ctx.strokeStyle = "black"
            ctx.fillStyle = "red"
            ctx.beginPath()
            ctx.rect(x2 - 96 / 2, y2, 96 * monster.hp / monster.hpMax, 8)
            ctx.fill()
            ctx.fillStyle = `rgb(255, 255, 255, 0.3)`
            ctx.beginPath()
            ctx.rect(x2 - 96 / 2, y2, 96, 4)
            ctx.fill()
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.rect(x2 - 96 / 2, y2, 96, 8)
            ctx.stroke()
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.lineWidth = 4
            let dmg2 = Math.round(ComputerVision.getMonsterDmg(monster, dw.c))
            let battleScore = Math.round(ComputerVision.getMonsterBattleScore(monster, dw.c))
            let name2 = `\u{1F396}\uFE0F${monster.level} ${monster.md}`
            if (monster.r ?? 0 >= 1) {
                name2 += `\u{1F480}`
                if (monster.r > 1) {
                    name2 += monster.r
                }
            }
            ctx.font = "14px arial"
            ctx.textAlign = "center"
            ctx.strokeText("\u{1F5E1}\uFE0F", x2, y2 - 8 - 20)
            ctx.fillText("\u{1F5E1}\uFE0F", x2, y2 - 8 - 20)
            ctx.fillStyle = "orange"
            ctx.textAlign = "right"
            let textWidth2 = ctx.measureText(dmg2).width
            ctx.strokeText(dmg2, x2 - textWidth2, y2 - 8 - 20)
            ctx.fillText(dmg2, x2 - textWidth2, y2 - 8 - 20)
            ctx.fillStyle = "white"
            if (battleScore < myBattleScore * 0.7) {
                ctx.fillStyle = "white"
            } else if (ComputerVision.isValidTarget(monster, nonTraversableEntities, dw.c, dw.e, targetZoneLevel, nearMonsterUnsafeRadius)) {
                ctx.strokeStyle = "orange"
            } else {
                ctx.strokeStyle = "red"
            }
            ctx.textAlign = "left"
            textWidth2 = ctx.measureText("x").width + 5
            ctx.strokeText(battleScore, x2 + textWidth2, y2 - 8 - 20)
            ctx.fillText(battleScore, x2 + textWidth2, y2 - 8 - 20)
            ctx.font = "18px arial"
            ctx.textAlign = "center"
            ctx.strokeText(name2, x2, y2 - 8)
            ctx.fillText(name2, x2, y2 - 8)
            ctx.lineWidth = 2
            ctx.font = "12px arial"
            ctx.strokeText(monster.hp, x2, y2 + 8)
            ctx.fillText(monster.hp, x2, y2 + 8)
        }
        let otherPlayers = dw.findEntities((e) => e.player && e.id != dw.c.id)
        for (let pc of otherPlayers) {
            let smoothPos = pc.id in entititiesSmoothPosMap ? entititiesSmoothPosMap[pc.id] : pc
            let x2 = smoothPos.x * 96 - camOffsetX
            let y2 = smoothPos.y * 96 - camOffsetY - 120
            let w = 124
            let h = 12
            ctx.fillStyle = `rgb(0, 0, 0, 0.5)`
            ctx.beginPath()
            ctx.rect(x2 - w / 2, y2, w, h)
            ctx.fill()
            ctx.strokeStyle = "black"
            ctx.fillStyle = "blue"
            ctx.beginPath()
            ctx.rect(x2 - w / 2, y2, w * pc.hp / pc.hpMax, h)
            ctx.fill()
            ctx.fillStyle = `rgb(255, 255, 255, 0.3)`
            ctx.beginPath()
            ctx.rect(x2 - w / 2, y2, w, h / 2)
            ctx.fill()
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.rect(x2 - w / 2, y2, w, h)
            ctx.stroke()
            ctx.strokeStyle = "black"
            ctx.fillStyle = "white"
            ctx.lineWidth = 4
            let name2 = `\u{1F396}\uFE0F${pc.level} ${pc.name}`
            ctx.fillStyle = "white"
            ctx.font = "18px arial"
            ctx.textAlign = "center"
            ctx.strokeText(name2, x2, y2 - 8)
            ctx.fillText(name2, x2, y2 - 8)
            ctx.lineWidth = 2
            ctx.font = "12px arial"
            ctx.strokeText(pc.hp, x2, y2 + 8)
            ctx.fillText(pc.hp, x2, y2 + 8)
        }
        let x = ctx.canvas.width / 2
        let y = ctx.canvas.height / 2 - 120
        ctx.fillStyle = `rgb(0, 0, 0, 0.5)`
        let nameplateWidth = 192
        let nameplateHeight = 16
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y, nameplateWidth, nameplateHeight)
        ctx.fill()
        ctx.strokeStyle = "black"
        ctx.fillStyle = "green"
        if (dw.c.hp / dw.c.hpMax < 0.66) {
            ctx.fillStyle = "orange"
        }
        if (dw.c.hp / dw.c.hpMax < 0.33) {
            ctx.fillStyle = "red"
        }
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y, nameplateWidth * dw.c.hp / dw.c.hpMax, nameplateHeight)
        ctx.fill()
        ctx.fillStyle = "rgb(0, 0, 255, 0.6"
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y + 3 * nameplateHeight / 4, nameplateWidth * dw.c.mp / dw.c.mpMax, nameplateHeight / 4)
        ctx.fill()
        ctx.fillStyle = `rgb(255, 255, 255, 0.3)`
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y, nameplateWidth, nameplateHeight / 2)
        ctx.fill()
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y, nameplateWidth, nameplateHeight)
        ctx.stroke()
        ctx.strokeStyle = "black"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.rect(x - nameplateWidth / 2, y, nameplateWidth, nameplateHeight)
        ctx.stroke()
        ctx.strokeStyle = "black"
        ctx.fillStyle = "white"
        ctx.lineWidth = 4
        ctx.font = "12px arial"
        ctx.fillStyle = "white"
        ctx.strokeText(dw.c.hp, x, y + 12)
        ctx.fillText(dw.c.hp, x, y + 12)
        let name = `\u{1F396}\uFE0F${dw.c.level} ${dw.c.name.toLowerCase()}`
        ctx.font = "20px arial"
        ctx.textAlign = "center"
        ctx.strokeText("\u{1F5E1}\uFE0F", x, y - 8 - 30)
        ctx.fillText("\u{1F5E1}\uFE0F", x, y - 8 - 30)
        ctx.font = "16px arial"
        ctx.fillStyle = "orange"
        ctx.textAlign = "right"
        let dmg = ComputerVision.getSkillDamage(dw.c.skills[0])
        let textWidth = ctx.measureText("x").width + 8
        ctx.strokeText(dmg, x - textWidth, y - 8 - 30)
        ctx.fillText(dmg, x - textWidth, y - 8 - 30)
        ctx.fillStyle = "white"
        myBattleScore = Math.round(ComputerVision.getMyBattleScore(dw.c, true))
        ctx.textAlign = "left"
        textWidth = ctx.measureText("x").width + 8
        ctx.strokeText(`${myBattleScore} | ${myGearScore}`, x + textWidth, y - 8 - 30)
        ctx.fillText(`${myBattleScore} | ${myGearScore}`, x + textWidth, y - 8 - 30)
        ctx.font = "24px arial"
        ctx.textAlign = "center"
        ctx.strokeText(name, x, y - 12)
        ctx.fillText(name, x, y - 12)

    })
    dw.on("drawEnd", (ctx, cx, cy) => {

        for (let m of dw.findEntities(e => e.ai)) {
            drawLineToPOI(ctx, cx, cy, { x: m.x + m.dx, y: m.y + m.dy }, "black", m)
        }
    })
}, 200)