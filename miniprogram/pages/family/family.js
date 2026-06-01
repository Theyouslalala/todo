const api = require('../../utils/api')
Page({
  data: { members: [], inviteCode: '', joinCode: '' },
  onLoad() { this.loadData() },
  async loadData() {
    const membersRes = await api.users.getFamilyMembers()
    if (membersRes && membersRes.data) this.setData({ members: membersRes.data })
  },
  copyCode() { wx.setClipboardData({ data: this.data.inviteCode }) },
  onJoinInput(e) { this.setData({ joinCode: e.detail.value }) },
  async onJoin() {
    if (!this.data.joinCode) return
    const res = await api.users.joinFamily(this.data.joinCode)
    if (res && res.code === 0) { wx.showToast({ title: '加入成功', icon: 'success' }); this.loadData() }
  }
})