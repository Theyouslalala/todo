const CACHE_PREFIX = 'family_todo_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

const cache = {
  async set(key, data) {
    const cacheData = { data, timestamp: Date.now(), expiry: CACHE_EXPIRY }
    return new Promise((resolve) => {
      wx.setStorage({
        key: CACHE_PREFIX + key,
        data: cacheData,
        success: () => resolve(),
        fail: (e) => {
          console.error('Cache set error:', e)
          resolve()
        }
      })
    })
  },

  async get(key) {
    return new Promise((resolve) => {
      wx.getStorage({
        key: CACHE_PREFIX + key,
        success: (res) => {
          const cacheData = res.data
          if (!cacheData) { resolve(null); return }
          if (Date.now() - cacheData.timestamp > cacheData.expiry) {
            this.remove(key)
            resolve(null)
            return
          }
          resolve(cacheData.data)
        },
        fail: () => resolve(null)
      })
    })
  },

  async remove(key) {
    return new Promise((resolve) => {
      wx.removeStorage({
        key: CACHE_PREFIX + key,
        success: () => resolve(),
        fail: () => resolve()
      })
    })
  },

  async clear() {
    try {
      const info = await new Promise((resolve, reject) => {
        wx.getStorageInfo({ success: resolve, fail: reject })
      })
      const keysToRemove = info.keys.filter(key => key.startsWith(CACHE_PREFIX))
      await Promise.all(keysToRemove.map(key =>
        new Promise(resolve => wx.removeStorage({ key, success: resolve, fail: resolve }))
      ))
    } catch (e) {
      console.error('Cache clear error:', e)
    }
  }
}

module.exports = cache
