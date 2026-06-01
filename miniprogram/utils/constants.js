// Shared constants across the mini-program

const CATEGORY_MAP = {
  daily: '日常',
  shopping: '购物',
  family: '家庭',
  bill: '账单',
  other: '其他'
}

const REPEAT_MAP = {
  none: '不重复',
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  lunar_yearly: '农历每年'
}

const COLOR_MAP = {
  red: '#ff4d4f',
  blue: '#4A90D9',
  green: '#52c41a',
  yellow: '#faad14'
}

const ROLE_MAP = {
  child: '孩子',
  father: '爸爸',
  mother: '妈妈'
}

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

module.exports = {
  CATEGORY_MAP,
  REPEAT_MAP,
  COLOR_MAP,
  ROLE_MAP,
  CATEGORIES,
  COLORS,
  REPEAT_OPTIONS,
  NOTIFY_OPTIONS
}
