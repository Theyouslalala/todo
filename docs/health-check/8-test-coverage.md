# 8 - 自动化测试覆盖率评估

## 概述

本项目（家庭提醒事项微信小程序）**完全没有自定义测试**。项目中不存在任何针对业务代码的单元测试、集成测试或端到端测试。

---

## 1. 测试文件统计

| 类别 | 数量 |
|------|------|
| 项目自定义测试文件 | **0** |
| 第三方库测试文件（node_modules） | 23（lunar-javascript 库自带） |
| 项目源代码文件（JS） | **24** |
| 测试覆盖率 | **0%** |

### 项目源代码文件清单

#### 工具模块（utils/）- 5 个文件
| 文件 | 用途 | 测试状态 |
|------|------|----------|
| `miniprogram/utils/api.js` | 云函数调用封装 | 未测试 |
| `miniprogram/utils/lunar.js` | 农历/公历转换 | 未测试 |
| `miniprogram/utils/cache.js` | 本地缓存管理 | 未测试 |
| `miniprogram/utils/image.js` | 图片压缩与上传 | 未测试 |
| `miniprogram/utils/notification.js` | 订阅消息管理 | 未测试 |

#### 云函数（cloudfunctions/）- 4 个文件
| 文件 | 用途 | 测试状态 |
|------|------|----------|
| `cloudfunctions/users/index.js` | 用户与家庭管理 | 未测试 |
| `cloudfunctions/todos/index.js` | 待办事项 CRUD | 未测试 |
| `cloudfunctions/notifications/index.js` | 通知订阅管理 | 未测试 |
| `cloudfunctions/activity-logs/index.js` | 活动日志查询 | 未测试 |

#### 页面（pages/）- 10 个文件
| 文件 | 用途 | 测试状态 |
|------|------|----------|
| `miniprogram/pages/index/index.js` | 首页 | 未测试 |
| `miniprogram/pages/calendar/calendar.js` | 日历页 | 未测试 |
| `miniprogram/pages/family/family.js` | 家庭管理页 | 未测试 |
| `miniprogram/pages/mine/mine.js` | 个人中心页 | 未测试 |
| `miniprogram/pages/settings/settings.js` | 设置页 | 未测试 |
| `miniprogram/pages/todo-add/todo-add.js` | 新增待办页 | 未测试 |
| `miniprogram/pages/todo-detail/todo-detail.js` | 待办详情页 | 未测试 |
| `miniprogram/pages/search/search.js` | 搜索页 | 未测试 |
| `miniprogram/pages/activity-log/activity-log.js` | 活动日志页 | 未测试 |
| `miniprogram/pages/recycle-bin/recycle-bin.js` | 回收站页 | 未测试 |

#### 组件（components/）- 3 个文件
| 文件 | 用途 | 测试状态 |
|------|------|----------|
| `miniprogram/components/category-filter/category-filter.js` | 分类筛选器 | 未测试 |
| `miniprogram/components/quick-add/quick-add.js` | 快速新增组件 | 未测试 |
| `miniprogram/components/todo-card/todo-card.js` | 待办卡片组件 | 未测试 |

#### 入口与配置 - 2 个文件
| 文件 | 用途 | 测试状态 |
|------|------|----------|
| `miniprogram/app.js` | 小程序入口 | 未测试 |
| `miniprogram/config.js` | 配置常量 | 未测试 |

---

## 2. 核心模块零覆盖分析

以下为核心业务模块，全部 **零测试覆盖**：

### 严重度：高

1. **`miniprogram/utils/lunar.js`** - 农历转换引擎
   - `solarToLunar()` - 公历转农历，日历页核心依赖
   - `lunarToSolar()` - 农历转公历
   - `getLunarMonthDays()` - 获取月份每日农历信息
   - `matchLunarDate()` - 匹配农历日期
   - **风险**：算法密集型代码，边界条件（闰月、年末）极易出错，完全无验证

2. **`miniprogram/utils/api.js`** - API 调用层
   - `call()` - 统一云函数调用，含错误处理和测试模式
   - `todos.*` / `users.*` / `notifications.*` / `activityLogs.*` - 所有 API 快捷方法
   - **风险**：所有前端-后端通信的唯一入口，错误处理逻辑未验证

3. **`cloudfunctions/todos/index.js`** - 待办核心逻辑
   - `getUserAndFamily()` - 用户与家庭信息获取，所有操作的前置依赖
   - `createTodo()` / `updateTodo()` / `deleteTodo()` - CRUD 核心
   - `completeTodo()` / `restoreTodo()` - 状态管理
   - `searchTodos()` - 搜索功能（正则注入风险）
   - `permanentDeleteTodo()` - 永久删除（数据丢失风险）
   - **风险**：业务逻辑最集中的文件，权限校验缺失

### 严重度：中

4. **`cloudfunctions/users/index.js`** - 用户管理
   - `login()` - 登录与自动注册
   - `createFamily()` / `joinFamily()` - 家庭创建与加入
   - `getFamilyMembers()` - 获取家庭成员
   - **风险**：家庭成员关系管理复杂，缺少边界条件测试

5. **`miniprogram/utils/cache.js`** - 缓存管理
   - `set()` / `get()` / `remove()` / `clear()` - 缓存 CRUD
   - **风险**：过期判断逻辑、存储异常处理未验证

6. **`cloudfunctions/notifications/index.js`** - 通知管理
   - `sendNotification()` - 发送订阅消息
   - `updateSubscription()` / `getSubscriptionCount()` - 订阅计数
   - **风险**：剩余次数扣减逻辑（并发安全）未验证

### 严重度：低

7. **`miniprogram/utils/image.js`** - 图片处理
   - `compress()` / `upload()` / `chooseAndUpload()`
   - **风险**：上传失败回退逻辑未验证

8. **`miniprogram/utils/notification.js`** - 前端通知封装
   - `requestSubscribe()` / `checkSubscription()` / `promptIfNeeded()`
   - **风险**：订阅状态判断逻辑未验证

---

## 3. 未覆盖的核心函数清单

| 模块 | 函数 | 重要性 | 测试难点 |
|------|------|--------|----------|
| lunar.js | `solarToLunar(year, month, day)` | 高 | 依赖 lunar-javascript 库 |
| lunar.js | `lunarToSolar(year, month, day, isLeap)` | 高 | 闰月参数处理 |
| lunar.js | `getLunarMonthDays(year, month)` | 中 | 循环调用依赖 |
| lunar.js | `matchLunarDate(solarDateStr, lunarMonth, lunarDay)` | 中 | 字符串解析 |
| api.js | `call(name, data)` | 高 | 依赖 wx 全局对象 |
| api.js | `todos.create(data)` | 中 | 委托给 call() |
| todos/index.js | `getUserAndFamily(openid)` | 高 | 依赖云数据库 |
| todos/index.js | `createTodo(openid, event)` | 高 | 复杂参数处理 |
| todos/index.js | `completeTodo(openid, event)` | 中 | 状态变更逻辑 |
| todos/index.js | `searchTodos(openid, event)` | 中 | 正则安全 |
| todos/index.js | `permanentDeleteTodo(openid, event)` | 高 | 权限校验 |
| users/index.js | `login(openid, event)` | 高 | 新用户注册流程 |
| users/index.js | `joinFamily(openid, event)` | 中 | 家庭切换逻辑 |
| users/index.js | `createFamily(openid, event)` | 中 | 邀请码生成 |
| notifications/index.js | `sendNotification(event)` | 中 | 订阅次数校验 |
| cache.js | `get(key)` | 中 | 过期判断 |
| cache.js | `set(key, data)` | 低 | 异常处理 |
| notification.js | `promptIfNeeded(templateId, threshold)` | 低 | 条件判断 |
| image.js | `upload(filePath)` | 低 | 异步错误处理 |

---

## 4. 生成的单元测试

针对三个最重要的未覆盖函数，已生成测试文件：

| 测试文件 | 被测函数 | 测试用例数 |
|----------|----------|------------|
| `tests/generated/test-lunar.js` | `lunar.solarToLunar()` | 10 |
| `tests/generated/test-api.js` | `api.call()` | 8 |
| `tests/generated/test-users-getUserAndFamily.js` | `getUserAndFamily()` | 5 |

详见 `tests/generated/` 目录。

---

## 5. 建议

### 短期（立即可做）
- **为 lunar.js 添加测试**：纯逻辑函数，无外部依赖（除 lunar-javascript 库），最容易测试
- **为 cache.js 添加测试**：只需 mock wx.setStorageSync 等方法

### 中期
- **建立测试框架**：推荐 Jest + miniprogram-simulate，配置 jest.config.js
- **为 api.js 的 call() 添加测试**：需 mock wx.cloud.callFunction 和 getApp()
- **为云函数添加测试**：需 mock wx-server-sdk，测试各 action 分支

### 长期
- **CI/CD 集成**：在提交前自动运行测试
- **覆盖率目标**：核心工具模块（utils/）达到 80%+，云函数达到 60%+
- **E2E 测试**：使用 miniprogram-automator 模拟用户操作
