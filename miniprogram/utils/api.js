const pendingRequests = new Map()

const api = {
  async call(name, data = {}) {
    const key = JSON.stringify({ name, data })
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key)
    }
    const promise = this._execute(name, data)
    pendingRequests.set(key, promise)
    const timer = setTimeout(() => pendingRequests.delete(key), 30000)
    promise.finally(() => { clearTimeout(timer); pendingRequests.delete(key) })
    return promise
  },

  async _execute(name, data = {}) {
    try {
      const app = getApp()
      if (app && app.globalData.testMode && app.globalData.testOpenid) {
        data._testOpenid = app.globalData.testOpenid
      }
      const res = await wx.cloud.callFunction({ name, data })
      if (res.result.code === -1) {
        wx.showToast({ title: res.result.msg || '操作失败', icon: 'none' })
        return null
      }
      return res.result
    } catch (err) {
      console.error(`Cloud function ${name} error:`, err)
      wx.showToast({ title: '网络错误，请重试', icon: 'none' })
      return null
    }
  },

  todos: {
    create: (data) => api.call('todos', { action: 'create', ...data }),
    update: (data) => api.call('todos', { action: 'update', ...data }),
    delete: (todoId) => api.call('todos', { action: 'delete', todoId }),
    restore: (todoId) => api.call('todos', { action: 'restore', todoId }),
    complete: (todoId) => api.call('todos', { action: 'complete', todoId }),
    getToday: () => api.call('todos', { action: 'getToday' }),
    getByDate: (date) => api.call('todos', { action: 'getByDate', date }),
    getByMonth: (year, month) => api.call('todos', { action: 'getByMonth', year, month }),
    search: (keyword, skip) => api.call('todos', { action: 'search', keyword, skip }),
    getDeleted: () => api.call('todos', { action: 'getDeleted' }),
    permanentDelete: (todoId) => api.call('todos', { action: 'permanentDelete', todoId }),
    getById: (todoId) => api.call('todos', { action: 'getById', todoId }),
    getAll: () => api.call('todos', { action: 'getAll' }),
    batchDelete: (todoIds) => api.call('todos', { action: 'batchDelete', todoIds })
  },

  users: {
    login: (data) => api.call('users', { action: 'login', ...data }),
    updateProfile: (data) => api.call('users', { action: 'updateProfile', ...data }),
    updateSettings: (data) => api.call('users', { action: 'updateSettings', ...data }),
    createFamily: (data) => api.call('users', { action: 'createFamily', ...data }),
    joinFamily: (inviteCode) => api.call('users', { action: 'joinFamily', inviteCode }),
    getFamilyMembers: () => api.call('users', { action: 'getFamilyMembers' }),
    getUserInfo: () => api.call('users', { action: 'getUserInfo' }),
    getFamilyInfo: () => api.call('users', { action: 'getFamilyInfo' })
  },

  notifications: {
    updateSubscription: (data) => api.call('notifications', { action: 'updateSubscription', ...data }),
    getSubscriptionCount: (templateId) => api.call('notifications', { action: 'getSubscriptionCount', templateId }),
    batchSubscribe: (data) => api.call('notifications', { action: 'batchSubscribe', ...data }),
    sendNotification: (data) => api.call('notifications', { action: 'sendNotification', ...data })
  },

  activityLogs: {
    getLogs: (skip) => api.call('activity-logs', { action: 'getLogs', skip })
  }
}

module.exports = api
