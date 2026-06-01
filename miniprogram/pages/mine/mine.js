const app = getApp()
const api = require('../../utils/api')

const roleMap = {
  child: '孩子',
  father: '爸爸',
  mother: '妈妈'
}

Page({
  data: {
    userInfo: {},
    roleName: ''
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    const res = await api.users.getUserInfo()
    if (res && res.data) {
      app.globalData.userInfo = res.data
      this.setData({
        userInfo: res.data,
        roleName: roleMap[res.data.role] || '成员'
      })
    }
  },

  goFamily() {
    wx.navigateTo({ url: '/pages/family/family' })
  },

  goActivityLog() {
    wx.navigateTo({ url: '/pages/activity-log/activity-log' })
  },

  goRecycleBin() {
    wx.navigateTo({ url: '/pages/recycle-bin/recycle-bin' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
