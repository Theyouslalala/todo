const categoryMap = {
  daily: '日常', shopping: '购物', family: '家庭', bill: '账单', other: '其他'
}

Component({
  properties: {
    todo: { type: Object, value: {} },
    members: { type: Array, value: [] }
  },

  data: {
    categoryName: '',
    assigneeInitial: ''
  },

  observers: {
    'todo, members': function (todo, members) {
      if (!todo) return
      this.setData({
        categoryName: categoryMap[todo.category] || '其他',
        assigneeInitial: this.getAssigneeInitial(todo.assignedTo, members)
      })
    }
  },

  methods: {
    getAssigneeInitial(assignedTo, members) {
      const member = members.find(m => m._id === assignedTo)
      return member ? member.name.charAt(0) : '?'
    },
    onTap() {
      this.triggerEvent('tap', { todo: this.properties.todo })
    },
    onComplete() {
      this.triggerEvent('complete', { todoId: this.properties.todo._id })
    },
    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定删除"${this.properties.todo.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { todoId: this.properties.todo._id })
          }
        }
      })
    }
  }
})
