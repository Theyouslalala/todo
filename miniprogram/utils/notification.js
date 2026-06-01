const api = require('./api')

const notification = {
  async requestSubscribe(templateId) {
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          if (res[templateId] === 'accept' || res[templateId] === 'acceptWithAlert') {
            api.notifications.updateSubscription({ templateId, count: 1 })
            resolve(true)
          } else {
            resolve(false)
          }
        },
        fail: (err) => {
          console.error('Subscribe failed:', err)
          reject(err)
        }
      })
    })
  },

  async checkSubscription(templateId) {
    const res = await api.notifications.getSubscriptionCount(templateId)
    if (res && res.data) {
      return res.data.count > 0
    }
    return false
  },

  async promptIfNeeded(templateId, threshold = 3) {
    const res = await api.notifications.getSubscriptionCount(templateId)
    if (res && res.data && res.data.count < threshold) {
      wx.showModal({
        title: '订阅次数不足',
        content: '您接收提醒的次数即将用完，是否立即补充？',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.requestSubscribe(templateId)
          }
        }
      })
    }
  }
}

module.exports = notification
