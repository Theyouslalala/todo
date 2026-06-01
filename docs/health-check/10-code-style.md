# 10. 代码风格与规范检查

**检查日期**: 2026-06-01
**检查范围**: 项目所有 JS 文件（排除 node_modules），共检查 20+ 个文件

---

## 总体评估

项目整体代码风格**较为一致**，已形成明确的编码约定：

| 检查项 | 约定 | 一致性 |
|--------|------|--------|
| 分号 | 不使用 | ✅ 一致 |
| 比较运算符 | 使用 `===` | ✅ 一致 |
| 命名规范 | camelCase | ✅ 一致 |
| const/let | 优先 `const`，仅在需要重新赋值时使用 `let` | ✅ 一致 |
| 引号风格 | 单引号 `'` | ✅ 一致 |
| 缩进 | 2 空格 | ✅ 一致 |

---

## 发现的问题

### 问题 1: import 与 Page/Component 声明之间缺少空行

多个文件在 `require` 语句和 `Page()`/`Component()` 声明之间缺少空行，与其他文件的风格不一致。

**约定参考**: `index.js`、`calendar.js`、`todo-add.js`、`todo-detail.js` 等文件均有空行分隔。

| 文件 | 行号 | 状态 |
|------|------|------|
| `miniprogram/pages/family/family.js` | 2-3 | ✅ 已修复 |
| `miniprogram/pages/recycle-bin/recycle-bin.js` | 1-2 | ✅ 已修复 |
| `miniprogram/pages/search/search.js` | 1-2 | ✅ 已修复 |
| `miniprogram/pages/activity-log/activity-log.js` | 1-2 | ✅ 已修复 |

**修复方式**: 在 `require` 语句和 `Page({` 之间添加空行。

---

### 问题 2: 文件末尾缺少换行符

POSIX 标准要求文本文件以换行符结尾。多个文件缺少末尾换行。

| 文件 | 状态 |
|------|------|
| `miniprogram/pages/search/search.js` | ✅ 已修复 |
| `miniprogram/pages/activity-log/activity-log.js` | ✅ 已修复 |
| `miniprogram/pages/recycle-bin/recycle-bin.js` | ✅ 已修复 |
| `miniprogram/pages/family/family.js` | ✅ 已修复 |

---

### 问题 3: 未使用的 catch 参数变量

`catch` 块中捕获了异常变量但未使用，属于未使用变量问题。

| 文件 | 行号 | 问题 | 状态 |
|------|------|------|------|
| `miniprogram/pages/todo-add/todo-add.js` | 172 | `catch (e)` 中 `e` 未被使用 | ✅ 已修复 |

**修复方式**: 将 `console.log('Notification subscription skipped')` 改为 `console.log('Notification subscription skipped', e)`，使异常信息可用于调试。

---

### 问题 4: 未使用的事件参数

事件处理函数中声明了 `e` 参数但未使用。

| 文件 | 行号 | 函数 | 状态 |
|------|------|------|------|
| `miniprogram/components/todo-card/todo-card.js` | 44 | `onComplete(e)` | ✅ 已修复 |
| `miniprogram/components/todo-card/todo-card.js` | 48 | `onDelete(e)` | ✅ 已修复 |

**修复方式**: 移除未使用的 `e` 参数，改为 `onComplete()` 和 `onDelete()`。

---

### 问题 5: 代码密度不一致

部分文件采用极简的单行写法，与其他文件的多行风格不一致。

| 文件 | 示例 |
|------|------|
| `miniprogram/pages/family/family.js` | `if (res && res.code === 0) { wx.showToast({...}); this.loadData() }` |
| `miniprogram/pages/recycle-bin/recycle-bin.js` | `if (res && res.code === 0) { wx.showToast({...}); this.loadDeleted() }` |
| `miniprogram/pages/search/search.js` | `onInput(e) { this.setData({ keyword: e.detail.value }) }` |
| `miniprogram/pages/activity-log/activity-log.js` | 多个逻辑压缩在单行 |

**对比**: `index.js`、`calendar.js`、`todo-add.js` 等文件采用更清晰的多行格式。

**建议**: 对于包含多个语句的逻辑块（如 if 分支内有 showToast + 方法调用），应拆分为多行以提高可读性。单行 getter/setter 可以保持单行。

**严重程度**: 低（可读性问题，非功能问题）

---

### 问题 6: 变量声明位置不一致

| 文件 | 行号 | 问题 |
|------|------|------|
| `cloudfunctions/users/index.js` | 1-4 | `cloud.init()` 在 `const db` 之前调用，但 `cloud` 的初始化和 `db` 的声明紧挨着，无空行分隔逻辑块 |
| `cloudfunctions/todos/index.js` | 1-4 | 同上 |
| `cloudfunctions/activity-logs/index.js` | 1-4 | 同上 |
| `cloudfunctions/notifications/index.js` | 1-4 | 同上 |

**说明**: 这是云函数的通用模板结构，属于框架约定，不影响功能。

---

## 完整文件风格概览

| 文件 | 分号 | === | camelCase | const/let | 引号 | 缩进 | 问题数 |
|------|------|-----|-----------|-----------|------|------|--------|
| `app.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `config.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `utils/api.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `utils/cache.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `utils/image.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `utils/lunar.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `utils/notification.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/index/index.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/calendar/calendar.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/todo-add/todo-add.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 1 (已修复) |
| `pages/todo-detail/todo-detail.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/family/family.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 (已修复) |
| `pages/settings/settings.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/search/search.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 (已修复) |
| `pages/recycle-bin/recycle-bin.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 (已修复) |
| `pages/mine/mine.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `pages/activity-log/activity-log.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 (已修复) |
| `components/todo-card/todo-card.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 2 (已修复) |
| `components/category-filter/category-filter.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `components/quick-add/quick-add.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `cloudfunctions/todos/index.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `cloudfunctions/users/index.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `cloudfunctions/activity-logs/index.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |
| `cloudfunctions/notifications/index.js` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 0 |

---

## 修复汇总

共修复 **11 处**代码风格问题：

| # | 文件 | 修复内容 |
|---|------|----------|
| 1 | `pages/family/family.js` | 添加 import 与 Page 之间的空行 |
| 2 | `pages/recycle-bin/recycle-bin.js` | 添加 import 与 Page 之间的空行 |
| 3 | `pages/search/search.js` | 添加 import 与 Page 之间的空行 |
| 4 | `pages/activity-log/activity-log.js` | 添加 import 与 Page 之间的空行 |
| 5 | `pages/todo-add/todo-add.js` | catch 块中使用异常变量 `e` |
| 6 | `components/todo-card/todo-card.js` | 移除 `onComplete` 中未使用的 `e` 参数 |
| 7 | `components/todo-card/todo-card.js` | 移除 `onDelete` 中未使用的 `e` 参数 |
| 8 | `pages/search/search.js` | 添加文件末尾换行符 |
| 9 | `pages/activity-log/activity-log.js` | 添加文件末尾换行符 |
| 10 | `pages/recycle-bin/recycle-bin.js` | 添加文件末尾换行符 |
| 11 | `pages/family/family.js` | 添加文件末尾换行符 |

---

## 建议（未修复，需人工判断）

1. **代码密度统一**: `search.js`、`recycle-bin.js`、`activity-log.js`、`family.js` 中多个逻辑压缩在单行，建议拆分为多行以提高可读性。
2. **添加 ESLint 配置**: 项目当前无 lint 工具，建议添加 `.eslintrc.js` 自动化代码风格检查。
3. **添加 Prettier 配置**: 统一自动格式化，避免手动维护风格一致性。
