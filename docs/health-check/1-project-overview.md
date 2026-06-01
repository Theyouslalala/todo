# 项目概览健康检查报告

> 生成日期: 2026-06-01
> 项目路径: D:/Wang Yuhan/Desktop/Project/github_project/todo
> 项目名称: family-reminder (家庭提醒小程序)
> AppID: wx0b65659bbf0ead88

---

## 1. 项目简介

本项目是一个微信小程序，用于三口之家共享提醒事项。项目采用前后端分离架构：

- **miniprogram/** — 微信小程序前端（页面、组件、工具函数）
- **cloudfunctions/** — 微信云函数后端（todos、users、notifications、activity-logs）
- **ai-service/** — Python AI 服务（FastAPI + Whisper 语音识别 + 分类器）
- **docs/** — 项目文档与设计规格

---

## 2. 项目目录结构

```
todo/
├── .gitignore
├── CLAUDE.md
├── LEARNING.md
├── README.md
├── project.config.json
├── project.private.config.json
├── ai-service/
│   ├── README.md
│   ├── app.py
│   ├── config.py
│   ├── requirements.txt
│   └── models/
│       ├── __init__.py
│       ├── classifier.py
│       └── time_recommender.py
├── cloudfunctions/
│   ├── activity-logs/
│   │   ├── config.json
│   │   ├── index.js
│   │   └── package.json
│   ├── notifications/
│   │   ├── config.json
│   │   ├── index.js
│   │   └── package.json
│   ├── todos/
│   │   ├── config.json
│   │   ├── index.js
│   │   └── package.json
│   └── users/
│       ├── config.json
│       ├── index.js
│       └── package.json
├── docs/
│   ├── database-schema.md
│   ├── health-check/
│   │   └── 2-dependency-audit.md
│   └── superpowers/
│       ├── plans/
│       │   └── 2026-06-01-family-reminder-impl.md
│       └── specs/
│           └── 2026-06-01-family-reminder-design.md
└── miniprogram/
    ├── app.js
    ├── app.json
    ├── app.wxss
    ├── config.js
    ├── package.json
    ├── package-lock.json
    ├── sitemap.json
    ├── components/
    │   ├── category-filter/
    │   │   ├── category-filter.js
    │   │   ├── category-filter.json
    │   │   ├── category-filter.wxml
    │   │   └── category-filter.wxss
    │   ├── quick-add/
    │   │   ├── quick-add.js
    │   │   ├── quick-add.json
    │   │   ├── quick-add.wxml
    │   │   └── quick-add.wxss
    │   └── todo-card/
    │       ├── todo-card.js
    │       ├── todo-card.json
    │       ├── todo-card.wxml
    │       └── todo-card.wxss
    ├── images/
    │   ├── calendar.png
    │   ├── calendar-active.png
    │   ├── home.png
    │   ├── home-active.png
    │   ├── mine.png
    │   └── mine-active.png
    ├── pages/
    │   ├── activity-log/
    │   │   ├── activity-log.js
    │   │   ├── activity-log.json
    │   │   ├── activity-log.wxml
    │   │   └── activity-log.wxss
    │   ├── calendar/
    │   │   ├── calendar.js
    │   │   ├── calendar.json
    │   │   ├── calendar.wxml
    │   │   └── calendar.wxss
    │   ├── family/
    │   │   ├── family.js
    │   │   ├── family.json
    │   │   ├── family.wxml
    │   │   └── family.wxss
    │   ├── index/
    │   │   ├── index.js
    │   │   ├── index.json
    │   │   ├── index.wxml
    │   │   └── index.wxss
    │   ├── mine/
    │   │   ├── mine.js
    │   │   ├── mine.json
    │   │   ├── mine.wxml
    │   │   └── mine.wxss
    │   ├── recycle-bin/
    │   │   ├── recycle-bin.js
    │   │   ├── recycle-bin.json
    │   │   ├── recycle-bin.wxml
    │   │   └── recycle-bin.wxss
    │   ├── search/
    │   │   ├── search.js
    │   │   ├── search.json
    │   │   ├── search.wxml
    │   │   └── search.wxss
    │   ├── settings/
    │   │   ├── settings.js
    │   │   ├── settings.json
    │   │   ├── settings.wxml
    │   │   └── settings.wxss
    │   ├── todo-add/
    │   │   ├── todo-add.js
    │   │   ├── todo-add.json
    │   │   ├── todo-add.wxml
    │   │   └── todo-add.wxss
    │   └── todo-detail/
    │       ├── todo-detail.js
    │       ├── todo-detail.json
    │       ├── todo-detail.wxml
    │       └── todo-detail.wxss
    └── utils/
        ├── api.js
        ├── cache.js
        ├── image.js
        ├── lunar.js
        └── notification.js
```

---

## 3. 文件统计（按扩展名分类）

| 扩展名 | 文件数量 | 代码行数 | 说明 |
|--------|---------|---------|------|
| `.js` | 24 | 1,775 | JavaScript 源码（页面逻辑、云函数、工具函数） |
| `.json` | 27 | 238 | 配置文件（页面配置、项目配置、package.json） |
| `.wxml` | 13 | 368 | 微信小程序模板文件（页面结构） |
| `.wxss` | 14 | 718 | 微信小程序样式文件（页面样式） |
| `.py` | 5 | 190 | Python 源码（AI 服务） |
| `.md` | 7 | 4,981 | Markdown 文档（README、设计文档、计划文档） |
| `.txt` | 1 | 7 | 文本文件（requirements.txt） |
| `.png` | 6 | — | 图片资源（TabBar 图标） |
| `.gitignore` | 1 | 25 | Git 忽略配置 |
| **合计** | **98** | **8,302** | — |

> 注: 行数统计排除了 `node_modules/`、`.git/` 和 `miniprogram_npm/` 目录。`.png` 文件不计入行数。

---

## 4. 总代码行数

| 类别 | 行数 | 占比 |
|------|------|------|
| JavaScript (`.js`) | 1,775 | 21.4% |
| WXSS 样式 (`.wxss`) | 718 | 8.6% |
| WXML 模板 (`.wxml`) | 368 | 4.4% |
| JSON 配置 (`.json`) | 238 | 2.9% |
| Python (`.py`) | 190 | 2.3% |
| Markdown 文档 (`.md`) | 4,981 | 60.0% |
| 其他 (`.txt` + `.gitignore`) | 32 | 0.4% |
| **总计** | **8,302** | **100%** |

- **源代码总行数** (JS + WXML + WXSS + PY): **3,051 行**
- **配置文件总行数** (JSON + txt + gitignore): **295 行**
- **文档总行数** (MD): **4,981 行**

---

## 5. 最大的 10 个文件

| 排名 | 文件路径 | 行数 | 类型 |
|------|---------|------|------|
| 1 | `docs/superpowers/plans/2026-06-01-family-reminder-impl.md` | 4,195 | 文档 |
| 2 | `docs/superpowers/specs/2026-06-01-family-reminder-design.md` | 439 | 文档 |
| 3 | `cloudfunctions/todos/index.js` | 321 | 云函数 |
| 4 | `cloudfunctions/users/index.js` | 200 | 云函数 |
| 5 | `miniprogram/pages/todo-add/todo-add.js` | 179 | 页面逻辑 |
| 6 | `miniprogram/components/todo-card/todo-card.wxss` | 157 | 组件样式 |
| 7 | `miniprogram/pages/index/index.wxss` | 142 | 页面样式 |
| 8 | `LEARNING.md` | 131 | 文档 |
| 9 | `miniprogram/app.wxss` | 124 | 全局样式 |
| 10 | `miniprogram/pages/calendar/calendar.js` | 113 | 页面逻辑 |

> 说明: 最大的文件是实施计划文档（4,195 行），占文档总量的 84%。源代码中最大的文件是 `cloudfunctions/todos/index.js`（321 行），其次是 `cloudfunctions/users/index.js`（200 行）。

---

## 6. 依赖管理文件

### 6.1 小程序前端依赖

**文件**: `miniprogram/package.json`

| 依赖 | 版本 | 说明 |
|------|------|------|
| `lunar-javascript` | `^1.6.12` | 农历日历库，用于日历页面的农历显示 |

### 6.2 云函数依赖

四个云函数均依赖 `wx-server-sdk ~2.6.3`（微信云开发 SDK）：

| 云函数 | 文件 | 依赖 |
|--------|------|------|
| `todos` | `cloudfunctions/todos/package.json` | `wx-server-sdk ~2.6.3` |
| `users` | `cloudfunctions/users/package.json` | `wx-server-sdk ~2.6.3` |
| `notifications` | `cloudfunctions/notifications/package.json` | `wx-server-sdk ~2.6.3` |
| `activity-logs` | `cloudfunctions/activity-logs/package.json` | `wx-server-sdk ~2.6.3` |

### 6.3 AI 服务依赖

**文件**: `ai-service/requirements.txt`

| 依赖 | 版本 | 说明 |
|------|------|------|
| `fastapi` | `0.104.1` | Web 框架 |
| `uvicorn` | `0.24.0` | ASGI 服务器 |
| `torch` | `2.1.0` | PyTorch 深度学习框架 |
| `openai-whisper` | `20231117` | OpenAI Whisper 语音识别模型 |
| `numpy` | `1.24.0` | 数值计算库 |
| `pydantic` | `2.5.0` | 数据验证库 |
| `python-multipart` | `0.0.6` | 文件上传支持 |

### 6.4 项目配置文件

**文件**: `project.config.json`

- 项目名称: `family-reminder`
- 编译类型: `miniprogram`
- 基础库版本: `2.30.0`
- 小程序根目录: `miniprogram/`
- 云函数根目录: `cloudfunctions/`
- ES6 转换: 启用
- 增强编译: 启用
- 代码压缩: 启用（WXSS + WXML）
- Source Map: 上传时包含

---

## 7. 项目架构总结

| 维度 | 数值 |
|------|------|
| 总文件数（不含 node_modules/.git） | 98 |
| 源代码文件数 | 56 |
| 源代码行数 | 3,051 |
| 小程序页面数 | 10 |
| 小程序组件数 | 3 |
| 云函数数 | 4 |
| Python 模块数 | 5 |
| 第三方 JS 依赖 | 1 |
| 第三方 Python 依赖 | 7 |
| 图片资源 | 6 |
