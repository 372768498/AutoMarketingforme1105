# 每周任务详细清单
## AutoMarketing Pro - 增强版MVP

**目的**：10周开发周期的每周具体任务和验收标准

**面向**：AI工程师

**如何使用**：每周开始时阅读本周任务，周末对照验收清单检查完成情况

---

## 📅 Week 1: 基础设施和产品管理

### 目标
搭建完整的开发环境，实现产品CRUD功能，部署缓存系统基础

### 任务清单

#### Day 1-2: 环境配置

- [ ] **安装开发工具**
  ```bash
  # Node.js v18+
  node --version

  # pnpm
  npm install -g pnpm

  # Vercel CLI
  npm install -g vercel
  ```

- [ ] **Clone 代码仓库**
  ```bash
  git clone https://github.com/372768498/AutoMarketingforme1105.git
  cd AutoMarketingforme1105
  pnpm install
  ```

- [ ] **创建所有外部服务账户**
  - Supabase 项目
  - Claude API Key
  - OpenAI API Key
  - Upstash Redis
  - N8N (Cloud 或 Docker)
  - SerpAPI

  参考：`SETUP_CHECKLIST.md` 和 `API_AND_TOOLS.md`

- [ ] **配置 .env.local**
  ```bash
  # 复制所有必要的环境变量
  # 见 API_AND_TOOLS.md 的完整清单
  ```

- [ ] **初始化数据库**
  ```sql
  -- 在 Supabase SQL Editor 运行
  -- 见 API_AND_TOOLS.md Part 1.3
  ```

- [ ] **测试所有集成**
  ```bash
  npx ts-node scripts/test-all-integrations.ts
  # 应该全部 ✅ 通过
  ```

#### Day 3-4: 产品管理功能

- [ ] **创建类型定义**
  ```typescript
  // types/index.ts
  export interface Product {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    description?: string;
    type: 'B2B' | 'B2C' | 'B2B2C';
    category?: string;
    price_model?: string;
    target_markets: string[];
    target_languages: string[];
    status: 'active' | 'paused' | 'archived';
    metadata?: Record<string, any>;
  }
  ```

- [ ] **创建 Supabase 客户端**
  ```typescript
  // lib/supabase/client.ts
  import { createClient } from '@supabase/supabase-js';
  import type { Database } from '@/types/supabase';

  export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  ```

  ```typescript
  // lib/supabase/server.ts
  import { createClient } from '@supabase/supabase-js';
  import type { Database } from '@/types/supabase';

  export const supabaseServer = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  ```

- [ ] **创建 API 路由：Products CRUD**
  ```typescript
  // app/api/products/route.ts
  import { NextRequest } from 'next/server';
  import { supabaseServer } from '@/lib/supabase/server';

  export async function GET() {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }

  export async function POST(req: NextRequest) {
    const body = await req.json();

    const { data, error } = await supabaseServer
      .from('products')
      .insert(body)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }
  ```

  ```typescript
  // app/api/products/[id]/route.ts
  import { NextRequest } from 'next/server';
  import { supabaseServer } from '@/lib/supabase/server';

  export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 404 });
    }

    return Response.json({ data });
  }

  export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const body = await req.json();

    const { data, error } = await supabaseServer
      .from('products')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ data });
  }

  export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const { error } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true });
  }
  ```

- [ ] **创建产品列表页面**
  ```typescript
  // app/dashboard/products/page.tsx
  import { supabaseServer } from '@/lib/supabase/server';
  import { ProductList } from '@/components/products/ProductList';

  export default async function ProductsPage() {
    const { data: products } = await supabaseServer
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">产品管理</h1>
        <ProductList initialProducts={products || []} />
      </div>
    );
  }
  ```

- [ ] **创建产品表单组件**
  ```typescript
  // components/products/ProductForm.tsx
  'use client';

  import { useState } from 'react';
  import { Product } from '@/types';

  export function ProductForm({
    product,
    onSave
  }: {
    product?: Product;
    onSave: (data: any) => void;
  }) {
    const [formData, setFormData] = useState({
      name: product?.name || '',
      description: product?.description || '',
      type: product?.type || 'B2C',
      target_markets: product?.target_markets || [],
      target_languages: product?.target_languages || ['en-US'],
    });

    // 表单实现...
  }
  ```

#### Day 5: 缓存系统基础

- [ ] **实现缓存管理器**
  ```typescript
  // lib/cache/manager.ts
  // 见 API_AND_TOOLS.md Part 4.5 的完整实现
  ```

- [ ] **定义缓存策略**
  ```typescript
  // lib/cache/strategies.ts
  export const CACHE_TTL = {
    AI_RESPONSE: 86400,      // 24小时
    MARKET_ANALYSIS: 604800, // 7天
    SEO_RANKINGS: 86400,     // 24小时
    PRODUCT_DATA: 3600,      // 1小时
  };
  ```

- [ ] **测试缓存**
  ```bash
  npx ts-node lib/cache/test-redis.ts
  ```

### 验收标准 ✅

Week 1 结束时，应该能够：

```
□ 本地开发环境完全配置好
□ pnpm dev 能正常启动
□ 访问 http://localhost:3000 看到应用
□ 所有外部服务测试通过
□ 能创建新产品（表单验证正确）
□ 能看到产品列表（带分页）
□ 能编辑产品信息
□ 能删除产品（带确认对话框）
□ 数据正确保存到 Supabase
□ Redis 缓存系统可用
□ 没有 console 错误
□ 代码通过 lint 检查
□ 页面加载速度 <3秒
```

---

## 📅 Week 2-3: AI 分析引擎 + 智能路由

### 目标
实现AI用户画像生成、市场分析、智能模型路由、缓存优化

### 任务清单

#### Day 1: AI 基础架构

- [ ] **创建 AI 客户端封装**
  ```typescript
  // lib/ai/claude.ts
  import Anthropic from '@anthropic-ai/sdk';

  const client = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
  });

  export async function callClaude(
    messages: any[],
    options?: { model?: string; maxTokens?: number }
  ) {
    const message = await client.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      messages,
    });

    return message.content[0].text;
  }
  ```

  ```typescript
  // lib/ai/openai.ts
  import OpenAI from 'openai';

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  export async function callOpenAI(
    messages: any[],
    options?: { model?: string; maxTokens?: number }
  ) {
    const completion = await client.chat.completions.create({
      model: options?.model || 'gpt-4o',
      max_tokens: options?.maxTokens || 4096,
      messages,
    });

    return completion.choices[0].message.content || '';
  }
  ```

- [ ] **实现智能路由器**
  ```typescript
  // lib/ai/smart-router.ts
  // 见 API_AND_TOOLS.md Part 3.5 的完整实现
  ```

#### Day 2-3: Prompt 模板系统

- [ ] **创建 Prompt 模板**
  ```typescript
  // lib/ai/prompts/persona.ts
  export function generatePersonaPrompt(product: Product): string {
    return `你是一位资深的市场研究专家。请为以下产品生成详细的用户画像。

产品信息:
- 名称: ${product.name}
- 描述: ${product.description}
- 类型: ${product.type}
- 目标市场: ${product.target_markets.join(', ')}

请生成3-5个不同的用户画像，每个画像包括:

1. **基本信息**
   - 年龄范围
   - 性别
   - 地理位置
   - 职业/行业
   - 收入水平

2. **心理特征**
   - 价值观
   - 生活方式
   - 兴趣爱好
   - 消费习惯

3. **行为特征**
   - 常用平台 (社交媒体、搜索引擎等)
   - 内容偏好 (文字、视频、图片)
   - 购买决策因素
   - 购买触发点

4. **痛点和需求**
   - 当前面临的问题
   - 希望解决的需求
   - 为什么需要这个产品

请以 JSON 格式返回，结构如下:
{
  "personas": [
    {
      "name": "用户画像名称",
      "demographics": { ... },
      "psychographics": { ... },
      "platforms": [...],
      "content_preferences": {...},
      "buying_triggers": [...],
      "pain_points": [...],
      "needs": [...]
    }
  ]
}`;
  }
  ```

  ```typescript
  // lib/ai/prompts/market-analysis.ts
  export function generateMarketAnalysisPrompt(
    product: Product,
    market: string
  ): string {
    return `你是一位资深的市场分析师。请为以下产品在特定市场进行深度分析。

产品信息:
- 名称: ${product.name}
- 描述: ${product.description}
- 类型: ${product.type}

目标市场: ${market}

请分析以下方面:

1. **市场趋势**
   - 当前市场规模和增长率
   - 主要趋势和变化
   - 未来3-5年预测

2. **竞争对手分析**
   - 识别3-5个主要竞争对手
   - 每个竞争对手的优势和劣势
   - 市场份额分布

3. **市场机会**
   - 未被满足的需求
   - 竞争空白点
   - 进入市场的最佳时机

4. **关键词研究**
   - 20-30个高价值关键词
   - 每个关键词的:
     * 搜索意图 (信息型、交易型、导航型)
     * 竞争难度 (低、中、高)
     * 推荐优先级

5. **内容策略建议**
   - 应该创作什么类型的内容
   - 内容发布频率建议
   - 内容分发渠道建议

请以 JSON 格式返回。`;
  }
  ```

#### Day 4-5: 用户画像生成

- [ ] **创建 API 端点**
  ```typescript
  // app/api/products/[id]/personas/route.ts
  import { NextRequest } from 'next/server';
  import { supabaseServer } from '@/lib/supabase/server';
  import { SmartAIRouter } from '@/lib/ai/smart-router';
  import { generatePersonaPrompt } from '@/lib/ai/prompts/persona';
  import { CacheManager } from '@/lib/cache/manager';

  const router = new SmartAIRouter();
  const cache = new CacheManager();

  export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    // 获取产品信息
    const { data: product } = await supabaseServer
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // 使用缓存
    const cacheKey = `persona:${params.id}`;
    const result = await cache.getOrSet(
      cacheKey,
      86400, // 24小时
      async () => {
        // 生成 prompt
        const prompt = generatePersonaPrompt(product);

        // 调用 AI（智能路由到 Claude）
        const response = await router.generateContent(
          'persona_generation',
          prompt
        );

        // 解析响应
        const personas = JSON.parse(response);

        // 保存到数据库
        const saved = await Promise.all(
          personas.personas.map((persona: any) =>
            supabaseServer.from('user_personas').insert({
              product_id: params.id,
              persona_name: persona.name,
              demographics: persona.demographics,
              psychographics: persona.psychographics,
              platforms: persona.platforms,
              content_preferences: persona.content_preferences,
              buying_triggers: persona.buying_triggers,
              ai_insights: JSON.stringify(persona),
              confidence_score: 0.85,
            }).select()
          )
        );

        return saved.map(s => s.data);
      }
    );

    return Response.json({ data: result });
  }
  ```

#### Day 6-7: 市场分析

- [ ] **创建市场分析 API**
  ```typescript
  // app/api/products/[id]/market-analysis/route.ts
  // 类似的结构，使用 generateMarketAnalysisPrompt
  ```

- [ ] **创建前端页面**
  ```typescript
  // app/dashboard/products/[id]/analysis/page.tsx
  import { AnalysisView } from '@/components/analysis/AnalysisView';

  export default async function AnalysisPage({
    params,
  }: {
    params: { id: string };
  }) {
    // 获取产品、用户画像、市场分析
    // 传递给 AnalysisView 组件
  }
  ```

#### Day 8-9: 成本追踪

- [ ] **实现 AI 任务追踪**
  ```typescript
  // lib/ai/task-tracker.ts
  import { supabaseServer } from '@/lib/supabase/server';

  export class AITaskTracker {
    async trackTask(
      taskType: string,
      model: string,
      tokensUsed: number,
      costUSD: number
    ) {
      await supabaseServer.from('ai_tasks').insert({
        task_type: taskType,
        status: 'completed',
        model_used: model,
        tokens_used: tokensUsed,
        cost_usd: costUSD,
        completed_at: new Date().toISOString(),
      });
    }

    async getMonthlySpend(): Promise<number> {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data } = await supabaseServer
        .from('ai_tasks')
        .select('cost_usd')
        .gte('created_at', startOfMonth.toISOString());

      return data?.reduce((sum, task) => sum + Number(task.cost_usd), 0) || 0;
    }
  }
  ```

- [ ] **集成到 AI 路由器**
  ```typescript
  // 更新 SmartAIRouter 添加成本追踪
  ```

### 验收标准 ✅

Week 2-3 结束时，应该能够：

```
□ 选择一个产品，点击"生成用户画像"
□ 看到加载状态（任务队列）
□ 30秒内收到3-5个详细的用户画像
□ 每个画像包含完整的人口统计、心理特征、行为特征
□ 能查看市场分析（趋势、竞争对手、机会）
□ 能看到20-30个关键词建议
□ 重复请求时从缓存返回（<1秒）
□ 能查看本月AI成本总计
□ 能看到每个任务使用的模型（Claude vs GPT-4o vs GPT-4o-mini）
□ 智能路由正确工作（复杂任务用Claude，简单任务用GPT-4o-mini）
□ 成本比Week 1降低60%+
```

---

## 📅 Week 4-5: 内容生成 + 任务队列

### 目标
实现AI内容生成、任务队列系统、SEO优化、可读性分析

### 任务清单

#### Day 1-2: 任务队列系统

- [ ] **安装 BullMQ**
  ```bash
  pnpm add bullmq ioredis
  ```

- [ ] **创建队列配置**
  ```typescript
  // lib/queue/config.ts
  import { Queue, Worker } from 'bullmq';
  import Redis from 'ioredis';

  const connection = new Redis({
    host: process.env.UPSTASH_REDIS_HOST,
    port: Number(process.env.UPSTASH_REDIS_PORT),
    password: process.env.UPSTASH_REDIS_PASSWORD,
    maxRetriesPerRequest: null,
  });

  export const contentQueue = new Queue('content-generation', {
    connection,
  });

  export const analysisQueue = new Queue('analysis', {
    connection,
  });
  ```

- [ ] **创建 Worker**
  ```typescript
  // lib/queue/workers/content-worker.ts
  import { Worker, Job } from 'bullmq';
  import { generateContent } from '@/lib/ai/content-generator';

  export const contentWorker = new Worker(
    'content-generation',
    async (job: Job) => {
      console.log(`Processing job ${job.id}:`, job.data);

      const { productId, contentType, personaId } = job.data;

      // 更新任务状态为 processing
      await updateTaskStatus(job.data.taskId, 'processing');

      try {
        // 生成内容
        const content = await generateContent({
          productId,
          contentType,
          personaId,
        });

        // 保存到数据库
        await saveContent(content);

        // 更新任务状态为 completed
        await updateTaskStatus(job.data.taskId, 'completed', content);

        return { success: true, contentId: content.id };
      } catch (error) {
        // 更新任务状态为 failed
        await updateTaskStatus(job.data.taskId, 'failed', null, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: 5, // 同时处理5个任务
      limiter: {
        max: 10, // 每分钟最多10个
        duration: 60000,
      },
    }
  );

  contentWorker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  contentWorker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
  });
  ```

- [ ] **创建任务 API**
  ```typescript
  // app/api/queue/content/route.ts
  import { contentQueue } from '@/lib/queue/config';
  import { supabaseServer } from '@/lib/supabase/server';

  export async function POST(req: Request) {
    const { productId, contentType, personaId } = await req.json();

    // 创建任务记录
    const { data: task } = await supabaseServer
      .from('ai_tasks')
      .insert({
        task_type: 'content_generation',
        status: 'pending',
        input_data: { productId, contentType, personaId },
      })
      .select()
      .single();

    // 添加到队列
    const job = await contentQueue.add('generate', {
      taskId: task.id,
      productId,
      contentType,
      personaId,
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });

    return Response.json({
      taskId: task.id,
      jobId: job.id,
    });
  }
  ```

#### Day 3-4: 内容生成器

- [ ] **创建内容生成 Prompt**
  ```typescript
  // lib/ai/prompts/content.ts
  export function generateContentPrompt(
    product: Product,
    persona: UserPersona,
    contentType: string,
    keywords: string[]
  ): string {
    const prompts = {
      blog: `写一篇专业的博客文章...`,
      social: `写一条社交媒体帖子...`,
      email: `写一封营销邮件...`,
    };

    return prompts[contentType] || prompts.blog;
  }
  ```

- [ ] **实现内容生成器**
  ```typescript
  // lib/ai/content-generator.ts
  import { SmartAIRouter } from './smart-router';
  import { generateContentPrompt } from './prompts/content';
  import { analyzeSEO } from './seo-analyzer';
  import { analyzeReadability } from './readability-analyzer';

  export async function generateContent({
    productId,
    contentType,
    personaId,
  }: {
    productId: string;
    contentType: string;
    personaId: string;
  }) {
    // 获取产品和用户画像
    const product = await getProduct(productId);
    const persona = await getPersona(personaId);

    // 获取关键词
    const keywords = await getKeywords(productId);

    // 生成 prompt
    const prompt = generateContentPrompt(
      product,
      persona,
      contentType,
      keywords
    );

    // 使用智能路由生成内容
    const router = new SmartAIRouter();
    const content = await router.generateContent('content_generation', prompt);

    // SEO分析
    const seoScore = await analyzeSEO(content, keywords);

    // 可读性分析
    const readabilityScore = await analyzeReadability(content);

    return {
      content,
      seoScore,
      readabilityScore,
      keywords,
    };
  }
  ```

#### Day 5-6: SEO 和可读性分析

- [ ] **实现 SEO 分析器**
  ```typescript
  // lib/ai/seo-analyzer.ts
  export async function analyzeSEO(
    content: string,
    keywords: string[]
  ): Promise<number> {
    let score = 0;

    // 1. 关键词密度 (30分)
    const keywordDensity = calculateKeywordDensity(content, keywords);
    score += Math.min(keywordDensity * 30, 30);

    // 2. 标题优化 (20分)
    const hasH1 = /<h1>.*<\/h1>/i.test(content);
    if (hasH1) score += 20;

    // 3. 内容长度 (20分)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 1000) score += 20;
    else if (wordCount >= 500) score += 10;

    // 4. 内部链接 (15分)
    const linkCount = (content.match(/<a href/g) || []).length;
    score += Math.min(linkCount * 5, 15);

    // 5. 图片 Alt 文本 (15分)
    const altTexts = content.match(/alt="[^"]+"/g) || [];
    score += Math.min(altTexts.length * 5, 15);

    return score;
  }
  ```

- [ ] **实现可读性分析器**
  ```typescript
  // lib/ai/readability-analyzer.ts
  export function analyzeReadability(content: string): number {
    // Flesch Reading Ease Score
    const sentences = content.split(/[.!?]+/).length;
    const words = content.split(/\s+/).length;
    const syllables = countSyllables(content);

    const score =
      206.835 -
      1.015 * (words / sentences) -
      84.6 * (syllables / words);

    // 转换到 0-100 分
    return Math.max(0, Math.min(100, score));
  }

  function countSyllables(text: string): number {
    // 简化的音节计数
    const words = text.toLowerCase().split(/\s+/);
    return words.reduce((count, word) => {
      const vowels = word.match(/[aeiou]{1,2}/g);
      return count + (vowels?.length || 1);
    }, 0);
  }
  ```

#### Day 7: 前端集成

- [ ] **创建内容生成页面**
  ```typescript
  // app/dashboard/products/[id]/content/new/page.tsx
  import { ContentGenerator } from '@/components/content/ContentGenerator';

  export default function NewContentPage({
    params,
  }: {
    params: { id: string };
  }) {
    return <ContentGenerator productId={params.id} />;
  }
  ```

- [ ] **创建内容编辑器组件**
  ```typescript
  // components/content/ContentEditor.tsx
  'use client';

  import { useState } from 'react';
  import { RichTextEditor } from './RichTextEditor';
  import { SEOScoreDisplay } from './SEOScoreDisplay';
  import { ReadabilityScoreDisplay } from './ReadabilityScoreDisplay';

  export function ContentEditor({
    initialContent,
    onSave
  }: {
    initialContent?: string;
    onSave: (content: string) => void;
  }) {
    const [content, setContent] = useState(initialContent || '');
    const [seoScore, setSeoScore] = useState(0);
    const [readabilityScore, setReadabilityScore] = useState(0);

    // 实时分析
    useEffect(() => {
      const analyze = async () => {
        const seo = await analyzeSEO(content, keywords);
        const readability = analyzeReadability(content);
        setSeoScore(seo);
        setReadabilityScore(readability);
      };

      const debounced = debounce(analyze, 500);
      debounced();
    }, [content]);

    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <RichTextEditor
            value={content}
            onChange={setContent}
          />
        </div>
        <div className="col-span-1">
          <SEOScoreDisplay score={seoScore} />
          <ReadabilityScoreDisplay score={readabilityScore} />
        </div>
      </div>
    );
  }
  ```

### 验收标准 ✅

Week 4-5 结束时，应该能够：

```
□ 选择一个产品和用户画像
□ 选择内容类型（博客、社交媒体、邮件）
□ 点击"生成内容"
□ 任务立即返回 taskId（不等待完成）
□ 看到任务进度（pending → processing → completed）
□ 1-2分钟内收到生成的内容
□ 内容长度合适（博客1000字+，社交媒体100字）
□ 内容包含目标关键词
□ 能看到实时的 SEO 分数（0-100）
□ 能看到可读性分数（0-100）
□ 能在富文本编辑器中编辑内容
□ 修改内容时，分数实时更新
□ 能保存内容为草稿
□ 任务失败时自动重试（最多3次）
□ 队列中有多个任务时按顺序处理
```

---

## 📅 Week 6-7: 内容管理和排期

### 目标
实现内容日历、排期系统、批量生成、版本管理

### 任务清单

#### Day 1-2: 内容日历

- [ ] **创建日历视图**
  ```typescript
  // app/dashboard/calendar/page.tsx
  import { Calendar } from '@/components/calendar/Calendar';

  export default async function CalendarPage() {
    const scheduledContent = await getScheduledContent();

    return (
      <div>
        <h1>内容日历</h1>
        <Calendar events={scheduledContent} />
      </div>
    );
  }
  ```

- [ ] **实现拖拽排期**
  ```bash
  pnpm add @dnd-kit/core @dnd-kit/sortable
  ```

#### Day 3-4: 批量生成

- [ ] **创建批量生成 API**
  ```typescript
  // app/api/products/[id]/content/batch/route.ts
  export async function POST(req: Request) {
    const { contentTypes, count } = await req.json();

    // 为每个内容类型创建多个任务
    const jobs = [];
    for (const type of contentTypes) {
      for (let i = 0; i < count; i++) {
        const job = await contentQueue.add('generate', {
          productId: params.id,
          contentType: type,
        });
        jobs.push(job.id);
      }
    }

    return Response.json({ jobs });
  }
  ```

#### Day 5-6: 发布管理

- [ ] **创建发布工作流**
  ```typescript
  // 状态机: draft → ready → scheduled → published
  ```

#### Day 7: 内容性能预测

- [ ] **使用 AI 预测内容表现**
  ```typescript
  // lib/ai/performance-predictor.ts
  export async function predictPerformance(content: string) {
    const prompt = `基于这篇内容，预测它的表现...`;
    // 调用 AI 分析
  }
  ```

### 验收标准 ✅

```
□ 能在日历视图中看到所有排期内容
□ 能拖拽调整发布日期
□ 能批量生成10篇博客（自动排期到未来10天）
□ 能查看每篇内容的状态
□ 能将内容标记为"准备发布"
□ 能看到内容的预测表现分数
□ 能按产品、日期、状态筛选内容
```

---

## 📅 Week 8: SEO追踪 + 竞品监控

### 目标
实现SEO排名追踪、竞品监控、自动报告

### 任务清单

#### Day 1-2: SEO 排名追踪

- [ ] **实现排名检查器**
  ```typescript
  // lib/seo/ranking-tracker.ts
  // 见 API_AND_TOOLS.md Part 6.5
  ```

- [ ] **创建定时任务（N8N）**
  ```
  每周检查所有内容的关键词排名
  ```

#### Day 3-4: 竞品监控

- [ ] **实现竞品爬虫**
  ```typescript
  // lib/competitors/scraper.ts
  export async function scrapeCompetitor(url: string) {
    // 使用 Cheerio 或 Puppeteer 抓取竞品网站
  }
  ```

- [ ] **AI 分析竞品内容**
  ```typescript
  // 调用 AI 分析竞品的内容策略、关键词、发布频率
  ```

#### Day 5-6: Dashboard 和报告

- [ ] **创建分析 Dashboard**
  ```typescript
  // 显示：
  // - SEO排名趋势图
  // - 竞品动态
  // - 内容表现对比
  ```

### 验收标准 ✅

```
□ 能追踪20个关键词的排名
□ 能看到排名变化趋势图
□ 能监控3个竞品
□ 能看到竞品的最新内容
□ 能看到AI生成的竞品分析报告
□ 能导出周报（PDF）
```

---

## 📅 Week 9-10: 优化、测试、部署

### 目标
性能优化、完整测试、生产部署、文档完善

### 任务清单

#### Week 9

- [ ] **性能优化**
  - 图片懒加载
  - 代码分割
  - 缓存优化
  - API响应时间优化

- [ ] **测试覆盖**
  - 单元测试（Jest）
  - 集成测试
  - E2E测试（Playwright）

- [ ] **错误处理**
  - 全局错误边界
  - API错误处理
  - 用户友好的错误信息

#### Week 10

- [ ] **部署到 Vercel**
  ```bash
  vercel --prod
  ```

- [ ] **配置监控**
  - Sentry 错误监控
  - Vercel Analytics

- [ ] **文档完善**
  - API文档
  - 用户手册
  - 运维手册

### 验收标准 ✅

```
□ 所有页面 Lighthouse 分数 >90
□ 测试覆盖率 >80%
□ 所有API都有错误处理
□ 生产环境部署成功
□ 监控和告警配置完成
□ 文档齐全
□ PM 最终验收通过
```

---

## 📊 总体进度追踪

```
Week 1:    [████████████████████] 100% - 基础设施
Week 2-3:  [████████████████████] 100% - AI分析引擎
Week 4-5:  [████████████████████] 100% - 内容生成
Week 6-7:  [████████████████████] 100% - 内容管理
Week 8:    [████████████████████] 100% - SEO追踪
Week 9-10: [████████████████████] 100% - 部署上线
```

---

**每周五**: 提交 Pull Request，PM 验收
**遇到问题**: 立即在 GitHub Issue 中反馈
**每日进度**: 在 Slack/钉钉 更新

**祝你编码愉快！** 🚀
