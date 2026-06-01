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
  },

  async ensureLogin() {
    if (this.globalData.userInfo) return this.globalData.userInfo
    if (this._loginPromise) return this._loginPromise

    this._loginPromise = this._doLogin()
    return this._loginPromise
  },

  async _doLogin() {
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
    }

    return this.globalData.userInfo
  },

  globalData: {
    userInfo: null,
    needLogin: false,
    testMode: false,
    testOpenid: ''
  }
})
