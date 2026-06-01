const { Lunar, Solar } = require('lunar-javascript')

const lunar = {
  _monthCache: new Map(),

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

  getLunarMonthDays(year, month) {
    const key = `${year}-${month}`
    if (this._monthCache.has(key)) return this._monthCache.get(key)

    const days = []
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = this.solarToLunar(year, month, d)
      days.push({
        day: d,
        lunarDay: lunarInfo.day === 1 ? lunarInfo.monthName + '月' : lunarInfo.dayName,
        lunarMonth: lunarInfo.monthName,
        isLunarFirst: lunarInfo.day === 1
      })
    }
    this._monthCache.set(key, days)
    // Keep cache size reasonable
    if (this._monthCache.size > 24) {
      const firstKey = this._monthCache.keys().next().value
      this._monthCache.delete(firstKey)
    }
    return days
  },

  matchLunarDate(solarDateStr, lunarMonth, lunarDay) {
    const [year, month, day] = solarDateStr.split('-').map(Number)
    const lunarInfo = this.solarToLunar(year, month, day)
    return Math.abs(lunarInfo.month) === lunarMonth && lunarInfo.day === lunarDay
  },

  fromDateStr(dateStr) {
    const parts = dateStr.split('-').map(Number)
    return this.solarToLunar(parts[0], parts[1], parts[2])
  }
}

module.exports = lunar
