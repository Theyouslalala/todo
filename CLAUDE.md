# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

家庭提醒（Family Reminder）— 微信小程序，三口之家共享提醒事项管理。支持农历日期、购物清单（作为待办分类）、家庭协作。

## Architecture

三层架构：

1. **miniprogram/** — 微信小程序前端（原生 WXML/WXSS/JS）
   - `pages/` — 9 个页面：index, calendar, mine, todo-add, todo-detail, family, activity-log, recycle-bin, search
   - `components/` — 3 个组件：todo-card, category-filter, quick-add
   - `utils/` — 5 个工具模块：api（云函数调用封装）, lunar（农历）, notification（订阅消息）, cache（本地缓存）, image（图片压缩上传）
2. **cloudfunctions/** — 微信云函数（Node.js），4 个：todos, users, notifications, activity-logs
3. **ai-service/** — Python AI 服务（FastAPI + PyTorch），通过 `ENABLE_AI` 环境变量控制开关

数据流：小程序 → `utils/api.js` → 云函数 → 云数据库。AI 功能为可选增强，核心功能不依赖 AI。

## Key Patterns

- **api.js 集中调用**：所有云函数通过 `miniprogram/utils/api.js` 统一封装，不要直接调用 `wx.cloud.callFunction`
- **软删除**：`deletedAt` 字段标记删除，30 天自动清理。恢复用 `restore`，永久删除用 `permanentDelete`
- **订阅消息计数**：`notification_records` 集合跟踪剩余次数，发送时递减
- **购物清单**：`category="shopping"` 的待办事项，额外有 `quantity` 字段，状态统一用 `completed`
- **农历支持**：`utils/lunar.js` 基于 lunar-javascript 库，支持闰月
- **快速/完整模式**：todo-add 页面支持快速模式（标题+日期）和完整模式（全部字段）
- **操作日志**：`activity_logs` 集合记录家庭成员操作历史

## Development Workflow

### 小程序开发
使用微信开发者工具打开项目根目录：
1. 在 `project.config.json` 中填入真实 AppID（替换 `YOUR_APPID`）
2. 在 `miniprogram/app.js` 中填入云环境 ID（替换 `YOUR_CLOUD_ENV_ID`）
3. 在微信开发者工具中上传部署云函数（右键 cloudfunctions → 上传并部署）
4. 编译运行小程序

### AI 服务开发
```bash
conda activate family-reminder   # 或新建环境
cd ai-service
pip install -r requirements.txt
uvicorn app:app --reload         # 默认 http://localhost:8000
```
健康检查：`GET /api/ai/health`。关闭 AI：设置 `ENABLE_AI=false`。

### 云函数结构
每个云函数独立 `package.json`，部署前需在各自目录 `npm install`。云函数入口统一为 `index.js`，通过 `action` 参数路由到不同操作。

## Database

4 个云数据库集合：`users`, `reminders`, `activity_logs`, `notification_records`。详见 `docs/database-schema.md`。

关键索引：
- reminders: `familyGroupId + date + completed`
- reminders: `familyGroupId + category`
- activity_logs: `familyGroupId + createdAt`
- notification_records: `todoId + userId`

## Conventions

- 项目语言：中文（注释、UI 文案、提交信息描述部分）
- 提交信息格式：`type: description`（feat/fix/docs/chore）
- 小程序基础库：2.30.0+
- AI 功能必须在 `ENABLE_AI=false` 时不影响核心功能
