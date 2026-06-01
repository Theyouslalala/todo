const api = require('../../utils/api')
const cache = require('../../utils/cache')

Page({
  data: {
    todos: [],
    members: [],
    currentCategory: 'all',
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadTodos()
  },

  onPullDownRefresh() {
    this.loadTodos().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    const memberRes = await api.users.getFamilyMembers()
    if (memberRes && memberRes.data) {
      this.setData({ members: memberRes.data })
    }
    await this.loadTodos()
  },

  async loadTodos() {
    this.setData({ loading: true })
    const category = this.data.currentCategory

    let res
    if (category === 'all') {
      res = await api.todos.getToday()
    } else {
      res = await api.todos.getToday()
      if (res && res.data) {
        res.data = res.data.filter(t => t.category === category)
      }
    }

    if (res && res.data) {
      this.setData({ todos: res.data, loading: false })
      cache.set('today_todos', res.data)
    } else {
      this.setData({ loading: false })
    }
  },

  onCategoryChange(e) {
    this.setData({ currentCategory: e.detail.category })
    this.loadTodos()
  },

  onTodoTap(e) {
    const todo = e.detail.todo
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${todo._id}` })
  },

  async onTodoComplete(e) {
    const { todoId } = e.detail
    const res = await api.todos.complete(todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已完成', icon: 'success' })
      this.loadTodos()
    }
  },

  async onTodoDelete(e) {
    const { todoId } = e.detail
    const res = await api.todos.delete(todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已删除', icon: 'success' })
      this.loadTodos()
    }
  },

  onQuickAdd() {
    wx.navigateTo({ url: '/pages/todo-add/todo-add' })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
