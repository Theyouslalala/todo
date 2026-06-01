const { Lunar, Solar } = require('lunar-javascript')

const lunar = {
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
    const days = []
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const lunarInfo = this.solarToLunar(year, month, d)
      days.push({
        day: d,
        lunarDay: lunarInfo.dayName,
        lunarMonth: lunarInfo.monthName,
        isLunarFirst: lunarInfo.day === 1
      })
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
