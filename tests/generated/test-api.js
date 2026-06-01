/**
 * api.js 单元测试
 * 被测函数: api.call(name, data) - 统一云函数调用方法
 * 需要 mock: wx.cloud.callFunction, wx.showToast, getApp()
 *
 * 运行方式:
 *   node tests/generated/test-api.js（简易模式）
 *   npx jest tests/generated/test-api.js（Jest 模式）
 */

// ============================================================
// 简易 mock 工厂
// ============================================================
function createMock(returnValue) {
  const fn = function (...args) {
    fn.calls.push(args)
    if (fn._rejects) return Promise.reject(fn._rejects)
    return Promise.resolve(returnValue)
  }
  fn.calls = []
  fn._rejects = null
  return fn
}

function assert(condition, message) {
  if (!condition) throw new Error(`断言失败: ${message}`)
}

// ============================================================
// 设置全局 mock（必须在 require 之前）
// ============================================================
const mockCallFunction = createMock({ result: { code: 0, data: { id: 1 } } })
const mockShowToast = createMock(null)

global.wx = {
  cloud: { callFunction: mockCallFunction },
  showToast: mockShowToast
}

const mockAppData = { testMode: false, testOpenid: '' }
global.getApp = () => ({ globalData: mockAppData })

// 清除缓存并加载被测模块
delete require.cache[require.resolve('../../miniprogram/utils/api')]
const api = require('../../miniprogram/utils/api')

// ============================================================
// 测试用例
// ============================================================
const tests = [
  {
    name: 'call: 成功调用应返回 result 对象',
    async fn() {
      mockCallFunction.calls = []
      mockCallFunction._rejects = null
      // 替换为成功响应
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: { id: 'todo123' } }
      })

      const result = await api.call('todos', { action: 'getToday' })
      assert(result !== null, '成功时不应返回 null')
      assert(result.code === 0, `code 应为 0，实际为 ${result.code}`)
      assert(result.data.id === 'todo123', 'data 应包含返回数据')
    }
  },

  {
    name: 'call: 云函数返回 code=-1 时应返回 null',
    async fn() {
      global.wx.cloud.callFunction = createMock({
        result: { code: -1, msg: '用户不存在' }
      })
      global.wx.showToast = createMock(null)

      const result = await api.call('users', { action: 'getUserInfo' })
      assert(result === null, 'code=-1 时应返回 null')
    }
  },

  {
    name: 'call: 网络异常时应捕获错误并返回 null',
    async fn() {
      const failingMock = createMock(null)
      failingMock._rejects = new Error('Network timeout')
      global.wx.cloud.callFunction = failingMock
      global.wx.showToast = createMock(null)

      const result = await api.call('todos', { action: 'getAll' })
      assert(result === null, '网络错误时应返回 null')
    }
  },

  {
    name: 'call: 测试模式下应注入 _testOpenid',
    async fn() {
      mockAppData.testMode = true
      mockAppData.testOpenid = 'test_openid_123'
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: {} }
      })

      await api.call('users', { action: 'login', name: '测试' })

      const calledData = global.wx.cloud.callFunction.calls[0][0].data
      assert(calledData._testOpenid === 'test_openid_123',
        `应注入 _testOpenid，实际为 ${calledData._testOpenid}`)

      // 恢复
      mockAppData.testMode = false
      mockAppData.testOpenid = ''
    }
  },

  {
    name: 'call: 非测试模式不应注入 _testOpenid',
    async fn() {
      mockAppData.testMode = false
      mockAppData.testOpenid = ''
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: {} }
      })

      await api.call('todos', { action: 'getAll' })

      const calledData = global.wx.cloud.callFunction.calls[0][0].data
      assert(calledData._testOpenid === undefined,
        '非测试模式不应注入 _testOpenid')
    }
  },

  {
    name: 'call: 应正确传递函数名和参数',
    async fn() {
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: {} }
      })

      await api.call('todos', { action: 'create', title: '买菜', priority: 'high' })

      const callArgs = global.wx.cloud.callFunction.calls[0][0]
      assert(callArgs.name === 'todos', `函数名应为 todos，实际为 ${callArgs.name}`)
      assert(callArgs.data.action === 'create', 'action 应为 create')
      assert(callArgs.data.title === '买菜', 'title 应为 买菜')
    }
  },

  {
    name: 'todos.create: 应调用 call 并传入正确 action',
    async fn() {
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: { _id: 'new123' } }
      })

      const result = await api.todos.create({ title: '测试待办' })
      const callArgs = global.wx.cloud.callFunction.calls[0][0]
      assert(callArgs.name === 'todos', '应调用 todos 云函数')
      assert(callArgs.data.action === 'create', 'action 应为 create')
      assert(callArgs.data.title === '测试待办', 'title 应正确传递')
    }
  },

  {
    name: 'users.joinFamily: 应正确传递 inviteCode',
    async fn() {
      global.wx.cloud.callFunction = createMock({
        result: { code: 0, data: {} }
      })

      await api.users.joinFamily('ABC123')
      const callArgs = global.wx.cloud.callFunction.calls[0][0]
      assert(callArgs.name === 'users', '应调用 users 云函数')
      assert(callArgs.data.action === 'joinFamily', 'action 应为 joinFamily')
      assert(callArgs.data.inviteCode === 'ABC123', 'inviteCode 应为 ABC123')
    }
  }
]

// ============================================================
// 执行测试
// ============================================================
console.log('\n=== api.js call() 单元测试 ===\n')

async function runAll() {
  const results = []
  for (const t of tests) {
    try {
      await t.fn()
      results.push({ name: t.name, status: 'PASS' })
      console.log(`  PASS  ${t.name}`)
    } catch (err) {
      results.push({ name: t.name, status: 'FAIL', error: err.message })
      console.log(`  FAIL  ${t.name} -- ${err.message}`)
    }
  }
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`\n结果: ${passed} 通过, ${failed} 失败, 共 ${results.length} 个测试\n`)
  if (failed > 0) process.exit(1)
}

runAll()
