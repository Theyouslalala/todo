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

    this.login()
  },

  async login() {
    try {
      // First try to get existing user info
      let res = await wx.cloud.callFunction({
        name: 'users',
        data: { action: 'getUserInfo' }
      })

      if (res.result.code === 0) {
        this.globalData.userInfo = res.result.data
      } else {
        // User not found, auto-register
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
    }
  },

  globalData: {
    userInfo: null,
    needLogin: false
  },

  // Wait for login to complete before calling API
  waitForLogin() {
    return new Promise((resolve) => {
      if (this.globalData.userInfo) {
        resolve(this.globalData.userInfo)
        return
      }
      const check = setInterval(() => {
        if (this.globalData.userInfo) {
          clearInterval(check)
          resolve(this.globalData.userInfo)
        }
      }, 100)
      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(check)
        resolve(null)
      }, 5000)
    })
  }
})
