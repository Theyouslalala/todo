const api = require('../../utils/api')

Page({
  data: { deletedTodos: [], loading: true },
  onLoad() { this.loadDeleted() },
  async loadDeleted() {
    this.setData({ loading: true })
    try {
      const res = await api.todos.getDeleted()
      if (res && res.data) {
        const deletedTodos = res.data.map(t => ({ ...t, deletedAtStr: t.deletedAt ? new Date(t.deletedAt).toLocaleString() : '' }))
        this.setData({ deletedTodos })
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
    }
  },
  async onRestore(e) {
    const id = e.currentTarget.dataset.id
    const res = await api.todos.restore(id)
    if (res && res.code === 0) { wx.showToast({ title: '已恢复', icon: 'success' }); this.loadDeleted() }
  },
  async onPermanentDelete(e) {
    wx.showModal({
      title: '彻底删除', content: '此操作不可恢复，确定删除？',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.todos.permanentDelete(e.currentTarget.dataset.id)
          if (result && result.code === 0) {
            wx.showToast({ title: '已彻底删除', icon: 'success' })
          }
          this.loadDeleted()
        }
      }
    })
  }
})
