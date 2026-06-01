# 性能反模式检测报告

> 检测日期：2026-06-01
> 扫描范围：cloudfunctions/、miniprogram/utils/

---

## 问题总览

| 编号 | 严重程度 | 文件 | 问题类型 |
|------|----------|------|----------|
| P01 | 高 | todos/index.js | 重复用户查询（每个操作都查一次） |
| P02 | 高 | todos/index.js | 大对象序列化风险（images 数组） |
| P03 | 中 | users/index.js | 重复 openid 查询（7 处相同查询） |
| P04 | 中 | users/index.js | joinFamily 串行 DB 操作 |
| P05 | 中 | notifications/index.js | 重复用户查询 |
| P06 | 中 | activity-logs/index.js | getLogs 无总数返回，前端无法判断分页终点 |
| P07 | 中 | cache.js | clear() 遍历全部 Storage 键 |
| P08 | 低 | cache.js | 同步阻塞 I/O |
| P09 | 低 | api.js | 无请求去重/并发控制 |
| P10 | 低 | api.js | 无批量操作接口 |
| P11 | 低 | lunar.js | getLunarMonthDays 无缓存，重复计算 |
| P12 | 低 | todos/index.js | logActivity 为非关键路径串行写入 |

---

## 详细分析

### P01 [高] 重复用户查询 — `getUserAndFamily` 被每个操作调用

**文件：** `cloudfunctions/todos/index.js`，第 43-47 行

**问题代码：**
```javascript
async function getUserAndFamily(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  return user.data[0]
}
```

**问题说明：**
`getUserAndFamily` 在 `createTodo`（第 63 行）、`updateTodo`（第 107 行）、`deleteTodo`（第 136 行）、`restoreTodo`（第 154 行）、`completeTodo`（第 165 行）、`getTodayTodos`（第 187 行）、`getTodosByDate`（第 205 行）、`getTodosByMonth`（第 222 行）、`searchTodos`（第 244 行）、`getDeletedTodos`（第 262 行）、`getAllTodos`（第 294 行）、`getTodoById`（第 309 行）等 **12 处**被调用。每次云函数调用都会执行一次 `users` 集合查询，这是完全冗余的——同一请求内 openid 不会变化。

此外，`deleteTodo`（第 139 行）、`completeTodo`（第 168 行）在调用 `getUserAndFamily` 后又查询了一次 `reminders` 文档，形成 **两次串行 DB 读取**。

**优化方案：**
```javascript
// 方案一：在 main 入口一次性查询用户，通过参数传递
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  // 仅在需要用户信息的操作中查询一次
  const needsUser = ['create','update','delete','restore','complete',
    'getToday','getByDate','getByMonth','search','getDeleted',
    'getAll','getById']
  let user = null
  if (needsUser.includes(action)) {
    user = await getUserAndFamily(openid)
  }

  switch (action) {
    case 'create': return await createTodo(user, event)
    case 'update': return await updateTodo(user, event)
    // ... 其余同理
  }
}

// 方案二：在云函数层缓存（利用云函数实例复用机制）
let userCache = {}
async function getUserAndFamilyCached(openid) {
  if (userCache[openid]) return userCache[openid]
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  userCache[openid] = user.data[0]
  return userCache[openid]
}
```

---

### P02 [高] 大对象序列化风险 — images 数组未做大小限制

**文件：** `cloudfunctions/todos/index.js`，第 85 行

**问题代码：**
```javascript
images: images || [],
```

**问题说明：**
`createTodo` 和 `updateTodo` 接受 `images` 参数但未做任何大小校验。如果前端传入大量图片 base64 或过多图片 URL，会导致：
- 云函数响应体过大（微信云开发单次返回限制 100KB）
- `getAllTodos`（第 293-306 行）和 `getTodosByMonth`（第 221-241 行）批量返回 100 条记录，若每条含大量 images 数据，序列化和传输开销剧增

**优化方案：**
```javascript
// 创建时限制图片数量和大小
if (images && images.length > 9) {
  return { code: -1, msg: '最多上传9张图片' }
}

// 批量查询时排除 images 字段（云开发使用 field 控制返回字段）
const res = await db.collection('reminders')
  .where({ familyGroupId: user.familyGroupId, status: 'pending', deletedAt: null })
  .orderBy('dueDate', 'asc')
  .orderBy('dueTime', 'asc')
  .field({ images: false })  // 列表查询时不返回图片
  .limit(100)
  .get()
```

---

### P03 [中] 重复 openid 查询 — 7 处相同模式

**文件：** `cloudfunctions/users/index.js`，第 35、77、94、109、131、167、182 行

**问题代码：**
```javascript
// 以下 7 个函数都包含相同的查询：
const user = await db.collection('users').where({ openid }).get()
if (user.data.length === 0) return { code: -1, msg: 'User not found' }
```

**问题说明：**
`updateProfile`（第 77 行）、`updateSettings`（第 94 行）、`createFamily`（第 109 行）、`joinFamily`（第 131 行）、`getFamilyMembers`（第 167 行）、`getUserInfo`（第 182 行）、`login`（第 35 行）全部独立查询用户。同一云函数调用中 openid 恒定，查询结果完全相同。

**优化方案：**
```javascript
// 在 main 中统一查询，注入到各函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  if (action === 'login') return await login(openid, event)

  // login 之外的操作都需要用户数据
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }
  const userData = user.data[0]

  switch (action) {
    case 'updateProfile': return await updateProfile(userData, event)
    case 'updateSettings': return await updateSettings(userData, event)
    case 'createFamily': return await createFamily(userData, event)
    case 'joinFamily': return await joinFamily(userData, event)
    case 'getFamilyMembers': return await getFamilyMembers(userData)
    case 'getUserInfo': return { code: 0, data: userData }
    case 'getFamilyInfo': return await getFamilyInfo(userData)
    default: return { code: -1, msg: 'Unknown action' }
  }
}
```

---

### P04 [中] joinFamily 串行 DB 操作可并行化

**文件：** `cloudfunctions/users/index.js`，第 145-163 行

**问题代码：**
```javascript
// Remove from old family's members array
if (userData.familyGroupId) {
  try {
    await db.collection('family_groups').doc(userData.familyGroupId).update({
      data: { members: _.pull(userData._id) }
    })
  } catch (err) { }
}

await db.collection('family_groups').doc(familyData._id).update({
  data: { members: _.push(userData._id) }
})

await db.collection('users').doc(userData._id).update({
  data: { familyGroupId: familyData._id }
})
```

**问题说明：**
这三个 DB 操作是串行执行的。从旧家庭移除、加入新家庭、更新用户记录之间没有数据依赖，最后两个操作可以并行。

**优化方案：**
```javascript
// 从旧家庭移除（必须先完成，因为要确保数据一致性）
if (userData.familyGroupId) {
  try {
    await db.collection('family_groups').doc(userData.familyGroupId).update({
      data: { members: _.pull(userData._id) }
    })
  } catch (err) { }
}

// 加入新家庭 + 更新用户记录：并行执行
await Promise.all([
  db.collection('family_groups').doc(familyData._id).update({
    data: { members: _.push(userData._id) }
  }),
  db.collection('users').doc(userData._id).update({
    data: { familyGroupId: familyData._id }
  })
])
```

---

### P05 [中] notifications 重复用户查询

**文件：** `cloudfunctions/notifications/index.js`，第 27、59 行

**问题代码：**
```javascript
// updateSubscription (第 27 行)
const user = await db.collection('users').where({ openid }).get()

// getSubscriptionCount (第 59 行)
const user = await db.collection('users').where({ openid }).get()
```

**问题说明：**
与 P03 相同的模式，每个 action 都独立查询用户。且 `sendNotification`（第 74 行）通过 `userId` 查询用户又是一次额外的 DB 读取。

**优化方案：**
```javascript
// main 入口统一查询
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  if (action === 'sendNotification') return await sendNotification(event)

  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }
  const userId = user.data[0]._id

  switch (action) {
    case 'updateSubscription':
      return await updateSubscription(userId, event)
    case 'getSubscriptionCount':
      return await getSubscriptionCount(userId, event)
    case 'batchSubscribe':
      return await batchSubscribe(userId, event)
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}
```

---

### P06 [中] getLogs 分页无总数返回

**文件：** `cloudfunctions/activity-logs/index.js`，第 19-47 行

**问题代码：**
```javascript
async function getLogs(openid, event) {
  const { skip = 0 } = event
  // ...
  const res = await db.collection('activity_logs')
    .where({ familyGroupId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(20)
    .get()
  // ...
  return { code: 0, data: logs }
}
```

**问题说明：**
分页查询只返回数据，不返回总数。前端无法判断是否还有更多数据，可能导致：
- 用户不断滑动触发无效请求
- 无法实现精确的分页 UI

**优化方案：**
```javascript
async function getLogs(openid, event) {
  const { skip = 0 } = event
  // ...
  const countRes = await db.collection('activity_logs')
    .where({ familyGroupId })
    .count()

  const res = await db.collection('activity_logs')
    .where({ familyGroupId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(20)
    .get()

  // ...
  return {
    code: 0,
    data: logs,
    total: countRes.total,
    hasMore: skip + 20 < countRes.total
  }
}
```

---

### P07 [中] cache.clear() 遍历全部 Storage 键

**文件：** `miniprogram/utils/cache.js`，第 37-48 行

**问题代码：**
```javascript
clear() {
  try {
    const res = wx.getStorageInfoSync()
    res.keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        wx.removeStorageSync(key)
      }
    })
  } catch (e) {
    console.error('Cache clear error:', e)
  }
}
```

**问题说明：**
`wx.getStorageInfoSync()` 返回全部存储键，然后逐个过滤和删除。如果 Storage 中有大量非缓存键，遍历开销浪费。更严重的是，每个 `removeStorageSync` 都是一次同步 I/O 调用。

**优化方案：**
```javascript
// 方案一：维护缓存键索引
const cacheKeys = new Set()

const cache = {
  set(key, data) {
    const fullKey = CACHE_PREFIX + key
    const cacheData = { data, timestamp: Date.now(), expiry: CACHE_EXPIRY }
    try {
      wx.setStorageSync(fullKey, cacheData)
      cacheKeys.add(fullKey)
    } catch (e) {
      console.error('Cache set error:', e)
    }
  },

  clear() {
    try {
      for (const key of cacheKeys) {
        wx.removeStorageSync(key)
      }
      cacheKeys.clear()
    } catch (e) {
      console.error('Cache clear error:', e)
    }
  }
}

// 方案二：使用异步 API 减少阻塞
async clear() {
  try {
    const res = await wx.getStorageInfo()
    const cacheKeys = res.keys.filter(k => k.startsWith(CACHE_PREFIX))
    await Promise.all(cacheKeys.map(k => wx.removeStorage({ key: k })))
  } catch (e) {
    console.error('Cache clear error:', e)
  }
}
```

---

### P08 [低] 同步阻塞 I/O

**文件：** `miniprogram/utils/cache.js`，第 8、16、30、39 行

**问题代码：**
```javascript
wx.setStorageSync(CACHE_PREFIX + key, cacheData)   // 第 8 行
wx.getStorageSync(CACHE_PREFIX + key)               // 第 16 行
wx.removeStorageSync(CACHE_PREFIX + key)            // 第 30 行
wx.getStorageInfoSync()                             // 第 39 行
```

**问题说明：**
微信小程序中 `*Sync` 系列 API 会阻塞主线程。当缓存数据较大（如包含多个 todo 的 images）时，序列化/反序列化会导致界面卡顿。尤其在页面 `onLoad` 中同步读取缓存时，会影响首屏渲染。

**优化方案：**
```javascript
// 使用异步 API
const cache = {
  async set(key, data) {
    const cacheData = { data, timestamp: Date.now(), expiry: CACHE_EXPIRY }
    try {
      await wx.setStorage({ key: CACHE_PREFIX + key, data: cacheData })
    } catch (e) {
      console.error('Cache set error:', e)
    }
  },

  async get(key) {
    try {
      const res = await wx.getStorage({ key: CACHE_PREFIX + key })
      const cacheData = res.data
      if (Date.now() - cacheData.timestamp > cacheData.expiry) {
        await this.remove(key)
        return null
      }
      return cacheData.data
    } catch (e) {
      return null
    }
  }
}
```

---

### P09 [低] API 层无请求去重

**文件：** `miniprogram/utils/api.js`，第 3-18 行

**问题代码：**
```javascript
async call(name, data = {}) {
  try {
    const app = getApp()
    if (app && app.globalData.testMode && app.globalData.testOpenid) {
      data._testOpenid = app.globalData.testOpenid
    }
    const res = await wx.cloud.callFunction({ name, data })
    // ...
  }
}
```

**问题说明：**
如果用户快速点击或页面 `onShow` 中多次调用同一接口（如 `getToday`），会产生重复请求。没有防抖/去重机制，浪费云函数调用次数和网络资源。

**优化方案：**
```javascript
// 请求去重：相同请求在进行中时复用 Promise
const pendingRequests = {}

const api = {
  async call(name, data = {}) {
    const key = `${name}_${JSON.stringify(data)}`

    // 去重：相同请求返回同一个 Promise
    if (pendingRequests[key]) {
      return pendingRequests[key]
    }

    pendingRequests[key] = (async () => {
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
      } finally {
        delete pendingRequests[key]
      }
    })()

    return pendingRequests[key]
  }
}
```

---

### P10 [低] 无批量操作接口

**文件：** `miniprogram/utils/api.js`，第 21-35 行

**问题代码：**
```javascript
todos: {
  create: (data) => api.call('todos', { action: 'create', ...data }),
  update: (data) => api.call('todos', { action: 'update', ...data }),
  delete: (todoId) => api.call('todos', { action: 'delete', todoId }),
  // ... 每个操作一次云函数调用
}
```

**问题说明：**
每个待办操作都是独立的云函数调用。如果用户批量删除 10 个待办，就需要 10 次云函数调用 + 10 次网络往返。云函数冷启动延迟叠加后体感明显。

**优化方案：**
```javascript
// 在 todos 云函数中增加 batch action
case 'batchDelete':
  return await batchDelete(openid, event)

// 前端增加批量 API
todos: {
  batchDelete: (todoIds) => api.call('todos', { action: 'batchDelete', todoIds }),
}

// 云函数实现
async function batchDelete(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoIds } = event

  const promises = todoIds.map(id =>
    db.collection('reminders').doc(id).update({
      data: { deletedAt: db.serverDate() }
    })
  )
  await Promise.all(promises)
  return { code: 0, msg: `Deleted ${todoIds.length} items` }
}
```

---

### P11 [低] lunar.js getLunarMonthDays 无缓存

**文件：** `miniprogram/utils/lunar.js`，第 29-42 行

**问题代码：**
```javascript
getLunarMonthDays(year, month) {
  const days = []
  const daysInMonth = new Date(year, month, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const lunarInfo = this.solarToLunar(year, month, d)  // 每天都计算一次
    days.push({
      day: d,
      lunarDay: lunarInfo.dayName,
      lunarMonth: lunarInfo.monthName,
      isLunarFirst: lunarInfo.day === 1
    })
  }
  return days
}
```

**问题说明：**
每次调用 `getLunarMonthDays` 都会循环计算 28-31 次农历转换。如果日历页面反复切换月份，相同月份会被重复计算。`lunar-javascript` 库内部虽然有优化，但外层循环 + 对象创建仍有开销。

**优化方案：**
```javascript
const monthCache = new Map()

const lunar = {
  // ... 其他方法不变

  getLunarMonthDays(year, month) {
    const cacheKey = `${year}-${month}`
    if (monthCache.has(cacheKey)) {
      return monthCache.get(cacheKey)
    }

    const days = []
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = this.solarToLunar(year, month, d)
      days.push({
        day: d,
        lunarDay: lunarInfo.dayName,
        lunarMonth: lunarInfo.monthName,
        isLunarFirst: lunarInfo.day === 1
      })
    }

    // 限制缓存大小，避免内存泄漏
    if (monthCache.size > 24) {
      const firstKey = monthCache.keys().next().value
      monthCache.delete(firstKey)
    }
    monthCache.set(cacheKey, days)
    return days
  }
}
```

---

### P12 [低] logActivity 串行写入阻塞主流程

**文件：** `cloudfunctions/todos/index.js`，第 49-60 行

**问题代码：**
```javascript
async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  await db.collection('activity_logs').add({
    data: {
      familyGroupId, userId, action, targetTitle, detail,
      createdAt: db.serverDate()
    }
  })
}
```

**问题说明：**
`logActivity` 在 `createTodo`（第 98 行）、`updateTodo`（第 127 行）、`deleteTodo`（第 145 行）、`completeTodo`（第 178 行）中被 `await` 调用。日志写入不是核心业务逻辑，不应阻塞主操作的返回。

**优化方案：**
```javascript
// 使用 fire-and-forget 模式，不阻塞返回
function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  // 故意不 await，让日志写入异步执行
  db.collection('activity_logs').add({
    data: {
      familyGroupId, userId, action, targetTitle, detail,
      createdAt: db.serverDate()
    }
  }).catch(err => {
    console.error('Failed to log activity:', err)
  })
}

// createTodo 中改为：
logActivity(user.familyGroupId, user._id, 'create', title, `创建了待办: ${title}`)
return { code: 0, data: todoData }  // 不等待日志写入完成
```

---

## 综合建议

### 优先级排序

**应立即修复（P01、P02）：**
- 统一各云函数的用户查询入口，消除重复 DB 读取
- 为 images 字段增加大小限制，批量查询时排除 images 字段

**建议尽快优化（P03-P07）：**
- 各云函数 main 入口统一查询用户后分发
- `joinFamily` 中无依赖操作改为 `Promise.all`
- `getLogs` 返回总数信息
- `cache.clear()` 改用键索引

**可安排迭代优化（P08-P12）：**
- 缓存模块全部改为异步 API
- API 层增加请求去重
- 增加批量操作接口
- lunar 计算结果缓存
- 日志写入改为非阻塞
