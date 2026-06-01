// Shared constants across the mini-program

const CATEGORIES = [
  { label: '日常', value: 'daily' },
  { label: '购物', value: 'shopping' },
  { label: '家庭', value: 'family' },
  { label: '账单', value: 'bill' },
  { label: '其他', value: 'other' }
]

const COLORS = [
  { label: '红', value: 'red', hex: '#ff4d4f' },
  { label: '蓝', value: 'blue', hex: '#4A90D9' },
  { label: '绿', value: 'green', hex: '#52c41a' },
  { label: '黄', value: 'yellow', hex: '#faad14' }
]

const REPEAT_OPTIONS = [
  { label: '不重复', value: 'none' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '农历每年', value: 'lunar_yearly' }
]

const NOTIFY_OPTIONS = [
  { label: '准时', value: 0 },
  { label: '5分钟前', value: 5 },
  { label: '15分钟前', value: 15 },
  { label: '30分钟前', value: 30 },
  { label: '1小时前', value: 60 }
]

// Derived maps (single source of truth)
const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map(c => [c.value, c.label]))
const COLOR_MAP = Object.fromEntries(COLORS.map(c => [c.value, c.hex]))
const REPEAT_MAP = Object.fromEntries(REPEAT_OPTIONS.map(r => [r.value, r.label]))
const ROLE_MAP = { child: '孩子', father: '爸爸', mother: '妈妈' }

module.exports = {
  CATEGORY_MAP, REPEAT_MAP, COLOR_MAP, ROLE_MAP,
  CATEGORIES, COLORS, REPEAT_OPTIONS, NOTIFY_OPTIONS
}
