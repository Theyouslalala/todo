App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    wx.cloud.init({
      env: 'YOUR_CLOUD_ENV_ID',
      traceUser: true
    })

    this.login()
  },

  async login() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'users',
        data: { action: 'getUserInfo' }
      })

      if (res.result.code === 0) {
        this.globalData.userInfo = res.result.data
      } else {
        this.globalData.needLogin = true
      }
    } catch (err) {
      console.error('Login failed:', err)
    }
  },

  globalData: {
    userInfo: null,
    needLogin: false
  }
})
