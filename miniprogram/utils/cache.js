const CACHE_PREFIX = 'family_todo_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

const cache = {
  async set(key, data) {
    const cacheData = { data, timestamp: Date.now(), expiry: CACHE_EXPIRY }
    return new Promise((resolve, reject) => {
      wx.setStorage({
        key: CACHE_PREFIX + key,
        data: cacheData,
        success: () => resolve(),
        fail: (e) => {
          console.error('Cache set error:', e)
          reject(e)
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
          if (!cacheData) {
            resolve(null)
            return
          }
          if (Date.now() - cacheData.timestamp > cacheData.expiry) {
            this.remove(key)
            resolve(null)
            return
          }
          resolve(cacheData.data)
        },
        fail: (e) => {
          console.error('Cache get error:', e)
          resolve(null)
        }
      })
    })
  },

  async remove(key) {
    return new Promise((resolve) => {
      wx.removeStorage({
        key: CACHE_PREFIX + key,
        success: () => resolve(),
        fail: (e) => {
          console.error('Cache remove error:', e)
          resolve()
        }
      })
    })
  },

  async clear() {
    return new Promise((resolve) => {
      wx.getStorageInfo({
        success: (res) => {
          const keysToRemove = res.keys.filter(key => key.startsWith(CACHE_PREFIX))
          const removePromises = keysToRemove.map(key => {
            return new Promise((res) => {
              wx.removeStorage({
                key,
                success: () => res(),
                fail: () => res()
              })
            })
          })
          Promise.all(removePromises).then(() => resolve())
        },
        fail: (e) => {
          console.error('Cache clear error:', e)
          resolve()
        }
      })
    })
  }
}

module.exports = cache
