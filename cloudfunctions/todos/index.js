const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const userCache = new Map()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  try {
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
      case 'getById':
        return await getTodoById(openid, event)
      case 'getAll':
        return await getAllTodos(openid)
      default:
        return { code: -1, msg: 'Unknown action' }
    }
  } catch (err) {
    console.error(`[todos] action=${action} error:`, err)
    return { code: -1, msg: 'Server error' }
  }
}

async function getUserAndFamily(openid) {
  if (userCache.has(openid)) return userCache.get(openid)
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  const result = user.data[0]
  userCache.set(openid, result)
  return result
}

async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  try {
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
  } catch (err) {
    console.error('[todos] logActivity failed:', err)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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
  console.log('[todos] Created todo:', title, 'by', openid)

  logActivity(user.familyGroupId, user._id, 'create', title, `创建了待办: ${title}`)

  return { code: 0, data: todoData }
}

async function updateTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  const allowedFields = [
    'title', 'description', 'color', 'priority', 'category',
    'dueDate', 'dueTime', 'isLunar', 'lunarDate', 'repeat',
    'assignedTo', 'images', 'quantity', 'enableNotification', 'notifyBefore'
  ]

  const updateFields = { updatedAt: db.serverDate() }
  for (const key of allowedFields) {
    if (event[key] !== undefined) {
      updateFields[key] = event[key]
    }
  }

  try {
    const todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
      return { code: -1, msg: 'Todo not found' }
    }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }

  await db.collection('reminders').doc(todoId).update({
    data: updateFields
  })

  logActivity(user.familyGroupId, user._id, 'update', updateFields.title || '', '更新了待办')

  return { code: 0, msg: 'Updated' }
}

async function deleteTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  let todo
  try {
    todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
      return { code: -1, msg: 'Todo not found' }
    }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }

  await db.collection('reminders').doc(todoId).update({
    data: { deletedAt: db.serverDate() }
  })

  console.log('[todos] Deleted todo:', todoId, 'by', openid)
  logActivity(user.familyGroupId, user._id, 'delete', todo.data.title, `删除了待办: ${todo.data.title}`)

  return { code: 0, msg: 'Deleted (soft)' }
}

async function restoreTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  try {
    const todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
      return { code: -1, msg: 'Todo not found' }
    }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }

  await db.collection('reminders').doc(todoId).update({
    data: { deletedAt: null }
  })

  return { code: 0, msg: 'Restored' }
}

async function completeTodo(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  let todo
  try {
    todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
      return { code: -1, msg: 'Todo not found' }
    }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }

  await db.collection('reminders').doc(todoId).update({
    data: {
      status: 'completed',
      completedAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  console.log('[todos] Completed todo:', todoId, 'by', openid)
  logActivity(user.familyGroupId, user._id, 'complete', todo.data.title, `完成了待办: ${todo.data.title}`)

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
    .field({ images: false })
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
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: null,
      dueDate: _.gte(startDate).and(_.lte(endDate))
    })
    .orderBy('dueDate', 'asc')
    .orderBy('dueTime', 'asc')
    .limit(100)
    .field({ images: false })
    .get()

  return { code: 0, data: res.data }
}

async function searchTodos(openid, event) {
  const user = await getUserAndFamily(openid)
  const { keyword, skip = 0 } = event

  const safeKeyword = escapeRegex(keyword)

  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      deletedAt: null,
      title: db.RegExp({ regexp: safeKeyword, options: 'i' })
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

  try {
    const todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== user.familyGroupId) {
      return { code: -1, msg: 'Todo not found' }
    }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }

  await db.collection('reminders').doc(todoId).remove()
  console.log('[todos] Permanently deleted:', todoId, 'by', openid)
  return { code: 0, msg: 'Permanently deleted' }
}

async function getTodoById(openid, event) {
  const user = await getUserAndFamily(openid)
  const { todoId } = event

  try {
    const res = await db.collection('reminders').doc(todoId).get()
    if (res.data && res.data.familyGroupId === user.familyGroupId) {
      return { code: 0, data: res.data }
    }
    return { code: -1, msg: 'Todo not found' }
  } catch (err) {
    return { code: -1, msg: 'Todo not found' }
  }
}

async function getAllTodos(openid) {
  const user = await getUserAndFamily(openid)
  const res = await db.collection('reminders')
    .where({
      familyGroupId: user.familyGroupId,
      status: 'pending',
      deletedAt: null
    })
    .orderBy('dueDate', 'asc')
    .orderBy('dueTime', 'asc')
    .limit(100)
    .field({ images: false })
    .get()
  return { code: 0, data: res.data }
}
