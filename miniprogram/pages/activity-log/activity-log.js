const api = require('../../utils/api')
Page({
  data: { logs: [] },
  onLoad() { this.loadLogs() },
  async loadLogs() {
    const res = await api.activityLogs.getLogs(0)
    if (res && res.data) {
      const logs = res.data.map(log => ({ ...log, createdAtStr: log.createdAt ? new Date(log.createdAt).toLocaleString() : '' }))
      this.setData({ logs })
    }
  }
})