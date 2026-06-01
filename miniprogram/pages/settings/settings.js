const app = getApp()
const api = require('../../utils/api')
const { ROLE_MAP, ROLE_OPTIONS } = require('../../utils/constants')

Page({
  data: {
    userInfo: {},
    name: '',
    isAdmin: false,
    members: [],
    roleOptions: ROLE_OPTIONS,
    showRolePicker: false,
    editingMember: null
  },

  async onLoad() {
    await this.loadUserInfo()
  },

  async loadUserInfo() {
    const res = await api.users.getUserInfo()
    if (res && res.data) {
      const userInfo = res.data
      this.setData({
        userInfo,
        name: userInfo.name || '',
        isAdmin: userInfo.role === 'admin'
      })

      if (userInfo.role === 'admin') {
        this.loadMembers()
      }
    }
  },

  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) {
      const members = res.data.map(m => ({
        ...m,
        roleName: ROLE_MAP[m.role] || m.role,
        isSelf: m._id === this.data.userInfo._id
      }))
      this.setData({ members })
    }
  },

  onNameInput(e) { this.setData({ name: e.detail.value }) },

  async onSaveName() {
    const { name } = this.data
    if (!name.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    const res = await api.users.updateProfile({ name: name.trim() })
    if (res && res.code === 0) {
      app.globalData.userInfo.name = name.trim()
      wx.showToast({ title: '保存成功', icon: 'success' })
    }
  },

  onRoleTap(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m._id === memberId)
    if (!member || member.isSelf) return

    wx.showActionSheet({
      itemList: ROLE_OPTIONS.map(r => r.label),
      success: async (res) => {
        const newRole = ROLE_OPTIONS[res.tapIndex].value
        if (newRole === member.role) return

        wx.showModal({
          title: '修改角色',
          content: `确定将 ${member.name} 的角色改为 ${ROLE_MAP[newRole]}？`,
          success: async (modalRes) => {
            if (modalRes.confirm) {
              const result = await api.users.updateMemberRole(memberId, newRole)
              if (result && result.code === 0) {
                wx.showToast({ title: '修改成功', icon: 'success' })
                this.loadMembers()
              }
            }
          }
        })
      }
    })
  },

  onRemoveMember(e) {
    const memberId = e.currentTarget.dataset.id
    const member = this.data.members.find(m => m._id === memberId)
    if (!member || member.isSelf) return

    wx.showModal({
      title: '移除成员',
      content: `确定将 ${member.name} 移出家庭？该成员的所有待办将保留。`,
      success: async (res) => {
        if (res.confirm) {
          const result = await api.users.removeMember(memberId)
          if (result && result.code === 0) {
            wx.showToast({ title: '已移除', icon: 'success' })
            this.loadMembers()
          }
        }
      }
    })
  },

  onAbout() {
    wx.showModal({
      title: '关于',
      content: '家庭提醒 v1.0.0\n三口之家共享待办事项管理',
      showCancel: false
    })
  }
})
