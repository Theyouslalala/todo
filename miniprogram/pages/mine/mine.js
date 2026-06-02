const app = getApp()
const api = require('../../utils/api')
const { ROLE_MAP } = require('../../utils/constants')

Page({
  data: {
    userInfo: {},
    roleName: '',
    debugTapCount: 0,
    loading: true
  },

  async onLoad() {
    await app.ensureLogin()
    this._dataLoaded = true
    await this.loadUserInfo()
  },

  onShow() {
    if (this._dataLoaded && app.globalData.userInfo) {
      this.loadUserInfo()
    }
  },

  async loadUserInfo() {
    this.setData({ loading: true })
    try {
      const res = await api.users.getUserInfo()
      if (res && res.data) {
        app.globalData.userInfo = res.data
        this.setData({
          userInfo: res.data,
          roleName: ROLE_MAP[res.data.role] || '成员'
        })
      }
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setData({ loading: false })
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
  },

  onVersionTap() {
    const count = this.data.debugTapCount + 1
    this.setData({ debugTapCount: count })
    if (count >= 5) {
      this.setData({ debugTapCount: 0 })
      wx.showActionSheet({
        itemList: ['开启测试模式', '关闭测试模式', '查看当前OpenID'],
        success: async (res) => {
          const app = getApp()
          if (res.tapIndex === 0) {
            app.globalData.testMode = true
            const members = await api.users.getFamilyMembers()
            if (members && members.data) {
              const names = members.data.map(m => m.name)
              wx.showActionSheet({
                itemList: names,
                success: (r) => {
                  app.globalData.testOpenid = members.data[r.tapIndex].openid || ''
                  wx.showToast({ title: '已切换到 ' + names[r.tapIndex], icon: 'none' })
                }
              })
            }
          } else if (res.tapIndex === 1) {
            app.globalData.testMode = false
            app.globalData.testOpenid = ''
            wx.showToast({ title: '已关闭测试模式', icon: 'none' })
          } else {
            const info = await api.users.getUserInfo()
            wx.showModal({
              title: '当前信息',
              content: 'OpenID: ' + (info.data ? info.data.openid.slice(0, 8) + '***' : 'unknown'),
              showCancel: false
            })
          }
        }
      })
    }
  }
})
