const api = require('../../utils/api')
const cache = require('../../utils/cache')
const lunar = require('../../utils/lunar')
const app = getApp()

Page({
  data: {
    todos: [],
    members: [],
    currentCategory: 'all',
    loading: true,
    viewMode: 'today',
    todayStr: '',
    lunarStr: '',
    greeting: ''
  },

  async onLoad() {
    await app.waitForLogin()
    const now = new Date()
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    this.setData({
      todayStr: `${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`,
      lunarStr: '农历' + lunar.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate()).fullName,
      greeting: now.getHours() < 12 ? '早上好' : now.getHours() < 18 ? '下午好' : '晚上好'
    })

    this._dataLoaded = true
    await this.loadData()
  },

  onShow() {
    if (this._dataLoaded && app.globalData.userInfo) {
      this.loadTodos()
    }
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
    try {
      let res
      if (this.data.viewMode === 'today') {
        res = await api.todos.getToday()
      } else {
        res = await api.todos.getAll()
      }
      if (res && res.data) {
        if (category !== 'all') {
          res.data = res.data.filter(t => t.category === category)
        }
        this.setData({ todos: res.data, loading: false })
        await cache.set('today_todos', res.data)
      } else {
        this.setData({ loading: false })
      }
    } catch (err) {
      console.error('loadTodos failed:', err)
      this.setData({ loading: false })
    }
  },

  onViewModeChange(e) {
    this.setData({ viewMode: e.currentTarget.dataset.mode })
    this.loadTodos()
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
