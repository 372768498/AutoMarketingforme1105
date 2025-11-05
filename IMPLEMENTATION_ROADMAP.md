# 技术实现路线图和部署指南

**版本**: v1.0
**目标受众**: AI工程师 + 项目经理
**特殊考虑**: 在中国部署运维，第一个市场是美国

---

## 📋 概览

```
总周期: 10周
总成本: ~$2000-3000初期投资 + $1500-2000/月运营
团队规模: 1-2个AI工程师
主要技术栈: Next.js + Supabase + N8N + Claude API
```

---

## 第1周：环境配置和基础架构

### 目标
- 所有开发工具已安装
- Supabase项目已创建
- N8N已部署
- 代码仓库已初始化
- 开发环境可以运行

### 具体任务

#### 1.1 本地开发环境（你的电脑）

```bash
# 必要工具
- Node.js v18+ 已安装
- Git 已安装
- VS Code 或其他编辑器

# 项目初始化
git clone https://github.com/372768498/AutoMarketingforme1105.git
cd AutoMarketingforme1105
npm install

# 创建.env文件
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
CLAUDE_API_KEY=
N8N_WEBHOOK_URL=
```

#### 1.2 Supabase项目创建

```
步骤:
1. 访问 https://supabase.com
2. 点击"Start your project"
3. 选择区域: 选择最近的区域 (如Singapore或US-East)

   备注:
   - 从中国访问会有延迟
   - 可以配置CDN加速（后期）

4. 创建项目名: "automarketing-us"
5. 保存以下信息（很重要）：
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY)

6. 在Supabase中创建所有表 (参考 SCHEMA.sql)
```

#### 1.3 N8N部署

```
方案A: 本地Docker (推荐开发期)
  步骤:
  1. 确保Docker已安装
  2. 创建 docker-compose.yml
  3. 运行: docker-compose up
  4. 访问: http://localhost:5678
  5. 创建管理员账号

方案B: N8N Cloud (推荐生产环境)
  步骤:
  1. 访问 https://n8n.cloud
  2. 创建账号
  3. 创建新工作流
  4. 获取Webhook URL (用于Next.js调用)
```

#### 1.4 API密钥获取

```
Claude API:
  1. 访问 https://console.anthropic.com
  2. 创建账号 (用海外邮箱，或用Gmail)
  3. 创建 API Key
  4. 设置月度预算: $500 (防止意外扣费)
  5. 保存到 .env 文件

Google Analytics:
  1. 访问 https://analytics.google.com
  2. 创建新属性
  3. 获取 Measurement ID
  4. 后期集成

OpenAI API (备用):
  1. 访问 https://platform.openai.com
  2. 创建 API Key
  3. 设置月度预算: $100
```

### 验收标准
- ✅ Next.js项目本地能运行 (npm run dev)
- ✅ Supabase能连接 (测试查询)
- ✅ N8N能访问 (http://localhost:5678)
- ✅ Claude API能调用 (测试请求)
- ✅ 所有.env变量已设置

---

## 第2-3周：数据库和产品管理功能

### 目标
- Supabase数据库完全初始化
- 产品CRUD功能完成
- 可以创建、编辑、删除、查看产品

### 具体任务

#### 2.1 创建数据库表

```sql
-- 核心表
1. products
2. user_personas
3. market_analysis
4. content_pieces
5. content_performance
6. ai_tasks
7. content_calendar
8. optimization_insights

详细的创建语句参考: SCHEMA.sql
```

#### 2.2 Next.js产品管理页面

```
页面结构:
/app/dashboard/products/
  ├─ page.tsx (产品列表页)
  ├─ [id]/
  │  ├─ page.tsx (产品详情页)
  │  └─ edit.tsx (编辑页)
  └─ create.tsx (创建页)

功能需求:
□ 产品列表：显示所有产品（卡片式）
□ 创建产品：表单包含 name, description, type, target_markets等
□ 编辑产品：可修改基本信息
□ 删除产品：确认后删除
□ 产品详情：显示基本信息 + 画像 + 分析结果

使用库:
- shadcn/ui 组件
- Tailwind CSS 样式
- Zod 表单验证
- React Hook Form 表单管理
- Supabase JS客户端
```

#### 2.3 Supabase与Next.js连接

```typescript
// 创建 lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 在组件中使用
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('user_id', userId)
```

### 验收标准
- ✅ 能创建新产品（表单验证正确）
- ✅ 能查看产品列表
- ✅ 能编辑产品信息
- ✅ 能删除产品
- ✅ 数据正确保存到Supabase
- ✅ 页面加载速度 < 3秒

---

## 第4周：AI分析引擎 (N8N工作流)

### 目标
- N8N中完成"用户画像生成器"工作流
- 完成"市场分析器"工作流
- Next.js能调用这些工作流

### 具体任务

#### 4.1 N8N工作流：用户画像生成器

```
工作流名: persona-generator
触发方式: Webhook (从Next.js调用)

步骤:
1. Webhook节点：接收 product_id
2. Supabase节点：读取产品信息
3. Claude节点：调用Claude API
   - 使用global-market-research Skill
   - Prompt模板：见下方
4. 数据处理节点：解析Claude响应
5. Supabase节点：写入 user_personas表
6. 更新ai_tasks状态为'completed'
7. 返回成功响应

Prompt模板:
"""
分析以下产品，生成详细的用户画像：

产品名: {product_name}
产品描述: {description}
目标市场: {target_markets}
产品类型: {type}

请返回JSON格式的结果，包含：
{
  "persona_name": "...",
  "demographics": {
    "age_range": "...",
    "locations": [...],
    "income_range": "...",
    "job_titles": [...],
    "company_size": "..."
  },
  "psychographics": {
    "goals": [...],
    "pain_points": [...],
    "values": [...],
    "behaviors": [...]
  },
  "platforms": {
    "primary": [...],
    "secondary": [...]
  },
  "buying_triggers": [...],
  "ai_insights": "深度分析..."
}

请确保数据准确、详细且可行
"""

预期耗时: 2-3分钟
```

#### 4.2 N8N工作流：市场分析器

```
工作流名: market-analyzer
触发方式: Webhook 或 Cron (每周一早上8点)

步骤:
1. 获取所有active产品
2. 对每个产品并行执行:

   2.1 竞品分析
       - HTTP Request节点：调用SerpAPI
       - 搜索产品相关关键词
       - Claude解析结果

   2.2 趋势分析
       - HTTP Request节点：调用Google Trends API
       - Claude解读趋势

   2.3 渠道分析
       - 基于user_personas数据
       - Claude推荐最佳渠道

3. 写入market_analysis表
4. 如有重要发现，创建optimization_insights
5. 发送Slack通知
```

#### 4.3 Next.js调用N8N工作流

```typescript
// app/api/triggers/analyze-product.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { productId } = await req.json()

  // 创建ai_task记录
  const { data: task } = await supabase
    .from('ai_tasks')
    .insert({
      task_type: 'generate_persona',
      product_id: productId,
      status: 'pending'
    })

  // 调用N8N Webhook
  const response = await fetch(process.env.N8N_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      taskId: task.id
    })
  })

  return NextResponse.json({ success: true, taskId: task.id })
}

// 前端调用
async function analyzeProduct(productId: string) {
  const response = await fetch('/api/triggers/analyze-product', {
    method: 'POST',
    body: JSON.stringify({ productId })
  })
  const { taskId } = await response.json()

  // 轮询查看结果
  // 或使用Supabase Realtime监听ai_tasks表
}
```

### 验收标准
- ✅ N8N工作流能接收Webhook请求
- ✅ 工作流能调用Claude API
- ✅ 生成的用户画像包含所有必要信息
- ✅ 市场分析结果准确
- ✅ 所有数据正确保存到Supabase
- ✅ Next.js能成功调用工作流
- ✅ 显示进度提示（处理中...）

---

## 第5周：AI内容生成（关键里程碑）

### 目标
- 完成内容生成工作流
- 能生成SEO长文
- 能生成社交媒体内容
- 前端能正确显示生成结果

### 具体任务

#### 5.1 N8N工作流：内容生成器

```
工作流名: content-generator
触发方式: Webhook (从Next.js) 或 Cron (每天早上7点)

步骤:
1. 读取参数 (product_id, content_type)
2. 获取最新的user_persona和market_analysis
3. 根据content_type分支:

   【SEO长文生成】
   - 从market_analysis提取关键词
   - 调用SerpAPI获取SERP结果
   - 使用Claude生成大纲
   - 使用Claude生成完整文章
   - 计算SEO评分 (关键词密度、可读性等)

   【LinkedIn内容生成】
   - Prompt针对LinkedIn风格 (较短、专业、有号召力)
   - 生成150-300字的帖子

   【Twitter内容生成】
   - 生成5条推文的Thread
   - 使用分支(@开头、引用、#标签等)

4. 所有内容写入content_pieces表
5. 状态设为'pending_review'
6. 发送Slack通知

关键Prompt (SEO长文):
"""
产品: {product_name}
目标用户: {persona_summary}
市场洞察: {recent_trends}
竞品参考: {serp_top_articles}

要求:
- 2000-2500字
- 包含H1, H2, H3标签
- 在前200字内引入至少3个关键词
- 结构: 引言(100字) → 3-5个问题/小节 → 结论
- 包含实例和数据
- 最后有CTA (号召用户行动)

关键词目标: {keywords}
品牌语气: {brand_voice}

生成高质量的SEO优化文章
"""
```

#### 5.2 SEO评分算法

```javascript
function calculateSEOScore(content, keywords) {
  let score = 50 // 基础分

  // 检查关键词
  keywords.forEach(kw => {
    const count = (content.match(new RegExp(kw, 'gi')) || []).length
    if (count >= 3) score += 10 // 关键词出现3次以上
  })

  // 检查长度
  if (content.length >= 2000) score += 10

  // 检查标题
  if (title.match(/\[/)) score += 5 // 包含数字的标题更吸引

  // 检查段落长度（不应太长）
  const avgParagraphLength = getAvgParagraphLength(content)
  if (avgParagraphLength < 200) score += 10

  // 检查标题结构
  const headingCount = (content.match(/<h[2-3]/g) || []).length
  if (headingCount >= 3) score += 10

  // 计算可读性
  const readabilityScore = calculateReadability(content)
  score += readabilityScore

  return Math.min(score, 100) // 最多100分
}
```

#### 5.3 前端显示生成结果

```typescript
// app/dashboard/products/[id]/generate-content.tsx

export default function GenerateContent({ productId }) {
  const [contentType, setContentType] = useState('seo_article')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(null)

  async function handleGenerate() {
    setLoading(true)
    const response = await fetch('/api/content/generate', {
      method: 'POST',
      body: JSON.stringify({ productId, contentType })
    })
    const result = await response.json()
    setContent(result)
    setLoading(false)
  }

  if (loading) {
    return <LoadingSpinner message="生成中..." />
  }

  if (content) {
    return (
      <div>
        <h2>{content.title}</h2>
        <div>SEO评分: {content.seoScore}/100</div>
        <div>预测表现: {renderStars(content.predictedPerformance)}</div>
        <div className="content">{content.html}</div>
        <div className="actions">
          <button onClick={() => approve(content.id)}>批准</button>
          <button onClick={() => reject(content.id)}>拒绝</button>
          <button onClick={() => edit(content.id)}>编辑</button>
          <button onClick={() => regenerate()}>重新生成</button>
        </div>
        <div className="lineage">
          基于用户画像: {content.personaName}
          基于市场分析: {content.analysisNames.join(', ')}
        </div>
      </div>
    )
  }

  return (
    <div>
      <select value={contentType} onChange={e => setContentType(e.target.value)}>
        <option value="seo_article">SEO长文</option>
        <option value="linkedin_post">LinkedIn帖子</option>
        <option value="twitter_thread">Twitter Thread</option>
      </select>
      <button onClick={handleGenerate}>生成内容</button>
    </div>
  )
}
```

### 验收标准
- ✅ 能生成2000+字的SEO文章
- ✅ 文章包含合适的关键词和标题结构
- ✅ SEO评分 60-100分
- ✅ 能生成LinkedIn和Twitter内容
- ✅ 内容相关性高（与产品和用户画像匹配）
- ✅ 显示内容的"信息溯源"
- ✅ 可编辑、批准、拒绝、重新生成
- ✅ 生成时间 2-3分钟内完成

---

## 第6-7周：内容管理和发布

### 目标
- 完成内容列表和编辑页面
- 完成排期功能
- 完成发布工作台

### 具体任务

#### 6.1 内容管理页面

```typescript
// app/dashboard/content/page.tsx

功能:
□ 显示所有内容列表
□ 过滤: 产品、状态、类型、时间范围
□ 搜索功能
□ 批量操作 (选择多项 + 批量批准/拒绝)
□ 排序: 按创建时间、发布日期、表现等

内容卡片显示:
├─ 标题
├─ 产品名
├─ 内容类型 (SEO/LinkedIn/Twitter)
├─ 创建时间
├─ 状态 (draft/pending/approved/scheduled/published)
├─ SEO评分或预测表现
└─ 【查看】【编辑】【批准】【排期】

编辑页面:
├─ 富文本编辑器 (Tiptap)
├─ 【保存草稿】【预览】【提交修改】
├─ 显示修改历史 (可选)
└─ 显示内容溯源信息
```

#### 6.2 排期页面

```typescript
// 弹出窗口组件
function ScheduleContentModal({ content, onSchedule }) {
  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState('10:00')
  const [platform, setPlatform] = useState('wordpress')
  const [timezone, setTimezone] = useState('America/New_York')

  function handleSchedule() {
    // 检查冲突
    const conflict = checkScheduleConflict(date, time, platform)
    if (conflict) {
      showWarning('该时间已有其他内容排期')
      return
    }

    // 保存排期
    supabase.from('content_calendar').insert({
      content_id: content.id,
      scheduled_date: date,
      scheduled_time: time,
      platform,
      timezone
    })

    // 更新content_pieces状态
    supabase.from('content_pieces')
      .update({ status: 'scheduled' })
      .eq('id', content.id)

    onSchedule()
  }

  return (
    <Modal>
      <DatePicker value={date} onChange={setDate} />
      <TimePicker value={time} onChange={setTime} />
      <select value={platform}...>
        <option>WordPress</option>
        <option>LinkedIn</option>
        <option>Medium</option>
      </select>
      <button onClick={handleSchedule}>保存排期</button>
    </Modal>
  )
}
```

#### 6.3 发布工作台

```typescript
// app/dashboard/publish/today.tsx

显示:
【今日待发布】(X篇)

对每篇内容:
├─ 平台标签 [WordPress] / [LinkedIn]
├─ 标题
├─ 排期时间
├─ 【复制标题】【复制全文】【复制标签】
├─ 发布后填写:
│  ├─ 发布URL [输入框]
│  ├─ 状态 [成功/失败 下拉]
│  └─ 【标记为已发布】
└─ ...

当用户点击【标记为已发布】:
├─ 更新 content_pieces.status = 'published'
├─ 更新 content_calendar.status = 'published'
├─ 记录 published_at 和 published_url
├─ 自动创建Google Analytics UTM参数
├─ 保存发布信息
└─ 在Dashboard中开始追踪这个URL
```

### 验收标准
- ✅ 能看到内容列表（支持过滤和搜索）
- ✅ 能在线编辑内容（富文本编辑器正常）
- ✅ 能为内容排期（选择日期、平台、时间）
- ✅ 排期冲突检测正常
- ✅ 日历视图显示排期内容
- ✅ 能复制内容到剪贴板
- ✅ 能标记为已发布
- ✅ 发布时间和URL正确记录

---

## 第8周：数据追踪和Dashboard

### 目标
- 创建Google Analytics集成
- 创建Dashboard展示数据
- 自动采集数据并更新

### 具体任务

#### 8.1 Google Analytics集成

```typescript
// lib/google-analytics.ts
import { google } from 'googleapis'

export async function fetchAnalyticsData(propertyId, startDate, endDate) {
  const analyticsData = google.analyticsdata('v1beta')

  const response = await analyticsData.properties.runReport({
    property: `properties/${propertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pageTitle' },
        { name: 'pagePathAndQuery' }
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' }
      ]
    }
  })

  return response.data.rows
}
```

#### 8.2 N8N数据采集工作流

```
工作流名: daily-data-collector
触发方式: Cron (每天晚上11点)

步骤:
1. 获取过去24小时发布的内容
2. 对每篇内容:
   - 从Google Analytics获取流量数据
   - 从LinkedIn/Twitter API获取社交数据
   - 从UTM参数获取转化数据
3. 写入content_performance表
4. 计算是否有异常
5. 如有异常，发送告警
```

#### 8.3 Dashboard页面

```typescript
// app/dashboard/analytics/page.tsx

显示:
【KPI卡片】
├─ 总浏览量: 15,234 ↑23%
├─ 总互动: 1,245 ↑18%
├─ 生成线索: 87 ↑35%
└─ 预期收入: $8,700 ↑42%

【内容排名表】(Top 10)
├─ 标题 | 类型 | 浏览 | 互动 | 线索 | 收入

【平台对比】(柱状图)
├─ LinkedIn vs WordPress vs Twitter
├─ 各项指标对比

【趋势图】(折线图)
├─ 最近30天的浏览、互动、转化趋势

【AI建议】
├─ "LinkedIn表现最好，建议增加到每周3篇"
├─ "周二发布的内容平均表现最好"
└─ ...
```

### 验收标准
- ✅ Google Analytics数据能正确导入
- ✅ Dashboard显示所有KPI
- ✅ 数据每天自动更新
- ✅ 内容排名榜单正确
- ✅ 平台对比正确
- ✅ 趋势图显示历史数据
- ✅ AI建议有意义

---

## 第9周：优化和测试

### 目标
- 性能优化
- Bug修复
- 中国网络环境测试
- 完整功能测试

### 具体任务

#### 9.1 性能优化

```
□ 页面加载速度优化
  - Code splitting
  - 图片优化
  - 数据库查询优化
  - CDN配置

□ 数据库优化
  - 添加合适的索引
  - 查询计划分析
  - 连接池配置

□ API优化
  - 批量请求
  - 缓存策略
  - 错误处理
```

#### 9.2 中国网络测试

```
重要!
你在中国，需要特别测试:

□ Vercel访问速度 (<3秒)
  - 如果慢，配置CDN

□ Supabase访问速度 (<1秒)
  - 如果慢，考虑数据库副本

□ Claude API延迟
  - 正常延迟: 5-10秒
  - 如果超过30秒，检查网络

□ N8N访问速度
  - 取决于部署位置
```

#### 9.3 功能测试检查表

```
□ 所有产品管理功能
□ 所有内容生成功能
□ 所有编辑和排期功能
□ 所有发布和追踪功能
□ 所有Dashboard功能
□ 多种浏览器兼容性
□ 移动端响应式设计
□ 错误处理和提示
□ 数据保存完整性
```

### 验收标准
- ✅ 所有页面加载速度 <3秒
- ✅ 所有功能正常工作
- ✅ 没有明显的Bug
- ✅ 在中国正常访问
- ✅ 手机上正常显示

---

## 第10周：部署和交付

### 目标
- 前端部署到Vercel
- N8N部署到生产环境
- 所有密钥和环境变量配置正确
- 生产数据库配置
- 你能正常使用系统

### 具体任务

#### 10.1 Vercel部署

```
步骤:
1. 连接GitHub仓库到Vercel
2. 配置环境变量:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - CLAUDE_API_KEY
   - N8N_WEBHOOK_URL

3. 部署: git push → 自动部署到Vercel
4. 访问: https://automarketing-us.vercel.app (或你的自定义域名)

中国访问优化:
- Vercel已在全球有CDN
- 如果仍然慢，考虑Cloudflare Workers加速
```

#### 10.2 N8N生产部署

```
选项1: Docker (本地)
  - 继续使用本地Docker
  - 需要你的电脑24/7运行
  - 不稳定时需要重启

选项2: N8N Cloud (推荐)
  - 每月$10-20
  - 自动备份
  - 99.9% 可用性
  - 推荐使用

配置:
1. 创建N8N Cloud账号
2. 迁移所有工作流
3. 配置Webhook URL (从Next.js调用)
4. 测试所有工作流
```

#### 10.3 生产数据库配置

```
Supabase生产检查:
□ 启用Row-Level Security (RLS)
□ 配置自动备份
□ 配置日志和监控
□ 设置数据库连接限制
□ 配置HTTPS和域名

数据库链接:
主数据库 (读写): 你的Supabase项目
备份策略: 自动每日备份
恢复策略: 可恢复到过去7天任意时间
```

#### 10.4 监控和告警

```
配置:
□ Sentry (错误监控)
□ Vercel Analytics (性能监控)
□ Supabase Logs (数据库监控)
□ N8N 健康检查

关键告警:
- 网站访问错误 → 立即邮件通知
- 数据库连接失败 → 立即邮件通知
- N8N工作流失败 → Slack通知
- API配额接近限制 → 邮件通知
```

### 验收标准
- ✅ 网站能在 vercel.app 域名访问
- ✅ 在中国网络正常访问
- ✅ 所有环境变量正确配置
- ✅ N8N工作流在生产环境正常运行
- ✅ 数据库自动备份配置
- ✅ 监控和告警正常工作
- ✅ 你能正常使用系统进行工作

---

## 部署检查清单（交付时必须完成）

```
【基础设施】
□ Vercel项目已创建
□ N8N已部署
□ Supabase项目已创建
□ 所有密钥已安全存储

【代码质量】
□ TypeScript类型检查通过
□ ESLint无错误
□ 没有console.log在生产代码中
□ 所有功能测试通过

【安全性】
□ 敏感信息在环境变量中
□ 数据库RLS已配置
□ HTTPS已启用
□ CORS配置正确

【性能】
□ 所有页面加载<3秒
□ 数据库查询优化
□ CDN配置正确

【文档】
□ 部署指南已完成
□ 运维手册已完成
□ API文档已完成
□ 故障排查指南已完成

【监控】
□ 错误监控已配置
□ 性能监控已配置
□ 日志聚合已配置
□ 告警已测试
```

---

## 在中国网络环境下的特殊考虑

### 问题1：访问Vercel慢

```
解决方案:
1. 配置Cloudflare Worker加速
2. 使用阿里CDN
3. 自建反向代理

优先级: 中
```

### 问题2：Claude API超时

```
解决方案:
1. 使用API代理 (Rapidapi等)
2. 本地部署模型 (llama等)
3. 增加超时时间

优先级: 高
```

### 问题3：某些Google服务无法访问

```
解决方案:
1. Google Analytics: 通过代理访问
2. Google Trends: 可直接访问
3. 备用: 使用国内数据源

优先级: 中
```

### 最佳实践

```
□ 所有外部调用都添加超时和重试机制
□ 使用国内CDN加速静态资源
□ 定期测试中国网络连接
□ 有备用方案 (例如备用API源)
□ 监控国际网络延迟
```

---

## 常见问题和故障排查

### 问题1：N8N工作流失败

```
症状: Claude生成返回错误
原因:
- Claude API配额已用尽
- 请求超时
- Prompt格式错误

解决:
1. 检查Claude API余额
2. 增加超时时间
3. 检查Prompt格式
4. 查看N8N日志
```

### 问题2：内容生成很慢

```
症状: 用户等待5分钟还没结果
原因:
- Claude API响应慢
- 网络延迟
- 系统资源不足

解决:
1. 检查N8N日志
2. 优化Prompt (简化内容)
3. 升级N8N资源
4. 使用快速模型 (GPT-3.5而非Sonnet)
```

### 问题3：数据库连接错误

```
症状: "Could not connect to database"
原因:
- Supabase宕机
- 连接超时
- RLS权限问题

解决:
1. 检查Supabase状态页面
2. 检查.env变量
3. 检查RLS规则
```

---

## 成本预估（月度）

```
Vercel (Next.js托管):     $0-20
Supabase (数据库):         $0-100
N8N Cloud (自动化):        $10-50
Claude API (AI调用):       $500-1000
Google Analytics:          $0
总计:                       $510-1170/月

初期投资 (一次性):
- 开发人工:                 $2000-3000
- 域名和SSL:                $30
- 其他服务:                 $100-200
```

---

## 后续迭代

当第一版完成后，你可以：

1. 添加更多市场和语言
2. 自动化发布 (WordPress/LinkedIn)
3. 更高级的AI分析
4. 更多集成 (CRM、Email等)
5. 移动应用

但这些都可以后面再做，不影响现在的功能。

---

**总结**：

这份路线图提供了：
- ✅ 每周明确的任务
- ✅ 具体的技术指导
- ✅ 验收标准
- ✅ 中国网络特殊考虑
- ✅ 部署和运维指南

AI工程师按这份文档的指导，可以直接开始编码。不需要额外的讨论或澄清。
