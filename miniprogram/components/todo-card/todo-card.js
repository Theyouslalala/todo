const lunar = require('../../utils/lunar')

Component({
  properties: {
    todo: { type: Object, value: {} },
    members: { type: Array, value: [] }
  },

  data: {
    lunarDateStr: '',
    _assigneeName: ''
  },

  observers: {
    'todo.dueDate': function(dueDate) {
      if (dueDate) {
        const info = lunar.fromDateStr(dueDate)
        this.setData({ lunarDateStr: info.monthName + '月' + info.dayName })
      }
    },
    'todo.assignedTo': function(assignedTo) {
      if (assignedTo && this.data.members) {
        const member = this.data.members.find(m => m._id === assignedTo)
        if (member) {
          this.setData({ '_assigneeName': member.name[0] || '?' })
        }
      }
    },
    'members': function(members) {
      const assignedTo = this.data.todo && this.data.todo.assignedTo
      if (assignedTo && members) {
        const member = members.find(m => m._id === assignedTo)
        if (member) {
          this.setData({ '_assigneeName': member.name[0] || '?' })
        }
      }
    }
  },

  methods: {
    onCardTap() {
      this.triggerEvent('todotap', { todo: this.data.todo })
    },
    onComplete() {
      this.triggerEvent('complete', { todoId: this.data.todo._id })
    },
    onDelete() {
      this.triggerEvent('delete', { todoId: this.data.todo._id })
    }
  }
})
