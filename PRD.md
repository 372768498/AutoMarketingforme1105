# AI驱动的全球营销自动化系统 - 产品需求文档 (PRD)

**版本**: v1.0
**创建日期**: 2025-11-05
**项目代号**: AutoMarketing Pro

---

## 📋 目录
1. [项目概述](#项目概述)
2. [核心目标](#核心目标)
3. [系统架构](#系统架构)
4. [数据模型设计](#数据模型设计)
5. [功能模块详解](#功能模块详解)
6. [关键业务流程](#关键业务流程)
7. [技术栈](#技术栈)
8. [开发路线图](#开发路线图)
9. [风险与注意事项](#风险与注意事项)

---

## 项目概述

### 问题定义
当前有多个优质产品需要在全球市场（B2B/B2C）销售，但缺乏：
- 系统化的市场分析能力
- 自动化的精准内容生成
- 数据驱动的内容迭代机制
- 多产品统一管理平台

### 解决方案
构建一个**AI驱动的营销自动化系统**，实现：
1. **智能分析**：产品分析 → 用户画像 → 市场研究
2. **内容生产**：基于分析结果自动生成多渠道营销内容
3. **内容管理**：统一排期表，支持手动审核与发布
4. **数据闭环**：追踪内容表现 → 反馈优化 → 迭代升级

### 核心价值主张
- ✅ **多产品管理**：一个系统管理N个产品的营销活动
- ✅ **信息串联**：画像→分析→内容→数据的完整闭环
- ✅ **人工把控**：前期100%人工审核，逐步增加自动化
- ✅ **持久化数据**：所有分析和数据永久保存，支持长期优化

---

## 核心目标

### 业务目标
1. 提升获客效率：从手动产出到AI辅助，提升10倍内容产出
2. 精准触达：通过数据分析提升内容-用户匹配度
3. 成本控制：减少70%的内容创作人力成本
4. 规模化复制：一套系统适配多个产品和市场

### 技术目标
1. 系统稳定性：99%+可用率
2. 数据准确性：AI生成内容准确率>90%
3. 响应速度：内容生成<2分钟，Dashboard加载<1秒
4. 可扩展性：支持100+产品，10000+条内容管理

---

## 系统架构

### 整体架构图
```
┌──────────────────────────────────────────────────────────┐
│                    用户交互层                              │
│  Web应用 (Next.js + Vercel)                               │
│  - 产品管理中心                                            │
│  - 内容审核与排期                                          │
│  - 数据分析Dashboard                                       │
└────────────────────┬─────────────────────────────────────┘
                     │ REST API / GraphQL
┌────────────────────▼─────────────────────────────────────┐
│                    数据层                                  │
│  Supabase (PostgreSQL + Realtime + Edge Functions)       │
│  - 产品信息库                                              │
│  - 用户画像数据                                            │
│  - 市场分析结果                                            │
│  - 内容库（草稿/已发布）                                    │
│  - 性能数据追踪                                            │
└────────────────────┬─────────────────────────────────────┘
                     │ Webhooks / Cron
┌────────────────────▼─────────────────────────────────────┐
│                    自动化层                                │
│  N8N (Docker本地部署)                                      │
│  工作流1: 市场分析引擎                                      │
│  工作流2: 内容生成引擎                                      │
│  工作流3: 数据采集引擎                                      │
│  工作流4: 内容发布执行器（后期）                             │
└────────────────────┬─────────────────────────────────────┘
                     │ API调用
┌────────────────────▼─────────────────────────────────────┐
│                    AI服务层                                │
│  - Claude API (战略分析、长文内容)                         │
│  - OpenAI API (快速文案、创意)                             │
│  - Google APIs (Trends, Analytics)                        │
│  - SerpAPI (竞品分析)                                      │
└──────────────────────────────────────────────────────────┘
```

### 数据流向
```
1. 输入：用户在Web创建新产品 → 存入Supabase
2. 分析：N8N定时触发 → 调用Claude分析 → 结果存Supabase
3. 生成：基于分析结果 → N8N调用AI生成内容 → 存入内容库（待审核）
4. 审核：用户在Web查看 → 编辑/批准 → 标记为"待发布"
5. 发布：用户手动发布到各平台 → 记录发布信息
6. 追踪：Google Analytics/平台API → N8N定时抓取 → 存入Supabase
7. 迭代：每周AI分析数据 → 生成优化建议 → 新一轮内容生成
```

---

## 数据模型设计

### Supabase数据库表结构

#### 1. products（产品表）
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 基础信息
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'B2B' | 'B2C' | 'B2B2C'
  category VARCHAR(100),
  price_model VARCHAR(50), -- 'subscription' | 'one-time' | 'freemium'

  -- 目标市场
  target_markets JSONB, -- ['US', 'UK', 'EU']
  target_languages JSONB, -- ['en-US', 'zh-CN']

  -- 状态
  status VARCHAR(50) DEFAULT 'active', -- 'active' | 'paused' | 'archived'

  -- 元数据
  metadata JSONB -- 自定义字段扩展
);
```

#### 2. user_personas（用户画像表）
```sql
CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 画像基础
  persona_name VARCHAR(255), -- "Tech-Savvy SaaS Founder"
  demographics JSONB, -- {age_range, location, income, education}
  psychographics JSONB, -- {goals, pain_points, values, behaviors}

  -- 行为特征
  platforms JSONB, -- 他们活跃的平台 ['LinkedIn', 'Twitter', 'Reddit']
  content_preferences JSONB, -- 喜欢的内容类型
  buying_triggers JSONB, -- 购买触发因素

  -- AI生成的洞察
  ai_insights TEXT, -- Claude生成的深度分析
  confidence_score FLOAT, -- AI分析的置信度

  -- 版本控制
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);
```

#### 3. market_analysis（市场分析表）
```sql
CREATE TABLE market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  persona_id UUID REFERENCES user_personas(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 分析类型
  analysis_type VARCHAR(50), -- 'competitor' | 'trend' | 'channel' | 'keyword'
  market VARCHAR(50), -- 'US' | 'global'

  -- 分析结果
  findings JSONB, -- 结构化的发现
  raw_data JSONB, -- 原始数据
  ai_summary TEXT, -- AI生成的总结

  -- 来源
  data_sources JSONB, -- ['Google Trends', 'SerpAPI', 'Reddit']

  -- 有效期
  valid_until TIMESTAMP WITH TIME ZONE, -- 分析的时效性

  -- 索引优化
  created_at_date DATE GENERATED ALWAYS AS (created_at::date) STORED
);

CREATE INDEX idx_market_analysis_product ON market_analysis(product_id);
CREATE INDEX idx_market_analysis_date ON market_analysis(created_at_date);
```

#### 4. content_pieces（内容库表）
```sql
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 内容基础
  title VARCHAR(500),
  content TEXT NOT NULL,
  content_type VARCHAR(50), -- 'seo_article' | 'linkedin_post' | 'tweet' | 'email'
  language VARCHAR(10) DEFAULT 'en-US',

  -- 关联信息（信息串联的关键）
  based_on_persona_id UUID REFERENCES user_personas(id),
  based_on_analysis_ids JSONB, -- 基于哪些市场分析

  -- SEO/优化数据
  keywords JSONB, -- 目标关键词
  seo_score FLOAT, -- SEO评分
  readability_score FLOAT,

  -- 状态流转
  status VARCHAR(50) DEFAULT 'draft',
  -- 'draft' → 'pending_review' → 'approved' → 'scheduled' → 'published' → 'archived'

  -- 排期信息
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  publish_platform VARCHAR(100), -- 'wordpress' | 'linkedin' | 'medium'
  publish_url TEXT,

  -- 性能预测
  predicted_performance JSONB, -- AI预测的表现

  -- 版本控制
  version INT DEFAULT 1,
  parent_content_id UUID REFERENCES content_pieces(id), -- 如果是迭代版本

  -- 元数据
  metadata JSONB
);

CREATE INDEX idx_content_product ON content_pieces(product_id);
CREATE INDEX idx_content_status ON content_pieces(status);
CREATE INDEX idx_content_scheduled ON content_pieces(scheduled_date);
```

#### 5. content_performance（内容性能表）
```sql
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES content_pieces(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 流量数据
  page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  avg_time_on_page FLOAT, -- 秒
  bounce_rate FLOAT,

  -- 互动数据
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,

  -- 转化数据
  leads_generated INT DEFAULT 0,
  conversions INT DEFAULT 0,
  revenue DECIMAL(10, 2),

  -- 数据来源
  source VARCHAR(100), -- 'google_analytics' | 'linkedin_api' | 'manual'
  raw_data JSONB,

  -- 日期索引
  recorded_date DATE GENERATED ALWAYS AS (recorded_at::date) STORED
);

CREATE INDEX idx_performance_content ON content_performance(content_id);
CREATE INDEX idx_performance_date ON content_performance(recorded_date);
```

#### 6. ai_tasks（AI任务表）
```sql
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  -- 任务信息
  task_type VARCHAR(100), -- 'generate_persona' | 'market_analysis' | 'content_generation'
  product_id UUID REFERENCES products(id),

  -- 执行状态
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'running' | 'completed' | 'failed'
  progress INT DEFAULT 0, -- 0-100

  -- 输入输出
  input_params JSONB,
  output_result JSONB,
  error_message TEXT,

  -- 性能指标
  tokens_used INT,
  cost DECIMAL(10, 4),
  execution_time INT, -- 毫秒

  -- AI模型信息
  ai_provider VARCHAR(50), -- 'claude' | 'openai'
  model_version VARCHAR(50)
);

CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_product ON ai_tasks(product_id);
```

#### 7. content_calendar（内容日历表）
```sql
CREATE TABLE content_calendar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  content_id UUID REFERENCES content_pieces(id) ON DELETE SET NULL,

  -- 排期信息
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- 平台信息
  platform VARCHAR(100), -- 'wordpress' | 'linkedin' | 'twitter'
  platform_account VARCHAR(255), -- 如果有多个账号

  -- 状态
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled' | 'published' | 'cancelled' | 'failed'

  -- 发布信息
  published_at TIMESTAMP WITH TIME ZONE,
  published_url TEXT,

  -- 备注
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calendar_date ON content_calendar(scheduled_date);
CREATE INDEX idx_calendar_product ON content_calendar(product_id);
```

#### 8. optimization_insights（优化洞察表）
```sql
CREATE TABLE optimization_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 分析周期
  analysis_period_start DATE,
  analysis_period_end DATE,

  -- 洞察内容
  insight_type VARCHAR(100), -- 'content_performance' | 'channel_effectiveness' | 'audience_shift'
  title VARCHAR(500),
  description TEXT,
  ai_recommendation TEXT, -- AI生成的建议

  -- 数据支撑
  supporting_data JSONB, -- 支持该洞察的数据
  confidence_score FLOAT,

  -- 行动建议
  suggested_actions JSONB, -- [{"action": "increase_linkedin_posts", "priority": "high"}]

  -- 执行状态
  status VARCHAR(50) DEFAULT 'new', -- 'new' | 'reviewed' | 'actioned' | 'dismissed'
  actioned_at TIMESTAMP WITH TIME ZONE
);
```

---

## 功能模块详解

### 模块1：产品管理中心

**功能描述**：多产品的CRUD和配置管理

**页面组成**：
- 产品列表页（卡片式，显示状态、目标市场、内容数量）
- 产品详情页（基础信息、用户画像、市场分析、内容库）
- 产品创建/编辑表单

**核心功能**：
1. ✅ 创建新产品
   - 输入：名称、描述、类型、目标市场、定价模型
   - 保存到 `products` 表

2. ✅ 触发AI分析
   - 点击"生成用户画像"按钮
   - 调用N8N Webhook → 启动分析工作流
   - 实时显示任务进度（通过 `ai_tasks` 表）

3. ✅ 查看分析结果
   - 用户画像卡片（demographics, psychographics, platforms）
   - 市场分析报告（竞品、趋势、渠道建议）
   - 支持导出PDF/Markdown

**技术要点**：
- 使用 Supabase Realtime 监听 `ai_tasks` 状态变化
- 前端用 Zustand/Jotai 管理状态
- 图表使用 Recharts 或 Tremor

---

### 模块2：智能分析引擎（N8N工作流）

**工作流2.1：用户画像生成器**

```
触发器: Webhook (从Web应用调用)
输入: product_id

步骤1: 从Supabase读取产品信息
  ↓
步骤2: 构建Prompt（包含产品描述、目标市场）
  ↓
步骤3: 调用Claude API
  - 使用你的 global-market-research Skill
  - Prompt模板：
    """
    分析产品：{product_name}
    目标市场：{target_markets}

    请生成详细的用户画像，包括：
    1. 人口统计学特征（年龄、地域、收入）
    2. 心理特征（目标、痛点、价值观）
    3. 行为特征（活跃平台、内容偏好）
    4. 购买触发因素

    以JSON格式返回，并附上深度分析。
    """
  ↓
步骤4: 解析Claude响应
  ↓
步骤5: 写入 user_personas 表
  ↓
步骤6: 更新 ai_tasks 状态为 'completed'
  ↓
返回: persona_id
```

**工作流2.2：市场分析器**

```
触发器: Cron (每周一早上8点) 或 Webhook

步骤1: 获取所有 active 产品
  ↓
步骤2: 对每个产品并行执行：

  2.1 竞品分析
    - 调用 SerpAPI 搜索相关产品
    - Claude总结竞品特点、定价、营销策略

  2.2 趋势分析
    - Google Trends API 获取搜索趋势
    - Reddit/HackerNews热度分析
    - Claude解读趋势含义

  2.3 渠道分析
    - 基于用户画像推荐最佳渠道
    - 分析各渠道的内容形式
  ↓
步骤3: 结果写入 market_analysis 表（附带 valid_until = 7天后）
  ↓
步骤4: 如果发现重大变化，创建 optimization_insights
```

---

### 模块3：内容生产引擎（N8N工作流）

**工作流3.1：内容生成器**

```
触发器: Cron (每天早上7点) 或 手动触发

步骤1: 读取产品列表
  ↓
步骤2: 对每个产品：

  2.1 读取最新的用户画像和市场分析
  ↓
  2.2 确定今日内容计划（基于规则或AI决策）
    - 例如：周一生成2篇SEO文章，周三生成5条LinkedIn帖子
  ↓
  2.3 对每种内容类型调用生成子流程：

    子流程A: SEO文章生成
      - 输入：product, persona, recent_analysis
      - 步骤1: 关键词研究（基于market_analysis）
      - 步骤2: SERP分析（SerpAPI获取Top 10）
      - 步骤3: Claude生成大纲
        Prompt:
        """
        产品：{product_name}
        目标用户：{persona_summary}
        市场洞察：{recent_trends}
        目标关键词：{keywords}

        参考竞品内容：{serp_top_articles}

        生成一篇2000字SEO优化文章：
        1. 标题（包含主关键词）
        2. 引言（痛点切入）
        3. 3-5个小节（解决方案）
        4. CTA（引导行动）

        要求：
        - 自然融入关键词
        - 提供实用价值
        - 语气：{brand_tone}
        """
      - 步骤4: 生成全文
      - 步骤5: SEO评分（readability, keyword density）
      - 步骤6: 写入 content_pieces (status='draft')

    子流程B: 社交媒体内容生成
      - 类似流程，但Prompt更短、更有创意
      - 可以用GPT-4o（更擅长短文案）
  ↓
步骤3: 所有内容写入数据库，状态='pending_review'
  ↓
步骤4: 发送通知到Slack/Email："今日生成X篇内容，请审核"
```

**重要配置**：
- 每个产品可配置"内容生成规则"（存在 products.metadata）
  ```json
  {
    "content_schedule": {
      "seo_article": {"frequency": "weekly", "count": 2},
      "linkedin_post": {"frequency": "daily", "count": 1},
      "tweet_thread": {"frequency": "weekly", "count": 1}
    }
  }
  ```

---

### 模块4：内容审核与排期（Web应用）

**页面：内容管理中心**

**布局**：
```
┌─────────────────────────────────────────────────────────┐
│  过滤器: [所有产品 ▼] [所有状态 ▼] [所有类型 ▼] [搜索...]  │
├─────────────────────────────────────────────────────────┤
│  待审核 (12) │ 已批准 (8) │ 已排期 (25) │ 已发布 (156)    │
├─────────────────────────────────────────────────────────┤
│  内容卡片列表                                             │
│  ┌───────────────────────────────────────────────────┐  │
│  │ [SEO] 如何通过AI提升营销效率                        │  │
│  │ 产品: AI课程 | 2025-11-05 生成                     │  │
│  │ 预测表现: ⭐⭐⭐⭐ (85分)                            │  │
│  │ [查看] [编辑] [批准] [排期]                         │  │
│  └───────────────────────────────────────────────────┘  │
│  ...                                                     │
└─────────────────────────────────────────────────────────┘
```

**核心功能**：

1. **内容预览与编辑**
   - 点击"查看"弹出全文预览
   - 支持在线编辑（使用富文本编辑器）
   - 显示相关信息：
     - 基于哪个用户画像
     - 基于哪些市场分析
     - SEO评分、关键词分布
     - AI的性能预测

2. **批准流程**
   - 点击"批准" → 状态改为 'approved'
   - 批量操作：选中多条内容批量批准

3. **内容排期**
   - 点击"排期"打开排期弹窗
   - 输入：
     - 发布日期和时间
     - 选择平台（WordPress/LinkedIn/Twitter）
     - 选择账号（如果有多个）
   - 保存到 `content_calendar` 表
   - 状态改为 'scheduled'

4. **日历视图**
   - 切换到日历视图
   - 类似Google Calendar的界面
   - 拖拽调整排期
   - 每个格子显示当天要发布的内容数量

**技术实现**：
- 编辑器：Tiptap 或 Lexical
- 日历组件：FullCalendar 或 React Big Calendar
- 拖拽：dnd-kit

---

### 模块5：手动发布工具

**阶段说明**：前期100%手动，后期逐步自动化

**功能设计**：

**页面：发布工作台**

```
今日待发布 (5)

┌─────────────────────────────────────────────────────────┐
│ [WordPress] 文章标题XXXX                                  │
│ 排期时间: 2025-11-05 10:00                               │
│                                                          │
│ [复制标题] [复制内容] [复制标签]                           │
│ [标记为已发布] [取消排期]                                  │
│                                                          │
│ 发布后填写:                                               │
│ URL: [________________]                                  │
│ 平台ID: [________________] (可选)                         │
│ [提交]                                                   │
└─────────────────────────────────────────────────────────┘
```

**工作流程**：
1. 用户在该页面看到今日需发布的内容
2. 点击"复制"按钮，一键复制标题/内容
3. 手动去目标平台（WordPress后台/LinkedIn）粘贴发布
4. 回到系统，填写发布后的URL
5. 点击"标记为已发布"
   - 更新 `content_pieces.status` = 'published'
   - 更新 `content_calendar.status` = 'published'
   - 记录 `published_at` 和 `published_url`

**后期自动化升级**：
- WordPress：集成WordPress REST API，直接发布
- LinkedIn：集成LinkedIn API（需审核）
- Twitter：集成Twitter API

---

### 模块6：数据追踪引擎（N8N工作流）

**工作流6.1：数据采集器**

```
触发器: Cron (每天晚上11点)

步骤1: 获取所有已发布的内容（published_date >= 昨天）
  ↓
步骤2: 对每条内容并行采集：

  2.1 Google Analytics数据
    - 使用GA4 API
    - 根据 published_url 查询：
      - pageviews
      - unique_visitors
      - avg_time_on_page
      - bounce_rate

  2.2 社交平台数据（如果是社交内容）
    - LinkedIn API: likes, comments, shares, impressions
    - Twitter API: likes, retweets, replies, impressions

  2.3 转化数据（如果配置了UTM跟踪）
    - 查询CRM/Stripe API
    - 匹配来源为该内容的leads/sales
  ↓
步骤3: 写入 content_performance 表
  ↓
步骤4: 如果某内容表现异常好/差，创建 optimization_insights
```

**数据采集详细配置**：

每个平台的数据映射：

| 平台 | 数据源 | 采集字段 |
|------|--------|----------|
| WordPress | Google Analytics 4 | page_views, unique_visitors, avg_time_on_page, bounce_rate |
| LinkedIn | LinkedIn API | impressions, clicks, likes, comments, shares, engagement_rate |
| Twitter | Twitter API v2 | impressions, likes, retweets, replies, profile_visits |
| Medium | Medium Stats API | views, reads, read_ratio, fans, claps |

**UTM参数设计**（用于精确追踪转化）：
```
utm_source={platform}      // wordpress, linkedin, twitter
utm_medium={content_type}  // seo_article, post, thread
utm_campaign={product_id}
utm_content={content_id}
```

---

### 模块7：数据分析Dashboard

**页面结构**：

**7.1 概览页**
```
┌─────────────────────────────────────────────────────────┐
│  时间范围: [最近7天 ▼]  产品: [所有产品 ▼]                 │
├─────────────────────────────────────────────────────────┤
│  KPI卡片                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │总浏览量  │ │总互动   │ │生成线索 │ │转化收入 │      │
│  │ 15.2K   │ │ 1,234  │ │   45    │ │ $3,200 │      │
│  │ ↑12%    │ │ ↑8%    │ │ ↑25%    │ │ ↑15%   │      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────────────────┤
│  内容表现趋势图（折线图）                                 │
│  [浏览量、互动率、转化率随时间变化]                        │
├─────────────────────────────────────────────────────────┤
│  Top 10表现最好的内容（表格）                             │
│  | 标题 | 类型 | 浏览 | 互动 | 转化 | ROI |              │
└─────────────────────────────────────────────────────────┘
```

**7.2 产品详情页**
```
选择产品后的深度分析：

- 该产品的所有内容表现
- 不同渠道的效果对比（柱状图）
- 用户画像准确性验证
  - 预测 vs 实际的用户来源对比
  - 如果差异大，触发画像更新建议
- AI优化建议列表
```

**7.3 内容对比分析**
```
选择2-5篇内容进行对比：
- 并列显示各项指标
- 高亮最优/最差
- AI分析差异原因
```

**技术实现**：
- 图表库：Tremor 或 Recharts
- 实时数据：Supabase Realtime订阅
- 数据计算：使用Supabase的Views和Functions预聚合

**示例SQL视图**：
```sql
CREATE VIEW content_performance_summary AS
SELECT
  cp.id,
  cp.title,
  cp.content_type,
  cp.published_date,
  p.name as product_name,
  SUM(perf.page_views) as total_views,
  SUM(perf.likes + perf.comments + perf.shares) as total_engagement,
  SUM(perf.leads_generated) as total_leads,
  SUM(perf.revenue) as total_revenue,
  AVG(perf.avg_time_on_page) as avg_time,
  AVG(perf.bounce_rate) as avg_bounce
FROM content_pieces cp
LEFT JOIN content_performance perf ON cp.id = perf.content_id
LEFT JOIN products p ON cp.product_id = p.id
WHERE cp.status = 'published'
GROUP BY cp.id, p.name;
```

---

### 模块8：智能优化引擎（N8N工作流）

**工作流8.1：周度优化分析**

```
触发器: Cron (每周一早上9点)

步骤1: 查询过去7天的 content_performance 数据
  ↓
步骤2: 调用Claude进行深度分析
  Prompt:
  """
  分析过去一周的内容营销数据：

  产品A:
  - 发布了5篇SEO文章，平均浏览量2000，转化率3%
  - 发布了10条LinkedIn帖子，平均互动率8%

  产品B:
  - ...

  对比历史数据（附上前4周数据）

  请分析：
  1. 哪些内容表现超预期？为什么？
  2. 哪些渠道效果最好？
  3. 用户行为有何变化？
  4. 下周应该调整什么策略？

  给出3-5条具体的优化建议，按优先级排序。
  """
  ↓
步骤3: 解析Claude的建议
  ↓
步骤4: 写入 optimization_insights 表
  ↓
步骤5: 发送周报到Email/Slack
  - 包含数据摘要
  - AI优化建议
  - 下周内容计划预览
```

**工作流8.2：实时异常检测**

```
触发器: Supabase Webhook (content_performance表新增数据时)

步骤1: 检查该内容的表现是否异常
  - 对比同类内容的平均值
  - 如果 > 2倍标准差 → 异常好
  - 如果 < 0.5倍平均值 → 异常差
  ↓
步骤2: 如果异常，调用Claude分析原因
  - 输入：内容本身、发布时间、平台、用户反馈
  - 输出：可能的原因、建议
  ↓
步骤3: 创建 insight，立即通知用户
```

---

### 模块9：信息串联的体现

**关键点**：确保每一环的数据都能追溯

**示例流程可视化**（在Web界面展示）：

```
产品: AI营销课程
  ↓ 基于此生成
用户画像: Tech-Savvy SaaS创始人（persona_id: xxx）
  ↓ 基于此分析
市场分析: 美国市场LinkedIn最活跃（analysis_id: yyy）
  ↓ 基于此生成
内容: "如何用AI提升LinkedIn内容ROI"（content_id: zzz）
  ↓ 发布后追踪
数据: 浏览5000，转化12人，收入$2400
  ↓ 反馈到
优化建议: LinkedIn内容表现优秀，增加发布频率
  ↓ 影响下一轮
新内容: 更多LinkedIn相关主题
```

**Web界面实现**：
在内容详情页显示"信息溯源"区块：
```
📊 这篇内容的信息链路

✓ 基于用户画像: "Tech-Savvy SaaS创始人" [查看]
  - 关键痛点: 手动营销效率低
  - 活跃平台: LinkedIn, Twitter

✓ 基于市场分析: [2篇分析]
  - "LinkedIn B2B内容趋势分析" (2025-11-01) [查看]
  - "AI营销工具竞品研究" (2025-10-28) [查看]

✓ 当前表现:
  - 浏览量: 5,234 (超预期 120%)
  - 转化率: 2.3% (高于平均 1.5%)

✓ AI洞察:
  "该内容成功的原因是精准匹配了用户画像的痛点，
   且发布时机正好赶上LinkedIn算法调整..." [查看完整分析]
```

---

## 关键业务流程

### 流程1：新产品上线完整流程

```
Day 0: 创建产品
  1. 用户在Web填写产品基础信息
  2. 点击"保存并启动分析"
  ↓
Day 0-1: AI深度分析（自动）
  3. N8N收到webhook触发
  4. 并行执行：
     - 用户画像生成（30分钟）
     - 竞品分析（1小时）
     - 市场趋势分析（1小时）
     - 渠道推荐（30分钟）
  5. 结果保存到数据库
  6. 发送通知："分析完成，请查看"
  ↓
Day 1: 人工审核
  7. 用户查看AI生成的画像和分析
  8. 编辑调整（如有必要）
  9. 批准画像和策略
  ↓
Day 2: 内容生成（自动）
  10. 定时任务触发内容生成
  11. 基于画像和分析生成首批内容：
      - 2篇SEO文章
      - 5条LinkedIn帖子
      - 1个Twitter thread
  12. 状态：pending_review
  ↓
Day 2-3: 内容审核
  13. 用户在Web审核内容
  14. 编辑优化
  15. 批准并排期（未来1周）
  ↓
Day 3-10: 内容发布
  16. 用户按排期手动发布
  17. 发布后记录URL
  ↓
Day 4-17: 数据收集（自动）
  18. 每天采集性能数据
  19. 实时更新Dashboard
  ↓
Day 10: 首次优化迭代
  20. AI分析首周数据
  21. 生成优化建议
  22. 调整下周内容策略
  ↓
循环...
```

### 流程2：每日自动化运行流程

```
06:00 - 数据采集
  - N8N采集昨日所有已发布内容的数据
  - 写入 content_performance
  - 如有异常，生成insight并通知

07:00 - 内容生成
  - 读取所有active产品
  - 根据每个产品的content_schedule生成内容
  - 状态：pending_review
  - 发送Slack通知："今日生成12篇内容"

09:00 - 用户上线工作
  - 打开Web应用查看新内容
  - 审核、编辑、批准
  - 排期到未来几天

10:00-18:00 - 手动发布
  - 用户根据排期表手动发布内容
  - 发布后标记为published

18:00 - 日报生成
  - N8N生成今日数据摘要
  - 发送Email：
    - 今日发布X篇
    - 总浏览量Y
    - 新增线索Z
    - Top 3表现最好的内容

每周一 09:00 - 周度优化
  - AI分析上周数据
  - 生成优化建议
  - 调整内容策略
```

---

## 技术栈

### 前端（Web应用）
```yaml
框架: Next.js 14 (App Router)
UI库:
  - shadcn/ui (组件)
  - Tailwind CSS (样式)
  - Tremor (数据可视化)
状态管理: Zustand
表单: React Hook Form + Zod
编辑器: Tiptap
日历: React Big Calendar
部署: Vercel
```

### 后端/数据库
```yaml
数据库: Supabase (PostgreSQL)
  - Database: 存储所有数据
  - Auth: 用户认证
  - Realtime: 实时数据更新
  - Edge Functions: 轻量API
  - Storage: 文件存储（如AI生成的图片）

API架构: RESTful + GraphQL (可选)
```

### 自动化层
```yaml
工作流引擎: N8N (Docker部署)
  - 版本: 最新稳定版
  - 持久化: PostgreSQL（可复用Supabase）
  - 部署: Docker Compose

关键N8N节点:
  - Supabase节点（读写数据）
  - HTTP Request（调用Claude/OpenAI API）
  - Webhook（接收触发）
  - Cron（定时任务）
  - Code节点（复杂逻辑处理）
```

### AI服务
```yaml
主力模型:
  - Claude 3.5 Sonnet (分析、长文)
  - GPT-4o (快速文案、创意)

辅助服务:
  - Google Trends API
  - SerpAPI (搜索结果分析)
  - Google Analytics 4 API
  - LinkedIn API (需申请)
  - Twitter API v2
```

### 开发工具
```yaml
版本控制: Git + GitHub
包管理: pnpm
代码规范: ESLint + Prettier
类型检查: TypeScript
测试: Vitest + Playwright
CI/CD: GitHub Actions → Vercel自动部署
```

---

## 开发路线图

### MVP阶段（4周）

#### Week 1: 基础设施 + 产品管理
**目标**: 能够创建和管理产品

- [ ] Day 1-2: 项目初始化
  - 创建Next.js项目
  - 配置Supabase项目
  - 设置GitHub仓库
  - 配置Docker版N8N

- [ ] Day 3-4: 数据库设计
  - 创建所有表（products, user_personas, market_analysis等）
  - 设置RLS策略
  - 创建必要的Views和Functions

- [ ] Day 5-7: 产品管理功能
  - 产品CRUD界面
  - 产品列表/详情页
  - 基础UI组件库

**交付物**: 能够创建和查看产品的Web应用

---

#### Week 2: AI分析引擎
**目标**: 点击按钮自动生成用户画像和市场分析

- [ ] Day 1-2: N8N工作流开发
  - 用户画像生成器工作流
  - 集成Claude API
  - Supabase读写节点配置

- [ ] Day 3-4: 市场分析工作流
  - 竞品分析（SerpAPI集成）
  - 趋势分析（Google Trends）
  - 结果存储

- [ ] Day 5-7: Web端集成
  - "生成画像"按钮 → 调用N8N webhook
  - 实时显示分析进度（ai_tasks表）
  - 分析结果展示界面

**交付物**: 完整的产品分析流程

---

#### Week 3: 内容生成 + 审核
**目标**: AI生成内容，人工审核批准

- [ ] Day 1-3: 内容生成工作流
  - SEO文章生成器
  - 社交媒体内容生成器
  - 内容质量评分

- [ ] Day 4-5: 内容管理界面
  - 内容列表（含过滤器）
  - 内容预览/编辑器
  - 批准/拒绝功能

- [ ] Day 6-7: 内容排期
  - 排期表单
  - 日历视图（基础版）
  - content_calendar表集成

**交付物**: 完整的内容生产和管理流程

---

#### Week 4: 发布追踪 + MVP上线
**目标**: 手动发布并开始收集数据

- [ ] Day 1-2: 发布工作台
  - "今日待发布"页面
  - 复制内容功能
  - 标记已发布

- [ ] Day 3-4: 数据采集工作流
  - Google Analytics集成
  - 数据写入content_performance

- [ ] Day 5-6: 基础Dashboard
  - KPI卡片
  - 简单图表
  - Top内容列表

- [ ] Day 7: 测试 + 部署
  - 完整流程测试
  - 部署到Vercel
  - 文档编写

**交付物**: 可用的MVP系统

---

### 迭代阶段（Week 5+）

#### Phase 2: 数据优化（2周）
- [ ] 完善数据采集（社交平台API）
- [ ] 转化追踪（UTM + CRM集成）
- [ ] 高级Dashboard（对比分析、预测）
- [ ] AI优化引擎（周度分析、实时异常检测）

#### Phase 3: 自动化升级（2周）
- [ ] WordPress API自动发布
- [ ] LinkedIn API自动发布
- [ ] 邮件营销集成（Instantly.ai）
- [ ] 发布失败自动重试

#### Phase 4: 高级功能（4周）
- [ ] A/B测试（标题/内容变体）
- [ ] 多语言支持
- [ ] 团队协作（角色权限）
- [ ] 白标定制

---

## 风险与注意事项

### 技术风险

1. **API成本超预算**
   - 风险：Claude/GPT-4频繁调用导致月费过高
   - 缓解：
     - 设置每日生成配额
     - 优先使用缓存
     - 混合使用开源模型（Llama 3.1）

2. **数据采集限制**
   - 风险：社交平台API限流或需要审核
   - 缓解：
     - 初期用GA为主
     - 分批次采集
     - 准备好API审核材料

3. **N8N稳定性**
   - 风险：本地Docker崩溃导致任务丢失
   - 缓解：
     - 配置持久化存储
     - 设置健康检查
     - 考虑后期迁移到N8N Cloud

### 业务风险

1. **AI内容质量不稳定**
   - 风险：生成的内容不符合品牌调性或含错误信息
   - 缓解：
     - 前期100%人工审核
     - 建立Prompt模板库
     - 定期优化Prompt

2. **平台规则变化**
   - 风险：LinkedIn/Twitter修改API政策
   - 缓解：
     - 保持手动发布能力
     - 分散平台，不依赖单一渠道

3. **数据隐私合规**
   - 风险：GDPR/CCPA合规问题
   - 缓解：
     - 不收集个人身份信息
     - 在Supabase配置数据加密
     - 添加用户数据导出功能

### 运营风险

1. **用户学习成本**
   - 风险：系统太复杂，用户不会用
   - 缓解：
     - 录制操作视频
     - 内置引导教程
     - 简化初期功能

2. **内容同质化**
   - 风险：AI生成内容缺乏独特性
   - 缓解：
     - 提供"品牌语调"配置
     - 鼓励人工二次创作
     - 定期更新Prompt

---

## 项目文件结构

### 代码仓库结构
```
ai-marketing-automation/
├── README.md
├── PRD.md (本文档)
├── apps/
│   ├── web/                    # Next.js Web应用
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── products/
│   │   │   │   ├── content/
│   │   │   │   ├── calendar/
│   │   │   │   ├── analytics/
│   │   │   ├── api/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   ├── lib/
│   │   └── package.json
│   │
│   └── n8n/                    # N8N工作流配置
│       ├── workflows/
│       │   ├── persona-generator.json
│       │   ├── market-analyzer.json
│       │   ├── content-generator.json
│       │   ├── data-collector.json
│       │   └── optimizer.json
│       ├── docker-compose.yml
│       └── README.md
│
├── packages/
│   ├── database/               # Supabase相关
│   │   ├── migrations/
│   │   ├── seed.sql
│   │   └── schema.sql
│   │
│   ├── shared/                 # 共享类型和工具
│   │   ├── types/
│   │   └── utils/
│   │
│   └── ai-prompts/             # Prompt模板库
│       ├── persona.md
│       ├── market-analysis.md
│       └── content-generation.md
│
├── docs/
│   ├── setup-guide.md
│   ├── n8n-workflows.md
│   └── api-reference.md
│
└── package.json
```

---

## 下一步行动

### 立即开始（现在）

1. **确认PRD**
   - 你review这份PRD
   - 提出修改意见
   - 确定MVP范围

2. **环境准备**（1小时）
   - 创建Supabase项目
   - 创建GitHub仓库
   - 确认N8N Docker正常运行

3. **技术验证**（2小时）
   - 测试Supabase连接
   - 测试N8N调用Claude API
   - 测试Next.js连接Supabase

### 第一周任务
- 按照Week 1路线图开发
- 每日同步进度
- 遇到问题及时调整

---

## 附录

### A. Prompt模板示例

**用户画像生成Prompt**
```markdown
# 任务
为产品生成详细的用户画像(Persona)

# 产品信息
- 名称: {{product_name}}
- 描述: {{product_description}}
- 类型: {{product_type}}
- 目标市场: {{target_markets}}
- 定价: {{price_model}}

# 输出要求
以JSON格式返回，包含以下字段：

{
  "persona_name": "给这个画像起个名字",
  "demographics": {
    "age_range": "25-40",
    "locations": ["US", "UK"],
    "income_range": "$50k-$150k",
    "job_titles": ["Marketing Manager", "Growth Lead"],
    "company_size": "10-500人"
  },
  "psychographics": {
    "goals": ["提升营销ROI", "节省时间"],
    "pain_points": ["手动内容创作效率低", "难以规模化"],
    "values": ["数据驱动", "效率优先"],
    "behaviors": ["经常学习新工具", "活跃在专业社区"]
  },
  "platforms": {
    "primary": ["LinkedIn", "Twitter"],
    "secondary": ["Reddit", "Product Hunt"],
    "content_consumption": ["长文博客", "案例研究", "工具测评"]
  },
  "buying_triggers": [
    "看到ROI数据",
    "同行推荐",
    "免费试用体验好"
  ],
  "ai_insights": "深度分析这个人群的特点、需求、决策路径..."
}

# 分析深度要求
- 基于真实市场数据推理
- 考虑文化差异（如果是国际市场）
- 给出具体可行的营销建议
```

### B. 关键SQL查询示例

**获取产品的完整营销数据**
```sql
WITH product_stats AS (
  SELECT
    p.id,
    p.name,
    COUNT(DISTINCT cp.id) as total_content,
    COUNT(DISTINCT CASE WHEN cp.status = 'published' THEN cp.id END) as published_content,
    SUM(perf.page_views) as total_views,
    SUM(perf.leads_generated) as total_leads,
    SUM(perf.revenue) as total_revenue
  FROM products p
  LEFT JOIN content_pieces cp ON p.id = cp.product_id
  LEFT JOIN content_performance perf ON cp.id = perf.content_id
  WHERE p.status = 'active'
  GROUP BY p.id
)
SELECT * FROM product_stats
ORDER BY total_revenue DESC;
```

---

**文档结束**

📌 **需要我做什么？**
1. 修改PRD中的任何部分？
2. 立即开始创建项目脚手架（初始化代码）？
3. 先帮你设计某个具体模块的详细技术方案？
4. 创建Supabase的完整Schema SQL文件？

请告诉我下一步！
