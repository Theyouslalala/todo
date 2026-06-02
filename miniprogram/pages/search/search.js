const api = require('../../utils/api')

Page({
  data: { keyword: '', results: [], members: [], searched: false, searching: false },
  onLoad() { this.loadMembers() },
  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) this.setData({ members: res.data })
  },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  async onSearch() {
    if (!this.data.keyword) return
    this.setData({ searching: true })
    try {
      const res = await api.todos.search(this.data.keyword, 0)
      if (res && res.data) this.setData({ results: res.data, searched: true })
    } catch (e) {
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      this.setData({ searching: false })
    }
  },
  onTodoTap(e) { wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.detail.todo._id}` }) },
  async onTodoComplete(e) {
    const { todoId } = e.detail
    const res = await api.todos.complete(todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已完成', icon: 'success' })
      this.onSearch()
    }
  },
  onTodoDelete(e) {
    const { todoId } = e.detail
    wx.showModal({
      title: '确认删除', content: '删除后可在回收站恢复',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.todos.delete(todoId)
          if (result && result.code === 0) {
            wx.showToast({ title: '已删除', icon: 'success' })
            this.onSearch()
          }
        }
      }
    })
  }
})
