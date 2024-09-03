
// Tile and loot logging
const baseUrl = 'https://dw.kvn.wtf'
const seenChunks = new Map()
const textEncoder = new TextEncoder()

dw.on('seenChunks', (chunks) => Promise.allSettled(
    Object.entries(chunks).map(async ([chunkName, chunk]) => {
        const buffer = await crypto.subtle.digest('SHA-1', textEncoder.encode(JSON.stringify(chunk)))
        const array = Array.from(new Uint8Array(buffer))
        const hash = array.map((byte) => byte.toString(16).padStart(2, '0')).join('')

        if ((seenChunks.get(chunkName) ?? '') === hash) {
            return
        }

        seenChunks.set(chunkName, hash)

        await fetch(
            `${baseUrl}/log/chunk?name=${encodeURIComponent(chunkName)}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk)
            }
        )
    })
))

dw.on('loot', (entries) => Promise.allSettled(
    entries.map(async (entry) => {
        if (!entry.item.mods) {
            return
        }

        const item = { ...entry.item }
        delete item.n

        await fetch(
            `${baseUrl}/log/loot`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item)
            }
        )
    })
))
