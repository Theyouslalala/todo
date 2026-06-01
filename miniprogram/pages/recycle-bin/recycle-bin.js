const api = require('../../utils/api')
Page({
  data: { deletedTodos: [] },
  onLoad() { this.loadDeleted() },
  async loadDeleted() {
    const res = await api.todos.getDeleted()
    if (res && res.data) {
      const deletedTodos = res.data.map(t => ({ ...t, deletedAtStr: t.deletedAt ? new Date(t.deletedAt).toLocaleString() : '' }))
      this.setData({ deletedTodos })
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
          await api.todos.permanentDelete(e.currentTarget.dataset.id)
          this.loadDeleted()
        }
      }
    })
  }
})