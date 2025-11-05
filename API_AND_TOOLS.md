# API 和工具配置指南
## AutoMarketing Pro - 增强版MVP

**目的**：完整的API配置和工具设置指南，确保所有外部服务正确集成

**面向**：AI工程师

**预计时间**：3-4小时完成所有配置

---

## 📋 所需服务清单

| 服务 | 用途 | 成本 | 必需？ |
|------|------|------|--------|
| **Supabase** | 数据库 + 实时功能 | $50/月 | ✅ 必需 |
| **Claude API** | AI内容生成和分析 | 按使用量 | ✅ 必需 |
| **OpenAI API** | AI备用和模型路由 | 按使用量 | ✅ 必需 |
| **Upstash Redis** | 缓存 + 任务队列 | $0-10/月 | ✅ 必需 (Option B) |
| **N8N** | 工作流自动化 | $20/月或免费 | ✅ 必需 |
| **SerpAPI** | SEO排名追踪 | $5-50/月 | ✅ 必需 (Option B) |
| **Vercel** | 前端部署 | $20/月 | ⚠️ 生产环境 |

---

## 🔧 Part 1: Supabase 配置

### 1.1 创建项目

```bash
# 步骤
1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写信息:
   - Name: automarketing-prod
   - Database Password: [生成强密码]
   - Region: Singapore (亚洲) 或 US East (美国)
   - Pricing Plan: Pro ($25/月) 或 Free (开发测试)
```

### 1.2 获取密钥

在 Project Settings → API：

```bash
# 需要保存的密钥
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ 重要**：
- `ANON_KEY`: 用于客户端（浏览器）
- `SERVICE_ROLE_KEY`: 用于服务器端（绕过RLS），**绝不能暴露到前端**

### 1.3 配置数据库表

在 SQL Editor 中运行：

```sql
-- 完整的数据库初始化脚本
-- 见 DATABASE_MIGRATIONS.md 或直接在这里运行：

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Products 表
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- B2B, B2C, B2B2C
  category VARCHAR(100),
  price_model VARCHAR(50),

  target_markets TEXT[], -- ['US', 'EU', 'Asia']
  target_languages TEXT[], -- ['en-US', 'zh-CN']

  status VARCHAR(50) DEFAULT 'active', -- active, paused, archived
  metadata JSONB,

  UNIQUE(name)
);

-- 3. User Personas 表
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

-- 4. Market Analysis 表
CREATE TABLE market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  market VARCHAR(100), -- 'US', 'EU-UK', etc

  trends JSONB,
  competitors JSONB,
  opportunities JSONB,

  keyword_data JSONB,
  search_volume_data JSONB,

  ai_summary TEXT,
  confidence_score FLOAT
);

-- 5. Content Pieces 表
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50), -- blog, social, email, etc
  language VARCHAR(10) DEFAULT 'en-US',

  based_on_persona_id UUID REFERENCES user_personas(id),
  based_on_analysis_ids JSONB,

  keywords JSONB,
  seo_score FLOAT,
  readability_score FLOAT,

  status VARCHAR(50) DEFAULT 'draft', -- draft, ready, scheduled, published

  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  publish_platform VARCHAR(100),
  publish_url TEXT,

  predicted_performance JSONB,

  version INT DEFAULT 1,
  metadata JSONB
);

-- 6. AI Tasks 表 (增强版)
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  task_type VARCHAR(100) NOT NULL, -- 'persona_generation', 'content_generation', etc
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed

  input_data JSONB,
  output_data JSONB,

  model_used VARCHAR(100), -- 'claude-3-5-sonnet', 'gpt-4o', etc
  tokens_used INT,
  cost_usd DECIMAL(10, 4),

  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,

  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3
);

-- 7. Content Performance 表
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  platform VARCHAR(100),

  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  engagement_rate FLOAT,

  metadata JSONB
);

-- 8. SEO Rankings 表 (增强版)
CREATE TABLE seo_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  keyword VARCHAR(255),
  position INT,
  previous_position INT,
  search_volume INT,

  url TEXT,
  country VARCHAR(10) DEFAULT 'US'
);

-- 9. Competitor Monitoring 表 (增强版)
CREATE TABLE competitor_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  competitor_name VARCHAR(255),
  competitor_url TEXT,

  content_topics JSONB,
  keywords JSONB,
  content_frequency JSONB,

  ai_insights TEXT
);

-- 10. 创建索引
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_content_product ON content_pieces(product_id);
CREATE INDEX idx_content_status ON content_pieces(status);
CREATE INDEX idx_personas_product ON user_personas(product_id);
CREATE INDEX idx_tasks_status ON ai_tasks(status);
CREATE INDEX idx_tasks_type ON ai_tasks(task_type);
CREATE INDEX idx_performance_content ON content_performance(content_id);
CREATE INDEX idx_rankings_content ON seo_rankings(content_id);
CREATE INDEX idx_rankings_keyword ON seo_rankings(keyword);

-- 11. 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. 应用触发器
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personas_updated_at
  BEFORE UPDATE ON user_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### 1.4 配置 Row Level Security (RLS)

```sql
-- 启用 RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- 开发阶段：允许所有操作（使用 SERVICE_ROLE_KEY）
-- 生产阶段：添加具体的策略
```

### 1.5 测试连接

```typescript
// lib/supabase/test.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testConnection() {
  const { data, error } = await supabase
    .from('products')
    .select('count');

  if (error) {
    console.error('❌ Supabase连接失败:', error);
  } else {
    console.log('✅ Supabase连接成功:', data);
  }
}

testConnection();
```

---

## 🤖 Part 2: Claude API 配置

### 2.1 创建 API Key

```bash
# 步骤
1. 访问 https://console.anthropic.com
2. 注册账户（用公司邮箱）
3. 进入 API Keys
4. 点击 "Create Key"
5. 复制密钥（只显示一次！）
```

### 2.2 设置预算限制

```bash
# 在 console.anthropic.com → Settings → Billing
1. 设置 Monthly Budget: $1000
2. 设置 Alert at: 80% ($800)
3. 启用 Email Notifications
```

### 2.3 环境变量

```bash
# .env.local
CLAUDE_API_KEY=sk-ant-api03-xxxxx
```

### 2.4 测试调用

```typescript
// lib/ai/test-claude.ts
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function testClaude() {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: 'Say hello in 5 words or less' },
      ],
    });

    console.log('✅ Claude API 工作正常:');
    console.log(message.content);
  } catch (error) {
    console.error('❌ Claude API 错误:', error);
  }
}

testClaude();
```

### 2.5 成本估算

```typescript
// lib/ai/cost-calculator.ts
export function estimateClaudeCost(model: string, tokens: number): number {
  const pricing = {
    'claude-3-5-sonnet-20241022': {
      input: 0.003 / 1000,  // $3 per 1M input tokens
      output: 0.015 / 1000, // $15 per 1M output tokens
    },
  };

  // 假设 input:output = 1:3 的比例
  const inputTokens = tokens * 0.25;
  const outputTokens = tokens * 0.75;

  const rates = pricing[model];
  return (inputTokens * rates.input) + (outputTokens * rates.output);
}

// 示例：生成一篇1000字文章的成本
const tokens = 4000; // ~1000 words = ~4000 tokens
const cost = estimateClaudeCost('claude-3-5-sonnet-20241022', tokens);
console.log(`成本估算: $${cost.toFixed(4)}`); // ~$0.048
```

---

## 🔄 Part 3: OpenAI API 配置

### 3.1 创建 API Key

```bash
# 步骤
1. 访问 https://platform.openai.com
2. 注册账户
3. 进入 API Keys
4. 点击 "Create new secret key"
5. 复制密钥
```

### 3.2 设置预算

```bash
# 在 platform.openai.com → Settings → Billing
1. 添加支付方式
2. 设置 Monthly budget: $200
3. 启用 Email alerts
```

### 3.3 环境变量

```bash
# .env.local
OPENAI_API_KEY=sk-proj-xxxxx
```

### 3.4 测试调用

```typescript
// lib/ai/test-openai.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'user', content: 'Say hello in 5 words' },
      ],
    });

    console.log('✅ OpenAI API 工作正常:');
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error('❌ OpenAI API 错误:', error);
  }
}

testOpenAI();
```

### 3.5 智能模型路由器 (增强版)

```typescript
// lib/ai/smart-router.ts
type TaskComplexity = 'simple' | 'medium' | 'complex';

interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  costPer1kTokens: number;
}

export class SmartAIRouter {
  private models: Record<TaskComplexity, ModelConfig> = {
    simple: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      costPer1kTokens: 0.00015,
    },
    medium: {
      provider: 'openai',
      model: 'gpt-4o',
      costPer1kTokens: 0.003,
    },
    complex: {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      costPer1kTokens: 0.015,
    },
  };

  selectModel(taskType: string): ModelConfig {
    const complexityMap: Record<string, TaskComplexity> = {
      // Simple tasks (gpt-4o-mini)
      'keyword_extraction': 'simple',
      'title_generation': 'simple',
      'summarization': 'simple',

      // Medium tasks (gpt-4o)
      'seo_optimization': 'medium',
      'competitor_analysis': 'medium',

      // Complex tasks (Claude)
      'persona_generation': 'complex',
      'market_analysis': 'complex',
      'content_generation': 'complex',
      'strategic_recommendations': 'complex',
    };

    const complexity = complexityMap[taskType] || 'medium';
    return this.models[complexity];
  }

  async generateContent(taskType: string, prompt: string): Promise<string> {
    const config = this.selectModel(taskType);

    if (config.provider === 'anthropic') {
      return this.callClaude(config.model, prompt);
    } else {
      return this.callOpenAI(config.model, prompt);
    }
  }

  private async callClaude(model: string, prompt: string): Promise<string> {
    const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    const message = await client.messages.create({
      model,
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });
    return message.content[0].text;
  }

  private async callOpenAI(model: string, prompt: string): Promise<string> {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });
    return completion.choices[0].message.content || '';
  }
}

// 使用示例
const router = new SmartAIRouter();
const result = await router.generateContent('persona_generation', 'Analyze...');
```

**成本节省示例**：

```
原方案（全部使用Claude）:
  100个任务 × $0.015 = $1.50

优化方案（智能路由）:
  30个简单任务 × $0.00015 = $0.0045
  40个中等任务 × $0.003 = $0.12
  30个复杂任务 × $0.015 = $0.45
  总计 = $0.5745

节省: 62% ✅
```

---

## 🗄️ Part 4: Upstash Redis 配置

### 4.1 创建数据库

```bash
# 步骤
1. 访问 https://upstash.com
2. 注册账户（可用GitHub登录）
3. 点击 "Create Database"
4. 选择:
   - Name: automarketing-cache
   - Type: Regional
   - Region: 选择靠近你的区域
   - Eviction: 启用（当内存满时自动清理）
```

### 4.2 获取连接信息

```bash
# 在 Database Details 页面复制
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXxxxxx
```

### 4.3 环境变量

```bash
# .env.local
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXxxxxx
```

### 4.4 测试连接

```typescript
// lib/cache/test-redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

async function testRedis() {
  try {
    // 写入
    await redis.set('test-key', 'Hello Redis!');

    // 读取
    const value = await redis.get('test-key');

    console.log('✅ Redis 工作正常:', value);

    // 清理
    await redis.del('test-key');
  } catch (error) {
    console.error('❌ Redis 错误:', error);
  }
}

testRedis();
```

### 4.5 缓存管理器 (增强版)

```typescript
// lib/cache/manager.ts
import { Redis } from '@upstash/redis';

export class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  /**
   * 获取或生成缓存数据
   * @param key - 缓存键
   * @param ttl - 过期时间（秒）
   * @param fetcher - 数据获取函数
   */
  async getOrSet<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    // 尝试从缓存获取
    const cached = await this.redis.get<T>(key);
    if (cached !== null) {
      console.log(`✅ 缓存命中: ${key}`);
      return cached;
    }

    console.log(`❌ 缓存未命中: ${key}, 调用fetcher`);

    // 缓存未命中，调用fetcher获取数据
    const data = await fetcher();

    // 存入缓存
    await this.redis.setex(key, ttl, JSON.stringify(data));

    return data;
  }

  /**
   * 删除缓存
   */
  async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * 批量删除缓存（使用模式匹配）
   */
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// 使用示例
const cache = new CacheManager();

// 缓存AI响应
const personaData = await cache.getOrSet(
  `persona:${productId}`,
  86400, // 24小时
  async () => {
    // 调用Claude生成用户画像
    return await generatePersona(productId);
  }
);
```

**缓存策略**：

```typescript
// lib/cache/strategies.ts
export const CACHE_STRATEGIES = {
  // AI 响应缓存
  AI_RESPONSE: {
    ttl: 86400, // 24小时
    keyPrefix: 'ai:',
  },

  // 市场分析缓存
  MARKET_ANALYSIS: {
    ttl: 604800, // 7天
    keyPrefix: 'market:',
  },

  // SEO排名数据
  SEO_RANKINGS: {
    ttl: 86400, // 24小时
    keyPrefix: 'seo:',
  },

  // 内容草稿（临时）
  CONTENT_DRAFT: {
    ttl: 3600, // 1小时
    keyPrefix: 'draft:',
  },
};
```

---

## 🔗 Part 5: N8N 配置

### 选项A: N8N Cloud (推荐)

#### 5.1 创建账户

```bash
# 步骤
1. 访问 https://n8n.cloud
2. 注册账户
3. 创建 Workspace
4. 免费计划：5个工作流，2500次执行/月
```

#### 5.2 创建 Webhook

```bash
# 在 N8N 中
1. 新建 Workflow
2. 添加 "Webhook" 节点
3. 设置 HTTP Method: POST
4. 复制 Webhook URL
```

#### 5.3 环境变量

```bash
# .env.local
N8N_WEBHOOK_URL=https://xxxxx.app.n8n.cloud/webhook/xxxxx
```

### 选项B: 本地 Docker 部署

#### 5.1 安装 Docker

```bash
# macOS
brew install docker

# Windows
# 下载 Docker Desktop from docker.com
```

#### 5.2 创建 docker-compose.yml

```yaml
# docker-compose.yml
version: '3'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - N8N_PROTOCOL=http
      - N8N_PORT=5678
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password_here
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

#### 5.3 启动 N8N

```bash
# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 访问
open http://localhost:5678
```

#### 5.4 环境变量

```bash
# .env.local
N8N_WEBHOOK_URL=http://localhost:5678/webhook/xxxxx
```

### 5.5 测试 Webhook

```typescript
// lib/n8n/test-webhook.ts
async function testN8NWebhook() {
  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        test: 'data',
        timestamp: new Date().toISOString(),
      }),
    });

    const data = await response.json();
    console.log('✅ N8N Webhook 工作正常:', data);
  } catch (error) {
    console.error('❌ N8N Webhook 错误:', error);
  }
}

testN8NWebhook();
```

### 5.6 示例工作流：用户画像生成

在 N8N 中创建这个工作流：

```
[Webhook] → [HTTP Request: Claude API] → [HTTP Request: Supabase]
```

**节点配置**：

```json
// Webhook 节点
{
  "httpMethod": "POST",
  "path": "generate-persona",
  "responseMode": "lastNode"
}

// HTTP Request 节点 (Claude)
{
  "method": "POST",
  "url": "https://api.anthropic.com/v1/messages",
  "authentication": "headerAuth",
  "headerAuth": {
    "name": "x-api-key",
    "value": "={{$env.CLAUDE_API_KEY}}"
  },
  "body": {
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 4096,
    "messages": [
      {
        "role": "user",
        "content": "={{$json.prompt}}"
      }
    ]
  }
}

// HTTP Request 节点 (Supabase)
{
  "method": "POST",
  "url": "={{$env.SUPABASE_URL}}/rest/v1/user_personas",
  "authentication": "headerAuth",
  "headerAuth": {
    "name": "apikey",
    "value": "={{$env.SUPABASE_SERVICE_KEY}}"
  },
  "body": {
    "product_id": "={{$json.productId}}",
    "persona_name": "={{$json.personaName}}",
    "ai_insights": "={{$json.claudeResponse.content[0].text}}"
  }
}
```

---

## 🔍 Part 6: SerpAPI 配置 (增强版)

### 6.1 创建账户

```bash
# 步骤
1. 访问 https://serpapi.com
2. 注册账户
3. 选择计划:
   - Free: 100次搜索/月
   - Developer: $50/月, 5000次搜索
```

### 6.2 获取 API Key

```bash
# 在 Dashboard → API Key
SERPAPI_API_KEY=xxxxx
```

### 6.3 环境变量

```bash
# .env.local
SERPAPI_API_KEY=xxxxx
```

### 6.4 测试调用

```typescript
// lib/seo/test-serpapi.ts
async function testSerpAPI() {
  const params = new URLSearchParams({
    engine: 'google',
    q: 'automarketing software',
    api_key: process.env.SERPAPI_API_KEY!,
    location: 'United States',
    gl: 'us',
    hl: 'en',
  });

  try {
    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    console.log('✅ SerpAPI 工作正常:');
    console.log('排名前3:', data.organic_results.slice(0, 3));
  } catch (error) {
    console.error('❌ SerpAPI 错误:', error);
  }
}

testSerpAPI();
```

### 6.5 SEO 排名追踪器

```typescript
// lib/seo/ranking-tracker.ts
import { supabaseServer } from '@/lib/supabase/server';

export class SEORankingTracker {
  async checkRankings(contentId: string, keywords: string[]): Promise<void> {
    for (const keyword of keywords) {
      const position = await this.getKeywordPosition(keyword);

      // 保存到数据库
      await supabaseServer.from('seo_rankings').insert({
        content_id: contentId,
        keyword,
        position,
        search_volume: await this.getSearchVolume(keyword),
      });
    }
  }

  private async getKeywordPosition(keyword: string): Promise<number | null> {
    const params = new URLSearchParams({
      engine: 'google',
      q: keyword,
      api_key: process.env.SERPAPI_API_KEY!,
      location: 'United States',
    });

    const response = await fetch(`https://serpapi.com/search?${params}`);
    const data = await response.json();

    // 找到我们的URL在结果中的位置
    const ourUrl = process.env.NEXT_PUBLIC_APP_URL;
    const position = data.organic_results.findIndex(
      (result: any) => result.link.includes(ourUrl)
    );

    return position === -1 ? null : position + 1;
  }

  private async getSearchVolume(keyword: string): Promise<number> {
    // 使用 SerpAPI 的搜索量数据
    // 或集成 Google Keyword Planner API
    return 0; // 占位符
  }
}
```

---

## 📊 Part 7: Vercel 部署配置

### 7.1 安装 Vercel CLI

```bash
npm install -g vercel
```

### 7.2 登录

```bash
vercel login
```

### 7.3 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# AI APIs
CLAUDE_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-proj-xxx

# Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx

# N8N
N8N_WEBHOOK_URL=https://xxxxx.app.n8n.cloud/webhook/xxx

# SerpAPI
SERPAPI_API_KEY=xxxxx

# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 7.4 部署

```bash
# 本地测试
vercel dev

# 预览部署
vercel

# 生产部署
vercel --prod
```

---

## ✅ 完整的环境变量清单

创建 `.env.local` 文件：

```bash
# ============================================
# Supabase
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================
# AI APIs
# ============================================
CLAUDE_API_KEY=sk-ant-api03-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx

# ============================================
# Redis Cache (Upstash)
# ============================================
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXXxxxxx

# ============================================
# N8N Automation
# ============================================
N8N_WEBHOOK_URL=https://xxxxx.app.n8n.cloud/webhook/xxxxx

# ============================================
# SEO & Analytics
# ============================================
SERPAPI_API_KEY=xxxxx

# ============================================
# Application
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🧪 测试所有集成

创建一个综合测试脚本：

```typescript
// scripts/test-all-integrations.ts
import { testSupabase } from '@/lib/supabase/test';
import { testClaude } from '@/lib/ai/test-claude';
import { testOpenAI } from '@/lib/ai/test-openai';
import { testRedis } from '@/lib/cache/test-redis';
import { testN8NWebhook } from '@/lib/n8n/test-webhook';
import { testSerpAPI } from '@/lib/seo/test-serpapi';

async function testAllIntegrations() {
  console.log('🧪 开始测试所有集成...\n');

  const tests = [
    { name: 'Supabase', fn: testSupabase },
    { name: 'Claude API', fn: testClaude },
    { name: 'OpenAI API', fn: testOpenAI },
    { name: 'Redis Cache', fn: testRedis },
    { name: 'N8N Webhook', fn: testN8NWebhook },
    { name: 'SerpAPI', fn: testSerpAPI },
  ];

  const results = [];

  for (const test of tests) {
    try {
      console.log(`Testing ${test.name}...`);
      await test.fn();
      results.push({ name: test.name, status: '✅ 通过' });
    } catch (error) {
      results.push({ name: test.name, status: '❌ 失败', error });
    }
  }

  console.log('\n📊 测试结果:');
  console.table(results);

  const allPassed = results.every(r => r.status === '✅ 通过');
  if (allPassed) {
    console.log('\n🎉 所有集成测试通过！可以开始开发了。');
  } else {
    console.log('\n⚠️ 部分集成测试失败，请检查配置。');
  }
}

testAllIntegrations();
```

运行测试：

```bash
npx ts-node scripts/test-all-integrations.ts
```

---

## 📋 配置完成检查清单

```
□ Supabase 项目已创建
□ Supabase 数据库表已创建
□ Supabase 连接测试通过
□ Claude API Key 已获取
□ Claude API 调用测试通过
□ OpenAI API Key 已获取
□ OpenAI API 调用测试通过
□ Upstash Redis 已创建
□ Redis 连接测试通过
□ N8N 已部署（Cloud 或 Docker）
□ N8N Webhook 测试通过
□ SerpAPI Key 已获取
□ SerpAPI 调用测试通过
□ .env.local 文件已创建
□ 所有环境变量已填写
□ 综合集成测试通过
```

---

## 🚨 常见问题排查

### Supabase 连接失败

```bash
# 检查
1. URL 是否正确（应该是 https://xxxxx.supabase.co）
2. API Key 是否复制完整
3. 是否启用了 RLS（开发阶段应该用 SERVICE_ROLE_KEY）
```

### Claude API 429 错误

```bash
# 原因：超出速率限制
# 解决：
1. 检查 Billing 页面的使用量
2. 增加预算限制
3. 实现请求队列和速率限制
```

### Redis 连接超时

```bash
# 检查
1. URL 和 Token 是否正确
2. 网络是否稳定（中国访问可能需要代理）
3. Upstash 服务状态: https://status.upstash.com
```

### N8N Webhook 404

```bash
# 检查
1. Webhook URL 是否正确
2. N8N 工作流是否已激活
3. Webhook 节点的 Path 是否匹配
```

---

**下一步**: 完成所有配置后，阅读 `ENGINEER_ONBOARDING.md` 开始编码！
