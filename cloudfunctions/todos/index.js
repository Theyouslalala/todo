const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  // Per-request user cache (avoids cross-request stale data)
  const userCache = new Map()

  try {
    switch (action) {
      case 'ping':
        return { code: 0, msg: 'pong' }
      case 'create':
        return await createTodo(openid, event, userCache)
      case 'update':
        return await updateTodo(openid, event, userCache)
      case 'delete':
        return await deleteTodo(openid, event, userCache)
      case 'restore':
        return await restoreTodo(openid, event, userCache)
      case 'complete':
        return await completeTodo(openid, event, userCache)
      case 'uncomplete':
        return await uncompleteTodo(openid, event, userCache)
      case 'getToday':
        return await getTodayTodos(openid, userCache)
      case 'getByDate':
        return await getTodosByDate(openid, event, userCache)
      case 'getByMonth':
        return await getTodosByMonth(openid, event, userCache)
      case 'search':
        return await searchTodos(openid, event, userCache)
      case 'getDeleted':
        return await getDeletedTodos(openid, userCache)
      case 'permanentDelete':
        return await permanentDeleteTodo(openid, event, userCache)
      case 'getById':
        return await getTodoById(openid, event, userCache)
      case 'batchDelete':
        return await batchDeleteTodos(openid, event, userCache)
      case 'getAll':
        return await getAllTodos(openid, userCache)
      default:
        return { code: -1, msg: 'Unknown action' }
    }
  } catch (err) {
    console.error(`[todos] action=${action} error:`, err)
    return { code: -1, msg: 'Server error' }
  }
}

async function getUserAndFamily(openid, cache) {
  if (cache.has(openid)) return cache.get(openid)
  const user = await db.collection('users').where({ openid }).get()
  if (user.data.length === 0) throw new Error('User not found')
  const result = user.data[0]
  cache.set(openid, result)
  return result
}

async function verifyOwnership(todoId, familyGroupId) {
  try {
    const todo = await db.collection('reminders').doc(todoId).get()
    if (!todo.data || todo.data.familyGroupId !== familyGroupId) {
      return { error: { code: -1, msg: 'Todo not found' } }
    }
    return { todo: todo.data }
  } catch (err) {
    return { error: { code: -1, msg: 'Todo not found' } }
  }
}

async function logActivity(familyGroupId, userId, action, targetTitle, detail) {
  try {
    await db.collection('activity_logs').add({
      data: { familyGroupId, userId, action, targetTitle, detail, createdAt: db.serverDate() }
    })
  } catch (err) {
    console.error('[todos] logActivity failed:', err)
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function createTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
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

async function updateTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  const allowedFields = [
    'title', 'description', 'color', 'priority', 'category',
    'dueDate', 'dueTime', 'isLunar', 'lunarDate', 'repeat',
    'assignedTo', 'images', 'quantity', 'enableNotification', 'notifyBefore'
  ]

  const updateFields = { updatedAt: db.serverDate() }
  for (const key of allowedFields) {
    if (event[key] !== undefined) updateFields[key] = event[key]
  }

  await db.collection('reminders').doc(todoId).update({ data: updateFields })
  logActivity(user.familyGroupId, user._id, 'update', ownership.todo.title, '更新了待办')
  return { code: 0, msg: 'Updated' }
}

async function deleteTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  await db.collection('reminders').doc(todoId).update({ data: { deletedAt: db.serverDate() } })
  console.log('[todos] Deleted todo:', todoId, 'by', openid)
  logActivity(user.familyGroupId, user._id, 'delete', ownership.todo.title, `删除了待办: ${ownership.todo.title}`)
  return { code: 0, msg: 'Deleted (soft)' }
}

async function restoreTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  await db.collection('reminders').doc(todoId).update({ data: { deletedAt: null } })
  return { code: 0, msg: 'Restored' }
}

async function completeTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  await db.collection('reminders').doc(todoId).update({
    data: { status: 'completed', completedAt: db.serverDate(), updatedAt: db.serverDate() }
  })
  console.log('[todos] Completed todo:', todoId, 'by', openid)
  logActivity(user.familyGroupId, user._id, 'complete', ownership.todo.title, `完成了待办: ${ownership.todo.title}`)
  return { code: 0, msg: 'Completed' }
}

async function uncompleteTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  await db.collection('reminders').doc(todoId).update({
    data: { status: 'pending', completedAt: null, updatedAt: db.serverDate() }
  })
  console.log('[todos] Uncompleted todo:', todoId, 'by', openid)
  logActivity(user.familyGroupId, user._id, 'uncomplete', ownership.todo.title, `撤销完成: ${ownership.todo.title}`)
  return { code: 0, msg: 'Uncompleted' }
}

function getLocalDate() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

async function getTodayTodos(openid, cache) {
  const user = await getUserAndFamily(openid, cache)
  const today = getLocalDate()

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, status: 'pending', deletedAt: null, dueDate: today })
    .orderBy('dueTime', 'asc').limit(50).field({ images: false }).get()

  return { code: 0, data: res.data }
}

async function getTodosByDate(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { date } = event

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, deletedAt: null, dueDate: date })
    .orderBy('dueTime', 'asc').limit(50).get()

  return { code: 0, data: res.data }
}

async function getTodosByMonth(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { year, month } = event
  if (!year || !month) return { code: -1, msg: 'Missing year or month' }

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, deletedAt: null, dueDate: _.gte(startDate).and(_.lte(endDate)) })
    .orderBy('dueDate', 'asc').orderBy('dueTime', 'asc').limit(100).field({ images: false }).get()

  return { code: 0, data: res.data }
}

async function searchTodos(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { keyword, skip = 0 } = event
  if (!keyword || typeof keyword !== 'string') return { code: -1, msg: 'Missing keyword' }
  const safeKeyword = escapeRegex(keyword)

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, deletedAt: null, title: db.RegExp({ regexp: safeKeyword, options: 'i' }) })
    .orderBy('createdAt', 'desc').skip(skip).limit(20).get()

  return { code: 0, data: res.data }
}

async function getDeletedTodos(openid, cache) {
  const user = await getUserAndFamily(openid, cache)

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, deletedAt: _.neq(null) })
    .orderBy('deletedAt', 'desc').limit(50).get()

  return { code: 0, data: res.data }
}

async function permanentDeleteTodo(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  await db.collection('reminders').doc(todoId).remove()
  console.log('[todos] Permanently deleted:', todoId, 'by', openid)
  return { code: 0, msg: 'Permanently deleted' }
}

async function getTodoById(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoId } = event

  const ownership = await verifyOwnership(todoId, user.familyGroupId)
  if (ownership.error) return ownership.error

  return { code: 0, data: ownership.todo }
}

async function batchDeleteTodos(openid, event, cache) {
  const user = await getUserAndFamily(openid, cache)
  const { todoIds } = event
  if (!Array.isArray(todoIds) || todoIds.length === 0) return { code: -1, msg: 'No todos specified' }
  if (todoIds.length > 50) return { code: -1, msg: 'Too many todos' }

  // Batch read instead of N+1
  const existing = await db.collection('reminders')
    .where({ _id: _.in(todoIds), familyGroupId: user.familyGroupId })
    .get()

  const validIds = existing.data.map(d => d._id)
  const notFoundIds = todoIds.filter(id => !validIds.includes(id))

  // Batch update
  const now = db.serverDate()
  const updatePromises = validIds.map(id =>
    db.collection('reminders').doc(id).update({ data: { deletedAt: now } })
  )
  await Promise.all(updatePromises)

  const results = [
    ...validIds.map(id => ({ id, success: true })),
    ...notFoundIds.map(id => ({ id, success: false, reason: 'not found' }))
  ]

  console.log('[todos] Batch delete:', validIds.length, '/', todoIds.length, 'by', openid)
  return { code: 0, data: { total: todoIds.length, succeeded: validIds.length, results } }
}

async function getAllTodos(openid, cache) {
  const user = await getUserAndFamily(openid, cache)

  const res = await db.collection('reminders')
    .where({ familyGroupId: user.familyGroupId, status: 'pending', deletedAt: null })
    .orderBy('dueDate', 'asc').orderBy('dueTime', 'asc').limit(100).field({ images: false }).get()

  return { code: 0, data: res.data }
}
