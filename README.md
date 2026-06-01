# 家庭提醒小程序

三口之家共享提醒事项微信小程序，支持农历日期、购物清单、家庭成员协作。

## 功能特性

- **待办事项管理**：创建、编辑、完成、删除待办事项
- **购物清单**：购物作为待办分类，支持数量和拍照
- **日历视图**：月视图 + 农历日期显示
- **家庭协作**：邀请码加入家庭组，共享待办
- **通知提醒**：微信订阅消息推送
- **操作日志**：记录家庭组内所有操作
- **回收站**：软删除，可恢复
- **搜索功能**：按标题搜索待办
- **AI功能（可选）**：智能分类、时间推荐、语音识别

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 |
| 后端 | 微信云开发（云函数+云数据库） |
| AI服务 | Python + FastAPI + PyTorch（可选） |
| 农历 | lunar-javascript |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/family-reminder.git
cd family-reminder
```

### 2. 微信小程序配置

1. 下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开微信开发者工具，导入项目
3. 在 `project.config.json` 中替换 `YOUR_APPID` 为你的小程序 AppID
4. 在 `miniprogram/app.js` 中替换 `YOUR_CLOUD_ENV_ID` 为你的云开发环境 ID

### 3. 云开发环境

1. 在微信开发者工具中开通云开发
2. 创建以下数据库集合：
   - `users`
   - `reminders`
   - `activity_logs`
   - `notification_records`
3. 上传云函数（右键云函数目录 -> 上传并部署）

### 4. AI服务（可选）

```bash
cd ai-service
conda create -n family-todo-ai python=3.10 -y
conda activate family-todo-ai
pip install -r requirements.txt
export ENABLE_AI=true
python app.py
```

## 项目结构

```
├── miniprogram/          # 微信小程序前端
│   ├── pages/            # 页面
│   ├── components/       # 组件
│   ├── utils/            # 工具函数
│   └── images/           # 图片资源
├── cloudfunctions/       # 微信云函数
│   ├── todos/            # 待办CRUD
│   ├── users/            # 用户管理
│   ├── notifications/    # 通知推送
│   └── activity-logs/    # 操作日志
├── ai-service/           # Python AI服务（可选）
├── docs/                 # 文档
├── README.md
└── LEARNING.md
```

## 开发指南

详见 [LEARNING.md](./LEARNING.md)

## 许可证

MIT License
