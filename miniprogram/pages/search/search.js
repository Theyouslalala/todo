const api = require('../../utils/api')

Page({
  data: { keyword: '', results: [], members: [], searched: false },
  onLoad() { this.loadMembers() },
  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) this.setData({ members: res.data })
  },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  async onSearch() {
    if (!this.data.keyword) return
    const res = await api.todos.search(this.data.keyword, 0)
    if (res && res.data) this.setData({ results: res.data, searched: true })
  },
  onTodoTap(e) { wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.detail.todo._id}` }) }
})
