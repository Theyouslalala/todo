const api = require('../../utils/api')
const lunar = require('../../utils/lunar')
const { CATEGORY_MAP, REPEAT_MAP, COLOR_MAP } = require('../../utils/constants')

Page({
  data: {
    todo: {}, categoryName: '', assigneeName: '', repeatName: '', lunarDateStr: '',
    colorMap: COLOR_MAP
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
        const lunarInfo = lunar.fromDateStr(todo.dueDate)
        lunarDateStr = lunarInfo.fullName
      }
      this.setData({
        todo,
        categoryName: CATEGORY_MAP[todo.category] || '其他',
        assigneeName: assignee ? assignee.name : '未指定',
        repeatName: REPEAT_MAP[todo.repeat] || '不重复',
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
