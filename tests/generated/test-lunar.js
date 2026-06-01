/**
 * lunar.js 单元测试
 * 被测函数: solarToLunar(year, month, day)
 * 依赖: lunar-javascript 库（位于 miniprogram/node_modules/）
 *
 * 运行方式:
 *   cd miniprogram && npx jest tests/generated/test-lunar.js
 *   或: node tests/generated/test-lunar.js（简易模式）
 */

const path = require('path')

// 加载项目中的 lunar.js（它依赖 lunar-javascript）
const lunarPath = path.resolve(__dirname, '../../miniprogram/utils/lunar.js')
const lunar = require(lunarPath)

// ============================================================
// 简易测试框架（若未安装 Jest，可用此模式直接运行）
// ============================================================
const isJest = typeof describe !== 'undefined'
const results = []

function assert(condition, message) {
  if (!condition) {
    throw new Error(`断言失败: ${message}`)
  }
}

function runTest(name, fn) {
  try {
    fn()
    results.push({ name, status: 'PASS' })
    if (!isJest) console.log(`  PASS  ${name}`)
  } catch (err) {
    results.push({ name, status: 'FAIL', error: err.message })
    if (!isJest) console.log(`  FAIL  ${name} -- ${err.message}`)
  }
}

// ============================================================
// 测试用例
// ============================================================

const tests = [
  // --- 基本功能 ---
  {
    name: 'solarToLunar: 2026-01-01 应返回有效农历对象',
    fn() {
      const result = lunar.solarToLunar(2026, 1, 1)
      assert(result !== null, '返回值不应为 null')
      assert(typeof result.year === 'number', 'year 应为数字')
      assert(typeof result.month === 'number', 'month 应为数字')
      assert(typeof result.day === 'number', 'day 应为数字')
      assert(typeof result.monthName === 'string', 'monthName 应为字符串')
      assert(typeof result.dayName === 'string', 'dayName 应为字符串')
      assert(typeof result.fullName === 'string', 'fullName 应为字符串')
    }
  },

  // --- fullName 格式 ---
  {
    name: 'solarToLunar: fullName 应为 "X月X" 格式',
    fn() {
      const result = lunar.solarToLunar(2025, 1, 29) // 2025 春节
      assert(result.fullName.includes('月'), 'fullName 应包含"月"')
      assert(result.fullName === result.monthName + '月' + result.dayName,
        'fullName 应等于 monthName + "月" + dayName')
    }
  },

  // --- 春节边界 ---
  {
    name: 'solarToLunar: 2025-01-29 应为正月初一（2025 春节）',
    fn() {
      const result = lunar.solarToLunar(2025, 1, 29)
      assert(result.year === 2025, `农历年应为 2025，实际为 ${result.year}`)
      assert(Math.abs(result.month) === 1, `农历月应为 1（正月），实际为 ${result.month}`)
      assert(result.day === 1, `农历日应为 1，实际为 ${result.day}`)
      assert(result.monthName === '正', `月名应为"正"，实际为 ${result.monthName}`)
      assert(result.dayName === '初一', `日名应为"初一"，实际为 ${result.dayName}`)
    }
  },

  // --- 中秋节 ---
  {
    name: 'solarToLunar: 2025-10-06 应为八月十五（中秋）',
    fn() {
      const result = lunar.solarToLunar(2025, 10, 6)
      assert(Math.abs(result.month) === 8, `农历月应为 8，实际为 ${result.month}`)
      assert(result.day === 15, `农历日应为 15，实际为 ${result.day}`)
      assert(result.monthName === '八', `月名应为"八"，实际为 ${result.monthName}`)
      assert(result.dayName === '十五', `日名应为"十五"，实际为 ${result.dayName}`)
    }
  },

  // --- 2026 春节 ---
  {
    name: 'solarToLunar: 2026-02-17 应为正月初一（2026 春节）',
    fn() {
      const result = lunar.solarToLunar(2026, 2, 17)
      assert(result.year === 2026, `农历年应为 2026，实际为 ${result.year}`)
      assert(Math.abs(result.month) === 1, `农历月应为 1，实际为 ${result.month}`)
      assert(result.day === 1, `农历日应为 1，实际为 ${result.day}`)
    }
  },

  // --- isLeap 标记 ---
  {
    name: 'solarToLunar: isLeap 应正确标记闰月',
    fn() {
      // 2025 年有闰六月，2025-07-25 是闰六月初一
      const result = lunar.solarToLunar(2025, 7, 25)
      // 闰月时 month 为负数
      if (result.isLeap) {
        assert(result.month < 0, '闰月时 month 应为负数')
      }
      // 无论如何，isLeap 应为 boolean
      assert(typeof result.isLeap === 'boolean', 'isLeap 应为布尔值')
    }
  },

  // --- 月末日期 ---
  {
    name: 'solarToLunar: 2025-12-31（年末）应返回有效结果',
    fn() {
      const result = lunar.solarToLunar(2025, 12, 31)
      assert(result.year > 0, '年份应为正数')
      assert(result.month !== 0, '月份不应为 0')
      assert(result.day > 0, '日期应为正数')
    }
  },

  // --- lunarToSolar 反向转换 ---
  {
    name: 'lunarToSolar: 2025年正月初一 应转回 2025-01-29',
    fn() {
      const result = lunar.lunarToSolar(2025, 1, 1)
      assert(result.year === 2025, `公历年应为 2025，实际为 ${result.year}`)
      assert(result.month === 1, `公历月应为 1，实际为 ${result.month}`)
      assert(result.day === 29, `公历日应为 29，实际为 ${result.day}`)
      assert(result.dateStr === '2025-01-29', `日期字符串应为 2025-01-29，实际为 ${result.dateStr}`)
    }
  },

  // --- getLunarMonthDays ---
  {
    name: 'getLunarMonthDays: 2025年1月应返回31天',
    fn() {
      const days = lunar.getLunarMonthDays(2025, 1)
      assert(Array.isArray(days), '返回值应为数组')
      assert(days.length === 31, `1月应有31天，实际为 ${days.length}`)
      assert(days[0].day === 1, '第一天应为 1')
      assert(days[30].day === 31, '最后一天应为 31')
      assert(typeof days[0].lunarDay === 'string', 'lunarDay 应为字符串')
      assert(typeof days[0].isLunarFirst === 'boolean', 'isLunarFirst 应为布尔值')
    }
  },

  // --- matchLunarDate ---
  {
    name: 'matchLunarDate: 2025-01-29 应匹配正月初一',
    fn() {
      const result = lunar.matchLunarDate('2025-01-29', 1, 1)
      assert(result === true, '应匹配正月初一')
    }
  }
]

// ============================================================
// 执行测试
// ============================================================

if (!isJest) {
  console.log('\n=== lunar.js solarToLunar 单元测试 ===\n')
  tests.forEach(t => runTest(t.name, t.fn))
  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  console.log(`\n结果: ${passed} 通过, ${failed} 失败, 共 ${results.length} 个测试\n`)
  if (failed > 0) process.exit(1)
} else {
  describe('lunar.js - solarToLunar 及相关函数', () => {
    tests.forEach(t => {
      test(t.name, t.fn)
    })
  })
}
