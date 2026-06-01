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

  const user = await db.collection('users').doc(userId).get()
  if (!user.data) return { code: -1, msg: 'User not found' }

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
  const { templateId, count } = event
  return await updateSubscription(openid, { templateId, count })
}
