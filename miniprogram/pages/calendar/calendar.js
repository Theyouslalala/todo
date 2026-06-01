const api = require('../../utils/api')
const lunar = require('../../utils/lunar')
const { COLOR_MAP } = require('../../utils/constants')
const app = getApp()

Page({
  data: {
    year: 0,
    month: 0,
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    selectedDay: null,
    selectedDate: '',
    selectedDayTodos: [],
    monthTodos: []
  },

  async onLoad() {
    await app.waitForLogin()
    const now = new Date()
    this.setData({ year: now.getFullYear(), month: now.getMonth() + 1 })
    this.loadMonth()
  },

  onShow() {
    if (app.globalData.userInfo) {
      this.loadMonthTodos()
    }
  },

  async loadMonth() {
    const { year, month } = this.data
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayWeek = new Date(year, month - 1, 1).getDay()
    const today = new Date()

    const calendarDays = []
    for (let i = 0; i < firstDayWeek; i++) {
      calendarDays.push({ isEmpty: true, day: '' })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = lunar.solarToLunar(year, month, d)
      calendarDays.push({
        day: d,
        lunarDay: lunarInfo.day === 1 ? lunarInfo.monthName + '月' : lunarInfo.dayName,
        isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d,
        isSelected: false,
        hasTodos: false,
        todoCount: 0,
        todoColors: []
      })
    }
    this.setData({ calendarDays })
    await this.loadMonthTodos()
  },

  async loadMonthTodos() {
    const { year, month } = this.data
    const res = await api.todos.getByMonth(year, month)
    if (res && res.data) {
      this.setData({ monthTodos: res.data })
      this.updateCalendarDots()
    }
  },

  updateCalendarDots() {
    const { calendarDays, monthTodos } = this.data
    const colorMap = COLOR_MAP

    calendarDays.forEach(day => {
      if (day.isEmpty) return
      const dateStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
      const dayTodos = monthTodos.filter(t => t.dueDate === dateStr && t.status === 'pending' && !t.deletedAt)
      day.hasTodos = dayTodos.length > 0
      day.todoCount = dayTodos.length
      day.todoColors = [...new Set(dayTodos.map(t => colorMap[t.color] || '#4A90D9'))].slice(0, 3)
    })
    this.setData({ calendarDays })
  },

  onDayTap(e) {
    const day = e.currentTarget.dataset.day
    if (day.isEmpty) return

    const { calendarDays, monthTodos } = this.data
    calendarDays.forEach(d => { d.isSelected = false })
    day.isSelected = true

    const dateStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
    const selectedDayTodos = monthTodos.filter(t => t.dueDate === dateStr && !t.deletedAt)

    this.setData({ calendarDays, selectedDay: day.day, selectedDate: dateStr, selectedDayTodos })
  },

  onTodoTap(e) {
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.currentTarget.dataset.id}` })
  },

  prevMonth() {
    let { year, month } = this.data
    month--
    if (month < 1) { month = 12; year-- }
    this.setData({ year, month, selectedDay: null, selectedDayTodos: [] })
    this.loadMonth()
  },

  nextMonth() {
    let { year, month } = this.data
    month++
    if (month > 12) { month = 1; year++ }
    this.setData({ year, month, selectedDay: null, selectedDayTodos: [] })
    this.loadMonth()
  }
})
