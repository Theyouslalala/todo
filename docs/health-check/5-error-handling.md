# 5. 错误处理与日志审计报告

**审计日期**: 2026-06-01  
**审计范围**: 所有云函数、页面 JS、工具类、组件  

---

## 一、未使用 try-catch 包裹的异步操作

### 严重程度：高

云函数和小程序页面中大量异步操作缺少 try-catch，数据库异常或网络错误会以原始堆栈信息返回客户端，既不安全也不友好。

#### 1.1 云函数主入口缺少顶层 try-catch

所有四个云函数的 `exports.main` 均无顶层错误捕获，任何未处理的异常会直接暴露给客户端。

**文件**: `cloudfunctions/todos/index.js` 第 6-41 行

```js
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event
  switch (action) {
    case 'create':
      return await createTodo(openid, event)
    // ...
  }
}
```

**修复**:

```js
exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext()
    const openid = event._testOpenid || wxContext.OPENID
    const { action } = event
    switch (action) {
      case 'create':
        return await createTodo(openid, event)
      // ...
    }
  } catch (err) {
    console.error('todos error:', err)
    return { code: -1, msg: '服务内部错误' }
  }
}
```

**文件**: `cloudfunctions/users/index.js` 第 6-31 行  
**文件**: `cloudfunctions/notifications/index.js` 第 6-23 行  
**文件**: `cloudfunctions/activity-logs/index.js` 第 6-17 行  

以上三个云函数存在相同问题，均需添加顶层 try-catch。

---

#### 1.2 云函数内部操作缺少 try-catch

以下函数内部执行多个数据库操作，任一步骤失败都会导致未捕获异常：

**文件**: `cloudfunctions/todos/index.js`

| 函数 | 行号 | 说明 |
|------|------|------|
| `createTodo` | 62-104 | getUserAndFamily + db.add + logActivity，三步均无保护 |
| `updateTodo` | 106-133 | getUserAndFamily + db.update + logActivity |
| `deleteTodo` | 135-151 | getUserAndFamily + db.get + db.update + logActivity |
| `restoreTodo` | 153-162 | getUserAndFamily + db.update |
| `completeTodo` | 164-184 | getUserAndFamily + db.get + db.update + logActivity |
| `getTodayTodos` | 186-202 | getUserAndFamily + db.where.get |
| `getTodosByDate` | 204-219 | 同上 |
| `getTodosByMonth` | 221-241 | 同上 |
| `searchTodos` | 243-259 | 同上 |
| `getDeletedTodos` | 261-274 | 同上 |
| `getAllTodos` | 293-306 | 同上 |

以 `createTodo` 为例：

```js
async function createTodo(openid, event) {
  const user = await getUserAndFamily(openid)  // 可能抛出 'User not found'
  // ... 无 try-catch
  const res = await db.collection('reminders').add({ data: todoData })  // DB 可能失败
  await logActivity(...)  // 日志写入可能失败
  return { code: 0, data: todoData }
}
```

**修复**: 在 `exports.main` 中添加顶层 try-catch（见 1.1），或在每个函数内部添加。

**文件**: `cloudfunctions/users/index.js`

| 函数 | 行号 | 说明 |
|------|------|------|
| `login` | 33-73 | 多次 DB 操作，无 try-catch |
| `updateProfile` | 75-90 | DB 查询 + 更新 |
| `updateSettings` | 92-105 | DB 查询 + 更新 |
| `createFamily` | 107-127 | DB 查询 + 创建 + 更新 |
| `joinFamily` | 129-164 | 仅旧家庭移除有 try-catch，其余无 |
| `getFamilyMembers` | 166-179 | 多次 DB 查询 |
| `getUserInfo` | 181-185 | DB 查询 |

**文件**: `cloudfunctions/notifications/index.js`

| 函数 | 行号 | 说明 |
|------|------|------|
| `updateSubscription` | 25-55 | 多次 DB 操作 |
| `getSubscriptionCount` | 57-68 | DB 查询 |
| `batchSubscribe` | 109-112 | 委托给 updateSubscription |

**文件**: `cloudfunctions/activity-logs/index.js`

| 函数 | 行号 | 说明 |
|------|------|------|
| `getLogs` | 19-47 | 多次 DB 查询，userIds 为空时 _.in([]) 可能报错 |

---

#### 1.3 小程序页面异步操作缺少 try-catch

所有页面的 `onLoad`、数据加载、用户操作回调中的异步调用均无 try-catch。虽然 `api.js` 的 `call` 方法有统一捕获，但 `call` 内部只处理了 `callFunction` 本身的异常，对于 `res.result.code === -1` 的业务错误只是 showToast 并返回 null，页面侧未做 null 检查时仍可能出错。

**文件**: `miniprogram/pages/index/index.js`

```js
// 第 43-48 行
async loadData() {
  const memberRes = await api.users.getFamilyMembers()
  if (memberRes && memberRes.data) {  // 有 null 检查，OK
    this.setData({ members: memberRes.data })
  }
  await this.loadTodos()
}
```

部分页面有 null 检查（如 index.js），但以下页面缺少对 `res` 为 null 的防护：

**文件**: `miniprogram/pages/calendar/calendar.js` 第 56-63 行

```js
async loadMonthTodos() {
  const { year, month } = this.data
  const res = await api.todos.getByMonth(year, month)
  if (res && res.data) {  // 有检查，OK
    // ...
  }
}
```

**文件**: `miniprogram/pages/todo-add/todo-add.js` 第 125-178 行

```js
async onSubmit() {
  // ...
  let res
  if (this.data.isEdit) {
    res = await api.todos.update({ todoId: this.todoId, ...todoData })
  } else {
    res = await api.todos.create(todoData)
  }
  wx.hideLoading()
  if (res && res.code === 0) {  // 有检查，但 hideLoading 在 res 为 null 时仍执行
    // ...
  }
  // res 为 null 时无错误提示（api.call 已 showToast，此处可接受）
}
```

**结论**: 页面侧因 `api.js` 有统一错误处理，风险较低。但建议在关键路径（如删除、创建）添加 try-catch 以防万一。

---

## 二、空 catch 块吞没错误

### 严重程度：中

#### 2.1 空 catch 块 - 旧家庭移除

**文件**: `cloudfunctions/users/index.js` 第 146-153 行

```js
if (userData.familyGroupId) {
  try {
    await db.collection('family_groups').doc(userData.familyGroupId).update({
      data: { members: _.pull(userData._id) }
    })
  } catch (err) {
    // Old family may have been deleted, ignore
  }
}
```

**问题**: 完全吞没错误，无法排查旧家庭数据不一致问题。

**修复**:

```js
} catch (err) {
  console.warn(`移除旧家庭成员失败 (familyGroupId: ${userData.familyGroupId}):`, err.message)
}
```

#### 2.2 静默忽略查询错误

**文件**: `cloudfunctions/todos/index.js` 第 280-287 行

```js
try {
  const todo = await db.collection('reminders').doc(todoId).get()
  if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
    return { code: -1, msg: 'Todo not found' }
  }
} catch (err) {
  return { code: -1, msg: 'Todo not found' }
}
```

**文件**: `cloudfunctions/todos/index.js` 第 312-320 行

```js
try {
  const res = await db.collection('reminders').doc(todoId).get()
  if (res.data && res.data.familyGroupId === user.familyGroupId) {
    return { code: 0, data: res.data }
  }
  return { code: -1, msg: 'Todo not found' }
} catch (err) {
  return { code: -1, msg: 'Todo not found' }
}
```

**问题**: catch 块将所有错误统一返回 "Todo not found"，掩盖了数据库连接超时等非预期错误。

**修复**:

```js
} catch (err) {
  console.error(`查询待办失败 (todoId: ${todoId}):`, err)
  if (err.errCode === -1 || err.message.includes('not exist')) {
    return { code: -1, msg: 'Todo not found' }
  }
  return { code: -1, msg: '查询失败，请重试' }
}
```

---

## 三、抛出字符串而非 Error 对象

### 严重程度：低

经扫描，项目中所有 `throw` 语句均使用 `new Error()` 形式，未发现直接抛出字符串的情况。

**文件**: `cloudfunctions/todos/index.js` 第 45 行

```js
if (user.data.length === 0) throw new Error('User not found')
```

此项检查通过，无问题。

---

## 四、错误日志中的敏感信息泄露

### 严重程度：高

#### 4.1 云函数向客户端暴露原始错误信息

**文件**: `cloudfunctions/notifications/index.js` 第 104-106 行

```js
} catch (err) {
  return { code: -1, msg: err.message }
}
```

**问题**: `cloud.openapi.subscribeMessage.send` 的错误可能包含 AppSecret 相关信息、模板配置详情、API 内部错误码等。直接将 `err.message` 返回客户端存在信息泄露风险。

**修复**:

```js
} catch (err) {
  console.error('发送通知失败:', err)
  return { code: -1, msg: '通知发送失败' }
}
```

#### 4.2 调试面板暴露 OpenID

**文件**: `miniprogram/pages/mine/mine.js` 第 82-86 行

```js
const info = await api.users.getUserInfo()
wx.showModal({
  title: '当前信息',
  content: 'OpenID: ' + (info.data ? info.data.openid : 'unknown'),
  showCancel: false
})
```

**问题**: 虽然隐藏在 5 次点击后的调试菜单中，但 OpenID 是用户永久标识符，在界面上明文展示存在被截屏泄露的风险。建议仅在开发环境中启用。

**修复**:

```js
} else {
  // #ifdef DEBUG 或通过环境变量控制
  const info = await api.users.getUserInfo()
  wx.showModal({
    title: '当前信息',
    content: 'OpenID: ' + (info.data ? info.data.openid.slice(0, 6) + '***' : 'unknown'),
    showCancel: false
  })
}
```

---

## 五、关键路径缺少日志

### 严重程度：中

关键业务操作（登录、创建、删除）缺少 `console.log`/`console.error` 日志，线上问题排查困难。虽然 `logActivity()` 记录了操作日志到数据库，但云函数控制台无法看到这些记录。

#### 5.1 登录与注册

**文件**: `miniprogram/app.js` 第 16-39 行

```js
async login() {
  try {
    let res = await wx.cloud.callFunction({ name: 'users', data: { action: 'getUserInfo' } })
    if (res.result.code === 0) {
      this.globalData.userInfo = res.result.data
      // 缺少: console.log('用户登录成功:', res.result.data.name)
    } else {
      res = await wx.cloud.callFunction({ name: 'users', data: { action: 'login', name: '家庭成员' } })
      if (res.result.code === 0) {
        this.globalData.userInfo = res.result.data
        // 缺少: console.log('新用户注册成功')
      }
    }
  } catch (err) {
    console.error('Login failed:', err)  // 仅有失败日志，无成功日志
  }
}
```

**修复**: 在登录和注册成功分支添加 `console.log`。

**文件**: `cloudfunctions/users/index.js` 第 33-73 行 `login` 函数

```js
async function login(openid, event) {
  // ...无任何日志
  const userRes = await db.collection('users').add({ data: userData })
  // 缺少: console.log(`新用户注册: openid=${openid}, familyId=${familyRes._id}`)
  return { code: 0, data: userData }
}
```

#### 5.2 创建待办

**文件**: `cloudfunctions/todos/index.js` 第 62-104 行 `createTodo`

```js
const res = await db.collection('reminders').add({ data: todoData })
// 缺少: console.log(`待办创建成功: id=${res._id}, title=${title}`)
await logActivity(...)  // 仅写数据库，无控制台日志
return { code: 0, data: todoData }
```

#### 5.3 删除操作

**文件**: `cloudfunctions/todos/index.js` 第 135-151 行 `deleteTodo`

```js
await db.collection('reminders').doc(todoId).update({
  data: { deletedAt: db.serverDate() }
})
// 缺少: console.log(`待办已删除: todoId=${todoId}`)
await logActivity(...)
```

**文件**: `cloudfunctions/todos/index.js` 第 276-291 行 `permanentDeleteTodo`

```js
await db.collection('reminders').doc(todoId).remove()
// 缺少: console.log(`待办已永久删除: todoId=${todoId}`)
return { code: 0, msg: 'Permanently deleted' }
```

#### 5.4 完成待办

**文件**: `cloudfunctions/todos/index.js` 第 164-184 行 `completeTodo`

```js
await db.collection('reminders').doc(todoId).update({
  data: { status: 'completed', completedAt: db.serverDate(), updatedAt: db.serverDate() }
})
// 缺少: console.log(`待办已完成: todoId=${todoId}`)
```

#### 5.5 更新待办

**文件**: `cloudfunctions/todos/index.js` 第 106-133 行 `updateTodo`

```js
await db.collection('reminders').doc(todoId).update({ data: updateFields })
// 缺少: console.log(`待办已更新: todoId=${todoId}`)
```

#### 5.6 用户资料与设置变更

**文件**: `cloudfunctions/users/index.js`

| 函数 | 行号 | 缺失日志 |
|------|------|----------|
| `updateProfile` | 75-90 | 无 console.log 记录资料变更 |
| `updateSettings` | 92-105 | 无 console.log 记录设置变更 |
| `createFamily` | 107-127 | 无 console.log 记录家庭创建 |
| `joinFamily` | 129-164 | 无 console.log 记录家庭加入 |

---

## 六、其他值得注意的问题

#### 6.1 `logActivity` 失败会中断主流程

**文件**: `cloudfunctions/todos/index.js` 第 49-60 行

```js
async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  await db.collection('activity_logs').add({ data: { ... } })
}
```

**问题**: `logActivity` 被 `createTodo`、`deleteTodo`、`completeTodo` 等函数调用，且使用 `await`。如果活动日志写入失败（如集合权限问题），会导致整个主操作失败返回错误。

**修复**: 将 `logActivity` 改为 fire-and-forget 或添加内部 try-catch：

```js
async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  try {
    await db.collection('activity_logs').add({
      data: { familyGroupId, userId, action, targetTitle, detail, createdAt: db.serverDate() }
    })
  } catch (err) {
    console.error('活动日志写入失败:', err)
  }
}
```

#### 6.2 `image.compress` 失败时静默返回原路径

**文件**: `miniprogram/utils/image.js` 第 3-10 行

```js
async compress(filePath, maxWidth = 800, quality = 80) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: filePath,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(filePath)  // 压缩失败时静默返回原文件
    })
  })
}
```

**问题**: 压缩失败时返回原文件路径，调用方无法感知压缩失败，可能导致上传超大图片。

**修复**:

```js
fail: (err) => {
  console.warn('图片压缩失败，使用原文件:', err)
  resolve(filePath)
}
```

#### 6.3 `notification.promptIfNeeded` 中的 `requestSubscribe` 未捕获异常

**文件**: `miniprogram/utils/notification.js` 第 32-44 行

```js
async promptIfNeeded(templateId, threshold = 3) {
  const res = await api.notifications.getSubscriptionCount(templateId)
  if (res && res.data && res.data.count < threshold) {
    wx.showModal({
      // ...
      success: (modalRes) => {
        if (modalRes.confirm) {
          this.requestSubscribe(templateId)  // 返回 Promise，未 await 也未 catch
        }
      }
    })
  }
}
```

**问题**: `requestSubscribe` 内部会 reject（第 17 行），但此处调用未处理 rejection。

**修复**:

```js
if (modalRes.confirm) {
  this.requestSubscribe(templateId).catch(err => {
    console.warn('订阅通知失败:', err)
  })
}
```

---

## 七、问题汇总

| 类别 | 数量 | 严重程度 |
|------|------|----------|
| 异步操作无 try-catch | 4 个云函数入口 + 20+ 个内部函数 + 10+ 个页面方法 | 高 |
| 空 catch 块吞没错误 | 3 处 | 中 |
| 抛出字符串而非 Error | 0 处 | - |
| 敏感信息泄露 | 2 处 | 高 |
| 关键路径缺少日志 | 12+ 处 | 中 |
| logActivity 失败阻断主流程 | 1 处 | 中 |
| 其他问题 | 2 处 | 低 |

### 优先修复建议

1. **P0** - 为所有 4 个云函数的 `exports.main` 添加顶层 try-catch，返回统一错误格式
2. **P0** - `notifications/index.js` 第 105 行停止向客户端返回 `err.message`
3. **P1** - `logActivity` 添加内部 try-catch，避免日志写入失败阻断业务
4. **P1** - 空 catch 块添加 `console.warn` 日志
5. **P2** - 关键路径（登录、创建、删除、完成）添加控制台日志
6. **P2** - `notification.promptIfNeeded` 中处理 Promise rejection
