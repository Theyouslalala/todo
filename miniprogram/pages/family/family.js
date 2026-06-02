const api = require('../../utils/api')

Page({
  data: {
    members: [],
    inviteCode: '',
    joinCode: '',
    hasFamily: false,
    loading: true
  },
  onLoad() { this.loadData() },
  async loadData() {
    this.setData({ loading: true })
    const userRes = await api.users.getUserInfo()
    if (!userRes || !userRes.data) {
      this.setData({ loading: false })
      return
    }

    const user = userRes.data
    if (user.familyGroupId) {
      this.setData({ hasFamily: true })
      const membersRes = await api.users.getFamilyMembers()
      if (membersRes && membersRes.data) this.setData({ members: membersRes.data })

      const res = await api.users.getFamilyInfo()
      if (res && res.data) this.setData({ inviteCode: res.data.inviteCode })
    }
    this.setData({ loading: false })
  },
  copyCode() { wx.setClipboardData({ data: this.data.inviteCode }) },
  onJoinInput(e) { this.setData({ joinCode: e.detail.value }) },
  async onJoin() {
    if (!this.data.joinCode) {
      wx.showToast({ title: '请输入邀请码', icon: 'none' })
      return
    }
    wx.showLoading({ title: '加入中...' })
    const res = await api.users.joinFamily(this.data.joinCode)
    wx.hideLoading()
    if (res && res.code === 0) {
      wx.showToast({ title: '加入成功', icon: 'success' })
      this.loadData()
    }
  },
  async onCreateFamily() {
    wx.showModal({
      title: '创建家庭',
      content: '创建后你将成为管理员，可以通过邀请码邀请家人加入',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '创建中...' })
          const result = await api.users.createFamily({})
          wx.hideLoading()
          if (result && result.code === 0) {
            wx.showToast({ title: '创建成功', icon: 'success' })
            this.loadData()
          }
        }
      }
    })
  }
})
