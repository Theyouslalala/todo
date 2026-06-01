const image = {
  async compress(filePath, maxWidth = 800, quality = 80) {
    return new Promise((resolve) => {
      wx.compressImage({
        src: filePath,
        quality,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => {
          console.warn('Image compress failed, using original:', err)
          resolve(filePath)
        }
      })
    })
  },

  async upload(filePath) {
    const compressed = await this.compress(filePath)
    const ext = compressed.split('.').pop()
    const cloudPath = `todo-images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    try {
      const res = await wx.cloud.uploadFile({ cloudPath, filePath: compressed })
      return res.fileID
    } catch (err) {
      console.error('Upload failed:', err)
      wx.showToast({ title: '图片上传失败', icon: 'none' })
      return null
    }
  },

  async chooseAndUpload() {
    return new Promise((resolve) => {
      wx.chooseImage({
        count: 3,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const fileIDs = []
          for (const path of res.tempFilePaths) {
            const fileID = await this.upload(path)
            if (fileID) fileIDs.push(fileID)
          }
          resolve(fileIDs)
        },
        fail: () => resolve([])
      })
    })
  }
}

module.exports = image
