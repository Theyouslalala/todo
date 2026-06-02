const api = require('../../utils/api')
const lunar = require('../../utils/lunar')
const notification = require('../../utils/notification')
const config = require('../../config')
const { CATEGORIES, COLORS, REPEAT_OPTIONS, NOTIFY_OPTIONS } = require('../../utils/constants')

Page({
  data: {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    category: 'daily',
    color: 'blue',
    priority: 'medium',
    assignedTo: '',
    repeat: 'none',
    isLunar: false,
    quantity: '',
    enableNotification: true,
    notifyBefore: 15,
    showMore: false,
    lunarPreview: '',
    members: [],
    isEdit: false,
    categories: CATEGORIES,
    colors: COLORS,
    repeatOptions: REPEAT_OPTIONS,
    notifyOptions: NOTIFY_OPTIONS,
    submitting: false
  },

  onLoad(options) {
    if (options.id && options.mode === 'edit') {
      this.todoId = options.id
      this.setData({ isEdit: true })
      wx.setNavigationBarTitle({ title: '编辑待办' })
      this.loadTodo()
    } else {
      const today = new Date().toISOString().split('T')[0]
      this.setData({ dueDate: today })
      const info = lunar.fromDateStr(today)
      this.setData({ lunarPreview: info.monthName + '月' + info.dayName })
    }
    this.loadMembers()
  },

  async loadTodo() {
    wx.showLoading({ title: '加载中...' })
    const res = await api.todos.getById(this.todoId)
    wx.hideLoading()
    if (res && res.data) {
      const todo = res.data
      this.setData({
        title: todo.title || '',
        description: todo.description || '',
        dueDate: todo.dueDate || '',
        dueTime: todo.dueTime || '',
        category: todo.category || 'daily',
        color: todo.color || 'blue',
        priority: todo.priority || 'medium',
        assignedTo: todo.assignedTo || '',
        repeat: todo.repeat || 'none',
        isLunar: todo.isLunar || false,
        quantity: todo.quantity || '',
        enableNotification: todo.enableNotification !== false,
        notifyBefore: todo.notifyBefore || 15,
        showMore: true
      })
    }
  },

  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) {
      const app = getApp()
      const currentUser = app.globalData.userInfo
      this.setData({
        members: res.data,
        assignedTo: this.data.assignedTo || (currentUser ? currentUser._id : (res.data[0] ? res.data[0]._id : ''))
      })
    }
  },

  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onQuantityInput(e) { this.setData({ quantity: e.detail.value }) },
  onDateChange(e) {
    const date = e.detail.value
    this.setData({ dueDate: date })
    const info = lunar.fromDateStr(date)
    this.setData({ lunarPreview: info.monthName + '月' + info.dayName })
  },
  onTimeChange(e) { this.setData({ dueTime: e.detail.value }) },
  onCategorySelect(e) { this.setData({ category: e.currentTarget.dataset.value }) },
  onColorSelect(e) { this.setData({ color: e.currentTarget.dataset.value }) },
  onAssigneeSelect(e) { this.setData({ assignedTo: e.currentTarget.dataset.id }) },
  onRepeatSelect(e) { this.setData({ repeat: e.currentTarget.dataset.value }) },
  onNotifySelect(e) { this.setData({ notifyBefore: Number(e.currentTarget.dataset.value) }) },
  onNotificationChange(e) { this.setData({ enableNotification: e.detail.value }) },
  onLunarChange(e) { this.setData({ isLunar: e.detail.value }) },
  toggleMore() { this.setData({ showMore: !this.data.showMore }) },

  async onSubmit() {
    if (this.data.submitting) return
    this.setData({ submitting: true })

    const { title, dueDate } = this.data
    if (!title.trim() || !dueDate) {
      wx.showToast({ title: '请填写标题和日期', icon: 'none' })
      this.setData({ submitting: false })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const todoData = {
      title: this.data.title,
      description: this.data.description,
      dueDate: this.data.dueDate,
      dueTime: this.data.dueTime,
      category: this.data.category,
      color: this.data.color,
      priority: this.data.priority,
      assignedTo: this.data.assignedTo,
      repeat: this.data.repeat,
      isLunar: this.data.isLunar,
      quantity: this.data.quantity,
      enableNotification: this.data.enableNotification,
      notifyBefore: this.data.notifyBefore
    }

    // Compute lunarDate when isLunar is enabled
    if (this.data.isLunar && this.data.dueDate) {
      const lunarInfo = lunar.fromDateStr(this.data.dueDate)
      todoData.lunarDate = `${lunarInfo.month}-${lunarInfo.day}`
    }

    let res
    if (this.data.isEdit) {
      res = await api.todos.update({ todoId: this.todoId, ...todoData })
    } else {
      res = await api.todos.create(todoData)
    }

    wx.hideLoading()

    if (res && res.code === 0) {
      wx.showToast({ title: this.data.isEdit ? '更新成功' : '添加成功', icon: 'success' })
      // Request notification subscription for new todos with notifications enabled
      if (!this.data.isEdit && this.data.enableNotification && config.NOTIFICATION_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {
        try {
          await notification.requestSubscribe(config.NOTIFICATION_TEMPLATE_ID)
        } catch (e) {
          console.log('Notification subscription skipped', e)
        }
      }
      setTimeout(() => { wx.navigateBack() }, 1500)
    } else {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' })
    }
    this.setData({ submitting: false })
  }
})
