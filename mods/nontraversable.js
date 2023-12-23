
let nonTraversableEntities = []
function updateNonTraversableEntities() {
  nonTraversableEntities = []
  let blockingEntities = dw.findEntities((e) => !e.ai && !e.player && !e.ore && !e.md.includes("portal"))
  let count = blockingEntities.length
  for (let i = 0; i < count; ++i) {
      let e = blockingEntities[i]
      let hitbox = dw.md.items[e.md]?.hitbox ?? { w: 0, h: 0 }
      nonTraversableEntities.push({ x: e.x - hitbox.w / 2, y: e.y - hitbox.h, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x - hitbox.w / 2, y: e.y - hitbox.h / 2, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x, y: e.y - hitbox.h, id: e.id, entity:1 })
      nonTraversableEntities.push({ x: e.x, y: e.y - hitbox.h / 2, id: e.id, entity:1 })
  }
  let chunkPropertyKeys = Object.keys(dw.chunks).filter((k) => k.startsWith(dw.c.l))
  for (let k of chunkPropertyKeys) {
      let l = k.split(".")[0] - 1
      let r = k.split(".")[2]
      let c = k.split(".")[1]
      let oneBelow = `${l}.${c}.${r}`
      for (let i = 0; i < 16; ++i) {
          for (let j = 0; j < 16; ++j) {
              let isHole = dw.chunks[oneBelow] && dw.chunks[oneBelow][0][i][j] < 1
              if (dw.chunks[k][0][i][j] != 0 || isHole) {
                  let x = r * 16 + j
                  let y = c * 16 + i
                  if (x < dw.c.x - gridWidth / 2 || x > dw.c.x + gridWidth / 2 || y < dw.c.y - gridHeight / 2 || y > dw.c.y + gridHeight / 2) {
                      continue
                  }
                  nonTraversableEntities.push({ x: x + 0.5, y: y + 0.5, chunk: 1 })
                  nonTraversableEntities.push({ x: x + terrainThickness / 2, y: y + terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + 1 - terrainThickness / 2, y: y + terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + terrainThickness / 2, y: y + 1 - terrainThickness / 2, chunk: 1 })
                  nonTraversableEntities.push({ x: x + 1 - terrainThickness / 2, y: y + 1 - terrainThickness / 2, chunk: 1 })
              }
          }
      }
  }
}

let nonTraversableEntitiesUpdatePeriod = 500
let lastNonTraversableEntitiesUpdate = new Date()
function getNonTraversableEntities() {
  let now = new Date()
  let mssince = now.getTime() - lastNonTraversableEntitiesUpdate.getTime()
  if(mssince > nonTraversableEntitiesUpdatePeriod) {
      updateNonTraversableEntities()
      lastNonTraversableEntitiesUpdate = now
  }
  return nonTraversableEntities
}