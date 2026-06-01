const lunar = require('../../utils/lunar')

Component({
  properties: {
    todo: { type: Object, value: {} },
    members: { type: Array, value: [] }
  },

  data: {
    expanded: false,
    lunarDateStr: '',
    _assigneeName: ''
  },

  observers: {
    'todo.dueDate': function(dueDate) {
      if (dueDate) {
        const parts = dueDate.split('-').map(Number)
        const info = lunar.solarToLunar(parts[0], parts[1], parts[2])
        this.setData({ lunarDateStr: info.monthName + '月' + info.dayName })
      }
    },
    'todo.assignedTo': function(assignedTo) {
      if (assignedTo && this.data.members) {
        const member = this.data.members.find(m => m._id === assignedTo)
        if (member) {
          this.setData({ '_assigneeName': member.name[0] })
        }
      }
    }
  },

  methods: {
    onLongPress() {
      this.setData({ expanded: !this.data.expanded })
    },
    onCardTap(e) {
      if (this.data.expanded) {
        this.setData({ expanded: false })
        return
      }
      this.triggerEvent('tap', { todo: this.data.todo })
    },
    onComplete(e) {
      this.setData({ expanded: false })
      this.triggerEvent('complete', { todoId: this.data.todo._id })
    },
    onDelete(e) {
      this.setData({ expanded: false })
      this.triggerEvent('delete', { todoId: this.data.todo._id })
    }
  }
})
