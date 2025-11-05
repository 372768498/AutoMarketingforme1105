# 项目启动检查清单
## AutoMarketing Pro - 增强版MVP

**目标**：在第一周开始前，所有基础设施都已就位

**预期时间**：3-5天（并行进行）

---

## 📋 Phase 1: 帐户和服务创建（第1天）

### Supabase 设置

- [ ] 创建 Supabase 账户
  - 访问：https://supabase.com
  - 用 GitHub 登录

- [ ] 创建新项目
  - 项目名：`automarketing-us` 或 `automarketing-prod`
  - 区域：最靠近你的区域 (建议 Singapore 或 US-East)
  - 数据库密码：强密码（保存到密码管理器）

- [ ] 保存关键信息
  ```
  PROJECT_URL = https://xxx.supabase.co
  ANON_KEY = eyJxx...
  SERVICE_ROLE_KEY = eyJxx...
  ```
  → 保存到安全的地方（下面会用到）

### Claude API 设置

- [ ] 创建 Anthropic 账户
  - 访问：https://console.anthropic.com
  - 用邮箱注册（推荐用公司邮箱）

- [ ] 创建 API Key
  - 点击 "API Keys"
  - 创建新的 API Key
  - 复制并保存（只显示一次！）

- [ ] 设置月度预算
  - 进入 Billing
  - 设置 Monthly Budget: $1000 (足够100+篇内容)
  - 这样不会意外超支

### OpenAI API 设置（备用）

- [ ] 创建 OpenAI 账户
  - 访问：https://platform.openai.com

- [ ] 创建 API Key

- [ ] 设置月度预算: $200

### N8N 部署

**选择 A 或 B：**

#### 选项 A: N8N Cloud （推荐 - 省心）

- [ ] 创建 N8N Cloud 账户
  - 访问：https://n8n.cloud
  - 免费注册

- [ ] 创建新的 Workspace
  - 命名：`automarketing-prod`

- [ ] 记录 Webhook Base URL
  ```
  https://xxxx.n8n.cloud/webhook/xxxx
  ```

#### 选项 B: 本地 Docker （如果你懂Docker）

- [ ] 安装 Docker Desktop

- [ ] 创建 `docker-compose.yml`
  ```yaml
  version: '3'
  services:
    n8n:
      image: n8nio/n8n
      ports:
        - "5678:5678"
      environment:
        - N8N_HOST=localhost
        - N8N_PROTOCOL=http
        - N8N_PORT=5678
      volumes:
        - n8n_data:/home/node/.n8n

  volumes:
    n8n_data:
  ```

- [ ] 运行
  ```bash
  docker-compose up
  ```

- [ ] 访问：http://localhost:5678
  - 创建管理员账户
  - 记录 Webhook Base URL

### Redis/Upstash 设置（缓存和队列）

- [ ] 创建 Upstash 账户
  - 访问：https://upstash.com
  - 免费额度：10GB

- [ ] 创建 Redis 数据库
  - 区域：选择靠近你的
  - 名称：`automarketing-cache`

- [ ] 保存连接信息
  ```
  UPSTASH_REDIS_URL = redis://default:xxx@xxx.upstash.io:xxx
  UPSTASH_REDIS_TOKEN = xxx
  ```

---

## 🔧 Phase 2: 代码仓库和本地环境（第1-2天）

### GitHub 仓库

- [ ] Fork 或 Clone 仓库
  ```bash
  git clone https://github.com/372768498/AutoMarketingforme1105.git
  cd AutoMarketingforme1105
  ```

- [ ] 创建 feature branch
  ```bash
  git checkout -b setup/initial-config
  ```

### 本地开发环境

- [ ] 安装 Node.js (v18+)
  ```bash
  node --version  # 应该是 v18 或更高
  ```

- [ ] 安装 pnpm
  ```bash
  npm install -g pnpm
  ```

- [ ] 安装依赖
  ```bash
  pnpm install
  ```

- [ ] 安装开发工具
  ```bash
  pnpm add -D @typescript-eslint/eslint-plugin
  pnpm add -D prettier
  ```

### 创建 .env.local 文件

在项目根目录创建 `.env.local`：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Claude API
CLAUDE_API_KEY=sk-ant-xxx

# OpenAI API (备用)
OPENAI_API_KEY=sk-xxx

# N8N
N8N_WEBHOOK_URL=https://xxxx.n8n.cloud/webhook/xxx
N8N_API_KEY=xxx (如果是本地Docker，可能不需要)

# Redis
UPSTASH_REDIS_URL=redis://default:xxx@xxx.upstash.io:xxx
UPSTASH_REDIS_TOKEN=xxx

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**⚠️ 重要**:
- 不要把这个文件提交到 Git
- 确保 `.gitignore` 包含 `.env.local`
- 使用密码管理器保存这些密钥

### 验证本地环境

```bash
# 启动开发服务器
pnpm dev

# 应该能看到：
# ▲ Next.js 14.0.0
# - Local: http://localhost:3000

# 打开浏览器访问 http://localhost:3000
# 应该看到一个页面（可能是空的或显示错误，这是正常的）
```

---

## 🗄️ Phase 3: 数据库初始化（第2-3天）

### 创建数据库表

- [ ] 在 Supabase 中创建表

在 Supabase Dashboard → SQL Editor，运行：

```sql
-- 1. Products 表
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50),
  category VARCHAR(100),
  price_model VARCHAR(50),

  target_markets TEXT[],
  target_languages TEXT[],

  status VARCHAR(50) DEFAULT 'active',
  metadata JSONB,

  UNIQUE(name)
);

-- 2. User Personas 表
CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  persona_name VARCHAR(255),
  demographics JSONB,
  psychographics JSONB,
  platforms JSONB,
  content_preferences JSONB,
  buying_triggers JSONB,

  ai_insights TEXT,
  confidence_score FLOAT,

  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- 3. Content Pieces 表
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50),
  language VARCHAR(10) DEFAULT 'en-US',

  based_on_persona_id UUID REFERENCES user_personas(id),
  based_on_analysis_ids JSONB,

  keywords JSONB,
  seo_score FLOAT,
  readability_score FLOAT,

  status VARCHAR(50) DEFAULT 'draft',

  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  publish_platform VARCHAR(100),
  publish_url TEXT,

  predicted_performance JSONB,

  version INT DEFAULT 1,
  metadata JSONB
);

-- 创建索引（提升查询性能）
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_content_product ON content_pieces(product_id);
CREATE INDEX idx_content_status ON content_pieces(status);
CREATE INDEX idx_personas_product ON user_personas(product_id);
```

- [ ] 验证表是否创建成功
  - 在 Supabase Dashboard 的 "Tables" 部分应该能看到这些表

### 设置 Row Level Security (RLS)

- [ ] 启用 RLS
  ```sql
  ALTER TABLE products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
  ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
  ```

（后期会配置具体的RLS策略，现在暂时禁用以便开发）

---

## 🔌 Phase 4: 工具集成测试（第3-4天）

### 测试 Claude API

- [ ] 在代码中测试调用
  ```typescript
  // lib/test-claude.ts
  import Anthropic from '@anthropic-ai/sdk';

  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  async function testClaude() {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: '说一个简短的笑话' },
      ],
    });
    console.log(message.content);
  }

  testClaude();
  ```

- [ ] 运行测试
  ```bash
  npx ts-node lib/test-claude.ts
  ```
  应该看到一个笑话 ✅

### 测试 Supabase 连接

- [ ] 创建测试 API 路由
  ```typescript
  // app/api/test/route.ts
  import { createClient } from '@supabase/supabase-js';

  export async function GET() {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    return Response.json({ data, error });
  }
  ```

- [ ] 访问 http://localhost:3000/api/test
  - 应该返回 `{"data":[],"error":null}` ✅

### 测试 N8N Webhook

- [ ] 创建一个简单的 N8N 工作流
  - 新建 Workflow
  - 添加 Webhook 节点（作为触发器）
  - 添加 HTTP Request 节点（调用 Claude）
  - 测试运行

- [ ] 从 Next.js 调用
  ```typescript
  const response = await fetch(process.env.N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ test: 'data' })
  });
  ```
  应该成功返回 ✅

### 测试 Redis

- [ ] 创建测试脚本
  ```typescript
  import { Redis } from '@upstash/redis';

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });

  async function testRedis() {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log(value); // 应该输出 'test-value'
  }
  ```

---

## 📊 Phase 5: 初步代码架构（第4-5天）

### 项目文件结构

- [ ] 创建必要的目录
  ```bash
  mkdir -p app/api/products
  mkdir -p app/dashboard/products
  mkdir -p lib/supabase
  mkdir -p lib/ai
  mkdir -p lib/cache
  mkdir -p components/forms
  mkdir -p components/cards
  mkdir -p types
  ```

### 创建基础类型定义

- [ ] `types/index.ts`
  ```typescript
  export interface Product {
    id: string;
    name: string;
    description?: string;
    type: 'B2B' | 'B2C' | 'B2B2C';
    target_markets: string[];
    status: 'active' | 'paused' | 'archived';
    created_at: string;
    updated_at: string;
  }

  export interface UserPersona {
    id: string;
    product_id: string;
    persona_name: string;
    demographics: Record<string, any>;
    // ... 更多字段
  }

  // 等等
  ```

### 创建 Supabase 客户端

- [ ] `lib/supabase/client.ts`
  ```typescript
  import { createClient } from '@supabase/supabase-js';

  export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```

- [ ] `lib/supabase/server.ts` (用于服务器端)
  ```typescript
  import { createClient } from '@supabase/supabase-js';

  export const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  ```

### 创建 AI 调用器

- [ ] `lib/ai/claude.ts`
  ```typescript
  import Anthropic from '@anthropic-ai/sdk';

  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  export async function callClaude(messages: any[]) {
    return client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages,
    });
  }
  ```

### 创建缓存管理器

- [ ] `lib/cache/manager.ts`
  ```typescript
  import { Redis } from '@upstash/redis';

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });

  export async function getOrSet<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await redis.get<T>(key);
    if (cached) return cached;

    // 缓存未命中，调用fetcher
    const result = await fetcher();

    // 存入缓存
    await redis.setex(key, ttl, JSON.stringify(result));

    return result;
  }
  ```

---

## ✅ 最终检查清单

项目启动前，确认以下所有✅：

```
【外部服务】
✅ Supabase 账户和项目已创建
✅ Claude API Key 已获取
✅ N8N (本地或Cloud) 已部署
✅ Redis/Upstash 已配置
✅ 所有密钥都在 .env.local 中

【本地环境】
✅ Node.js v18+ 已安装
✅ pnpm 已安装
✅ 项目依赖已安装 (pnpm install)
✅ 本地服务器能运行 (pnpm dev)

【数据库】
✅ 所有表都已在 Supabase 创建
✅ 索引已创建
✅ 可以从代码查询数据库

【工具集成】
✅ Claude API 测试成功
✅ Supabase 连接测试成功
✅ N8N Webhook 可调用
✅ Redis 连接测试成功

【代码架构】
✅ 基础文件结构已创建
✅ 类型定义已创建
✅ 工具类已创建 (Supabase, AI, Cache)

【文档和流程】
✅ 所有 8 份文档都已阅读
✅ 每周任务清单已打印
✅ 验收标准已理解
✅ 遇到问题的沟通渠道已确立
```

---

## 🚀 完成后的下一步

当所有项目都✅ 时：

1. **提交 Pull Request**
   ```bash
   git add .
   git commit -m "setup: 初始项目配置和工具集成"
   git push origin setup/initial-config
   gh pr create --title "Setup: Initial Project Configuration"
   ```

2. **PM 验收**
   - PM 检查所有配置
   - 验证开发环境正常
   - 批准 PR

3. **开始 Week 1 开发**
   - 创建新分支 `feature/week1-products`
   - 开始第一周的任务

---

**一旦所有项目都准备好，你就可以开始编码了！** 🎉

有任何问题，随时沟通。
