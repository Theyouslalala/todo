const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

async function findUser(openid) {
  const res = await db.collection('users').where({ openid }).get()
  return res.data.length > 0 ? res.data[0] : null
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
  const { action } = event

  try {
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
      case 'getFamilyInfo':
        return await getFamilyInfo(openid)
      default:
        return { code: -1, msg: 'Unknown action' }
    }
  } catch (err) {
    console.error(`[users] action=${action} error:`, err)
    return { code: -1, msg: 'Server error' }
  }
}

async function login(openid, event) {
  const { name, avatar } = event
  const existing = await findUser(openid)

  if (existing) {
    console.log('[users] User logged in:', openid)
    return { code: 0, data: existing }
  }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()

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
    settings: { fontSize: 'normal', enableAI: false },
    createdAt: db.serverDate()
  }

  const userRes = await db.collection('users').add({ data: userData })
  userData._id = userRes._id

  await db.collection('family_groups').doc(familyRes._id).update({
    data: { members: _.push(userRes._id) }
  })

  console.log('[users] New user registered:', openid)
  return { code: 0, data: userData }
}

async function updateProfile(openid, event) {
  const { name, avatar } = event
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }

  const updateData = {}
  if (name !== undefined) updateData.name = name
  if (avatar !== undefined) updateData.avatar = avatar

  await db.collection('users').doc(user._id).update({ data: updateData })
  return { code: 0, msg: 'Updated' }
}

async function updateSettings(openid, event) {
  const { settings } = event
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }

  const existingSettings = user.settings || {}
  const mergedSettings = { ...existingSettings, ...settings }

  await db.collection('users').doc(user._id).update({ data: { settings: mergedSettings } })
  return { code: 0, msg: 'Settings updated' }
}

async function createFamily(openid, event) {
  const { familyName } = event
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }

  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const familyRes = await db.collection('family_groups').add({
    data: { name: familyName || '我的家庭', members: [user._id], inviteCode, createdAt: db.serverDate() }
  })

  await db.collection('users').doc(user._id).update({ data: { familyGroupId: familyRes._id } })
  console.log('[users] Family created:', familyRes._id, 'by', openid)
  return { code: 0, data: { familyId: familyRes._id, inviteCode } }
}

async function joinFamily(openid, event) {
  const { inviteCode } = event
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }

  const family = await db.collection('family_groups').where({ inviteCode }).get()
  if (family.data.length === 0) return { code: -1, msg: 'Invalid invite code' }

  const familyData = family.data[0]
  if (familyData.members.includes(user._id)) return { code: -1, msg: 'Already in this family' }

  if (user.familyGroupId) {
    try {
      await db.collection('family_groups').doc(user.familyGroupId).update({ data: { members: _.pull(user._id) } })
    } catch (err) {
      console.warn('[users] Failed to remove from old family:', err.message)
    }
  }

  await db.collection('family_groups').doc(familyData._id).update({ data: { members: _.push(user._id) } })
  await db.collection('users').doc(user._id).update({ data: { familyGroupId: familyData._id } })
  console.log('[users] User joined family:', familyData._id, 'by', openid)
  return { code: 0, data: familyData }
}

async function getFamilyMembers(openid) {
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }

  const family = await db.collection('family_groups').doc(user.familyGroupId).get()
  const members = await db.collection('users').where({ _id: _.in(family.data.members) }).get()
  return { code: 0, data: members.data }
}

async function getUserInfo(openid) {
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }
  return { code: 0, data: user }
}

async function getFamilyInfo(openid) {
  const user = await findUser(openid)
  if (!user) return { code: -1, msg: 'User not found' }
  if (!user.familyGroupId) return { code: -1, msg: 'No family' }

  try {
    const family = await db.collection('family_groups').doc(user.familyGroupId).get()
    return { code: 0, data: family.data }
  } catch (err) {
    return { code: -1, msg: 'Family not found' }
  }
}
