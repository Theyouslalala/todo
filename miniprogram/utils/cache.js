const CACHE_PREFIX = 'family_todo_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

const cache = {
  set(key, data) {
    const cacheData = { data, timestamp: Date.now(), expiry: CACHE_EXPIRY }
    try {
      wx.setStorageSync(CACHE_PREFIX + key, cacheData)
    } catch (e) {
      console.error('Cache set error:', e)
    }
  },

  get(key) {
    try {
      const cacheData = wx.getStorageSync(CACHE_PREFIX + key)
      if (!cacheData) return null
      if (Date.now() - cacheData.timestamp > cacheData.expiry) {
        this.remove(key)
        return null
      }
      return cacheData.data
    } catch (e) {
      console.error('Cache get error:', e)
      return null
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(CACHE_PREFIX + key)
    } catch (e) {
      console.error('Cache remove error:', e)
    }
  },

  clear() {
    try {
      const res = wx.getStorageInfoSync()
      res.keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          wx.removeStorageSync(key)
        }
      })
    } catch (e) {
      console.error('Cache clear error:', e)
    }
  }
}

module.exports = cache
