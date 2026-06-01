const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = event._testOpenid || wxContext.OPENID
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
