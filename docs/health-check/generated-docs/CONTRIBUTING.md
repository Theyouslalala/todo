# 贡献指南

感谢你对家庭提醒小程序的关注！本文档将帮助你了解如何参与项目开发。

## 目录

- [环境准备](#环境准备)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [提交 Issue](#提交-issue)
- [提交 Pull Request](#提交-pull-request)

---

## 环境准备

### 必需工具

- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- [Node.js](https://nodejs.org/) 16+
- [Git](https://git-scm.com/)

### 可选工具（AI 服务开发）

- [Anaconda](https://www.anaconda.com/) 或 Miniconda
- Python 3.10+

### 初始化步骤

```bash
# 1. Fork 并克隆项目
git clone https://github.com/YOUR_USERNAME/family-reminder.git
cd family-reminder

# 2. 安装云函数依赖
cd cloudfunctions/todos && npm install && cd ../..
cd cloudfunctions/users && npm install && cd ../..
cd cloudfunctions/notifications && npm install && cd ../..
cd cloudfunctions/activity-logs && npm install && cd ../..

# 3. （可选）安装 AI 服务依赖
cd ai-service
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
pip install -r requirements.txt
cd ..
```

---

## 开发流程

1. 从 `main` 分支创建特性分支：`git checkout -b feat/your-feature`
2. 在微信开发者工具中开发和调试
3. 确保代码符合规范（见下文）
4. 提交代码并推送
5. 发起 Pull Request

### 分支命名

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat/` | 新功能 | `feat/search-filter` |
| `fix/` | Bug 修复 | `fix/lunar-date-display` |
| `docs/` | 文档更新 | `docs/api-readme` |
| `chore/` | 构建/工具 | `chore/update-deps` |
| `refactor/` | 重构 | `refactor/api-utils` |

---

## 代码规范

### 小程序前端

- 使用原生微信小程序框架（WXML/WXSS/JS）
- 所有云函数调用通过 `miniprogram/utils/api.js` 封装
- 组件放在 `miniprogram/components/` 目录
- 工具函数放在 `miniprogram/utils/` 目录

### 云函数

- 每个云函数独立 `package.json`
- 入口统一为 `index.js`
- 通过 `action` 参数路由到不同操作

### AI 服务

- 使用 FastAPI 框架
- AI 功能必须在 `ENABLE_AI=false` 时不影响核心功能
- 使用 Conda 管理 Python 环境

### 通用规范

- 变量和函数命名清晰易懂
- 注释使用中文
- 避免硬编码，使用配置或常量

---

## 提交规范

使用 `type: description` 格式：

```
feat: 添加待办搜索过滤功能
fix: 修复农历日期显示错误
docs: 更新 API 文档
chore: 升级 lunar-javascript 依赖
refactor: 重构 api.js 调用逻辑
```

### 类型说明

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档变更 |
| chore | 构建过程或辅助工具变更 |
| refactor | 代码重构（不修复 bug 也不添加功能） |
| test | 添加或修改测试 |
| style | 代码格式调整（不影响功能） |

---

## 提交 Issue

### Bug 报告

请包含以下信息：

- **环境信息**：微信开发者工具版本、基础库版本
- **复现步骤**：详细的操作步骤
- **期望行为**：你期望发生什么
- **实际行为**：实际发生了什么
- **截图**：如有界面问题，请附截图

### 功能建议

请说明：

- **使用场景**：为什么需要这个功能
- **预期效果**：功能应该如何工作
- **替代方案**：你考虑过的其他方案

---

## 提交 Pull Request

### PR 要求

1. 确保代码在微信开发者工具中能正常编译运行
2. 如涉及云函数，确保已本地测试
3. 更新相关文档（如有必要）
4. PR 标题遵循提交规范格式
5. 在描述中说明改动内容和原因

### PR 模板

```
## 改动说明

简要描述本次改动。

## 改动类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构
- [ ] 其他

## 测试情况

说明如何验证本次改动。

## 关联 Issue

Closes #issue_number
```

---

## 开发提示

### 云函数调试

在微信开发者工具中，右键云函数 -> "本地调试" 可进行断点调试。

### 数据库操作

- 使用软删除（设置 `deletedAt` 字段），不要直接删除数据
- 恢复数据使用 `restore` action
- 永久删除使用 `permanentDelete` action

### AI 服务开发

```bash
# 启动开发服务器（热重载）
cd ai-service
conda activate family-todo-ai
export ENABLE_AI=true
uvicorn app:app --reload

# 关闭 AI 功能
export ENABLE_AI=false
```

---

如有疑问，请在 GitHub Issues 中提问。
