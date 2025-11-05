# 数据库迁移脚本
## AutoMarketing Pro - 增强版MVP

**目的**：包含所有数据库初始化和迁移脚本

**使用方法**：按照周次顺序在 Supabase SQL Editor 中运行这些脚本

---

## 初始化：启用扩展和基础函数

在 Supabase → SQL Editor 中新建查询，运行以下脚本：

```sql
-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- 用于全文搜索

-- 创建更新时间戳的函数（所有表都会用到）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建记录操作日志的函数
CREATE OR REPLACE FUNCTION log_operation()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, operation, old_data, changed_at)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), NOW());
  ELSE
    INSERT INTO audit_log (table_name, operation, new_data, changed_at)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), NOW());
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

---

## Week 1: 核心数据表

### Migration 1.1: 创建 Products 表

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 基本信息
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE, -- URL-friendly name
  type VARCHAR(50), -- B2B, B2C, B2B2C
  category VARCHAR(100),
  price_model VARCHAR(50), -- freemium, subscription, one-time

  -- 目标市场和语言
  target_markets TEXT[] DEFAULT ARRAY[]::text[], -- ['US', 'EU', 'APAC']
  target_languages TEXT[] DEFAULT ARRAY['en-US']::text[], -- ['en-US', 'zh-CN']

  -- 状态
  status VARCHAR(50) DEFAULT 'active', -- active, paused, archived

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb,

  -- 统计
  total_content_count INT DEFAULT 0,
  published_content_count INT DEFAULT 0,
  average_engagement_rate DECIMAL(5,2) DEFAULT 0,

  CONSTRAINT valid_type CHECK (type IN ('B2B', 'B2C', 'B2B2C')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'archived'))
);

-- 创建索引
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_slug ON products(slug);

-- 创建更新触发器
CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 创建审计日志
CREATE TRIGGER products_audit
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION log_operation();

-- 添加注释
COMMENT ON TABLE products IS '产品表 - 存储要营销的产品信息';
COMMENT ON COLUMN products.slug IS '产品的URL友好名称，用于生成内容URL';
COMMENT ON COLUMN products.metadata IS 'JSON格式的额外信息，如logo_url、website_url等';
```

### Migration 1.2: 创建 User Personas 表

```sql
CREATE TABLE user_personas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 用户画像信息
  persona_name VARCHAR(255) NOT NULL, -- "Tech-savvy Startup Founder"

  -- 用户特征（JSON格式便于扩展）
  demographics JSONB, -- age_range, gender, location, job_title, income
  psychographics JSONB, -- values, lifestyle, interests, pain_points

  -- 平台和内容偏好
  platforms JSONB DEFAULT '[]'::jsonb, -- ['twitter', 'linkedin', 'reddit']
  content_preferences JSONB, -- preferred_format, content_length, tone

  -- 购买相关
  buying_triggers JSONB DEFAULT '[]'::jsonb, -- 什么会促使他们购买

  -- AI分析
  ai_insights TEXT, -- AI生成的完整分析
  confidence_score DECIMAL(3,2) DEFAULT 0.85, -- 置信度 0-1

  -- 版本管理
  version INT DEFAULT 1, -- 画像版本
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

-- 创建索引
CREATE INDEX idx_personas_product ON user_personas(product_id);
CREATE INDEX idx_personas_active ON user_personas(is_active);
CREATE INDEX idx_personas_created_at ON user_personas(created_at DESC);

-- 创建触发器
CREATE TRIGGER personas_updated_at
  BEFORE UPDATE ON user_personas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER personas_audit
  AFTER INSERT OR UPDATE OR DELETE ON user_personas
  FOR EACH ROW
  EXECUTE FUNCTION log_operation();

COMMENT ON TABLE user_personas IS '用户画像表 - AI生成的目标用户详细描述';
COMMENT ON COLUMN user_personas.demographics IS '包含age_range, gender, location, job_title, income等';
COMMENT ON COLUMN user_personas.psychographics IS '包含values, lifestyle, interests, pain_points等';
```

### Migration 1.3: 创建 Audit Log 表

```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100),
  operation VARCHAR(10), -- INSERT, UPDATE, DELETE
  old_data JSONB,
  new_data JSONB,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID
);

CREATE INDEX idx_audit_log_table ON audit_log(table_name);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at DESC);

COMMENT ON TABLE audit_log IS '审计日志 - 记录所有数据表的变更';
```

---

## Week 2-3: AI 分析表

### Migration 2.1: 创建 Market Analysis 表

```sql
CREATE TABLE market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 市场信息
  market VARCHAR(100) NOT NULL, -- 'US', 'EU-UK', 'APAC-JP'

  -- 分析数据
  market_size_usd DECIMAL(15,0), -- 市场规模
  growth_rate_percent DECIMAL(5,2), -- 增长率

  trends JSONB, -- AI分析的市场趋势
  competitors JSONB, -- 竞争对手列表和分析
  opportunities JSONB, -- 市场机会

  -- 关键词数据
  keyword_data JSONB, -- [{ keyword, search_volume, difficulty, cpc }]
  search_volume_data JSONB, -- 搜索量数据

  -- AI分析
  ai_summary TEXT, -- AI生成的市场分析总结
  ai_recommendations TEXT, -- AI建议的策略
  confidence_score DECIMAL(3,2) DEFAULT 0.80,

  CONSTRAINT valid_confidence CHECK (confidence_score >= 0 AND confidence_score <= 1)
);

CREATE INDEX idx_market_analysis_product ON market_analysis(product_id);
CREATE INDEX idx_market_analysis_market ON market_analysis(market);
CREATE INDEX idx_market_analysis_created_at ON market_analysis(created_at DESC);

CREATE TRIGGER market_analysis_updated_at
  BEFORE UPDATE ON market_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE market_analysis IS '市场分析表 - AI生成的市场研究和竞争分析';
```

### Migration 2.2: 创建 AI Tasks 表

```sql
CREATE TABLE ai_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 任务类型
  task_type VARCHAR(100) NOT NULL, -- persona_generation, content_generation, market_analysis, etc
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed

  -- 输入和输出
  input_data JSONB, -- 任务的输入参数
  output_data JSONB, -- 任务的输出结果

  -- AI模型信息
  model_used VARCHAR(100), -- 'claude-3-5-sonnet', 'gpt-4o', 'gpt-4o-mini'
  tokens_used INT DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,

  -- 时间戳
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- 错误信息
  error_message TEXT,

  -- 重试逻辑
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  next_retry_at TIMESTAMP WITH TIME ZONE,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  CONSTRAINT valid_attempts CHECK (attempts >= 0 AND max_attempts > 0)
);

CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_type ON ai_tasks(task_type);
CREATE INDEX idx_ai_tasks_created_at ON ai_tasks(created_at DESC);
CREATE INDEX idx_ai_tasks_model ON ai_tasks(model_used);
CREATE INDEX idx_ai_tasks_next_retry ON ai_tasks(next_retry_at) WHERE status = 'failed';

CREATE TRIGGER ai_tasks_updated_at
  BEFORE UPDATE ON ai_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE ai_tasks IS 'AI任务表 - 跟踪所有AI操作的执行和成本';
COMMENT ON COLUMN ai_tasks.cost_usd IS '该任务的成本，用于成本追踪和预算监控';
```

---

## Week 4-5: 内容表

### Migration 3.1: 创建 Content Pieces 表

```sql
CREATE TABLE content_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 内容基本信息
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT, -- 内容摘要
  slug VARCHAR(255) UNIQUE,

  content_type VARCHAR(50) NOT NULL, -- blog, social, email, landing_page
  language VARCHAR(10) DEFAULT 'en-US',

  -- 关联信息
  based_on_persona_id UUID REFERENCES user_personas(id),
  based_on_analysis_ids JSONB DEFAULT '[]'::jsonb, -- 基于哪些分析

  -- SEO信息
  keywords JSONB DEFAULT '[]'::jsonb, -- 目标关键词
  meta_description VARCHAR(160),
  seo_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  readability_score DECIMAL(5,2) DEFAULT 0, -- 0-100

  -- 发布状态
  status VARCHAR(50) DEFAULT 'draft', -- draft, ready, scheduled, published, archived
  scheduled_date TIMESTAMP WITH TIME ZONE,
  published_date TIMESTAMP WITH TIME ZONE,
  publish_platform VARCHAR(100), -- twitter, linkedin, medium, website
  publish_url TEXT,

  -- 性能数据
  predicted_performance JSONB, -- AI预测的表现

  -- 版本管理
  version INT DEFAULT 1,
  parent_id UUID REFERENCES content_pieces(id), -- 用于版本历史

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_content_type CHECK (content_type IN ('blog', 'social', 'email', 'landing_page', 'video_script')),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'ready', 'scheduled', 'published', 'archived'))
);

CREATE INDEX idx_content_product ON content_pieces(product_id);
CREATE INDEX idx_content_status ON content_pieces(status);
CREATE INDEX idx_content_published_date ON content_pieces(published_date DESC) WHERE published_date IS NOT NULL;
CREATE INDEX idx_content_type ON content_pieces(content_type);
CREATE INDEX idx_content_persona ON content_pieces(based_on_persona_id);
CREATE INDEX idx_content_slug ON content_pieces(slug);
CREATE INDEX idx_content_keywords ON content_pieces USING GIN(keywords);

CREATE TRIGGER content_updated_at
  BEFORE UPDATE ON content_pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE content_pieces IS '内容表 - 存储生成的营销内容';
COMMENT ON COLUMN content_pieces.slug IS '内容的URL友好名称';
COMMENT ON COLUMN content_pieces.seo_score IS '基于SEO最佳实践的评分，0-100';
COMMENT ON COLUMN content_pieces.readability_score IS '基于Flesch Reading Ease的易读性评分，0-100';
```

### Migration 3.2: 创建 Content Performance 表

```sql
CREATE TABLE content_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 渠道
  platform VARCHAR(100), -- twitter, linkedin, website, email

  -- 性能指标
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  shares INT DEFAULT 0,
  comments INT DEFAULT 0,

  -- 计算字段
  engagement_rate DECIMAL(5,2), -- (clicks + shares + comments) / views
  conversion_rate DECIMAL(5,2), -- conversions / clicks

  -- 其他指标
  metadata JSONB DEFAULT '{}',

  CONSTRAINT positive_views CHECK (views >= 0),
  CONSTRAINT positive_clicks CHECK (clicks >= 0)
);

CREATE INDEX idx_performance_content ON content_performance(content_id);
CREATE INDEX idx_performance_platform ON content_performance(platform);
CREATE INDEX idx_performance_recorded_at ON content_performance(recorded_at DESC);
CREATE INDEX idx_performance_engagement ON content_performance(engagement_rate DESC) WHERE engagement_rate > 0;

COMMENT ON TABLE content_performance IS '内容性能表 - 跟踪发布内容的性能指标';
```

---

## Week 8: SEO 和竞品表

### Migration 4.1: 创建 SEO Rankings 表

```sql
CREATE TABLE seo_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES content_pieces(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 关键词信息
  keyword VARCHAR(255) NOT NULL,
  position INT, -- Google排名位置 (1 = 第一)
  previous_position INT, -- 之前的排名，用于追踪变化
  search_volume INT, -- 该关键词的月搜索量

  -- URL信息
  url TEXT,
  country VARCHAR(10) DEFAULT 'US',
  language VARCHAR(10) DEFAULT 'en-US',

  -- 计算字段
  position_change INT GENERATED ALWAYS AS (previous_position - position) STORED,

  metadata JSONB DEFAULT '{}'::jsonb,

  CONSTRAINT valid_position CHECK (position > 0 OR position IS NULL)
);

CREATE INDEX idx_seo_rankings_content ON seo_rankings(content_id);
CREATE INDEX idx_seo_rankings_keyword ON seo_rankings(keyword);
CREATE INDEX idx_seo_rankings_position ON seo_rankings(position) WHERE position IS NOT NULL;
CREATE INDEX idx_seo_rankings_checked_at ON seo_rankings(checked_at DESC);

COMMENT ON TABLE seo_rankings IS 'SEO排名追踪表 - 记录关键词在搜索引擎中的排名';
COMMENT ON COLUMN seo_rankings.position_change IS '排名变化（正数=上升，负数=下降）';
```

### Migration 4.2: 创建 Competitor Monitoring 表

```sql
CREATE TABLE competitor_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 竞品信息
  competitor_name VARCHAR(255) NOT NULL,
  competitor_url TEXT NOT NULL,

  -- 内容分析
  content_topics JSONB, -- 竞品发布的主题
  keywords JSONB, -- 竞品使用的关键词
  content_frequency JSONB, -- 发布频率分析

  -- AI分析
  ai_insights TEXT, -- AI对竞品策略的分析
  ai_recommendations TEXT, -- AI对我们应该做什么的建议

  -- 元数据
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_competitor_product ON competitor_monitoring(product_id);
CREATE INDEX idx_competitor_scraped_at ON competitor_monitoring(scraped_at DESC);

COMMENT ON TABLE competitor_monitoring IS '竞品监控表 - 追踪竞争对手的营销活动';
```

---

## Week 8-9: 报告和优化表

### Migration 5.1: 创建 Analytics Reports 表

```sql
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 报告周期
  report_type VARCHAR(50) NOT NULL, -- weekly, monthly, quarterly
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,

  -- 报告数据
  total_content_created INT,
  total_content_published INT,

  content_performance JSONB, -- 聚合的性能数据
  top_performing_content JSONB, -- 表现最好的内容列表

  seo_metrics JSONB, -- SEO相关的指标
  engagement_metrics JSONB, -- 参与度指标

  ai_summary TEXT, -- AI生成的报告总结
  recommendations TEXT, -- AI给出的建议

  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_analytics_product ON analytics_reports(product_id);
CREATE INDEX idx_analytics_created_at ON analytics_reports(created_at DESC);
CREATE INDEX idx_analytics_period ON analytics_reports(period_start, period_end);

COMMENT ON TABLE analytics_reports IS '分析报告表 - 存储定期生成的分析报告';
```

### Migration 5.2: 创建 Optimization Recommendations 表

```sql
CREATE TABLE optimization_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 建议信息
  recommendation_type VARCHAR(100), -- content_strategy, seo_optimization, keyword_expansion
  priority VARCHAR(20), -- P0, P1, P2

  title VARCHAR(255),
  description TEXT,

  -- AI生成
  ai_reasoning TEXT, -- AI为什么这样建议
  estimated_impact JSONB, -- 预期影响 { metric: value }

  -- 执行状态
  status VARCHAR(50) DEFAULT 'new', -- new, in_progress, completed, dismissed

  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_recommendations_product ON optimization_recommendations(product_id);
CREATE INDEX idx_recommendations_status ON optimization_recommendations(status);
CREATE INDEX idx_recommendations_priority ON optimization_recommendations(priority);

COMMENT ON TABLE optimization_recommendations IS '优化建议表 - AI提供的优化建议';
```

---

## 初始数据

### Migration 6.1: 插入示例数据

```sql
-- 创建示例产品
INSERT INTO products (
  name, description, type, category, target_markets, target_languages, status
) VALUES (
  'AutoMarketing Pro',
  'AI-powered marketing automation platform for global businesses',
  'B2B',
  'SaaS',
  ARRAY['US', 'EU', 'APAC'],
  ARRAY['en-US', 'en-GB'],
  'active'
);

-- 获取product_id供后续使用
SELECT id FROM products WHERE name = 'AutoMarketing Pro' LIMIT 1;

-- 创建示例用户画像
INSERT INTO user_personas (
  product_id,
  persona_name,
  demographics,
  psychographics,
  platforms,
  content_preferences,
  ai_insights,
  confidence_score
) VALUES (
  (SELECT id FROM products WHERE name = 'AutoMarketing Pro' LIMIT 1),
  'Tech-Savvy Startup Founder',
  '{
    "age_range": "28-40",
    "gender": "M/F",
    "location": "US/EU",
    "job_title": "Founder/CEO",
    "income": "$100k-300k"
  }'::jsonb,
  '{
    "values": ["innovation", "efficiency", "growth"],
    "lifestyle": "fast-paced",
    "interests": ["AI", "marketing", "automation"]
  }'::jsonb,
  '["linkedin", "twitter", "product_hunt"]'::jsonb,
  '{
    "preferred_format": "educational",
    "content_length": "medium",
    "tone": "professional"
  }'::jsonb,
  'This persona is ideal for our SaaS product as they are early adopters.',
  0.90
);
```

---

## 回滚脚本

### 如果需要回滚，使用以下脚本：

```sql
-- 警告：这会删除所有数据！仅在开发环境中使用

DROP TABLE IF EXISTS optimization_recommendations;
DROP TABLE IF EXISTS analytics_reports;
DROP TABLE IF EXISTS competitor_monitoring;
DROP TABLE IF EXISTS seo_rankings;
DROP TABLE IF EXISTS content_performance;
DROP TABLE IF EXISTS content_pieces;
DROP TABLE IF EXISTS ai_tasks;
DROP TABLE IF EXISTS market_analysis;
DROP TABLE IF EXISTS user_personas;
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS products;

-- 删除函数
DROP FUNCTION IF EXISTS log_operation();
DROP FUNCTION IF EXISTS update_updated_at();

-- 删除扩展
DROP EXTENSION IF EXISTS "pg_trgm";
DROP EXTENSION IF EXISTS "uuid-ossp";
```

---

## 验证脚本

运行以下脚本确认所有表都已正确创建：

```sql
-- 查看所有表
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 查看表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- 查看所有索引
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 验证数据
SELECT
  'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 'user_personas', COUNT(*) FROM user_personas
UNION ALL
SELECT 'market_analysis', COUNT(*) FROM market_analysis
UNION ALL
SELECT 'content_pieces', COUNT(*) FROM content_pieces
UNION ALL
SELECT 'ai_tasks', COUNT(*) FROM ai_tasks
UNION ALL
SELECT 'seo_rankings', COUNT(*) FROM seo_rankings
UNION ALL
SELECT 'competitor_monitoring', COUNT(*) FROM competitor_monitoring
UNION ALL
SELECT 'analytics_reports', COUNT(*) FROM analytics_reports;
```

---

## 运行顺序

执行数据库迁移的推荐顺序：

```
1. 初始化：启用扩展和基础函数
2. Week 1: 核心数据表
   ├── Migration 1.1: Products
   ├── Migration 1.2: User Personas
   └── Migration 1.3: Audit Log
3. Week 2-3: AI 分析表
   ├── Migration 2.1: Market Analysis
   └── Migration 2.2: AI Tasks
4. Week 4-5: 内容表
   ├── Migration 3.1: Content Pieces
   └── Migration 3.2: Content Performance
5. Week 8: SEO 和竞品表
   ├── Migration 4.1: SEO Rankings
   └── Migration 4.2: Competitor Monitoring
6. Week 8-9: 报告和优化表
   ├── Migration 5.1: Analytics Reports
   └── Migration 5.2: Optimization Recommendations
7. 初始数据: 插入示例数据
8. 验证: 运行验证脚本确认
```

---

## 注意事项

1. **环境变量**：所有迁移都使用相对于当前用户的权限，在生产环境中应使用 `SUPABASE_SERVICE_ROLE_KEY`

2. **性能**：大表（如 `content_performance`）可能需要分区，但初期不需要

3. **备份**：运行大型迁移前，建议在 Supabase Dashboard 中创建备份

4. **测试**：所有迁移脚本都应在开发环境先测试

5. **版本控制**：每个迁移脚本都应有版本号和时间戳

---

**提示**：将这些脚本保存到 `packages/database/migrations/` 目录，并创建一个自动化迁移脚本来管理数据库版本。

