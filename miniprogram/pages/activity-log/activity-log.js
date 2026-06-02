const api = require('../../utils/api')

Page({
  data: { logs: [], loading: true },
  onLoad() { this.loadLogs() },
  async loadLogs() {
    this.setData({ loading: true })
    try {
      const res = await api.activityLogs.getLogs(0)
      if (res && res.data) {
        const logs = res.data.map(log => ({ ...log, createdAtStr: log.createdAt ? new Date(log.createdAt).toLocaleString() : '' }))
        this.setData({ logs })
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  }
})
