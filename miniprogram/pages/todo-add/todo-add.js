const api = require('../../utils/api')

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
    members: [],
    categories: [
      { label: '日常', value: 'daily' },
      { label: '购物', value: 'shopping' },
      { label: '家庭', value: 'family' },
      { label: '账单', value: 'bill' },
      { label: '其他', value: 'other' }
    ],
    colors: [
      { label: '红', value: 'red', hex: '#ff4d4f' },
      { label: '蓝', value: 'blue', hex: '#4A90D9' },
      { label: '绿', value: 'green', hex: '#52c41a' },
      { label: '黄', value: 'yellow', hex: '#faad14' }
    ],
    repeatOptions: [
      { label: '不重复', value: 'none' },
      { label: '每天', value: 'daily' },
      { label: '每周', value: 'weekly' },
      { label: '每月', value: 'monthly' },
      { label: '农历每年', value: 'lunar_yearly' }
    ],
    notifyOptions: [
      { label: '准时', value: 0 },
      { label: '5分钟前', value: 5 },
      { label: '15分钟前', value: 15 },
      { label: '30分钟前', value: 30 },
      { label: '1小时前', value: 60 }
    ]
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0]
    this.setData({ dueDate: today })
    this.loadMembers()
  },

  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) {
      const app = getApp()
      const currentUser = app.globalData.userInfo
      this.setData({
        members: res.data,
        assignedTo: currentUser ? currentUser._id : (res.data[0] ? res.data[0]._id : '')
      })
    }
  },

  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onQuantityInput(e) { this.setData({ quantity: e.detail.value }) },
  onDateChange(e) { this.setData({ dueDate: e.detail.value }) },
  onTimeChange(e) { this.setData({ dueTime: e.detail.value }) },
  onCategorySelect(e) { this.setData({ category: e.currentTarget.dataset.value }) },
  onColorSelect(e) { this.setData({ color: e.currentTarget.dataset.value }) },
  onAssigneeSelect(e) { this.setData({ assignedTo: e.currentTarget.dataset.id }) },
  onRepeatSelect(e) { this.setData({ repeat: e.currentTarget.dataset.value }) },
  onNotifySelect(e) { this.setData({ notifyBefore: e.currentTarget.dataset.value }) },
  onNotificationChange(e) { this.setData({ enableNotification: e.detail.value }) },
  onLunarChange(e) { this.setData({ isLunar: e.detail.value }) },
  toggleMore() { this.setData({ showMore: !this.data.showMore }) },

  async onSubmit() {
    const { title, dueDate } = this.data
    if (!title || !dueDate) {
      wx.showToast({ title: '请填写标题和日期', icon: 'none' })
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

    const res = await api.todos.create(todoData)

    wx.hideLoading()

    if (res && res.code === 0) {
      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => { wx.navigateBack() }, 1500)
    }
  }
})