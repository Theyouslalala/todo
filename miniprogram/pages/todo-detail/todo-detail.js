const api = require('../../utils/api')
const lunar = require('../../utils/lunar')
const categoryMap = { daily: '日常', shopping: '购物', family: '家庭', bill: '账单', other: '其他' }
const repeatMap = { none: '不重复', daily: '每天', weekly: '每周', monthly: '每月', lunar_yearly: '农历每年' }

Page({
  data: {
    todo: {}, categoryName: '', assigneeName: '', repeatName: '', lunarDateStr: '',
    colorMap: { red: '#ff4d4f', blue: '#4A90D9', green: '#52c41a', yellow: '#faad14' }
  },
  onLoad(options) {
    this.todoId = options.id
    this.loadTodo()
  },
  async loadTodo() {
    const res = await api.todos.getById(this.todoId)
    if (res && res.data) {
      const todo = res.data
      const membersRes = await api.users.getFamilyMembers()
      const members = membersRes && membersRes.data ? membersRes.data : []
      const assignee = members.find(m => m._id === todo.assignedTo)
      let lunarDateStr = ''
      if (todo.dueDate) {
        const [y, m, d] = todo.dueDate.split('-').map(Number)
        const lunarInfo = lunar.solarToLunar(y, m, d)
        lunarDateStr = lunarInfo.fullName
      }
      this.setData({
        todo,
        categoryName: categoryMap[todo.category] || '其他',
        assigneeName: assignee ? assignee.name : '未指定',
        repeatName: repeatMap[todo.repeat] || '不重复',
        lunarDateStr
      })
    }
  },
  async onComplete() {
    const res = await api.todos.complete(this.todoId)
    if (res && res.code === 0) { wx.showToast({ title: '已完成', icon: 'success' }); this.loadTodo() }
  },
  onEdit() { wx.navigateTo({ url: `/pages/todo-add/todo-add?id=${this.todoId}&mode=edit` }) },
  async onDelete() {
    wx.showModal({
      title: '确认删除', content: '删除后可在回收站恢复',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.todos.delete(this.todoId)
          if (result && result.code === 0) { wx.showToast({ title: '已删除', icon: 'success' }); setTimeout(() => { wx.navigateBack() }, 1500) }
        }
      }
    })
  }
})
