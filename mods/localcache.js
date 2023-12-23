class LocalCache {
    valueCache = {}
    constructor() {
        this.cachedValues = {}
    }
    get(key) {
        if (this.valueCache[key] == undefined) {
            console.log('adding to local cache', key, this.valueCache, this.valueCache[key], dw.get(key))
            this.valueCache[key] = dw.get(key) ?? null
        }
        return this.valueCache[key]
    }
    set(key, value) {
        console.log('setting cache value', key, value)
        this.valueCache[key] = value
        dw.set(key, value)
    }
}

let cache = new LocalCache()