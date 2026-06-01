# 代码重复分析报告

## 概述

本报告对项目中的代码重复进行了全面分析，涵盖云函数、页面 JS 和 WXSS 样式文件。共发现 **8 类主要重复模式**，涉及约 **20+ 处重复代码**。

---

## 一、云函数重复分析

### 重复 1：SDK 初始化模板（4 个文件完全相同）

**位置：**
- `cloudfunctions/todos/index.js` 第 1-4 行
- `cloudfunctions/users/index.js` 第 1-4 行
- `cloudfunctions/notifications/index.js` 第 1-4 行
- `cloudfunctions/activity-logs/index.js` 第 1-4 行

**重复代码：**
```js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
```

**重构方案：** 提取为共享模块 `cloudfunctions/shared/db.js`：
```js
// cloudfunctions/shared/db.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
module.exports = { cloud, db, _ }
```
各云函数引用：`const { cloud, db, _ } = require('../shared/db')`

---

### 重复 2：main 函数入口模板（4 个文件结构相同）

**位置：**
- `cloudfunctions/todos/index.js` 第 6-41 行
- `cloudfunctions/users/index.js` 第 6-31 行
- `cloudfunctions/notifications/index.js` 第 6-23 行
- `cloudfunctions/activity-logs/index.js` 第 6-17 行

**重复代码：**
```js
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event
  switch (action) {
    // ...
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}
```

**重构方案：** 提取路由工厂函数到 `cloudfunctions/shared/router.js`：
```js
// cloudfunctions/shared/router.js
const { cloud } = require('./db')

function createRouter(handlers) {
  return async (event, context) => {
    const wxContext = cloud.getWXContext()
    const openid = event._testOpenid || wxContext.OPENID
    const { action } = event
    const handler = handlers[action]
    if (!handler) return { code: -1, msg: 'Unknown action' }
    return await handler(openid, event)
  }
}
module.exports = { createRouter }
```
使用方式：
```js
const { createRouter } = require('../shared/router')
exports.main = createRouter({
  create: createTodo,
  update: updateTodo,
  // ...
})
```

---

### 重复 3：用户查询模式（出现 10+ 次）

**位置与代码：**

`cloudfunctions/users/index.js` 中出现 7 次（第 35、77、94、109、131、167、182、188 行）：
```js
const user = await db.collection('users').where({ openid }).get()
if (user.data.length === 0) return { code: -1, msg: 'User not found' }
```

`cloudfunctions/notifications/index.js` 中出现 2 次（第 27、59 行）：
```js
const user = await db.collection('users').where({ openid }).get()
if (user.data.length === 0) return { code: -1, msg: 'User not found' }
const userId = user.data[0]._id
```

`cloudfunctions/activity-logs/index.js` 第 21 行：
```js
const user = await db.collection('users').where({ openid }).get()
if (user.data.length === 0) return { code: -1, msg: 'User not found' }
```

`cloudfunctions/todos/index.js` 第 43-47 行（使用了不同的错误处理方式 - 抛出异常）：
```js
async function getUserAndFamily(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  return user.data[0]
}
```

**问题：**
1. 同一查询逻辑在 4 个文件中重复 10+ 次
2. 错误处理不一致：`todos` 用 `throw`，其他用 `return { code: -1 }`

**重构方案：** 统一提取到 `cloudfunctions/shared/user.js`：
```js
// cloudfunctions/shared/user.js
const { db } = require('./db')

async function getUserByOpenid(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return null
  return user.data[0]
}

// 带错误返回的版本（适用于大多数场景）
async function requireUser(openid) {
  const user = await getUserByOpenid(openid)
  if (!user) return { user: null, error: { code: -1, msg: 'User not found' } }
  return { user, error: null }
}

module.exports = { getUserByOpenid, requireUser }
```
使用方式：
```js
const { requireUser } = require('../shared/user')

async function updateProfile(openid, event) {
  const { user, error } = await requireUser(openid)
  if (error) return error
  // ... 继续业务逻辑
}
```

---

### 重复 4：todogroup 查询条件模板（5 个查询函数）

**位置：** `cloudfunctions/todos/index.js`
- 第 190-199 行 (`getTodayTodos`)
- 第 208-218 行 (`getTodosByDate`)
- 第 229-239 行 (`getTodosByMonth`)
- 第 247-257 行 (`searchTodos`)
- 第 264-273 行 (`getDeletedTodos`)
- 第 295-305 行 (`getAllTodos`)

**重复代码：**
```js
const user = await getUserAndFamily(openid)
const res = await db.collection('reminders')
  .where({
    familyGroupId: user.familyGroupId,
    deletedAt: null,  // 或其他条件
    // ... 额外条件
  })
  .orderBy(...)
  .limit(50)
  .get()
return { code: 0, data: res.data }
```

**重构方案：** 提取查询构建器：
```js
function buildBaseQuery(familyGroupId, extraFilter = {}) {
  return db.collection('reminders').where({
    familyGroupId,
    deletedAt: null,
    ...extraFilter
  })
}

async function getTodayTodos(openid) {
  const user = await getUserAndFamily(openid)
  const today = new Date().toISOString().split('T')[0]
  const res = await buildBaseQuery(user.familyGroupId, { dueDate: today })
    .orderBy('dueTime', 'asc').limit(50).get()
  return { code: 0, data: res.data }
}
```

---

## 二、页面 JS 重复分析

### 重复 5：成员加载模式（4 个页面）

**位置：**
- `miniprogram/pages/index/index.js` 第 43-46 行
- `miniprogram/pages/todo-add/todo-add.js` 第 93-103 行
- `miniprogram/pages/search/search.js` 第 5-8 行
- `miniprogram/pages/todo-detail/todo-detail.js` 第 19-20 行

**重复代码：**
```js
const res = await api.users.getFamilyMembers()
if (res && res.data) {
  this.setData({ members: res.data })
}
```

**重构方案：** 在 `api.js` 中封装，或创建 mixin/behavior：
```js
// miniprogram/utils/page-helpers.js
async function loadMembers(page) {
  const res = await api.users.getFamilyMembers()
  if (res && res.data) {
    page.setData({ members: res.data })
  }
  return res && res.data ? res.data : []
}
module.exports = { loadMembers }
```

---

### 重复 6：颜色映射定义（3 个文件）

**位置：**
- `miniprogram/pages/todo-detail/todo-detail.js` 第 9 行：
  ```js
  colorMap: { red: '#ff4d4f', blue: '#4A90D9', green: '#52c41a', yellow: '#faad14' }
  ```
- `miniprogram/pages/calendar/calendar.js` 第 67 行：
  ```js
  const colorMap = { red: '#ff4d4f', blue: '#4A90D9', green: '#52c41a', yellow: '#faad14' }
  ```
- `miniprogram/pages/todo-add/todo-add.js` 第 33-37 行（以数组形式）：
  ```js
  colors: [
    { label: '红', value: 'red', hex: '#ff4d4f' },
    { label: '蓝', value: 'blue', hex: '#4A90D9' },
    { label: '绿', value: 'green', hex: '#52c41a' },
    { label: '黄', value: 'yellow', hex: '#faad14' }
  ]
  ```

**重构方案：** 提取到 `miniprogram/config.js`（项目已有此文件）：
```js
// miniprogram/config.js 中添加
const COLORS = {
  red: '#ff4d4f',
  blue: '#4A90D9',
  green: '#52c41a',
  yellow: '#faad14'
}

const COLOR_OPTIONS = [
  { label: '红', value: 'red', hex: COLORS.red },
  { label: '蓝', value: 'blue', hex: COLORS.blue },
  { label: '绿', value: 'green', hex: COLORS.green },
  { label: '黄', value: 'yellow', hex: COLORS.yellow }
]

module.exports = { COLORS, COLOR_OPTIONS, /* ...existing exports */ }
```

---

### 重复 7：分类与重复映射（2 个文件）

**位置：**
- `miniprogram/pages/todo-detail/todo-detail.js` 第 3-4 行：
  ```js
  const categoryMap = { daily: '日常', shopping: '购物', family: '家庭', bill: '账单', other: '其他' }
  const repeatMap = { none: '不重复', daily: '每天', weekly: '每周', monthly: '每月', lunar_yearly: '农历每年' }
  ```
- `miniprogram/pages/todo-add/todo-add.js` 第 25-44 行（以数组形式定义了相同的映射）

**重构方案：** 提取到 `miniprogram/config.js`：
```js
const CATEGORIES = [
  { label: '日常', value: 'daily' },
  { label: '购物', value: 'shopping' },
  { label: '家庭', value: 'family' },
  { label: '账单', value: 'bill' },
  { label: '其他', value: 'other' }
]

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))

const REPEAT_OPTIONS = [
  { label: '不重复', value: 'none' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '农历每年', value: 'lunar_yearly' }
]

const REPEAT_MAP = Object.fromEntries(REPEAT_OPTIONS.map(r => [r.value, r.label]))

module.exports = { CATEGORIES, CATEGORY_MAP, REPEAT_OPTIONS, REPEAT_MAP, /* ... */ }
```

---

### 重复 8：农历日期转换模式（3 处）

**位置：**
- `miniprogram/pages/todo-detail/todo-detail.js` 第 24-26 行
- `miniprogram/pages/todo-add/todo-add.js` 第 63-65 行、第 111-113 行、第 152-154 行

**重复代码：**
```js
const parts = date.split('-').map(Number)
const lunarInfo = lunar.solarToLunar(parts[0], parts[1], parts[2])
// 使用 lunarInfo.monthName, lunarInfo.dayName, lunarInfo.fullName 等
```

**重构方案：** 在 `miniprogram/utils/lunar.js` 中添加便捷方法：
```js
// miniprogram/utils/lunar.js 中添加
function fromDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return solarToLunar(y, m, d)
}

module.exports = { solarToLunar, fromDateStr, /* ...existing exports */ }
```
使用方式：
```js
const lunarInfo = lunar.fromDateStr(this.data.dueDate)
```

---

## 三、WXSS 样式重复分析

### 重复 9：`.container` 基础样式（7 个文件）

**位置：**
- `miniprogram/pages/todo-detail/todo-detail.wxss` 第 1 行
- `miniprogram/pages/calendar/calendar.wxss` 第 1 行
- `miniprogram/pages/search/search.wxss` 第 1 行
- `miniprogram/pages/family/family.wxss` 第 1 行
- `miniprogram/pages/recycle-bin/recycle-bin.wxss` 第 1 行
- `miniprogram/pages/activity-log/activity-log.wxss` 第 1 行
- `miniprogram/pages/mine/mine.wxss` 第 1-3 行

**重复代码：**
```css
.container { min-height: 100vh; background: #f5f5f5; }
```

**重构方案：** 已在 `app.wxss` 中定义了全局样式，但 `.container` 未包含在内。添加到 `app.wxss`：
```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
}
```
然后从各页面 WXSS 中删除重复定义。

---

### 重复 10：`.btn-primary` 按钮样式（3 处定义不一致）

**位置：**
- `miniprogram/app.wxss` 第 21-28 行（全局定义）
- `miniprogram/pages/settings/settings.wxss` 第 64-71 行（覆盖定义，多了 `height` 和 `line-height`）
- `miniprogram/pages/todo-add/todo-add.wxss` 第 21 行（覆盖定义，多了 `font-size`）

**问题：** 全局已定义 `.btn-primary`，但各页面又重新定义，导致样式不一致。

**重构方案：** 统一到 `app.wxss`，使用 CSS 变量或 modifier 类：
```css
/* app.wxss */
.btn-primary {
  background: #4A90D9;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  text-align: center;
}
```
从 settings.wxss 和 todo-add.wxss 中删除重复定义。

---

### 重复 11：表单相关样式（2 个文件）

**位置：**
- `miniprogram/pages/settings/settings.wxss` 第 17-23 行 (`.form-item`)、第 27-31 行 (`.label`)、第 33-38 行 (`.input`)
- `miniprogram/pages/todo-add/todo-add.wxss` 第 3 行 (`.form-item`)、第 4 行 (`.label`)、第 5 行 (`.input`)

**重复代码（settings.wxss）：**
```css
.form-item { padding: 24rpx; border-bottom: 1rpx solid #f5f5f5; display: flex; align-items: center; justify-content: space-between; }
.label { font-size: 30rpx; color: #333; min-width: 120rpx; }
.input { flex: 1; font-size: 30rpx; color: #333; text-align: right; }
```

**重复代码（todo-add.wxss）：**
```css
.form-item { padding: 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.label { font-size: 28rpx; color: #666; display: block; margin-bottom: 12rpx; }
.input { font-size: 30rpx; color: #333; width: 100%; }
```

**重构方案：** 提取通用表单样式到 `app.wxss`：
```css
.form-item {
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.form-label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}
.form-input {
  font-size: 30rpx;
  color: #333;
  width: 100%;
}
```

---

### 重复 12：标签/选项卡样式（3+ 个文件）

**位置：**
- `miniprogram/pages/settings/settings.wxss` 第 45-57 行 (`.role-tag`)
- `miniprogram/pages/todo-add/todo-add.wxss` 第 10-11 行 (`.category-tag`, `.repeat-tag`, `.notify-tag`)、第 16-17 行 (`.assignee-tag`)
- `miniprogram/components/category-filter/category-filter.wxss` 第 8-21 行 (`.filter-item`)

**共同模式：**
```css
/* 基础态 */
padding: 12rpx 24rpx; border-radius: 8rpx; font-size: 26rpx; background: #f5f5f5; color: #666;
/* 激活态 */
background: #4A90D9; color: #fff;
```

**重构方案：** 提取通用标签组件样式到 `app.wxss`：
```css
.tag {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
}
.tag.active {
  background: #4A90D9;
  color: #fff;
}
```

---

### 重复 13：头像圆形样式（3 个文件）

**位置：**
- `miniprogram/pages/mine/mine.wxss` 第 13-25 行 (`.user-avatar`)
- `miniprogram/pages/family/family.wxss` 第 9 行 (`.member-avatar`)
- `miniprogram/pages/activity-log/activity-log.wxss` 第 3 行 (`.log-avatar`)

**共同模式：**
```css
width: XXrpx; height: XXrpx; line-height: XXrpx; text-align: center;
background: #4A90D9; color: #fff; border-radius: 50%;
```

**重构方案：** 提取到 `app.wxss`：
```css
.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4A90D9;
  color: #fff;
  border-radius: 50%;
}
.avatar-sm { width: 48rpx; height: 48rpx; font-size: 24rpx; }
.avatar-md { width: 56rpx; height: 56rpx; font-size: 26rpx; }
.avatar-lg { width: 64rpx; height: 64rpx; font-size: 28rpx; }
.avatar-xl { width: 100rpx; height: 100rpx; font-size: 44rpx; }
```

---

## 四、总结与优先级建议

| 优先级 | 重复项 | 影响范围 | 难度 |
|--------|--------|----------|------|
| **高** | 用户查询模式（重复 3） | 4 个云函数，10+ 处 | 低 |
| **高** | SDK 初始化模板（重复 1） | 4 个云函数 | 低 |
| **高** | main 函数入口模板（重复 2） | 4 个云函数 | 低 |
| **中** | `.container` 样式（重复 9） | 7 个页面 | 低 |
| **中** | 颜色/分类映射（重复 6、7） | 3 个页面 | 低 |
| **中** | 标签/选项卡样式（重复 12） | 3 个文件 | 低 |
| **中** | `.btn-primary` 不一致（重复 10） | 3 个文件 | 低 |
| **低** | 农历日期转换（重复 8） | 2 个页面 | 低 |
| **低** | 成员加载模式（重复 5） | 4 个页面 | 低 |
| **低** | 表单样式（重复 11） | 2 个页面 | 低 |
| **低** | 头像样式（重复 13） | 3 个文件 | 低 |

### 建议实施顺序

1. **第一步（云函数共享模块）：** 创建 `cloudfunctions/shared/` 目录，提取 `db.js`、`router.js`、`user.js`，可消除约 60% 的云函数重复代码。
2. **第二步（前端配置常量）：** 将颜色、分类、重复选项等常量统一到 `miniprogram/config.js`。
3. **第三步（全局样式）：** 将 `.container`、`.btn-primary`、`.tag`、`.avatar` 等通用样式统一到 `app.wxss`，删除各页面重复定义。

预计重构后可减少约 **300-400 行重复代码**，同时提升一致性和可维护性。
