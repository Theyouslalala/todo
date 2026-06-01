# 9. 文档完整性审计

## 审计概览

| 文档 | 状态 | 说明 |
|------|------|------|
| README.md | 存在 | 内容较完整 |
| CONTRIBUTING.md | **缺失** | 无贡献指南 |
| API.md / OpenAPI | **缺失** | 无 API 文档 |
| ADR (架构决策记录) | **缺失** | 无 ADR 目录和文件 |
| LEARNING.md | 存在 | 用户/开发者混合指南 |
| CLAUDE.md | 存在 | AI 辅助开发上下文 |
| docs/database-schema.md | 存在 | 数据库集合定义 |

---

## 1. README.md 评估

**状态**: 存在，内容基本完整

### 已覆盖内容

- 项目简介和功能特性
- 技术栈表格
- 快速开始（克隆、配置、云开发、AI 服务）
- 项目结构目录树
- 链接到 LEARNING.md

### 缺失内容

| 缺失项 | 重要性 | 说明 |
|--------|--------|------|
| 测试说明 | 高 | 未说明如何运行测试（tests/ 目录存在但 README 未提及） |
| 环境变量清单 | 高 | 仅提到 `ENABLE_AI`，未列出所有环境变量 |
| 部署说明 | 中 | 未说明如何部署到生产环境 |
| 贡献指南链接 | 中 | 无 CONTRIBUTING.md 可链接 |
| 许可证详情 | 低 | 仅写 "MIT License"，无 LICENSE 文件说明 |
| 徽章 | 低 | 无构建状态、版本等徽章 |

### 建议改进

```markdown
## 测试

```bash
# 运行单元测试
cd tests
npm test

# 运行 AI 服务测试
cd ai-service
pytest
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| ENABLE_AI | 是否启用 AI 服务 | false |
| YOUR_APPID | 小程序 AppID | 无（必填） |
| YOUR_CLOUD_ENV_ID | 云开发环境 ID | 无（必填） |
```

---

## 2. CONTRIBUTING.md 评估

**状态**: 完全缺失

项目没有贡献指南，对以下场景缺少指引：
- 如何提交 Issue
- 如何发起 Pull Request
- 代码风格和规范
- 提交信息格式（CLAUDE.md 中有提及但面向 AI，非面向人类贡献者）

**已生成初始版本**: `generated-docs/CONTRIBUTING.md`

---

## 3. API.md / OpenAPI 评估

**状态**: 完全缺失

项目有两套 API，均无独立文档：

### 云函数 API（4 个函数）

| 函数 | 已知 actions | 文档位置 |
|------|-------------|---------|
| todos | CRUD、软删除、搜索 | 仅代码 |
| users | 登录、家庭管理 | 仅代码 |
| notifications | 订阅消息管理 | 仅代码 |
| activity-logs | 操作日志查询 | 仅代码 |

### AI 服务 API（4 个端点）

| 端点 | 方法 | 说明 | 文档位置 |
|------|------|------|---------|
| /api/ai/health | GET | 健康检查 | ai-service/README.md |
| /api/ai/classify | POST | 待办分类 | ai-service/README.md |
| /api/ai/recommend-time | POST | 时间推荐 | ai-service/README.md |
| /api/ai/speech-to-text | POST | 语音转文字 | ai-service/README.md |

AI 服务的端点在 `ai-service/README.md` 中有简要列出，但缺少请求/响应格式。云函数 API 完全无文档。

**建议**: 为 AI 服务生成 OpenAPI 规范（FastAPI 原生支持），为云函数编写 API.md。

---

## 4. ADR（架构决策记录）评估

**状态**: 完全缺失

项目使用了多项关键技术决策，但未记录决策过程和理由：
- 为什么选择微信小程序（而非 Web App 或原生 App）
- 为什么使用微信云开发（而非自建后端）
- 为什么 AI 服务独立部署（而非嵌入云函数）
- 为什么使用软删除（而非硬删除）

**已生成初始版本**:
- `generated-docs/adr-001-why-wechat-miniprogram.md`
- `generated-docs/adr-002-why-cloud-functions.md`

---

## 5. LEARNING.md 评估

**状态**: 存在，质量良好

### 优点
- 同时覆盖用户使用指南和开发者指南
- 包含常见问题（FAQ）部分
- 数据库集合和云函数有表格说明

### 不足
- AI 服务启动命令与 README 不一致（README 用 `python app.py`，LEARNING 也用 `app.py` 但未说明 uvicorn）
- 未提及测试相关内容
- 缺少调试技巧

---

## 总结

### 文档完整性评分

| 维度 | 评分 (1-5) | 说明 |
|------|-----------|------|
| README 完整性 | 3.5 | 基本完整，缺测试和环境变量说明 |
| 贡献指南 | 0 | 缺失 |
| API 文档 | 1 | 仅 AI 服务有简要端点列表 |
| 架构决策记录 | 0 | 缺失 |
| 学习/上手文档 | 4 | LEARNING.md 质量不错 |
| 开发者上下文 | 4.5 | CLAUDE.md 非常详细 |
| **综合评分** | **2.2/5** | |

### 优先行动项

1. **高优先** - 添加 CONTRIBUTING.md（已生成初始版本）
2. **高优先** - 补充 API 文档（至少为 AI 服务添加 OpenAPI spec）
3. **中优先** - 在 README 中添加测试说明和环境变量清单
4. **中优先** - 建立 ADR 目录和初始记录（已生成 2 篇）
5. **低优先** - 统一 LEARNING.md 和 README 的命令差异
