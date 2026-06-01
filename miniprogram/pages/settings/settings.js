const app = getApp()
const api = require('../../utils/api')

Page({
  data: {
    userInfo: {},
    name: '',
    role: '',
    roles: [
      { label: '爸爸', value: 'father' },
      { label: '妈妈', value: 'mother' },
      { label: '孩子', value: 'child' }
    ]
  },

  async onLoad() {
    const res = await api.users.getUserInfo()
    if (res && res.data) {
      this.setData({
        userInfo: res.data,
        name: res.data.name || '',
        role: res.data.role || 'child'
      })
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },
  onRoleSelect(e) { this.setData({ role: e.currentTarget.dataset.value }) },

  async onSave() {
    const { name, role } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })
    const res = await api.users.updateProfile({ name: name.trim(), role })
    wx.hideLoading()

    if (res && res.code === 0) {
      app.globalData.userInfo.name = name.trim()
      app.globalData.userInfo.role = role
      wx.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => { wx.navigateBack() }, 1500)
    }
  },

  onAbout() {
    wx.showModal({
      title: '关于',
      content: '家庭提醒 v1.0.0\n三口之家共享待办事项管理',
      showCancel: false
    })
  }
})
