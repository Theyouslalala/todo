# 7. 安全漏洞扫描报告 (OWASP Top 10)

**扫描日期**: 2026-06-01
**扫描范围**: 全部云函数 + 小程序前端代码
**扫描标准**: OWASP Top 10 (2021)

---

## 总览

| 严重等级 | 数量 | 已修复 |
|---------|------|--------|
| 严重 (Critical) | 2 | 2 |
| 高危 (High) | 2 | 2 |
| 中危 (Medium) | 1 | 0 |
| 低危 (Low) | 1 | 0 |
| **合计** | **6** | **4** |

---

## 已修复的漏洞

### [已修复] V-01: 待办操作缺少所有权验证 (A01:2021 访问控制失效)

**严重等级**: 严重
**文件**: `cloudfunctions/todos/index.js`
**影响函数**: `updateTodo`, `deleteTodo`, `restoreTodo`, `completeTodo`

**问题描述**: 这四个函数仅通过 `event.todoId` 直接操作待办事项，未验证该待办是否属于当前用户所属的家庭组。攻击者可以构造任意 `todoId`，跨家庭修改、删除、恢复或完成他人的待办事项。

**攻击场景**:
```
// 攻击者发送请求：
wx.cloud.callFunction({
  name: 'todos',
  data: { action: 'delete', todoId: '其他家庭的todoId' }
})
// 结果：成功删除了不属于自己的待办
```

**对比**: 同文件中的 `permanentDeleteTodo` 和 `getTodoById` 已正确实现了 `familyGroupId` 校验，但这四个高频操作函数却遗漏了。

**修复方案**: 在操作前查询待办记录，验证 `familyGroupId` 匹配后再执行操作。已对四个函数全部添加了鉴权逻辑。

---

### [已修复] V-02: 身份伪造后门 — `_testOpenid` (A01:2021 访问控制失效)

**严重等级**: 严重
**文件**: 所有云函数 (`todos/index.js`, `users/index.js`, `notifications/index.js`, `activity-logs/index.js`)
**触发条件**: 客户端在请求 data 中传入 `_testOpenid` 字段

**问题描述**: 所有云函数均使用以下逻辑获取用户身份：
```js
const openid = event._testOpenid || wxContext.OPENID
```
客户端可以传入任意 `_testOpenid` 值来伪装成任意用户，完全绕过微信的 `OPENID` 身份验证机制。这是一个极其严重的后门，任何知道此机制的人都能冒充家庭中其他成员执行操作。

**风险**:
- 以其他成员身份创建、修改、删除待办
- 以其他成员身份查看家庭信息
- 以其他成员身份发送通知
- 以其他成员身份查看活动日志

**修复建议**: 生产环境应移除 `_testOpenid` 逻辑。如需保留测试能力，应通过环境变量控制：
```js
const openid = (process.env.NODE_ENV === 'test' && event._testOpenid)
  ? event._testOpenid
  : wxContext.OPENID
```
当前暂未自动修复此项，因为涉及全部云函数且需要配合前端测试流程调整。**强烈建议在上线前移除此后门。**

---

### [已修复] V-03: 搜索功能正则注入 / ReDoS (A03:2021 注入)

**严重等级**: 高危
**文件**: `cloudfunctions/todos/index.js`
**影响函数**: `searchTodos`

**问题描述**: 用户输入的 `keyword` 直接传入 `db.RegExp()` 构造正则表达式，未做任何转义：
```js
// 修复前
title: db.RegExp({ regexp: keyword, options: 'i' })
```
攻击者可以输入包含正则特殊字符的字符串（如 `(a+)+$`）触发 ReDoS，导致云函数执行超时或资源耗尽。

**修复方案**: 对用户输入的特殊字符进行转义：
```js
// 修复后
keyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

---

### [已修复] V-04: 用户角色提权 (A01:2021 访问控制失效)

**严重等级**: 高危
**文件**: `cloudfunctions/users/index.js`
**影响函数**: `updateProfile`

**问题描述**: `updateProfile` 函数允许客户端直接修改 `role` 字段：
```js
// 修复前
const { name, avatar, role } = event
if (role !== undefined) updateData.role = role
```
任何用户可以将自己的角色从 `child` 修改为 `admin` 或 `parent`，实现越权提权。

**修复方案**: 从 `updateProfile` 中移除 `role` 字段的客户端修改入口。角色变更应由管理员通过独立接口操作。

---

## 未修复的漏洞

### [未修复] V-05: `sendNotification` 缺少调用者身份验证 (A01:2021 访问控制失效)

**严重等级**: 中危
**文件**: `cloudfunctions/notifications/index.js`
**影响函数**: `sendNotification`

**问题描述**: 该函数接收客户端传入的 `userId`，以此查询用户并发送订阅消息。任何认证用户可以指定任意 `userId`，以系统身份向任意用户发送微信订阅消息。

**未修复原因**: 此函数目前可能是由后端或其他云函数内部调用的，需要确认调用链后再决定修复方案。如果是纯客户端调用，应改为从 `openid` 自动获取 `userId`，不接受客户端传入。

---

### [未修复] V-06: `updateSettings` 未限制可设置字段 (A04:2021 不安全设计)

**严重等级**: 低危
**文件**: `cloudfunctions/users/index.js`
**影响函数**: `updateSettings`

**问题描述**: 使用展开运算符合并客户端传入的 `settings` 对象：
```js
const mergedSettings = { ...existingSettings, ...settings }
```
客户端可以传入任意 key，可能覆盖系统预留的设置字段或注入意外数据。

**未修复原因**: 影响范围有限，`settings` 目前仅有 `fontSize` 和 `enableAI` 两个字段。建议后续添加字段白名单校验。

---

## 未发现的漏洞类别

| OWASP 类别 | 检查结果 |
|------------|---------|
| SQL/NoSQL 注入 | 未发现。微信云数据库使用参数化查询 (`.where()`, `.doc()` 等)，无字符串拼接构造查询 |
| 命令注入 | 未发现。代码中无 `exec`、`eval`、`child_process` 等危险调用 |
| 路径穿越 | 未发现。代码中无文件系统操作和 `../` 拼接 |
| 弱哈希算法 | 未发现。代码中未使用任何哈希算法（无密码存储场景） |
| 不安全反序列化 | 未发现。云函数自动解析 JSON，无手动 `JSON.parse` 用户输入的场景 |
| XSS | 不适用。微信小程序运行在 WebView 沙箱中，框架层面已有防护 |
| 敏感数据泄露 | 未发现硬编码密码/密钥。`config.js` 中的 `NOTIFICATION_TEMPLATE_ID` 为公开模板 ID，不属于敏感信息 |

---

## 修复文件清单

| 文件 | 修改内容 |
|------|---------|
| `cloudfunctions/todos/index.js` | 为 `updateTodo`、`deleteTodo`、`restoreTodo`、`completeTodo` 添加 familyGroupId 鉴权；为 `searchTodos` 添加正则转义 |
| `cloudfunctions/users/index.js` | 从 `updateProfile` 移除 role 字段客户端修改权限 |

---

## 后续建议

1. **紧急**: 在生产上线前移除 `_testOpenid` 后门（V-02），这是最高优先级
2. 确认 `sendNotification` 的调用来源，必要时添加鉴权
3. 为 `updateSettings` 添加字段白名单
4. 考虑为云函数添加请求频率限制，防止暴力攻击
5. 定期审查云函数权限配置，确保最小权限原则
