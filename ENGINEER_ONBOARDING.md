# 工程师快速入门指南
## AutoMarketing Pro - 增强版MVP项目

**你被招募来做什么：**
构建一个AI驱动的全球营销自动化系统，10周内交付。

**项目周期：** 10周 全职
**技术栈：** Next.js + Supabase + N8N + Claude API
**难度：** 中等 (有框架指导，设计清晰)
**薪资范围：** $50-80/小时 或 $100k-130k年薪

---

## 📖 阅读顺序（必读）

请按照这个顺序阅读，**总共2小时**：

### 第1步：项目全景 (20分钟)
📄 **PROJECT_OVERVIEW.md**
- 了解项目是做什么的
- 看系统架构图
- 理解为什么采用这个技术栈

### 第2步：详细需求 (60分钟) ⭐ 重点
📄 **REQUIREMENTS_DETAILED.md**
- **这是你需要构建的准确规范**
- 每个功能是什么
- 怎样才算完成（验收标准很重要）
- 用户是谁，他们要解决什么问题

### 第3步：开发路线图 (30分钟)
📄 **IMPLEMENTATION_ROADMAP.md**
- Week-by-week的具体任务
- 代码示例和技术指导
- 中国网络环境的考虑

### 第4步：增强版特殊优化 (30分钟)
📄 **ENHANCED_STRATEGY.md**
- 了解这个版本特别添加了什么
- 缓存系统、任务队列等的实现方法
- 为什么要这样设计

### 第5步：交付标准 (10分钟)
📄 **DELIVERY_AND_ITERATION.md**
- 每个里程碑的验收清单
- 如何处理迭代
- 遇到问题怎么办

---

## 🛠️ 技术栈详解

### 为什么选这些技术？

| 技术 | 用途 | 为什么选它 |
|------|------|-----------|
| **Next.js 14** | Web应用框架 | 全栈能力、Vercel部署、性能好 |
| **Supabase** | 数据库 + Auth | PostgreSQL + 实时功能 + 简单部署 |
| **N8N** | 自动化工作流 | 可视化编辑、易于维护、免费版可用 |
| **Claude API** | AI能力 | 强大的分析和生成、长上下文 |
| **Vercel** | 部署 | 自动部署、边缘计算、中国CDN支持 |
| **Redis/Upstash** | 缓存 + 队列 | 成本低、无服务器 |

### 学习资源

如果你对某些技术不熟悉：

```
Next.js:
  官方教程: https://nextjs.org/learn
  文档: https://nextjs.org/docs
  学习时间: 如果你懂React，1-2天足够

Supabase:
  官方文档: https://supabase.com/docs
  快速开始: 30分钟可以建立一个项目
  学习时间: 2-3天可以掌握基础

N8N:
  官方文档: https://docs.n8n.io
  推荐方式: 边学边做，看example workflows
  学习时间: 3-5天熟练

Claude API:
  文档: https://docs.anthropic.com
  重点: 理解Prompt工程
  学习时间: 1-2天足够
```

---

## 🎯 你的第一周任务

### Day 1-2: 环境配置

```bash
# 本地开发环境
node --version  # v18+
npm install -g pnpm

# 创建项目
git clone https://github.com/372768498/AutoMarketingforme1105.git
cd AutoMarketingforme1105
pnpm install

# 创建 .env.local 文件（向PM要这些）
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
CLAUDE_API_KEY=xxx
N8N_WEBHOOK_URL=xxx
UPSTASH_REDIS_URL=xxx
UPSTASH_REDIS_TOKEN=xxx

# 启动开发服务器
pnpm dev
# 访问 http://localhost:3000
```

### Day 2-3: 代码库导览

```
AutoMarketingforme1105/
├── apps/web/                    ← 你主要工作的地方
│   ├── app/
│   │   ├── (dashboard)/        ← 产品管理页面
│   │   ├── api/                ← API端点
│   │   └── layout.tsx
│   ├── components/             ← React组件
│   ├── lib/                    ← 工具函数
│   └── package.json
│
├── packages/
│   ├── database/               ← SQL文件
│   │   ├── migrations/
│   │   └── schema.sql
│   └── shared/                 ← 共享类型定义
│
└── docs/                       ← 文档
```

### Day 4-5: 熟悉系统

**任务**：
1. 在Supabase中创建products表（参考schema.sql）
2. 写一个Next.js API端点，能CRUD产品
3. 写一个React页面，显示产品列表
4. 本地测试完整流程

**预期成果**：
```
你能在浏览器中：
✅ 创建一个"Test Product"
✅ 看到产品列表
✅ 编辑和删除产品
✅ 数据持久化到Supabase
```

### Day 5-7: 第一个集成

**任务**：
1. 配置N8N (本地Docker或N8N Cloud)
2. 创建一个简单的Webhook端点
3. 从Next.js调用N8N
4. 测试Claude API集成

**预期成果**：
```
你能从Web应用：
✅ 点击按钮触发N8N工作流
✅ N8N调用Claude API
✅ 获得返回结果
✅ 在页面显示结果
```

---

## 💻 开发习惯和规范

### 代码规范

```bash
# 代码格式化
pnpm format

# Lint检查
pnpm lint

# 类型检查
pnpm type-check

# 本地测试
pnpm test

# 提交前全检查
pnpm check  # 这会运行format + lint + type-check
```

### Git工作流

```bash
# 创建分支
git checkout -b feature/week1-products

# 定期提交（每天1-2次）
git add .
git commit -m "feat: 添加产品CRUD功能"

# Push到GitHub（工作进度持续可见）
git push origin feature/week1-products

# 每周末创建Pull Request
gh pr create --title "Week 1: Product Management" --body "..."
```

### 日志和调试

```typescript
// ✅ 好的做法
console.log('[PRODUCT_CREATION] Creating product:', { productId, name });
logger.info('产品创建成功', { productId });

// ❌ 避免
console.log('ok');
console.log(productData); // 敏感信息

// 生产环境使用专业日志
import { logger } from '@/lib/logger';
logger.info('事件描述', { context });
logger.error('错误信息', { error, context });
```

### 错误处理

```typescript
// ✅ 好的做法
try {
  const result = await supabase.from('products').select();
  if (!result.data) {
    throw new Error('无法获取产品列表');
  }
  return result.data;
} catch (error) {
  logger.error('获取产品失败', { error });
  return { error: '获取失败，请重试' };
}

// 在API中
export async function GET(req: Request) {
  try {
    const data = await getProducts();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

---

## 📋 每周的期望

### 每周的工作流程

**周一**：
- Standup (15分钟)：介绍这周计划
- 阅读需求和设计文档

**周二-周四**：
- 编码和测试
- 遇到问题立即反馈（不要卡住）
- 在GitHub上commit进度

**周五**：
- Demo (30分钟)：演示这周完成的功能
- PM验收（对比验收清单）
- 讨论下周计划
- 整理代码，提交Pull Request

### 验收标准

每周都会有验收。示例：

**Week 1验收**：
```
□ 能创建新产品（表单验证正确）
□ 能看到产品列表
□ 能编辑产品信息
□ 能删除产品
□ 数据正确保存到Supabase
□ 页面加载速度 <3秒
□ 没有console错误
```

如果全部✅，下周继续。
如果有❌，修复后再继续。

---

## 🚨 遇到问题怎么办？

### 遇到技术问题

1. **先自己搜索** (Google / Stack Overflow / 官方文档)
   - 大部分问题都有人遇到过

2. **查看相关的代码示例**
   - IMPLEMENTATION_ROADMAP.md 有代码示例
   - GitHub上搜索类似项目

3. **请PM帮助**
   - 描述：你在做什么，遇到什么错误
   - 提供：错误日志、代码片段、已尝试的方案
   - PM会帮你或找技术顾问

### 遇到需求不清楚

1. **再读一遍REQUIREMENTS_DETAILED.md**
   - 大部分答案都在里面

2. **查看验收标准**
   - DELIVERY_AND_ITERATION.md有具体例子

3. **问PM**
   - "什么时候算完成？"
   - "这个功能还需要什么？"

### 遇到时间压力

1. **主动告诉PM**
   - 不要等到周末才说"做不完"
   - 立即沟通，调整计划

2. **PM会帮助优先级排序**
   - 哪些必做，哪些可以放到下周

3. **不要为了赶进度降低质量**
   - 宁愿少做，也要质量好
   - 技术债务会累积

---

## 🎯 成功标志

你知道你在正确的路上，当：

✅ **Week 1结束**：
- 有一个运行中的Next.js应用
- 能基本操作Supabase
- 理解了系统架构

✅ **Week 3结束**：
- 能调用Claude API
- N8N工作流正常运行
- 看到AI生成的结果

✅ **Week 5结束**：
- 完整的内容生成流程
- 任务队列和缓存系统工作
- 成本优化有效果

✅ **Week 10结束**：
- 所有功能完成
- 部署到Vercel
- 准备上线

---

## 📞 联系和支持

### 沟通渠道

**日常沟通**：
- Slack / 钉钉 (实时问题)
- GitHub Issues (需求/问题跟踪)

**定期同步**：
- 每周五Demo (30分钟)
- 每周一Standup (15分钟)
- 需要时emergency call

### 文档位置

所有文档都在GitHub仓库中：
```
REQUIREMENTS_DETAILED.md        ← 需求说明
IMPLEMENTATION_ROADMAP.md       ← 开发指南
ENHANCED_STRATEGY.md            ← 优化细节
DELIVERY_AND_ITERATION.md       ← 验收标准
API_AND_TOOLS.md               ← API配置
SETUP_CHECKLIST.md             ← 启动清单
```

---

## 💪 你能成功做到这个项目，因为：

1. **需求很清晰**
   - 不是"做一个AI营销系统"
   - 而是"Week 1做A，Week 2做B..."
   - 你知道每一步要做什么

2. **代码框架完整**
   - 不需要从零开始搭建框架
   - 架构已经设计好
   - 只需要实现细节

3. **有充分的文档**
   - 代码示例
   - 验收标准
   - 问题排查指南
   - 都写好了

4. **技术栈都是主流**
   - Next.js, React, TypeScript
   - 学习资源丰富
   - 遇到问题容易找答案

5. **时间充足**
   - 10周完成
   - 不是紧张的3周冲刺
   - 有缓冲时间

---

## 🚀 现在就开始

1. **今天**：阅读上面的5份文档 (2小时)
2. **明天**：配置本地开发环境
3. **Day 3**：跑通第一个"Hello World"
4. **Week 1结束**：完成第一个里程碑

---

**欢迎加入！**

有任何问题，随时问。

祝你编码愉快！💻
