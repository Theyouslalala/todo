# Family Reminder App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a WeChat mini-program for a family of three to share reminders, shopping lists, and calendar events with lunar date support.

**Architecture:** WeChat mini-program frontend + WeChat Cloud Development backend (cloud functions + cloud database). AI service as optional Python module. Three main tabs: Home (today's todos), Calendar (month view with lunar dates), Mine (settings, activity log, recycle bin).

**Tech Stack:** WeChat Mini-Program (WXML/WXSS/JS), WeChat Cloud Development (cloud functions, cloud database, cloud storage), lunar-javascript (lunar calendar), Python + FastAPI + PyTorch (AI, optional).

---

## File Structure

```
todo/
├── miniprogram/
│   ├── pages/
│   │   ├── index/           # Home - today's todos
│   │   │   ├── index.wxml
│   │   │   ├── index.wxss
│   │   │   ├── index.js
│   │   │   └── index.json
│   │   ├── calendar/        # Calendar page
│   │   │   ├── calendar.wxml
│   │   │   ├── calendar.wxss
│   │   │   ├── calendar.js
│   │   │   └── calendar.json
│   │   ├── mine/            # My page
│   │   │   ├── mine.wxml
│   │   │   ├── mine.wxss
│   │   │   ├── mine.js
│   │   │   └── mine.json
│   │   ├── todo-add/        # Add/edit todo
│   │   │   ├── todo-add.wxml
│   │   │   ├── todo-add.wxss
│   │   │   ├── todo-add.js
│   │   │   └── todo-add.json
│   │   ├── todo-detail/     # Todo detail
│   │   │   ├── todo-detail.wxml
│   │   │   ├── todo-detail.wxss
│   │   │   ├── todo-detail.js
│   │   │   └── todo-detail.json
│   │   ├── family/          # Family management
│   │   │   ├── family.wxml
│   │   │   ├── family.wxss
│   │   │   ├── family.js
│   │   │   └── family.json
│   │   ├── activity-log/    # Activity log
│   │   │   ├── activity-log.wxml
│   │   │   ├── activity-log.wxss
│   │   │   ├── activity-log.js
│   │   │   └── activity-log.json
│   │   ├── recycle-bin/     # Recycle bin
│   │   │   ├── recycle-bin.wxml
│   │   │   ├── recycle-bin.wxss
│   │   │   ├── recycle-bin.js
│   │   │   └── recycle-bin.json
│   │   └── search/          # Search
│   │       ├── search.wxml
│   │       ├── search.wxss
│   │       ├── search.js
│   │       └── search.json
│   ├── components/
│   │   ├── todo-card/
│   │   │   ├── todo-card.wxml
│   │   │   ├── todo-card.wxss
│   │   │   ├── todo-card.js
│   │   │   └── todo-card.json
│   │   ├── calendar-cell/
│   │   │   ├── calendar-cell.wxml
│   │   │   ├── calendar-cell.wxss
│   │   │   ├── calendar-cell.js
│   │   │   └── calendar-cell.json
│   │   ├── category-filter/
│   │   │   ├── category-filter.wxml
│   │   │   ├── category-filter.wxss
│   │   │   ├── category-filter.js
│   │   │   └── category-filter.json
│   │   └── quick-add/
│   │       ├── quick-add.wxml
│   │       ├── quick-add.wxss
│   │       ├── quick-add.js
│   │       └── quick-add.json
│   ├── utils/
│   │   ├── lunar.js
│   │   ├── api.js
│   │   ├── notification.js
│   │   ├── cache.js
│   │   └── image.js
│   ├── images/
│   ├── app.js
│   ├── app.json
│   ├── app.wxss
│   └── sitemap.json
├── cloudfunctions/
│   ├── todos/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   ├── users/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   ├── notifications/
│   │   ├── index.js
│   │   ├── package.json
│   │   └── config.json
│   └── activity-logs/
│       ├── index.js
│       ├── package.json
│       └── config.json
├── ai-service/
│   ├── app.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── classifier.py
│   │   └── time_recommender.py
│   ├── requirements.txt
│   ├── config.py
│   └── README.md
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-06-01-family-reminder-design.md
│       └── plans/
│           └── 2026-06-01-family-reminder-impl.md
├── README.md
├── LEARNING.md
├── .gitignore
└── project.config.json
```

---

## Task 1: Project Initialization

**Files:**
- Create: `.gitignore`
- Create: `project.config.json`
- Create: `README.md`

- [ ] **Step 1: Initialize Git repository**

```bash
cd "D:/Wang Yuhan/Desktop/Project/github_project/todo"
git init
```

- [ ] **Step 2: Create .gitignore**

```gitignore
# Node
node_modules/
npm-debug.log*

# WeChat mini-program
miniprogram_npm/
.idea/
.vscode/

# Python
ai-service/__pycache__/
ai-service/*.pyc
ai-service/.env
ai-service/venv/

# OS
.DS_Store
Thumbs.db

# Cloud functions node_modules
cloudfunctions/*/node_modules/

# Temporary
*.tmp
*.log
```

- [ ] **Step 3: Create project.config.json**

```json
{
  "miniprogramRoot": "miniprogram/",
  "cloudfunctionRoot": "cloudfunctions/",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "appid": "YOUR_APPID",
  "projectname": "family-reminder",
  "libVersion": "2.30.0",
  "cloudfunctionTemplateRoot": "",
  "condition": {}
}
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore project.config.json
git commit -m "chore: initialize project with gitignore and config"
```

---

## Task 2: Cloud Database Collections Setup

**Files:**
- Create: `docs/database-schema.md`

- [ ] **Step 1: Create database schema documentation**

This documents the collections to create in WeChat Cloud Development console.

```markdown
# Database Schema

## Collections to create in Cloud Console

### 1. users
- Fields: openid, name, avatar, role, familyGroupId, settings, createdAt
- Indexes: openid (unique)

### 2. reminders
- Fields: title, description, color, priority, category, dueDate, dueTime,
  isLunar, lunarDate, repeat, assignedTo, createdBy, familyGroupId,
  status, images, quantity, enableNotification, notifyBefore,
  createdAt, updatedAt, completedAt, deletedAt
- Indexes:
  - familyGroupId + status + dueDate
  - familyGroupId + category + status
  - assignedTo + status + dueDate

### 3. activity_logs
- Fields: familyGroupId, userId, action, targetTitle, detail, createdAt
- Indexes: familyGroupId + createdAt

### 4. notification_records
- Fields: userId, templateId, remainingCount, lastSubscribeAt, updatedAt
- Indexes: userId + templateId (unique)
```

- [ ] **Step 2: Commit**

```bash
git add docs/database-schema.md
git commit -m "docs: add database schema documentation"
```

---

## Task 3: Cloud Function - Users

**Files:**
- Create: `cloudfunctions/users/index.js`
- Create: `cloudfunctions/users/package.json`
- Create: `cloudfunctions/users/config.json`

- [ ] **Step 1: Create users cloud function package.json**

```json
{
  "name": "users",
  "version": "1.0.0",
  "description": "User management cloud function",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create users cloud function config.json**

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 3: Create users cloud function index.js**

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  switch (action) {
    case 'login':
      return await login(openid, event)
    case 'updateProfile':
      return await updateProfile(openid, event)
    case 'updateSettings':
      return await updateSettings(openid, event)
    case 'createFamily':
      return await createFamily(openid, event)
    case 'joinFamily':
      return await joinFamily(openid, event)
    case 'getFamilyMembers':
      return await getFamilyMembers(openid)
    case 'getUserInfo':
      return await getUserInfo(openid)
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}

async function login(openid, event) {
  const { name, avatar } = event
  const existing = await db.collection('users').where({ openid }).get()

  if (existing.data.length > 0) {
    return { code: 0, data: existing.data[0] }
  }

  // Generate invite code
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  // Create family group
  const familyRes = await db.collection('family_groups').add({
    data: {
      name: (name || '我的') + '的家庭',
      members: [],
      inviteCode,
      createdAt: db.serverDate()
    }
  })

  const userData = {
    openid,
    name: name || '家庭成员',
    avatar: avatar || '',
    role: 'child',
    familyGroupId: familyRes._id,
    settings: {
      fontSize: 'normal',
      enableAI: false
    },
    createdAt: db.serverDate()
  }

  const userRes = await db.collection('users').add({ data: userData })
  userData._id = userRes._id

  // Add user to family members
  await db.collection('family_groups').doc(familyRes._id).update({
    data: { members: _.push(userRes._id) }
  })

  return { code: 0, data: userData }
}

async function updateProfile(openid, event) {
  const { name, avatar, role } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const updateData = {}
  if (name) updateData.name = name
  if (avatar) updateData.avatar = avatar
  if (role) updateData.role = role

  await db.collection('users').doc(user.data[0]._id).update({
    data: updateData
  })

  return { code: 0, msg: 'Updated' }
}

async function updateSettings(openid, event) {
  const { settings } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  await db.collection('users').doc(user.data[0]._id).update({
    data: { settings }
  })

  return { code: 0, msg: 'Settings updated' }
}

async function createFamily(openid, event) {
  const { familyName } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const familyRes = await db.collection('family_groups').add({
    data: {
      name: familyName || '我的家庭',
      members: [user.data[0]._id],
      inviteCode,
      createdAt: db.serverDate()
    }
  })

  await db.collection('users').doc(user.data[0]._id).update({
    data: { familyGroupId: familyRes._id }
  })

  return { code: 0, data: { familyId: familyRes._id, inviteCode } }
}

async function joinFamily(openid, event) {
  const { inviteCode } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const family = await db.collection('family_groups')
    .where({ inviteCode }).get()
  if (family.data.length === 0) return { code: -1, msg: 'Invalid invite code' }

  const familyData = family.data[0]
  if (familyData.members.includes(user.data[0]._id)) {
    return { code: -1, msg: 'Already in this family' }
  }

  await db.collection('family_groups').doc(familyData._id).update({
    data: { members: _.push(user.data[0]._id) }
  })

  await db.collection('users').doc(user.data[0]._id).update({
    data: { familyGroupId: familyData._id }
  })

  return { code: 0, data: familyData }
}

async function getFamilyMembers(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const familyId = user.data[0].familyGroupId
  const family = await db.collection('family_groups').doc(familyId).get()
  const memberIds = family.data.members

  const members = await db.collection('users')
    .where({ _id: _.in(memberIds) })
    .get()

  return { code: 0, data: members.data }
}

async function getUserInfo(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }
  return { code: 0, data: user.data[0] }
}
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/users/
git commit -m "feat: add users cloud function with login, family management"
```

---

## Task 4: Cloud Function - Todos

**Files:**
- Create: `cloudfunctions/todos/index.js`
- Create: `cloudfunctions/todos/package.json`
- Create: `cloudfunctions/todos/config.json`

- [ ] **Step 1: Create todos cloud function package.json**

```json
{
  "name": "todos",
  "version": "1.0.0",
  "description": "Todo CRUD cloud function",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create todos cloud function config.json**

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 3: Create todos cloud function index.js**

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  switch (action) {
    case 'create':
      return await createTodo(openid, event)
    case 'update':
      return await updateTodo(openid, event)
    case 'delete':
      return await deleteTodo(openid, event)
    case 'restore':
      return await restoreTodo(openid, event)
    case 'complete':
      return await completeTodo(openid, event)
    case 'getToday':
      return await getTodayTodos(openid)
    case 'getByDate':
      return await getTodosByDate(openid, event)
    case 'getByMonth':
      return await getTodosByMonth(openid, event)
    case 'search':
      return await searchTodos(openid, event)
    case 'getDeleted':
      return await getDeletedTodos(openid)
    case 'permanentDelete':
      return await permanentDeleteTodo(openid, event)
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}

async function getUserAndFamily(openid) {
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  return user.data[0]
}

async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  await db.collection('activity_logs').add({
    data: {
      familyGroupId,
      userId,
      action,
      targetTitle,
      detail,
      createdAt: db.serverDate()
    }
  })
}

async function createTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const {
    title, description, color, priority, category,
    dueDate, dueTime, isLunar, lunarDate, repeat,
    assignedTo, images, quantity, enableNotification, notifyBefore
  } = event

  const todoData = {
    title,
    description: description || '',
    color: color || 'blue',
    priority: priority || 'medium',
    category: category || 'daily',
    dueDate: dueDate || new Date().toISOString().split('T')[0],
    dueTime: dueTime || '',
    isLunar: isLunar || false,
    lunarDate: lunarDate || '',
    repeat: repeat || 'none',
    assignedTo: assignedTo || user._id,
    createdBy: user._id,
    familyGroupId: user.familyGroupId,
    status: 'pending',
    images: images || [],
    quantity: quantity || '',
    enableNotification: enableNotification !== false,
    notifyBefore: notifyBefore || 15,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate(),
    completedAt: null,
    deletedAt: null
  }

  const res = await db.collection('reminders').add({ data: todoData })
  todoData._id = res._id

  await logActivity(
    user.familyGroupId, user._id, 'create',
    title, `创建了待办: ${title}`
  )

  return { code: 0, data: todoData }
}

async function updateTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId, ...updateFields } = event

  updateFields.updatedAt = db.serverDate()

  await db.collection('reminders').doc(todoId).update({
    data: updateFields
  })

  await logActivity(
    user.familyGroupId, user._id, 'update',
    updateFields.title || '', `更新了待办`
  )

  return { code: 0, msg: 'Updated' }
}

async function deleteTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  const todo = await db.collection('reminders').doc(todoId).get()

  await db.collection('reminders').doc(todoId).update({
    data: { deletedAt: db.serverDate() }
  })

  await logActivity(
    user.familyGroupId, user._id, 'delete',
    todo.data.title, `删除了待办: ${todo.data.title}`
  )

  return { code: 0, msg: 'Deleted (soft)' }
}

async function restoreTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  await db.collection('reminders').doc(todoId).update({
    data: { deletedAt: null }
  })

  return { code: 0, msg: 'Restored' }
}

async function completeTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  const todo = await db.collection('reminders').doc(todoId).get()

  await db.collection('reminders').doc(todoId).update({
    data: {
      status: 'completed',
      completedAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  await logActivity(
    user.familyGroupId, user._id, 'complete',
    todo.data.title, `完成了待办: ${todo.data.title}`
  )

  return { code: 0, msg: 'Completed' }
}

async function getTodayTodos(openid) {
  const user = await getUserAndFamily(openid)
  const today = new Date().toISOString().split('T')[0]

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      status: 'pending',
      deletedAt: null,
      dueDate: today
    })
    .orderBy('dueTime', 'asc')
    .limit(50)
    .get()

  return { code: 0, data: res.data }
}

async function getTodosByDate(openid, event) {
  const user = await getUserAndFamily(openid)
  const { date } = event

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: null,
      dueDate: date
    })
    .orderBy('dueTime', 'asc')
    .limit(50)
    .get()

  return { code: 0, data: res.data }
}

async function getTodosByMonth(openid, event) {
  const user = await getUserAndFamily(openid)
  const { year, month } = event

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: null,
      dueDate: _.gte(startDate).and(_.lte(endDate))
    })
    .orderBy('dueDate', 'asc')
    .orderBy('dueTime', 'asc')
    .limit(100)
    .get()

  return { code: 0, data: res.data }
}

async function searchTodos(openid, event) {
  const user = await getUserAndFamily(openid)
  const { keyword, skip = 0 } = event

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: null,
      title: db.RegExp({ regexp: keyword, options: 'i' })
    })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(20)
    .get()

  return { code: 0, data: res.data }
}

async function getDeletedTodos(openid) {
  const user = await getUserAndFamily(openid)

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: _.neq(null)
    })
    .orderBy('deletedAt', 'desc')
    .limit(50)
    .get()

  return { code: 0, data: res.data }
}

async function permanentDeleteTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  await db.collection('reminders').doc(todoId).remove()
  return { code: 0, msg: 'Permanently deleted' }
}
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/todos/
git commit -m "feat: add todos cloud function with CRUD, soft delete, search"
```

---

## Task 5: Cloud Function - Notifications

**Files:**
- Create: `cloudfunctions/notifications/index.js`
- Create: `cloudfunctions/notifications/package.json`
- Create: `cloudfunctions/notifications/config.json`

- [ ] **Step 1: Create notifications cloud function package.json**

```json
{
  "name": "notifications",
  "version": "1.0.0",
  "description": "Notification and subscription management",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create notifications cloud function config.json**

```json
{
  "permissions": {
    "openapi": ["subscribeMessage.send"]
  }
}
```

- [ ] **Step 3: Create notifications cloud function index.js**

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  switch (action) {
    case 'updateSubscription':
      return await updateSubscription(openid, event)
    case 'getSubscriptionCount':
      return await getSubscriptionCount(openid, event)
    case 'sendNotification':
      return await sendNotification(event)
    case 'batchSubscribe':
      return await batchSubscribe(openid, event)
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}

async function updateSubscription(openid, event) {
  const { templateId, count = 1 } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const userId = user.data[0]._id
  const existing = await db.collection('notification_records')
    .where({ userId, templateId }).get()

  if (existing.data.length > 0) {
    await db.collection('notification_records').doc(existing.data[0]._id).update({
      data: {
        remainingCount: _.inc(count),
        lastSubscribeAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
  } else {
    await db.collection('notification_records').add({
      data: {
        userId,
        templateId,
        remainingCount: count,
        lastSubscribeAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
  }

  return { code: 0, msg: 'Subscription updated' }
}

async function getSubscriptionCount(openid, event) {
  const { templateId } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const userId = user.data[0]._id
  const record = await db.collection('notification_records')
    .where({ userId, templateId }).get()

  const count = record.data.length > 0 ? record.data[0].remainingCount : 0
  return { code: 0, data: { count } }
}

async function sendNotification(event) {
  const { userId, templateId, data, page } = event

  // Get user's openid
  const user = await db.collection('users').doc(userId).get()
  if (!user.data) return { code: -1, msg: 'User not found' }

  // Check subscription count
  const record = await db.collection('notification_records')
    .where({ userId, templateId }).get()

  if (record.data.length === 0 || record.data[0].remainingCount <= 0) {
    return { code: -2, msg: 'No subscription remaining' }
  }

  try {
    await cloud.openapi.subscribeMessage.send({
      touser: user.data.openid,
      templateId,
      page: page || 'pages/index/index',
      data
    })

    // Decrement count
    await db.collection('notification_records').doc(record.data[0]._id).update({
      data: {
        remainingCount: _.inc(-1),
        updatedAt: db.serverDate()
      }
    })

    return { code: 0, msg: 'Notification sent' }
  } catch (err) {
    return { code: -1, msg: err.message }
  }
}

async function batchSubscribe(openid, event) {
  // Called when user wants to add subscription count
  // The actual wx.requestSubscribeMessage is called from frontend
  // This just records the result
  const { templateId, count } = event
  return await updateSubscription(openid, { templateId, count })
}
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/notifications/
git commit -m "feat: add notifications cloud function with subscription management"
```

---

## Task 6: Cloud Function - Activity Logs

**Files:**
- Create: `cloudfunctions/activity-logs/index.js`
- Create: `cloudfunctions/activity-logs/package.json`
- Create: `cloudfunctions/activity-logs/config.json`

- [ ] **Step 1: Create activity-logs cloud function package.json**

```json
{
  "name": "activity-logs",
  "version": "1.0.0",
  "description": "Activity log cloud function",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

- [ ] **Step 2: Create activity-logs cloud function config.json**

```json
{
  "permissions": {
    "openapi": []
  }
}
```

- [ ] **Step 3: Create activity-logs cloud function index.js**

```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID
  const { action } = event

  switch (action) {
    case 'getLogs':
      return await getLogs(openid, event)
    default:
      return { code: -1, msg: 'Unknown action' }
  }
}

async function getLogs(openid, event) {
  const { skip = 0 } = event
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) return { code: -1, msg: 'User not found' }

  const familyGroupId = user.data[0].familyGroupId

  const res = await db.collection('activity_logs')
    .where({ familyGroupId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(20)
    .get()

  // Get user names for logs
  const userIds = [...new Set(res.data.map(log => log.userId))]
  const users = await db.collection('users')
    .where({ _id: _.in(userIds) })
    .get()

  const userMap = {}
  users.data.forEach(u => { userMap[u._id] = u.name })

  const logs = res.data.map(log => ({
    ...log,
    userName: userMap[log.userId] || '未知用户'
  }))

  return { code: 0, data: logs }
}
```

- [ ] **Step 4: Commit**

```bash
git add cloudfunctions/activity-logs/
git commit -m "feat: add activity-logs cloud function"
```

---

## Task 7: Mini-Program App Initialization

**Files:**
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: `miniprogram/sitemap.json`

- [ ] **Step 1: Create app.json**

```json
{
  "pages": [
    "pages/index/index",
    "pages/calendar/calendar",
    "pages/mine/mine",
    "pages/todo-add/todo-add",
    "pages/todo-detail/todo-detail",
    "pages/family/family",
    "pages/activity-log/activity-log",
    "pages/recycle-bin/recycle-bin",
    "pages/search/search"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#4A90D9",
    "navigationBarTitleText": "家庭提醒",
    "navigationBarTextStyle": "white"
  },
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#4A90D9",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/home.png",
        "selectedIconPath": "images/home-active.png"
      },
      {
        "pagePath": "pages/calendar/calendar",
        "text": "日历",
        "iconPath": "images/calendar.png",
        "selectedIconPath": "images/calendar-active.png"
      },
      {
        "pagePath": "pages/mine/mine",
        "text": "我的",
        "iconPath": "images/mine.png",
        "selectedIconPath": "images/mine-active.png"
      }
    ]
  },
  "cloud": true,
  "sitemapLocation": "sitemap.json",
  "style": "v2"
}
```

- [ ] **Step 2: Create app.js**

```javascript
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

    // Auto login
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
        // New user, trigger login flow
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
```

- [ ] **Step 3: Create app.wxss**

```css
/* Global styles */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 28rpx;
  color: #333333;
  background-color: #f5f5f5;
}

/* Color tags */
.color-red { background-color: #ff4d4f; }
.color-blue { background-color: #4A90D9; }
.color-green { background-color: #52c41a; }
.color-yellow { background-color: #faad14; }

/* Priority indicators */
.priority-high { border-left: 6rpx solid #ff4d4f; }
.priority-medium { border-left: 6rpx solid #faad14; }
.priority-low { border-left: 6rpx solid #52c41a; }

/* Common components */
.btn-primary {
  background-color: #4A90D9;
  color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  font-size: 30rpx;
}

.btn-danger {
  background-color: #ff4d4f;
  color: #ffffff;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  font-size: 30rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 16rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
  color: #999999;
}

.empty-state text {
  font-size: 28rpx;
  margin-top: 16rpx;
}
```

- [ ] **Step 4: Create sitemap.json**

```json
{
  "desc": "关于本文件的更多信息，请参考文档",
  "rules": [{
    "action": "allow",
    "page": "*"
  }]
}
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/app.js miniprogram/app.json miniprogram/app.wxss miniprogram/sitemap.json
git commit -m "feat: add mini-program app initialization"
```

---

## Task 8: Utility Modules

**Files:**
- Create: `miniprogram/utils/api.js`
- Create: `miniprogram/utils/lunar.js`
- Create: `miniprogram/utils/notification.js`
- Create: `miniprogram/utils/cache.js`
- Create: `miniprogram/utils/image.js`

- [ ] **Step 1: Create api.js**

```javascript
// Cloud function call wrapper with error handling
const api = {
  async call(name, data = {}) {
    try {
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

  // Todo shortcuts
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
    permanentDelete: (todoId) => api.call('todos', { action: 'permanentDelete', todoId })
  },

  // User shortcuts
  users: {
    login: (data) => api.call('users', { action: 'login', ...data }),
    updateProfile: (data) => api.call('users', { action: 'updateProfile', ...data }),
    updateSettings: (data) => api.call('users', { action: 'updateSettings', ...data }),
    createFamily: (data) => api.call('users', { action: 'createFamily', ...data }),
    joinFamily: (inviteCode) => api.call('users', { action: 'joinFamily', inviteCode }),
    getFamilyMembers: () => api.call('users', { action: 'getFamilyMembers' }),
    getUserInfo: () => api.call('users', { action: 'getUserInfo' })
  },

  // Notification shortcuts
  notifications: {
    updateSubscription: (data) => api.call('notifications', { action: 'updateSubscription', ...data }),
    getSubscriptionCount: (templateId) => api.call('notifications', { action: 'getSubscriptionCount', templateId }),
    batchSubscribe: (data) => api.call('notifications', { action: 'batchSubscribe', ...data })
  },

  // Activity log shortcuts
  activityLogs: {
    getLogs: (skip) => api.call('activity-logs', { action: 'getLogs', skip })
  }
}

module.exports = api
```

- [ ] **Step 2: Create lunar.js**

```javascript
// Lunar calendar utility using lunar-javascript library
// npm install lunar-javascript --save
const { Lunar, Solar } = require('lunar-javascript')

const lunar = {
  // Convert solar date to lunar
  solarToLunar(year, month, day) {
    const solar = Solar.fromYmd(year, month, day)
    const lunarDate = solar.getLunar()
    return {
      year: lunarDate.getYear(),
      month: lunarDate.getMonth(),
      day: lunarDate.getDay(),
      isLeap: lunarDate.getMonth() < 0,
      monthName: lunarDate.getMonthInChinese(),
      dayName: lunarDate.getDayInChinese(),
      fullName: lunarDate.getMonthInChinese() + '月' + lunarDate.getDayInChinese()
    }
  },

  // Convert lunar date to solar
  lunarToSolar(year, month, day, isLeap = false) {
    const lunarDate = Lunar.fromYmd(year, isLeap ? -month : month, day)
    const solar = lunarDate.getSolar()
    return {
      year: solar.getYear(),
      month: solar.getMonth(),
      day: solar.getDay(),
      dateStr: `${solar.getYear()}-${String(solar.getMonth()).padStart(2, '0')}-${String(solar.getDay()).padStart(2, '0')}`
    }
  },

  // Get lunar info for a date range (for calendar display)
  getLunarMonthDays(year, month) {
    const days = []
    const daysInMonth = new Date(year, month, 0).getDate()

    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = this.solarToLunar(year, month, d)
      days.push({
        day: d,
        lunarDay: lunarInfo.dayName,
        lunarMonth: lunarInfo.monthName,
        isLunarFirst: lunarInfo.day === 1 // Month start marker
      })
    }

    return days
  },

  // Check if a lunar date matches (for recurring lunar reminders)
  matchLunarDate(solarDateStr, lunarMonth, lunarDay) {
    const [year, month, day] = solarDateStr.split('-').map(Number)
    const lunarInfo = this.solarToLunar(year, month, day)
    return lunarInfo.month === lunarMonth && lunarInfo.day === lunarDay
  }
}

module.exports = lunar
```

- [ ] **Step 3: Create notification.js**

```javascript
const api = require('./api')

const notification = {
  // Request subscription for a template
  async requestSubscribe(templateId) {
    return new Promise((resolve, reject) => {
      wx.requestSubscribeMessage({
        tmplIds: [templateId],
        success: (res) => {
          if (res[templateId] === 'accept' || res[templateId] === 'acceptWithAlert') {
            // Update subscription count on server
            api.notifications.updateSubscription({
              templateId,
              count: 1
            })
            resolve(true)
          } else {
            resolve(false)
          }
        },
        fail: (err) => {
          console.error('Subscribe failed:', err)
          reject(err)
        }
      })
    })
  },

  // Check if user has enough subscriptions
  async checkSubscription(templateId) {
    const res = await api.notifications.getSubscriptionCount(templateId)
    if (res && res.data) {
      return res.data.count > 0
    }
    return false
  },

  // Show subscription prompt if count is low
  async promptIfNeeded(templateId, threshold = 3) {
    const res = await api.notifications.getSubscriptionCount(templateId)
    if (res && res.data && res.data.count < threshold) {
      wx.showModal({
        title: '订阅次数不足',
        content: '您接收提醒的次数即将用完，是否立即补充？',
        success: (modalRes) => {
          if (modalRes.confirm) {
            this.requestSubscribe(templateId)
          }
        }
      })
    }
  }
}

module.exports = notification
```

- [ ] **Step 4: Create cache.js**

```javascript
const CACHE_PREFIX = 'family_todo_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

const cache = {
  set(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expiry: CACHE_EXPIRY
    }
    try {
      wx.setStorageSync(CACHE_PREFIX + key, cacheData)
    } catch (e) {
      console.error('Cache set error:', e)
    }
  },

  get(key) {
    try {
      const cacheData = wx.getStorageSync(CACHE_PREFIX + key)
      if (!cacheData) return null

      if (Date.now() - cacheData.timestamp > cacheData.expiry) {
        this.remove(key)
        return null
      }

      return cacheData.data
    } catch (e) {
      console.error('Cache get error:', e)
      return null
    }
  },

  remove(key) {
    try {
      wx.removeStorageSync(CACHE_PREFIX + key)
    } catch (e) {
      console.error('Cache remove error:', e)
    }
  },

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
}

module.exports = cache
```

- [ ] **Step 5: Create image.js**

```javascript
const image = {
  // Compress image before upload
  async compress(filePath, maxWidth = 800, quality = 80) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => {
          console.error('Compress failed:', err)
          resolve(filePath) // Return original if compression fails
        }
      })
    })
  },

  // Upload image to cloud storage
  async upload(filePath) {
    const compressed = await this.compress(filePath)
    const ext = compressed.split('.').pop()
    const cloudPath = `todo-images/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    try {
      const res = await wx.cloud.uploadFile({
        cloudPath,
        filePath: compressed
      })
      return res.fileID
    } catch (err) {
      console.error('Upload failed:', err)
      wx.showToast({ title: '图片上传失败', icon: 'none' })
      return null
    }
  },

  // Choose and upload image
  async chooseAndUpload() {
    return new Promise((resolve) => {
      wx.chooseImage({
        count: 3,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const fileIDs = []
          for (const path of res.tempFilePaths) {
            const fileID = await this.upload(path)
            if (fileID) fileIDs.push(fileID)
          }
          resolve(fileIDs)
        },
        fail: () => resolve([])
      })
    })
  }
}

module.exports = image
```

- [ ] **Step 6: Commit**

```bash
git add miniprogram/utils/
git commit -m "feat: add utility modules (api, lunar, notification, cache, image)"
```

---

## Task 9: Shared Components

**Files:**
- Create: `miniprogram/components/todo-card/` (4 files)
- Create: `miniprogram/components/category-filter/` (4 files)
- Create: `miniprogram/components/quick-add/` (4 files)

- [ ] **Step 1: Create todo-card component**

`miniprogram/components/todo-card/todo-card.json`:
```json
{
  "component": true
}
```

`miniprogram/components/todo-card/todo-card.wxml`:
```html
<view class="todo-card priority-{{todo.priority}}" bindtap="onTap">
  <view class="card-header">
    <view class="color-dot color-{{todo.color}}"></view>
    <view class="card-title">{{todo.title}}</view>
    <view class="card-category">{{categoryName}}</view>
  </view>
  <view class="card-body" wx:if="{{todo.description || todo.quantity}}">
    <text wx:if="{{todo.description}}" class="card-desc">{{todo.description}}</text>
    <text wx:if="{{todo.quantity}}" class="card-quantity">数量: {{todo.quantity}}</text>
  </view>
  <view class="card-footer">
    <view class="card-time" wx:if="{{todo.dueTime}}">
      <text class="time-icon">⏰</text>
      <text>{{todo.dueTime}}</text>
    </view>
    <view class="card-assignee">
      <text class="assignee-avatar">{{assigneeInitial}}</text>
    </view>
    <view class="card-actions">
      <view class="action-btn complete-btn" catchtap="onComplete">✓ 完成</view>
      <view class="action-btn delete-btn" catchtap="onDelete">删除</view>
    </view>
  </view>
</view>
```

`miniprogram/components/todo-card/todo-card.wxss`:
```css
.todo-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 12rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.color-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  margin-right: 12rpx;
}

.card-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.card-category {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.card-body {
  margin-bottom: 12rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.card-quantity {
  font-size: 24rpx;
  color: #4A90D9;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-time {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #999;
}

.time-icon {
  margin-right: 6rpx;
}

.card-assignee {
  margin-left: 16rpx;
}

.assignee-avatar {
  display: inline-block;
  width: 48rpx;
  height: 48rpx;
  line-height: 48rpx;
  text-align: center;
  background: #4A90D9;
  color: #fff;
  border-radius: 50%;
  font-size: 22rpx;
}

.card-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  font-size: 24rpx;
  padding: 8rpx 20rpx;
  border-radius: 8rpx;
}

.complete-btn {
  background: #e6f7e6;
  color: #52c41a;
}

.delete-btn {
  background: #fff1f0;
  color: #ff4d4f;
}
```

`miniprogram/components/todo-card/todo-card.js`:
```javascript
const categoryMap = {
  daily: '日常',
  shopping: '购物',
  family: '家庭',
  bill: '账单',
  other: '其他'
}

Component({
  properties: {
    todo: { type: Object, value: {} },
    members: { type: Array, value: [] }
  },

  computed: {},

  data: {
    categoryName: '',
    assigneeInitial: ''
  },

  observers: {
    'todo, members': function (todo, members) {
      if (!todo) return
      this.setData({
        categoryName: categoryMap[todo.category] || '其他',
        assigneeInitial: this.getAssigneeInitial(todo.assignedTo, members)
      })
    }
  },

  methods: {
    getAssigneeInitial(assignedTo, members) {
      const member = members.find(m => m._id === assignedTo)
      return member ? member.name.charAt(0) : '?'
    },

    onTap() {
      this.triggerEvent('tap', { todo: this.properties.todo })
    },

    onComplete() {
      this.triggerEvent('complete', { todoId: this.properties.todo._id })
    },

    onDelete() {
      wx.showModal({
        title: '确认删除',
        content: `确定删除"${this.properties.todo.title}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.triggerEvent('delete', { todoId: this.properties.todo._id })
          }
        }
      })
    }
  }
})
```

- [ ] **Step 2: Create category-filter component**

`miniprogram/components/category-filter/category-filter.json`:
```json
{
  "component": true
}
```

`miniprogram/components/category-filter/category-filter.wxml`:
```html
<view class="filter-bar">
  <view
    wx:for="{{categories}}"
    wx:key="value"
    class="filter-item {{current === item.value ? 'active' : ''}}"
    bindtap="onSelect"
    data-value="{{item.value}}"
  >
    {{item.label}}
  </view>
</view>
```

`miniprogram/components/category-filter/category-filter.wxss`:
```css
.filter-bar {
  display: flex;
  padding: 16rpx 24rpx;
  background: #fff;
  overflow-x: auto;
  white-space: nowrap;
}

.filter-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  flex-shrink: 0;
}

.filter-item.active {
  background: #4A90D9;
  color: #fff;
}
```

`miniprogram/components/category-filter/category-filter.js`:
```javascript
Component({
  properties: {
    current: { type: String, value: 'all' }
  },

  data: {
    categories: [
      { label: '全部', value: 'all' },
      { label: '日常', value: 'daily' },
      { label: '购物', value: 'shopping' },
      { label: '家庭', value: 'family' },
      { label: '账单', value: 'bill' },
      { label: '其他', value: 'other' }
    ]
  },

  methods: {
    onSelect(e) {
      const value = e.currentTarget.dataset.value
      this.triggerEvent('change', { category: value })
    }
  }
})
```

- [ ] **Step 3: Create quick-add component**

`miniprogram/components/quick-add/quick-add.json`:
```json
{
  "component": true
}
```

`miniprogram/components/quick-add/quick-add.wxml`:
```html
<view class="quick-add-btn" bindtap="onTap">
  <text class="btn-icon">+</text>
</view>
```

`miniprogram/components/quick-add/quick-add.wxss`:
```css
.quick-add-btn {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 100rpx;
  height: 100rpx;
  background: #4A90D9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(74, 144, 217, 0.4);
  z-index: 100;
}

.btn-icon {
  color: #fff;
  font-size: 48rpx;
  line-height: 1;
}
```

`miniprogram/components/quick-add/quick-add.js`:
```javascript
Component({
  methods: {
    onTap() {
      this.triggerEvent('add')
    }
  }
})
```

- [ ] **Step 4: Commit**

```bash
git add miniprogram/components/
git commit -m "feat: add shared components (todo-card, category-filter, quick-add)"
```

---

## Task 10: Home Page

**Files:**
- Create: `miniprogram/pages/index/index.wxml`
- Create: `miniprogram/pages/index/index.wxss`
- Create: `miniprogram/pages/index/index.js`
- Create: `miniprogram/pages/index/index.json`

- [ ] **Step 1: Create index.json**

```json
{
  "usingComponents": {
    "todo-card": "../../components/todo-card/todo-card",
    "category-filter": "../../components/category-filter/category-filter",
    "quick-add": "../../components/quick-add/quick-add"
  },
  "navigationBarTitleText": "今日待办"
}
```

- [ ] **Step 2: Create index.wxml**

```html
<view class="container">
  <!-- Search bar -->
  <view class="search-bar" bindtap="goSearch">
    <text class="search-icon">🔍</text>
    <text class="search-placeholder">搜索待办事项...</text>
  </view>

  <!-- Category filter -->
  <category-filter
    current="{{currentCategory}}"
    bind:change="onCategoryChange"
  />

  <!-- Todo list -->
  <view class="todo-list" wx:if="{{todos.length > 0}}">
    <todo-card
      wx:for="{{todos}}"
      wx:key="_id"
      todo="{{item}}"
      members="{{members}}"
      bind:tap="onTodoTap"
      bind:complete="onTodoComplete"
      bind:delete="onTodoDelete"
    />
  </view>

  <!-- Empty state -->
  <view class="empty-state" wx:if="{{!loading && todos.length === 0}}">
    <text class="empty-icon">📋</text>
    <text>今日暂无待办事项</text>
    <text class="empty-hint">点击右下角 + 添加</text>
  </view>

  <!-- Loading -->
  <view class="loading" wx:if="{{loading}}">
    <text>加载中...</text>
  </view>

  <!-- Quick add button -->
  <quick-add bind:add="onQuickAdd" />
</view>
```

- [ ] **Step 3: Create index.wxss**

```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  margin: 24rpx;
  padding: 16rpx 24rpx;
  background: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-icon {
  margin-right: 12rpx;
  font-size: 28rpx;
}

.search-placeholder {
  color: #999;
  font-size: 28rpx;
}

.todo-list {
  padding-bottom: 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: #bbb;
  margin-top: 8rpx;
}

.loading {
  text-align: center;
  padding: 40rpx;
  color: #999;
}
```

- [ ] **Step 4: Create index.js**

```javascript
const api = require('../../utils/api')
const cache = require('../../utils/cache')

Page({
  data: {
    todos: [],
    members: [],
    currentCategory: 'all',
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadTodos()
  },

  onPullDownRefresh() {
    this.loadTodos().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    const memberRes = await api.users.getFamilyMembers()
    if (memberRes && memberRes.data) {
      this.setData({ members: memberRes.data })
    }
    await this.loadTodos()
  },

  async loadTodos() {
    this.setData({ loading: true })
    const category = this.data.currentCategory

    let res
    if (category === 'all') {
      res = await api.todos.getToday()
    } else {
      // Filter by category - need to use search or custom query
      res = await api.todos.getToday()
      if (res && res.data) {
        res.data = res.data.filter(t => t.category === category)
      }
    }

    if (res && res.data) {
      this.setData({
        todos: res.data,
        loading: false
      })
      cache.set('today_todos', res.data)
    } else {
      this.setData({ loading: false })
    }
  },

  onCategoryChange(e) {
    this.setData({ currentCategory: e.detail.category })
    this.loadTodos()
  },

  onTodoTap(e) {
    const todo = e.detail.todo
    wx.navigateTo({
      url: `/pages/todo-detail/todo-detail?id=${todo._id}`
    })
  },

  async onTodoComplete(e) {
    const { todoId } = e.detail
    const res = await api.todos.complete(todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已完成', icon: 'success' })
      this.loadTodos()
    }
  },

  async onTodoDelete(e) {
    const { todoId } = e.detail
    const res = await api.todos.delete(todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已删除', icon: 'success' })
      this.loadTodos()
    }
  },

  onQuickAdd() {
    wx.navigateTo({ url: '/pages/todo-add/todo-add' })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  }
})
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/index/
git commit -m "feat: add home page with today's todos"
```

---

## Task 11: Calendar Page

**Files:**
- Create: `miniprogram/pages/calendar/calendar.wxml`
- Create: `miniprogram/pages/calendar/calendar.wxss`
- Create: `miniprogram/pages/calendar/calendar.js`
- Create: `miniprogram/pages/calendar/calendar.json`

- [ ] **Step 1: Create calendar.json**

```json
{
  "usingComponents": {},
  "navigationBarTitleText": "日历"
}
```

- [ ] **Step 2: Create calendar.wxml**

```html
<view class="container">
  <!-- Month navigation -->
  <view class="month-nav">
    <view class="nav-btn" bindtap="prevMonth">◀</view>
    <view class="month-title">{{year}}年{{month}}月</view>
    <view class="nav-btn" bindtap="nextMonth">▶</view>
  </view>

  <!-- Week header -->
  <view class="week-header">
    <view class="week-item" wx:for="{{weekDays}}" wx:key="*this">{{item}}</view>
  </view>

  <!-- Calendar grid -->
  <view class="calendar-grid">
    <view
      wx:for="{{calendarDays}}"
      wx:key="day"
      class="day-cell {{item.isToday ? 'today' : ''}} {{item.isSelected ? 'selected' : ''}} {{item.isEmpty ? 'empty' : ''}} {{item.hasTodos ? 'has-todos' : ''}}"
      bindtap="onDayTap"
      data-day="{{item}}"
    >
      <text class="day-number">{{item.day}}</text>
      <text class="lunar-day" wx:if="{{item.lunarDay}}">{{item.lunarDay}}</text>
      <view class="todo-dots" wx:if="{{item.todoCount > 0}}">
        <view class="dot" wx:for="{{item.todoColors}}" wx:for-item="color" wx:key="*this" style="background: {{color}}"></view>
      </view>
    </view>
  </view>

  <!-- Selected day's todos -->
  <view class="day-todos" wx:if="{{selectedDayTodos.length > 0}}">
    <view class="day-todos-title">{{selectedDate}} 的事项</view>
    <view
      wx:for="{{selectedDayTodos}}"
      wx:key="_id"
      class="day-todo-item"
      bindtap="onTodoTap"
      data-id="{{item._id}}"
    >
      <view class="todo-dot" style="background: {{item.color === 'red' ? '#ff4d4f' : item.color === 'blue' ? '#4A90D9' : item.color === 'green' ? '#52c41a' : '#faad14'}}"></view>
      <text class="todo-title">{{item.title}}</text>
      <text class="todo-time" wx:if="{{item.dueTime}}">{{item.dueTime}}</text>
    </view>
  </view>

  <view class="empty-day" wx:if="{{selectedDay && selectedDayTodos.length === 0}}">
    <text>该日暂无事项</text>
  </view>
</view>
```

- [ ] **Step 3: Create calendar.wxss**

```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 40rpx;
  background: #fff;
}

.nav-btn {
  font-size: 32rpx;
  color: #4A90D9;
  padding: 12rpx 20rpx;
}

.month-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
}

.week-header {
  display: flex;
  background: #fff;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #eee;
}

.week-item {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
}

.calendar-grid {
  display: flex;
  flex-wrap: wrap;
  background: #fff;
  padding: 8rpx;
}

.day-cell {
  width: 14.28%;
  padding: 12rpx 4rpx;
  text-align: center;
  position: relative;
  min-height: 100rpx;
}

.day-cell.empty {
  visibility: hidden;
}

.day-cell.today {
  background: #e6f3ff;
  border-radius: 12rpx;
}

.day-cell.selected {
  background: #4A90D9;
  border-radius: 12rpx;
}

.day-cell.selected .day-number,
.day-cell.selected .lunar-day {
  color: #fff;
}

.day-number {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.lunar-day {
  font-size: 18rpx;
  color: #999;
  display: block;
  margin-top: 2rpx;
}

.has-todos .day-number {
  font-weight: 600;
}

.todo-dots {
  display: flex;
  justify-content: center;
  gap: 4rpx;
  margin-top: 4rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
}

.day-todos {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.day-todos-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.day-todo-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.day-todo-item:last-child {
  border-bottom: none;
}

.todo-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.todo-title {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.todo-time {
  font-size: 24rpx;
  color: #999;
}

.empty-day {
  text-align: center;
  padding: 60rpx;
  color: #999;
}
```

- [ ] **Step 4: Create calendar.js**

```javascript
const api = require('../../utils/api')
const lunar = require('../../utils/lunar')

Page({
  data: {
    year: 0,
    month: 0,
    weekDays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    selectedDay: null,
    selectedDate: '',
    selectedDayTodos: [],
    monthTodos: []
  },

  onLoad() {
    const now = new Date()
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1
    })
    this.loadMonth()
  },

  onShow() {
    this.loadMonthTodos()
  },

  async loadMonth() {
    const { year, month } = this.data
    const daysInMonth = new Date(year, month, 0).getDate()
    const firstDayWeek = new Date(year, month - 1, 1).getDay()
    const today = new Date()

    const calendarDays = []

    // Empty cells before first day
    for (let i = 0; i < firstDayWeek; i++) {
      calendarDays.push({ isEmpty: true, day: '' })
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = lunar.solarToLunar(year, month, d)
      calendarDays.push({
        day: d,
        lunarDay: lunarInfo.day === 1 ? lunarInfo.monthName + '月' : lunarInfo.dayName,
        isToday: today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d,
        isSelected: false,
        hasTodos: false,
        todoCount: 0,
        todoColors: []
      })
    }

    this.setData({ calendarDays })
    await this.loadMonthTodos()
  },

  async loadMonthTodos() {
    const { year, month } = this.data
    const res = await api.todos.getByMonth(year, month)

    if (res && res.data) {
      this.setData({ monthTodos: res.data })
      this.updateCalendarDots()
    }
  },

  updateCalendarDots() {
    const { calendarDays, monthTodos } = this.data
    const colorMap = { red: '#ff4d4f', blue: '#4A90D9', green: '#52c41a', yellow: '#faad14' }

    calendarDays.forEach(day => {
      if (day.isEmpty) return
      const dateStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
      const dayTodos = monthTodos.filter(t => t.dueDate === dateStr && t.status === 'pending' && !t.deletedAt)
      day.hasTodos = dayTodos.length > 0
      day.todoCount = dayTodos.length
      day.todoColors = [...new Set(dayTodos.map(t => colorMap[t.color] || '#4A90D9'))].slice(0, 3)
    })

    this.setData({ calendarDays })
  },

  onDayTap(e) {
    const day = e.currentTarget.dataset.day
    if (day.isEmpty) return

    const { calendarDays, monthTodos } = this.data
    calendarDays.forEach(d => { d.isSelected = false })
    day.isSelected = true

    const dateStr = `${this.data.year}-${String(this.data.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}`
    const selectedDayTodos = monthTodos.filter(t => t.dueDate === dateStr && !t.deletedAt)

    this.setData({
      calendarDays,
      selectedDay: day.day,
      selectedDate: dateStr,
      selectedDayTodos
    })
  },

  onTodoTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/todo-detail/todo-detail?id=${id}`
    })
  },

  prevMonth() {
    let { year, month } = this.data
    month--
    if (month < 1) { month = 12; year-- }
    this.setData({ year, month, selectedDay: null, selectedDayTodos: [] })
    this.loadMonth()
  },

  nextMonth() {
    let { year, month } = this.data
    month++
    if (month > 12) { month = 1; year++ }
    this.setData({ year, month, selectedDay: null, selectedDayTodos: [] })
    this.loadMonth()
  }
})
```

- [ ] **Step 5: Commit**

```bash
git add miniprogram/pages/calendar/
git commit -m "feat: add calendar page with lunar dates"
```

---

## Task 12: Mine Page

**Files:**
- Create: `miniprogram/pages/mine/mine.wxml`
- Create: `miniprogram/pages/mine/mine.wxss`
- Create: `miniprogram/pages/mine/mine.js`
- Create: `miniprogram/pages/mine/mine.json`

- [ ] **Step 1: Create mine page files**

`mine.json`:
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "我的"
}
```

`mine.wxml`:
```html
<view class="container">
  <!-- User info -->
  <view class="user-card">
    <view class="user-avatar">{{userInfo.name[0] || '?'}}</view>
    <view class="user-info">
      <text class="user-name">{{userInfo.name || '未登录'}}</text>
      <text class="user-role">{{roleName}}</text>
    </view>
  </view>

  <!-- Menu items -->
  <view class="menu-group">
    <view class="menu-item" bindtap="goFamily">
      <text class="menu-icon">👨‍👩‍👧</text>
      <text class="menu-text">家庭成员</text>
      <text class="menu-arrow">▶</text>
    </view>
    <view class="menu-item" bindtap="goActivityLog">
      <text class="menu-icon">📝</text>
      <text class="menu-text">操作日志</text>
      <text class="menu-arrow">▶</text>
    </view>
    <view class="menu-item" bindtap="goRecycleBin">
      <text class="menu-icon">🗑️</text>
      <text class="menu-text">回收站</text>
      <text class="menu-arrow">▶</text>
    </view>
  </view>

  <view class="menu-group">
    <view class="menu-item" bindtap="goSettings">
      <text class="menu-icon">⚙️</text>
      <text class="menu-text">设置</text>
      <text class="menu-arrow">▶</text>
    </view>
  </view>
</view>
```

`mine.wxss`:
```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.user-card {
  display: flex;
  align-items: center;
  padding: 40rpx 32rpx;
  background: #4A90D9;
  color: #fff;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 40rpx;
  margin-right: 24rpx;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  display: block;
}

.user-role {
  font-size: 24rpx;
  opacity: 0.8;
  display: block;
  margin-top: 8rpx;
}

.menu-group {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 16rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 24rpx;
  color: #ccc;
}
```

`mine.js`:
```javascript
const app = getApp()
const api = require('../../utils/api')

const roleMap = {
  child: '孩子',
  father: '爸爸',
  mother: '妈妈'
}

Page({
  data: {
    userInfo: {},
    roleName: ''
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    this.loadUserInfo()
  },

  async loadUserInfo() {
    const res = await api.users.getUserInfo()
    if (res && res.data) {
      app.globalData.userInfo = res.data
      this.setData({
        userInfo: res.data,
        roleName: roleMap[res.data.role] || '成员'
      })
    }
  },

  goFamily() {
    wx.navigateTo({ url: '/pages/family/family' })
  },

  goActivityLog() {
    wx.navigateTo({ url: '/pages/activity-log/activity-log' })
  },

  goRecycleBin() {
    wx.navigateTo({ url: '/pages/recycle-bin/recycle-bin' })
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/pages/mine/
git commit -m "feat: add mine page with menu navigation"
```

---

## Task 13: Todo Add Page

**Files:**
- Create: `miniprogram/pages/todo-add/todo-add.wxml`
- Create: `miniprogram/pages/todo-add/todo-add.wxss`
- Create: `miniprogram/pages/todo-add/todo-add.js`
- Create: `miniprogram/pages/todo-add/todo-add.json`

- [ ] **Step 1: Create todo-add page**

`todo-add.json`:
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "添加待办"
}
```

`todo-add.wxml`:
```html
<view class="container">
  <!-- Quick mode form -->
  <view class="form">
    <view class="form-item">
      <text class="label">标题</text>
      <input class="input" placeholder="输入待办事项" value="{{title}}" bindinput="onTitleInput" focus="{{true}}" />
    </view>

    <view class="form-item">
      <text class="label">日期</text>
      <picker mode="date" value="{{dueDate}}" bindchange="onDateChange">
        <view class="picker-value">{{dueDate || '选择日期'}}</view>
      </picker>
    </view>

    <view class="form-item">
      <text class="label">时间</text>
      <picker mode="time" value="{{dueTime}}" bindchange="onTimeChange">
        <view class="picker-value">{{dueTime || '选择时间（可选）'}}</view>
      </picker>
    </view>

    <!-- More options toggle -->
    <view class="more-toggle" bindtap="toggleMore">
      <text>{{showMore ? '收起选项' : '更多选项'}}</text>
      <text class="toggle-arrow">{{showMore ? '▲' : '▼'}}</text>
    </view>

    <!-- Advanced options -->
    <view class="advanced-options" wx:if="{{showMore}}">
      <view class="form-item">
        <text class="label">分类</text>
        <view class="category-options">
          <view
            wx:for="{{categories}}"
            wx:key="value"
            class="category-tag {{category === item.value ? 'active' : ''}}"
            bindtap="onCategorySelect"
            data-value="{{item.value}}"
          >{{item.label}}</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">颜色</text>
        <view class="color-options">
          <view
            wx:for="{{colors}}"
            wx:key="value"
            class="color-tag {{color === item.value ? 'active' : ''}}"
            style="background: {{item.hex}}"
            bindtap="onColorSelect"
            data-value="{{item.value}}"
          ></view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">负责人</text>
        <view class="assignee-options">
          <view
            wx:for="{{members}}"
            wx:key="_id"
            class="assignee-tag {{assignedTo === item._id ? 'active' : ''}}"
            bindtap="onAssigneeSelect"
            data-id="{{item._id}}"
          >{{item.name}}</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">重复</text>
        <view class="repeat-options">
          <view
            wx:for="{{repeatOptions}}"
            wx:key="value"
            class="repeat-tag {{repeat === item.value ? 'active' : ''}}"
            bindtap="onRepeatSelect"
            data-value="{{item.value}}"
          >{{item.label}}</view>
        </view>
      </view>

      <view class="form-item">
        <text class="label">提醒通知</text>
        <switch checked="{{enableNotification}}" bindchange="onNotificationChange" color="#4A90D9" />
      </view>

      <view class="form-item" wx:if="{{enableNotification}}">
        <text class="label">提前提醒</text>
        <view class="notify-options">
          <view
            wx:for="{{notifyOptions}}"
            wx:key="value"
            class="notify-tag {{notifyBefore === item.value ? 'active' : ''}}"
            bindtap="onNotifySelect"
            data-value="{{item.value}}"
          >{{item.label}}</view>
        </view>
      </view>

      <view class="form-item" wx:if="{{category === 'shopping'}}">
        <text class="label">数量</text>
        <input class="input" placeholder="如：2颗、3斤" value="{{quantity}}" bindinput="onQuantityInput" />
      </view>

      <view class="form-item">
        <text class="label">描述</text>
        <textarea class="textarea" placeholder="补充说明（可选）" value="{{description}}" bindinput="onDescInput" />
      </view>

      <view class="form-item">
        <view class="lunar-toggle">
          <text class="label">使用农历</text>
          <switch checked="{{isLunar}}" bindchange="onLunarChange" color="#4A90D9" />
        </view>
      </view>
    </view>
  </view>

  <!-- Submit button -->
  <view class="submit-area">
    <button class="btn-primary" bindtap="onSubmit" disabled="{{!title}}">保存</button>
  </view>
</view>
```

`todo-add.wxss`:
```css
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

.form {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.form-item {
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.label {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 12rpx;
}

.input {
  font-size: 30rpx;
  color: #333;
  width: 100%;
}

.picker-value {
  font-size: 30rpx;
  color: #333;
}

.more-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  color: #4A90D9;
  font-size: 28rpx;
}

.toggle-arrow {
  margin-left: 8rpx;
  font-size: 20rpx;
}

.category-options, .repeat-options, .notify-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-tag, .repeat-tag, .notify-tag {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
}

.category-tag.active, .repeat-tag.active, .notify-tag.active {
  background: #4A90D9;
  color: #fff;
}

.color-options {
  display: flex;
  gap: 16rpx;
}

.color-tag {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
}

.color-tag.active {
  border-color: #333;
}

.assignee-options {
  display: flex;
  gap: 12rpx;
}

.assignee-tag {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #666;
}

.assignee-tag.active {
  background: #4A90D9;
  color: #fff;
}

.textarea {
  font-size: 28rpx;
  color: #333;
  width: 100%;
  height: 150rpx;
}

.lunar-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.submit-area {
  padding: 40rpx 24rpx;
}

.btn-primary {
  background: #4A90D9;
  color: #fff;
  border-radius: 12rpx;
  font-size: 32rpx;
}
```

`todo-add.js`:
```javascript
const api = require('../../utils/api')
const notification = require('../../utils/notification')

Page({
  data: {
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    category: 'daily',
    color: 'blue',
    priority: 'medium',
    assignedTo: '',
    repeat: 'none',
    isLunar: false,
    quantity: '',
    enableNotification: true,
    notifyBefore: 15,
    showMore: false,
    members: [],
    categories: [
      { label: '日常', value: 'daily' },
      { label: '购物', value: 'shopping' },
      { label: '家庭', value: 'family' },
      { label: '账单', value: 'bill' },
      { label: '其他', value: 'other' }
    ],
    colors: [
      { label: '红', value: 'red', hex: '#ff4d4f' },
      { label: '蓝', value: 'blue', hex: '#4A90D9' },
      { label: '绿', value: 'green', hex: '#52c41a' },
      { label: '黄', value: 'yellow', hex: '#faad14' }
    ],
    repeatOptions: [
      { label: '不重复', value: 'none' },
      { label: '每天', value: 'daily' },
      { label: '每周', value: 'weekly' },
      { label: '每月', value: 'monthly' },
      { label: '农历每年', value: 'lunar_yearly' }
    ],
    notifyOptions: [
      { label: '准时', value: 0 },
      { label: '5分钟前', value: 5 },
      { label: '15分钟前', value: 15 },
      { label: '30分钟前', value: 30 },
      { label: '1小时前', value: 60 }
    ]
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0]
    this.setData({ dueDate: today })
    this.loadMembers()
  },

  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) {
      const app = getApp()
      const currentUser = app.globalData.userInfo
      this.setData({
        members: res.data,
        assignedTo: currentUser ? currentUser._id : (res.data[0] ? res.data[0]._id : '')
      })
    }
  },

  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  onQuantityInput(e) { this.setData({ quantity: e.detail.value }) },
  onDateChange(e) { this.setData({ dueDate: e.detail.value }) },
  onTimeChange(e) { this.setData({ dueTime: e.detail.value }) },
  onCategorySelect(e) { this.setData({ category: e.currentTarget.dataset.value }) },
  onColorSelect(e) { this.setData({ color: e.currentTarget.dataset.value }) },
  onAssigneeSelect(e) { this.setData({ assignedTo: e.currentTarget.dataset.id }) },
  onRepeatSelect(e) { this.setData({ repeat: e.currentTarget.dataset.value }) },
  onNotifySelect(e) { this.setData({ notifyBefore: e.currentTarget.dataset.value }) },
  onNotificationChange(e) { this.setData({ enableNotification: e.detail.value }) },
  onLunarChange(e) { this.setData({ isLunar: e.detail.value }) },
  toggleMore() { this.setData({ showMore: !this.data.showMore }) },

  async onSubmit() {
    const { title, dueDate } = this.data
    if (!title || !dueDate) {
      wx.showToast({ title: '请填写标题和日期', icon: 'none' })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const todoData = {
      title: this.data.title,
      description: this.data.description,
      dueDate: this.data.dueDate,
      dueTime: this.data.dueTime,
      category: this.data.category,
      color: this.data.color,
      priority: this.data.priority,
      assignedTo: this.data.assignedTo,
      repeat: this.data.repeat,
      isLunar: this.data.isLunar,
      quantity: this.data.quantity,
      enableNotification: this.data.enableNotification,
      notifyBefore: this.data.notifyBefore
    }

    const res = await api.todos.create(todoData)

    wx.hideLoading()

    if (res && res.code === 0) {
      // Request notification subscription if enabled
      if (this.data.enableNotification) {
        try {
          // Replace YOUR_TEMPLATE_ID with actual template ID from WeChat MP console
          // await notification.requestSubscribe('YOUR_TEMPLATE_ID')
        } catch (e) {
          // Subscription failed, but todo was created
        }
      }

      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => { wx.navigateBack() }, 1500)
    }
  }
})
```

- [ ] **Step 2: Commit**

```bash
git add miniprogram/pages/todo-add/
git commit -m "feat: add todo-add page with quick/complete mode"
```

---

## Task 14: Todo Detail, Family, Activity Log, Recycle Bin, Search Pages

**Files:**
- Create: `miniprogram/pages/todo-detail/` (4 files)
- Create: `miniprogram/pages/family/` (4 files)
- Create: `miniprogram/pages/activity-log/` (4 files)
- Create: `miniprogram/pages/recycle-bin/` (4 files)
- Create: `miniprogram/pages/search/` (4 files)

- [ ] **Step 1: Create todo-detail page**

`todo-detail.json`:
```json
{
  "usingComponents": {},
  "navigationBarTitleText": "待办详情"
}
```

`todo-detail.wxml`:
```html
<view class="container">
  <view class="detail-card">
    <view class="detail-header">
      <view class="color-bar" style="background: {{colorMap[todo.color]}}"></view>
      <text class="detail-title">{{todo.title}}</text>
    </view>

    <view class="detail-row">
      <text class="row-label">日期</text>
      <text class="row-value">{{todo.dueDate}} {{todo.dueTime}}</text>
    </view>

    <view class="detail-row" wx:if="{{todo.isLunar}}">
      <text class="row-label">农历</text>
      <text class="row-value">{{todo.lunarDate}}</text>
    </view>

    <view class="detail-row">
      <text class="row-label">分类</text>
      <text class="row-value">{{categoryName}}</text>
    </view>

    <view class="detail-row">
      <text class="row-label">负责人</text>
      <text class="row-value">{{assigneeName}}</text>
    </view>

    <view class="detail-row">
      <text class="row-label">状态</text>
      <text class="row-value {{todo.status === 'completed' ? 'status-done' : ''}}">{{todo.status === 'completed' ? '已完成' : '待办中'}}</text>
    </view>

    <view class="detail-row" wx:if="{{todo.repeat !== 'none'}}">
      <text class="row-label">重复</text>
      <text class="row-value">{{repeatName}}</text>
    </view>

    <view class="detail-row" wx:if="{{todo.quantity}}">
      <text class="row-label">数量</text>
      <text class="row-value">{{todo.quantity}}</text>
    </view>

    <view class="detail-row" wx:if="{{todo.description}}">
      <text class="row-label">描述</text>
      <text class="row-value desc">{{todo.description}}</text>
    </view>

    <view class="detail-row">
      <text class="row-label">通知</text>
      <text class="row-value">{{todo.enableNotification ? '已开启' : '已关闭'}}</text>
    </view>
  </view>

  <view class="action-area" wx:if="{{todo.status === 'pending'}}">
    <button class="btn-primary" bindtap="onComplete">标记完成</button>
    <button class="btn-edit" bindtap="onEdit">编辑</button>
    <button class="btn-danger" bindtap="onDelete">删除</button>
  </view>
</view>
```

`todo-detail.wxss`:
```css
.container { min-height: 100vh; background: #f5f5f5; }
.detail-card { margin: 24rpx; background: #fff; border-radius: 16rpx; overflow: hidden; }
.detail-header { display: flex; align-items: center; padding: 32rpx 24rpx; border-bottom: 1rpx solid #f0f0f0; }
.color-bar { width: 8rpx; height: 48rpx; border-radius: 4rpx; margin-right: 16rpx; }
.detail-title { font-size: 36rpx; font-weight: 600; color: #333; }
.detail-row { display: flex; padding: 20rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.row-label { width: 120rpx; font-size: 26rpx; color: #999; }
.row-value { flex: 1; font-size: 28rpx; color: #333; }
.row-value.desc { white-space: pre-wrap; }
.status-done { color: #52c41a; }
.action-area { padding: 40rpx 24rpx; display: flex; flex-direction: column; gap: 20rpx; }
.btn-edit { background: #f5f5f5; color: #333; border-radius: 12rpx; font-size: 32rpx; }
.btn-danger { background: #ff4d4f; color: #fff; border-radius: 12rpx; font-size: 32rpx; }
```

`todo-detail.js`:
```javascript
const api = require('../../utils/api')
const categoryMap = { daily: '日常', shopping: '购物', family: '家庭', bill: '账单', other: '其他' }
const repeatMap = { none: '不重复', daily: '每天', weekly: '每周', monthly: '每月', lunar_yearly: '农历每年' }

Page({
  data: {
    todo: {},
    categoryName: '',
    assigneeName: '',
    repeatName: '',
    colorMap: { red: '#ff4d4f', blue: '#4A90D9', green: '#52c41a', yellow: '#faad14' }
  },

  onLoad(options) {
    this.todoId = options.id
    this.loadTodo()
  },

  async loadTodo() {
    // Get todo from today's list or by date
    const res = await api.todos.getToday()
    if (res && res.data) {
      const todo = res.data.find(t => t._id === this.todoId)
      if (todo) {
        const membersRes = await api.users.getFamilyMembers()
        const members = membersRes && membersRes.data ? membersRes.data : []
        const assignee = members.find(m => m._id === todo.assignedTo)

        this.setData({
          todo,
          categoryName: categoryMap[todo.category] || '其他',
          assigneeName: assignee ? assignee.name : '未指定',
          repeatName: repeatMap[todo.repeat] || '不重复'
        })
      }
    }
  },

  async onComplete() {
    const res = await api.todos.complete(this.todoId)
    if (res && res.code === 0) {
      wx.showToast({ title: '已完成', icon: 'success' })
      this.loadTodo()
    }
  },

  onEdit() {
    wx.navigateTo({
      url: `/pages/todo-add/todo-add?id=${this.todoId}&mode=edit`
    })
  },

  async onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后可在回收站恢复',
      success: async (res) => {
        if (res.confirm) {
          const result = await api.todos.delete(this.todoId)
          if (result && result.code === 0) {
            wx.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => { wx.navigateBack() }, 1500)
          }
        }
      }
    })
  }
})
```

- [ ] **Step 2: Create family page**

`family.json`: `{"usingComponents": {}, "navigationBarTitleText": "家庭成员"}`
`family.wxml`:
```html
<view class="container">
  <view class="invite-section">
    <text class="invite-label">邀请码</text>
    <text class="invite-code">{{inviteCode}}</text>
    <button class="btn-copy" bindtap="copyCode">复制</button>
  </view>

  <view class="members-section">
    <text class="section-title">家庭成员</text>
    <view class="member-item" wx:for="{{members}}" wx:key="_id">
      <view class="member-avatar">{{item.name[0]}}</view>
      <text class="member-name">{{item.name}}</text>
      <text class="member-role">{{item.role === 'child' ? '孩子' : item.role === 'father' ? '爸爸' : '妈妈'}}</text>
    </view>
  </view>

  <view class="join-section">
    <input class="join-input" placeholder="输入邀请码加入家庭" value="{{joinCode}}" bindinput="onJoinInput" />
    <button class="btn-primary" bindtap="onJoin">加入</button>
  </view>
</view>
```
`family.wxss`:
```css
.container { min-height: 100vh; background: #f5f5f5; }
.invite-section { background: #fff; margin: 24rpx; padding: 32rpx; border-radius: 16rpx; text-align: center; }
.invite-label { font-size: 26rpx; color: #999; display: block; margin-bottom: 12rpx; }
.invite-code { font-size: 48rpx; font-weight: 700; color: #4A90D9; letter-spacing: 8rpx; display: block; margin-bottom: 16rpx; }
.btn-copy { background: #f5f5f5; color: #4A90D9; font-size: 28rpx; border-radius: 8rpx; display: inline-block; padding: 8rpx 32rpx; }
.members-section { background: #fff; margin: 24rpx; padding: 24rpx; border-radius: 16rpx; }
.section-title { font-size: 30rpx; font-weight: 600; color: #333; display: block; margin-bottom: 16rpx; }
.member-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.member-avatar { width: 64rpx; height: 64rpx; line-height: 64rpx; text-align: center; background: #4A90D9; color: #fff; border-radius: 50%; margin-right: 16rpx; }
.member-name { flex: 1; font-size: 30rpx; color: #333; }
.member-role { font-size: 24rpx; color: #999; }
.join-section { background: #fff; margin: 24rpx; padding: 24rpx; border-radius: 16rpx; display: flex; gap: 16rpx; }
.join-input { flex: 1; font-size: 28rpx; border: 1rpx solid #ddd; border-radius: 8rpx; padding: 12rpx 16rpx; }
```
`family.js`:
```javascript
const api = require('../../utils/api')
Page({
  data: { members: [], inviteCode: '', joinCode: '' },
  onLoad() { this.loadData() },
  async loadData() {
    const membersRes = await api.users.getFamilyMembers()
    if (membersRes && membersRes.data) this.setData({ members: membersRes.data })
    const userRes = await api.users.getUserInfo()
    if (userRes && userRes.data) {
      const familyRes = await wx.cloud.callFunction({ name: 'users', data: { action: 'getFamilyInfo', familyId: userRes.data.familyGroupId } })
      if (familyRes.result && familyRes.result.data) this.setData({ inviteCode: familyRes.result.data.inviteCode })
    }
  },
  copyCode() { wx.setClipboardData({ data: this.data.inviteCode }) },
  onJoinInput(e) { this.setData({ joinCode: e.detail.value }) },
  async onJoin() {
    if (!this.data.joinCode) return
    const res = await api.users.joinFamily(this.data.joinCode)
    if (res && res.code === 0) { wx.showToast({ title: '加入成功', icon: 'success' }); this.loadData() }
  }
})
```

- [ ] **Step 3: Create activity-log page**

`activity-log.json`: `{"usingComponents": {}, "navigationBarTitleText": "操作日志"}`
`activity-log.wxml`:
```html
<view class="container">
  <view class="log-item" wx:for="{{logs}}" wx:key="_id">
    <view class="log-avatar">{{item.userName[0]}}</view>
    <view class="log-content">
      <text class="log-text">{{item.userName}} {{item.detail}}</text>
      <text class="log-time">{{item.createdAtStr}}</text>
    </view>
  </view>
  <view class="empty-state" wx:if="{{logs.length === 0}}">
    <text>暂无操作记录</text>
  </view>
</view>
```
`activity-log.wxss`:
```css
.container { min-height: 100vh; background: #f5f5f5; }
.log-item { display: flex; padding: 24rpx; background: #fff; margin-bottom: 2rpx; }
.log-avatar { width: 56rpx; height: 56rpx; line-height: 56rpx; text-align: center; background: #4A90D9; color: #fff; border-radius: 50%; margin-right: 16rpx; flex-shrink: 0; }
.log-content { flex: 1; }
.log-text { font-size: 28rpx; color: #333; display: block; }
.log-time { font-size: 22rpx; color: #999; display: block; margin-top: 8rpx; }
```
`activity-log.js`:
```javascript
const api = require('../../utils/api')
Page({
  data: { logs: [] },
  onLoad() { this.loadLogs() },
  async loadLogs() {
    const res = await api.activityLogs.getLogs(0)
    if (res && res.data) {
      const logs = res.data.map(log => ({
        ...log,
        createdAtStr: log.createdAt ? new Date(log.createdAt).toLocaleString() : ''
      }))
      this.setData({ logs })
    }
  }
})
```

- [ ] **Step 4: Create recycle-bin page**

`recycle-bin.json`: `{"usingComponents": {}, "navigationBarTitleText": "回收站"}`
`recycle-bin.wxml`:
```html
<view class="container">
  <view class="deleted-item" wx:for="{{deletedTodos}}" wx:key="_id">
    <view class="item-info">
      <text class="item-title">{{item.title}}</text>
      <text class="item-date">删除于 {{item.deletedAtStr}}</text>
    </view>
    <view class="item-actions">
      <text class="restore-btn" bindtap="onRestore" data-id="{{item._id}}">恢复</text>
      <text class="perm-delete-btn" bindtap="onPermanentDelete" data-id="{{item._id}}">彻底删除</text>
    </view>
  </view>
  <view class="empty-state" wx:if="{{deletedTodos.length === 0}}">
    <text>回收站为空</text>
  </view>
</view>
```
`recycle-bin.wxss`:
```css
.container { min-height: 100vh; background: #f5f5f5; }
.deleted-item { display: flex; align-items: center; padding: 24rpx; background: #fff; margin-bottom: 2rpx; }
.item-info { flex: 1; }
.item-title { font-size: 30rpx; color: #333; display: block; }
.item-date { font-size: 22rpx; color: #999; display: block; margin-top: 8rpx; }
.item-actions { display: flex; gap: 16rpx; }
.restore-btn { font-size: 26rpx; color: #4A90D9; padding: 8rpx 16rpx; }
.perm-delete-btn { font-size: 26rpx; color: #ff4d4f; padding: 8rpx 16rpx; }
```
`recycle-bin.js`:
```javascript
const api = require('../../utils/api')
Page({
  data: { deletedTodos: [] },
  onLoad() { this.loadDeleted() },
  async loadDeleted() {
    const res = await api.todos.getDeleted()
    if (res && res.data) {
      const deletedTodos = res.data.map(t => ({
        ...t,
        deletedAtStr: t.deletedAt ? new Date(t.deletedAt).toLocaleString() : ''
      }))
      this.setData({ deletedTodos })
    }
  },
  async onRestore(e) {
    const id = e.currentTarget.dataset.id
    const res = await api.todos.restore(id)
    if (res && res.code === 0) { wx.showToast({ title: '已恢复', icon: 'success' }); this.loadDeleted() }
  },
  async onPermanentDelete(e) {
    wx.showModal({
      title: '彻底删除',
      content: '此操作不可恢复，确定删除？',
      success: async (res) => {
        if (res.confirm) {
          const id = e.currentTarget.dataset.id
          await api.todos.permanentDelete(id)
          this.loadDeleted()
        }
      }
    })
  }
})
```

- [ ] **Step 5: Create search page**

`search.json`: `{"usingComponents": {"todo-card": "../../components/todo-card/todo-card"}, "navigationBarTitleText": "搜索"}`
`search.wxml`:
```html
<view class="container">
  <view class="search-input-bar">
    <input class="search-input" placeholder="搜索待办事项" value="{{keyword}}" bindinput="onInput" focus="{{true}}" bindconfirm="onSearch" />
    <text class="search-btn" bindtap="onSearch">搜索</text>
  </view>
  <view class="results">
    <todo-card wx:for="{{results}}" wx:key="_id" todo="{{item}}" members="{{members}}" bind:tap="onTodoTap" />
  </view>
  <view class="empty-state" wx:if="{{searched && results.length === 0}}">
    <text>未找到相关事项</text>
  </view>
</view>
```
`search.wxss`:
```css
.container { min-height: 100vh; background: #f5f5f5; }
.search-input-bar { display: flex; align-items: center; padding: 16rpx 24rpx; background: #fff; }
.search-input { flex: 1; font-size: 28rpx; padding: 12rpx 16rpx; background: #f5f5f5; border-radius: 8rpx; }
.search-btn { font-size: 28rpx; color: #4A90D9; margin-left: 16rpx; padding: 12rpx; }
```
`search.js`:
```javascript
const api = require('../../utils/api')
Page({
  data: { keyword: '', results: [], members: [], searched: false },
  onLoad() { this.loadMembers() },
  async loadMembers() {
    const res = await api.users.getFamilyMembers()
    if (res && res.data) this.setData({ members: res.data })
  },
  onInput(e) { this.setData({ keyword: e.detail.value }) },
  async onSearch() {
    if (!this.data.keyword) return
    const res = await api.todos.search(this.data.keyword, 0)
    if (res && res.data) this.setData({ results: res.data, searched: true })
  },
  onTodoTap(e) {
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.detail.todo._id}` })
  }
})
```

- [ ] **Step 6: Commit all pages**

```bash
git add miniprogram/pages/
git commit -m "feat: add remaining pages (detail, family, activity-log, recycle-bin, search)"
```

---

## Task 15: Tab Bar Icons

**Files:**
- Create: `miniprogram/images/` (6 icon files)

- [ ] **Step 1: Create placeholder icon files**

Since we can't generate actual PNG files in code, create a script to generate simple SVG-based icons or use placeholder text files. For production, replace with proper icons.

```bash
mkdir -p miniprogram/images
# Create placeholder files - replace with actual icons before deployment
touch miniprogram/images/home.png
touch miniprogram/images/home-active.png
touch miniprogram/images/calendar.png
touch miniprogram/images/calendar-active.png
touch miniprogram/images/mine.png
touch miniprogram/images/mine-active.png
```

Note: For actual deployment, use WeUI icons or custom icons. You can download from iconfont.cn or use WeChat DevTools' built-in icon library.

- [ ] **Step 2: Commit**

```bash
git add miniprogram/images/
git commit -m "chore: add placeholder tab bar icons"
```

---

## Task 16: Python AI Service

**Files:**
- Create: `ai-service/app.py`
- Create: `ai-service/config.py`
- Create: `ai-service/requirements.txt`
- Create: `ai-service/models/__init__.py`
- Create: `ai-service/models/classifier.py`
- Create: `ai-service/models/time_recommender.py`
- Create: `ai-service/README.md`

- [ ] **Step 1: Create Conda environment**

```bash
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
```

- [ ] **Step 2: Create requirements.txt**

```
fastapi==0.104.1
uvicorn==0.24.0
torch==2.1.0
openai-whisper==20231117
numpy==1.24.0
pydantic==2.5.0
python-multipart==0.0.6
```

- [ ] **Step 3: Create config.py**

```python
import os

class Config:
    # Server
    HOST = os.getenv("AI_HOST", "0.0.0.0")
    PORT = int(os.getenv("AI_PORT", "8000"))

    # AI toggle
    ENABLE_AI = os.getenv("ENABLE_AI", "false").lower() == "true"

    # Model paths
    CLASSIFIER_MODEL_PATH = os.getenv("CLASSIFIER_MODEL", "models/classifier.pt")
    WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")

    # Categories
    CATEGORIES = ["daily", "shopping", "family", "bill", "other"]
    COLORS = ["red", "blue", "green", "yellow"]

config = Config()
```

- [ ] **Step 4: Create models/__init__.py**

```python
from .classifier import TextClassifier
from .time_recommender import TimeRecommender

__all__ = ["TextClassifier", "TimeRecommender"]
```

- [ ] **Step 5: Create models/classifier.py**

```python
import torch
import torch.nn as nn


class SimpleClassifier(nn.Module):
    """Simple text classifier for todo categorization."""

    def __init__(self, vocab_size: int, embed_dim: int, num_classes: int):
        super().__init__()
        self.embedding = nn.EmbeddingBag(vocab_size, embed_dim, sparse=False)
        self.fc = nn.Linear(embed_dim, num_classes)

    def forward(self, text: str) -> torch.Tensor:
        # Placeholder: in production, use proper tokenization
        embedded = self.embedding(text)
        return self.fc(embedded)


class TextClassifier:
    """Wrapper for text classification."""

    def __init__(self):
        self.model = None
        self.vocab = {}
        self.categories = ["daily", "shopping", "family", "bill", "other"]
        self.colors = ["blue", "red", "green", "yellow"]
        self._load_model()

    def _load_model(self):
        """Load or initialize the classification model."""
        # In production, load a trained model
        # For now, use keyword-based classification
        self.keywords = {
            "shopping": ["买", "购", "超市", "菜", "水果", "日用品", "衣服"],
            "bill": ["缴费", "水电", "房租", "账单", "还款", "保险"],
            "family": ["聚会", "旅行", "纪念日", "生日", "祭祖", "扫墓"],
            "daily": ["吃药", "锻炼", "体检", "上班", "开会", "学习"],
        }
        self.color_keywords = {
            "red": ["紧急", "重要", "急", "马上"],
            "green": ["买", "购", "超市", "菜"],
            "yellow": ["提醒", "注意", "别忘"],
        }

    def classify(self, title: str) -> dict:
        """Classify a todo title into category and suggest color."""
        title_lower = title.lower()

        # Category classification
        category = "other"
        max_score = 0
        for cat, keywords in self.keywords.items():
            score = sum(1 for kw in keywords if kw in title_lower)
            if score > max_score:
                max_score = score
                category = cat

        # Color suggestion
        color = "blue"
        for c, keywords in self.color_keywords.items():
            if any(kw in title_lower for kw in keywords):
                color = c
                break

        return {
            "category": category,
            "color": color,
            "confidence": max_score / 3.0 if max_score > 0 else 0.0
        }
```

- [ ] **Step 6: Create models/time_recommender.py**

```python
from datetime import datetime
from typing import Optional


class TimeRecommender:
    """Recommends reminder times based on historical patterns."""

    def __init__(self):
        # In production, load user history from database
        self.user_patterns = {}

    def recommend(self, user_id: str, category: str) -> Optional[str]:
        """Recommend a time for a reminder based on user patterns."""
        # Default recommendations by category
        defaults = {
            "daily": "08:00",
            "shopping": "10:00",
            "family": "09:00",
            "bill": "09:00",
            "other": "10:00"
        }

        # Check if we have user-specific patterns
        if user_id in self.user_patterns:
            pattern = self.user_patterns[user_id].get(category)
            if pattern:
                return pattern

        return defaults.get(category, "10:00")

    def learn_from_history(self, user_id: str, category: str, time: str):
        """Learn from completed todo times."""
        if user_id not in self.user_patterns:
            self.user_patterns[user_id] = {}

        if category not in self.user_patterns[user_id]:
            self.user_patterns[user_id][category] = []

        self.user_patterns[user_id][category].append(time)

        # Calculate most common time
        times = self.user_patterns[user_id][category]
        if len(times) >= 3:
            from collections import Counter
            most_common = Counter(times).most_common(1)[0][0]
            self.user_patterns[user_id][category] = most_common
```

- [ ] **Step 7: Create app.py**

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import logging

from config import config
from models import TextClassifier, TimeRecommender

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Family Todo AI Service", version="1.0.0")

# Initialize models
classifier = TextClassifier()
time_recommender = TimeRecommender()


class ClassifyRequest(BaseModel):
    title: str


class ClassifyResponse(BaseModel):
    category: str
    color: str
    confidence: float


class RecommendTimeRequest(BaseModel):
    user_id: str
    category: str


class RecommendTimeResponse(BaseModel):
    recommended_time: str


class HealthResponse(BaseModel):
    status: str
    ai_enabled: bool


@app.get("/api/ai/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        ai_enabled=config.ENABLE_AI
    )


@app.post("/api/ai/classify", response_model=ClassifyResponse)
async def classify_todo(request: ClassifyRequest):
    """Classify a todo title into category and suggest color."""
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")

    result = classifier.classify(request.title)
    return ClassifyResponse(**result)


@app.post("/api/ai/recommend-time", response_model=RecommendTimeResponse)
async def recommend_time(request: RecommendTimeRequest):
    """Recommend a reminder time based on user patterns."""
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")

    recommended = time_recommender.recommend(request.user_id, request.category)
    return RecommendTimeResponse(recommended_time=recommended or "10:00")


@app.post("/api/ai/speech-to-text")
async def speech_to_text():
    """Convert speech to text using Whisper."""
    if not config.ENABLE_AI:
        raise HTTPException(status_code=503, detail="AI service is disabled")

    # Placeholder: implement with actual audio file upload
    return {"text": "语音识别功能开发中"}


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting AI service on {config.HOST}:{config.PORT}")
    logger.info(f"AI enabled: {config.ENABLE_AI}")
    uvicorn.run(app, host=config.HOST, port=config.PORT)
```

- [ ] **Step 8: Create ai-service/README.md**

```markdown
# Family Todo AI Service

Optional AI service for smart features.

## Setup

```bash
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
pip install -r requirements.txt
```

## Run

```bash
# Enable AI
export ENABLE_AI=true
python app.py

# Disable AI (default)
export ENABLE_AI=false
python app.py
```

## API Endpoints

- `GET /api/ai/health` - Health check
- `POST /api/ai/classify` - Classify todo title
- `POST /api/ai/recommend-time` - Recommend reminder time
- `POST /api/ai/speech-to-text` - Speech to text (placeholder)

## Toggle AI

Set `ENABLE_AI=true` environment variable to enable AI features.
When disabled, all endpoints return 503.
```

- [ ] **Step 9: Commit**

```bash
git add ai-service/
git commit -m "feat: add Python AI service with FastAPI and PyTorch"
```

---

## Task 17: Documentation

**Files:**
- Create: `README.md`
- Create: `LEARNING.md`

- [ ] **Step 1: Create README.md**

```markdown
# 家庭提醒小程序

三口之家共享提醒事项微信小程序，支持农历日期、购物清单、家庭成员协作。

## 功能特性

- **待办事项管理**：创建、编辑、完成、删除待办事项
- **购物清单**：购物作为待办分类，支持数量和拍照
- **日历视图**：月视图 + 农历日期显示
- **家庭协作**：邀请码加入家庭组，共享待办
- **通知提醒**：微信订阅消息推送
- **操作日志**：记录家庭组内所有操作
- **回收站**：软删除，可恢复
- **搜索功能**：按标题搜索待办
- **AI功能（可选）**：智能分类、时间推荐、语音识别

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 |
| 后端 | 微信云开发（云函数+云数据库） |
| AI服务 | Python + FastAPI + PyTorch（可选） |
| 农历 | lunar-javascript |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/family-reminder.git
cd family-reminder
```

### 2. 微信小程序配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入项目
3. 在 `project.config.json` 中替换 `YOUR_APPID` 为你的小程序 AppID
4. 在 `miniprogram/app.js` 中替换 `YOUR_CLOUD_ENV_ID` 为你的云开发环境 ID

### 3. 云开发环境

1. 在微信开发者工具中开通云开发
2. 创建以下数据库集合：
   - `users`
   - `reminders`
   - `activity_logs`
   - `notification_records`
3. 上传云函数（右键云函数目录 -> 上传并部署）

### 4. AI服务（可选）

```bash
cd ai-service
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
pip install -r requirements.txt
export ENABLE_AI=true
python app.py
```

## 项目结构

```
├── miniprogram/          # 微信小程序前端
│   ├── pages/            # 页面
│   ├── components/       # 组件
│   ├── utils/            # 工具函数
│   └── images/           # 图片资源
├── cloudfunctions/       # 微信云函数
│   ├── todos/            # 待办CRUD
│   ├── users/            # 用户管理
│   ├── notifications/    # 通知推送
│   └── activity-logs/    # 操作日志
├── ai-service/           # Python AI服务（可选）
├── docs/                 # 文档
├── README.md
└── LEARNING.md
```

## 开发指南

详见 [LEARNING.md](./LEARNING.md)

## 许可证

MIT License
```

- [ ] **Step 2: Create LEARNING.md**

```markdown
# 学习操作指南

本文档帮助你了解如何使用和开发家庭提醒小程序。

## 目录

1. [用户使用指南](#用户使用指南)
2. [开发者指南](#开发者指南)
3. [常见问题](#常见问题)

---

## 用户使用指南

### 首次使用

1. 打开小程序，自动创建账户
2. 记录你的邀请码（在"我的" -> "家庭成员"中查看）
3. 家庭其他成员使用邀请码加入家庭组

### 创建待办

1. 点击首页右下角 "+" 按钮
2. 填写标题和日期（必填）
3. 点击"更多选项"可设置分类、颜色、负责人等
4. 点击"保存"

### 管理待办

- **完成待办**：点击待办卡片上的"完成"按钮
- **删除待办**：点击"删除"（可在回收站恢复）
- **编辑待办**：进入详情页点击"编辑"

### 查看日历

1. 切换到"日历"Tab
2. 点击日期查看当天事项
3. 左右箭头切换月份

### 购物清单

1. 创建待办时选择"购物"分类
2. 可填写数量（如"2颗白菜"）
3. 完成后自动标记为"已购买"

### 农历提醒

1. 创建待办时开启"使用农历"
2. 适用于祭祖、传统节日等
3. 支持"农历每年"重复

---

## 开发者指南

### 环境要求

- 微信开发者工具
- Node.js 16+
- Python 3.10+（AI服务）
- Conda（Python环境管理）

### 本地开发

1. 克隆项目
2. 用微信开发者工具打开项目
3. 开通云开发，创建数据库集合
4. 上传云函数
5. 编译运行

### 数据库集合

| 集合名 | 用途 |
|--------|------|
| users | 用户信息 |
| reminders | 待办事项 |
| activity_logs | 操作日志 |
| notification_records | 通知订阅记录 |

### 云函数

| 函数名 | 功能 |
|--------|------|
| todos | 待办CRUD、软删除、搜索 |
| users | 用户登录、家庭管理 |
| notifications | 订阅消息管理 |
| activity-logs | 操作日志查询 |

### AI服务

AI服务为可选模块，通过环境变量 `ENABLE_AI` 控制开关。

```bash
# 启动AI服务
cd ai-service
conda activate family-todo-ai
export ENABLE_AI=true
python app.py

# 关闭AI服务
export ENABLE_AI=false
python app.py
```

---

## 常见问题

### Q: 如何获取小程序 AppID？

A: 登录 [微信公众平台](https://mp.weixin.qq.com/)，在"开发" -> "开发管理" -> "开发设置"中获取。

### Q: 如何开通云开发？

A: 在微信开发者工具中，点击"云开发"按钮，按提示开通。

### Q: 订阅消息如何配置？

A: 登录微信公众平台，在"功能" -> "订阅消息"中选择模板。

### Q: AI服务不启动会影响使用吗？

A: 不会。AI功能完全可选，关闭后核心功能正常运行。

### Q: 如何上传到 GitHub？

```bash
git remote add origin https://github.com/YOUR_USERNAME/family-reminder.git
git branch -M main
git push -u origin main
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md LEARNING.md
git commit -m "docs: add README and LEARNING documentation"
```

---

## Task 18: Final Review and GitHub Upload

- [ ] **Step 1: Review all files**

Check that all files are created and consistent.

- [ ] **Step 2: Create GitHub repository and push**

```bash
# Initialize if not already done
git init

# Add all files
git add -A

# Commit
git commit -m "feat: complete family reminder mini-program"

# Add remote (replace with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/family-reminder.git

# Push
git branch -M main
git push -u origin main
```

- [ ] **Step 3: Verify deployment**

1. Check GitHub repository has all files
2. Verify README renders correctly
3. Test mini-program in WeChat DevTools

---

## Completion Checklist

- [ ] All cloud functions created and tested
- [ ] All mini-program pages created
- [ ] All components created
- [ ] All utility modules created
- [ ] Tab bar icons added
- [ ] AI service created (optional)
- [ ] README.md complete
- [ ] LEARNING.md complete
- [ ] Git repository initialized
- [ ] Code pushed to GitHub
- [ ] Mini-program tested in DevTools
- [ ] Cloud functions deployed
- [ ] Database collections created
