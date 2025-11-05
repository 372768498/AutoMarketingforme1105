# 🚀 快速启动指南 (5分钟)

**前置条件已完成**：
- ✅ Node.js v22.20.0
- ✅ pnpm 10.20.0
- ✅ 所有依赖已安装
- ✅ Next.js 框架已初始化
- ✅ N8N 工作流已准备

现在我们只需要 **3 个步骤** 即可启动完整系统！

---

## Step 1: 快速 Supabase 设置（10分钟）

### 1.1 创建 Supabase 项目

1. 访问 https://supabase.com
2. 登录或注册
3. 点击 "New Project"
4. 填写：
   - **Project Name**: `automarketing-prod`
   - **Database Password**: 设置强密码（保存到密码管理器）
   - **Region**: 选择最近的地区（推荐 Singapore 或 US East）
5. 点击 "Create new project"

### 1.2 等待项目创建完成（2-3分钟）

项目创建后，你会看到一个提示。

### 1.3 复制 API Keys

1. 进入 **Settings** → **API**
2. 在左边菜单找到你的项目名
3. 复制以下内容：

```
Project URL → NEXT_PUBLIC_SUPABASE_URL
Anon Key → NEXT_PUBLIC_SUPABASE_ANON_KEY
Service Role Key → SUPABASE_SERVICE_ROLE_KEY
```

### 1.4 初始化数据库表

1. 在 Supabase Dashboard 中，进入 **SQL Editor**
2. 点击 "New Query"
3. 复制 `DATABASE_MIGRATIONS.md` 中的 **初始化脚本**（从 "启用扩展和基础函数" 开始）
4. 粘贴并执行
5. 执行 **Week 1: 核心数据表** 的脚本

---

## Step 2: 配置环境变量（3分钟）

在项目根目录创建 `.env.local` 文件：

```bash
# 复制 .env.example 的内容并填入你的 API Key
cp .env.example .env.local
```

编辑 `.env.local`，填入：

```bash
# Supabase（从上面复制）
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Claude API（你的中转 API）
CLAUDE_API_KEY=你的中转API密钥

# N8N Webhook URLs（从你的 N8N 实例获取）
N8N_WEBHOOK_URL_PERSONA=http://localhost:5678/webhook/generate-persona
N8N_WEBHOOK_URL_MARKET=http://localhost:5678/webhook/analyze-market
N8N_WEBHOOK_URL_CONTENT=http://localhost:5678/webhook/generate-content

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
API_KEY=your-secret-key
```

---

## Step 3: 启动开发服务器（立即！）

在 PowerShell 中运行：

```powershell
cd C:\Users\jojo1\AutoMarketingforme1105
pnpm dev
```

**预期输出**：
```
> next dev

  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 1234ms
```

---

## 测试系统

打开浏览器访问：http://localhost:3000

你应该看到：

### 主页
- ✅ "Welcome to AutoMarketing Pro" 标题
- ✅ 系统状态检查（应该显示红色 ⚠️ 或绿色 ✅）

### 功能测试

#### 1️⃣ 创建产品
1. 点击 "Go to Dashboard"
2. 点击 "+ New Product"
3. 填写信息：
   - **Product Name**: `Test Product`
   - **Type**: `B2C`
   - **Markets**: 选择 `US`
   - **Languages**: 保持 `en-US`
4. 点击 "Create Product"

#### 2️⃣ 查看产品列表
- 应该看到你刚创建的产品

#### 3️⃣ 删除产品
- 在产品卡片上点击 "Delete"
- 确认删除

---

## 🔍 验收清单（Week 1）

### 后端 API
```
□ GET /api/health → 返回 { status: 'ok', services: {...} }
□ GET /api/products → 返回产品列表
□ POST /api/products → 创建新产品
□ PATCH /api/products/[id] → 更新产品
□ DELETE /api/products/[id] → 删除产品
```

### 前端页面
```
□ / → 主页加载正常
□ /dashboard/products → 产品列表页面
□ /dashboard/products/new → 创建产品表单
□ 能创建、编辑、删除产品
□ 数据正确保存到 Supabase
```

### 缓存系统
```
□ Redis 连接正常
□ 缓存命中测试通过
□ 重复请求从缓存返回
```

---

## 🆘 遇到问题？

### Supabase 连接失败

```
Error: Missing Supabase environment variables
```

**解决**：
1. 检查 `.env.local` 中的 URL 和 Key 是否正确复制
2. 确认 Supabase 项目已创建完成
3. 查看 Supabase Dashboard 中的 Status

### Port 3000 已被占用

```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决**：
```powershell
# 杀死占用端口的进程
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# 或使用不同的端口
pnpm dev -- -p 3001
```

### 数据库表不存在

```
Error: relation "products" does not exist
```

**解决**：
1. 再次检查 SQL 脚本是否完整执行
2. 在 Supabase Dashboard 的 "Tables" 部分确认表是否存在
3. 重新运行 DATABASE_MIGRATIONS.md 中的脚本

---

## 📊 系统架构（此时应该就绪）

```
┌─────────────────────────────────────────────────────┐
│         Next.js Application (localhost:3000)        │
├─────────────────────────────────────────────────────┤
│  Frontend (React)    │    API Routes    │   Cache   │
│  - Home              │  - /health       │  - Redis  │
│  - Products          │  - /products     │  (缓存)   │
│  - Dashboard         │  - /api/...      │           │
└─────────────────────────────────────────────────────┘
           ↓                    ↓                  ↓
    ┌──────────────────┐  ┌──────────────┐  ┌──────────┐
    │  Supabase        │  │  Claude API  │  │ Upstash  │
    │  (PostgreSQL)    │  │  (N8N)       │  │  Redis   │
    │  - Products      │  │              │  │          │
    │  - Personas      │  │  • Personas  │  │ 缓存层   │
    │  - Content       │  │  • Analysis  │  │          │
    │  - Analytics     │  │  • Content   │  │          │
    └──────────────────┘  └──────────────┘  └──────────┘
```

---

## 🎯 Next Steps

完成上面的步骤后，你就有了一个**完整的 Week 1 基础设施**。

接下来的步骤：

### Week 2-3: AI 分析引擎
1. 创建 Persona Generator API 端点
2. 集成 N8N 工作流
3. 测试用户画像生成

### Week 4-5: 内容生成
1. 实现内容生成 API
2. 集成智能模型路由
3. 添加 SEO 和可读性分析

### Week 6-7: 内容管理
1. 创建内容日历
2. 实现排期系统
3. 批量生成功能

---

## 📚 更多文档

- **API 详细配置**: `API_AND_TOOLS.md`
- **N8N 工作流**: `N8N_WORKFLOWS_GUIDE.md`
- **数据库架构**: `DATABASE_MIGRATIONS.md`
- **每周任务详情**: `WEEKLY_TASKS.md`
- **完整需求**: `REQUIREMENTS_DETAILED.md`

---

## 💡 提示

1. **保存 API Keys**: 将所有 Key 保存到密码管理器
2. **不要提交 .env.local**: 已在 .gitignore 中
3. **定期备份**: Supabase 有自动备份，但建议手动导出
4. **监控成本**: 设置 Claude API 的月度预算限制

---

**现在就开始吧！** 🚀

```powershell
pnpm dev
```

然后访问 http://localhost:3000

