App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }

    wx.cloud.init({
      env: 'cloud1-d7get2p965ac6f291',
      traceUser: true
    })

    // Fire and forget - don't block app launch
    this.login()
  },

  async login() {
    try {
      let res = await wx.cloud.callFunction({
        name: 'users',
        data: { action: 'getUserInfo' }
      })

      if (res.result.code === 0) {
        this.globalData.userInfo = res.result.data
      } else {
        res = await wx.cloud.callFunction({
          name: 'users',
          data: { action: 'login', name: '家庭成员' }
        })

        if (res.result.code === 0) {
          this.globalData.userInfo = res.result.data
        }
      }
    } catch (err) {
      console.error('Login failed:', err)
    } finally {
      this.globalData.loginDone = true
    }
  },

  globalData: {
    userInfo: null,
    needLogin: false,
    loginDone: false,
    testMode: false,
    testOpenid: ''
  },

  async waitForLogin() {
    if (this.globalData.userInfo) return this.globalData.userInfo
    // Wait for login with 8-second max
    const start = Date.now()
    while (!this.globalData.loginDone && Date.now() - start < 8000) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return this.globalData.userInfo
  }
})
