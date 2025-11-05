# N8N 工作流配置指南

完整的 N8N 工作流已准备好，可以直接在你的 N8N 实例中导入和使用。

## 📦 包含的工作流

### 1. Persona Generator Workflow
**文件**: `n8n-workflows/1-persona-generator.json`

**功能**：
- 接收产品信息
- 调用 Claude API 生成 3-5 个详细的用户画像
- 保存结果回 Next.js 应用的数据库

**输入示例**：
```json
{
  "productName": "AutoMarketing Pro",
  "productDescription": "AI-driven marketing automation platform",
  "productType": "B2B SaaS",
  "targetMarkets": ["US", "EU"],
  "productId": "uuid-here"
}
```

**输出示例**：
```json
{
  "personas": [
    {
      "name": "Tech-Savvy Startup Founder",
      "demographics": {
        "ageRange": "28-40",
        "gender": "M/F",
        "location": "US/EU"
      },
      "psychographics": {
        "values": ["innovation", "efficiency"],
        "interests": ["AI", "marketing"]
      },
      "platforms": ["linkedin", "twitter"],
      "buying_triggers": ["cost savings", "time efficiency"]
    }
  ]
}
```

---

### 2. Market Analyzer Workflow
**文件**: `n8n-workflows/2-market-analyzer.json`

**功能**：
- 接收产品和市场信息
- 调用 Claude API 进行深度市场分析
- 生成 20-30 个关键词建议
- 分析竞争对手和市场机会

**输入示例**：
```json
{
  "productName": "AutoMarketing Pro",
  "productDescription": "AI-driven marketing automation platform",
  "productType": "B2B SaaS",
  "market": "US",
  "productId": "uuid-here"
}
```

**输出示例**：
```json
{
  "marketTrends": [...],
  "competitors": [...],
  "keywords": [
    {
      "keyword": "AI marketing automation",
      "searchVolume": 5000,
      "difficulty": "medium",
      "priority": "high"
    }
  ],
  "contentStrategy": "..."
}
```

---

### 3. Content Generator Workflow
**文件**: `n8n-workflows/3-content-generator.json`

**功能**：
- 接收产品、用户画像和关键词
- 调用 Claude API 生成优化的营销内容
- 分析内容的 SEO 质量和可读性
- 保存完整的内容结果（含分数）

**支持的内容类型**：
- `blog` - 800-1500 字的博客文章
- `social` - 100-280 字的社交媒体帖子
- `email` - 200-500 字的营销邮件

**输入示例**：
```json
{
  "productName": "AutoMarketing Pro",
  "productDescription": "AI-driven marketing automation platform",
  "personaName": "Tech-Savvy Founder",
  "personaDescription": "CEO of startup, values efficiency",
  "contentType": "blog",
  "keywords": ["marketing automation", "AI tools"],
  "productId": "uuid-here",
  "personaId": "uuid-here"
}
```

**输出示例**：
```json
{
  "title": "How AI Marketing Automation Can Save Your Startup 50 Hours Per Week",
  "content": "...",
  "seoScore": 82,
  "readabilityScore": 78,
  "keywords": ["marketing automation", "AI tools"],
  "callToAction": "Start your free trial today"
}
```

---

## 🚀 导入工作流到 N8N

### 方式 1: 从文件导入（推荐）

1. 打开你的 N8N 实例
2. 点击左上角的菜单 → "导入"
3. 选择 JSON 文件（从 `n8n-workflows/` 文件夹）
4. 确认导入

### 方式 2: 从 URL 导入

1. 在 N8N 中点击 "New Workflow"
2. 在 Workflow 设置中选择 "Import from URL"
3. 输入这个 URL（后期可以提供）

---

## ⚙️ 配置工作流环境变量

导入后，需要配置以下环境变量（在 N8N 中）：

```bash
# 1. Claude API Key（你的中转 API）
CLAUDE_API_KEY=你的中转API密钥

# 2. Next.js 应用 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 3. API 认证 Key（可选，用于保护 API 调用）
API_KEY=your-secret-key
```

### 在 N8N 中设置环境变量：

1. 打开 N8N Dashboard
2. 进入 Settings → Variables
3. 添加上述环境变量
4. 保存

---

## 🔌 集成到 Next.js 应用

### 1. 在应用中调用工作流

创建一个 API 端点来调用 N8N Webhook：

```typescript
// app/api/personas/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 调用 N8N Webhook
    const response = await fetch(
      process.env.N8N_WEBHOOK_URL_PERSONA!,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Failed to generate personas:', error);
    return NextResponse.json(
      { error: 'Failed to generate personas' },
      { status: 500 }
    );
  }
}
```

### 2. 在 React 组件中调用

```typescript
'use client';

import { useState } from 'react';

export function PersonaGenerator({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  const [personas, setPersonas] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName: 'Your Product',
          productDescription: 'Description',
          productType: 'B2B',
          targetMarkets: ['US', 'EU'],
        }),
      });

      const data = await res.json();
      setPersonas(data.data.personas);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Personas'}
      </button>
      {/* Display personas */}
    </div>
  );
}
```

---

## 📊 N8N Webhook URLs

你需要获取每个工作流的 Webhook URL：

1. 在 N8N 中打开工作流
2. 找到 "Webhook" 节点
3. 复制 Webhook URL

示例格式：
```
http://localhost:5678/webhook/generate-persona
http://localhost:5678/webhook/analyze-market
http://localhost:5678/webhook/generate-content
```

将这些 URL 保存到 `.env.local`：

```bash
N8N_WEBHOOK_URL_PERSONA=http://localhost:5678/webhook/generate-persona
N8N_WEBHOOK_URL_MARKET=http://localhost:5678/webhook/analyze-market
N8N_WEBHOOK_URL_CONTENT=http://localhost:5678/webhook/generate-content
```

---

## 🔧 工作流自定义

### 修改 Claude Prompt

每个工作流中的 Claude 调用都可以修改。在 N8N 中：

1. 打开工作流
2. 点击 "Claude API" 节点
3. 在 "Body" 字段中编辑 prompt
4. 保存工作流

### 添加错误处理

可以在工作流中添加错误处理节点：

1. 添加 "Error Handler" 节点
2. 连接到关键步骤
3. 配置重试逻辑或通知

### 调整 API 调用参数

```json
{
  "model": "claude-3-5-sonnet-20241022",  // 可以改成其他模型
  "max_tokens": 4096,                     // 调整输出长度
  "temperature": 0.7,                     // 调整创意度（0-1）
  "top_p": 0.9                            // 调整多样性
}
```

---

## 🧪 测试工作流

### 1. 在 N8N 中测试

1. 打开工作流
2. 点击 "Test" 按钮
3. 点击 Webhook 节点的 "Test"
4. 输入示例数据
5. 查看执行结果

### 2. 使用 cURL 测试

```bash
# 测试 Persona Generator
curl -X POST http://localhost:5678/webhook/generate-persona \
  -H "Content-Type: application/json" \
  -d '{
    "productName": "AutoMarketing Pro",
    "productDescription": "AI marketing automation",
    "productType": "B2B",
    "targetMarkets": ["US"],
    "productId": "test-id"
  }'
```

### 3. 使用 Postman 测试

1. 创建新的 POST 请求
2. URL：`http://localhost:5678/webhook/generate-persona`
3. Body（JSON）：复制上面的示例数据
4. 发送请求

---

## 📈 监控工作流

### 在 N8N Dashboard 查看：

1. **Execution Log** - 查看每次执行的详细日志
2. **Performance** - 查看执行时间和成功率
3. **Errors** - 查看失败的执行和错误信息

### 添加日志节点：

```
[Webhook] → [Claude API] → [Log Node] → [Save to DB]
```

使用 "Write log entry" 节点记录关键步骤。

---

## 🚨 常见问题

### Q: Webhook 返回 404
**A**:
- 确认工作流已激活
- 检查 Webhook 路径是否正确
- 重新启动 N8N

### Q: Claude API 返回错误
**A**:
- 检查 API Key 是否正确
- 检查 API Key 是否有有效期限制
- 查看 N8N 日志获取详细错误信息

### Q: 工作流超时
**A**:
- 增加 max_tokens 的超时时间
- 减少提示词长度
- 分解为多个工作流

### Q: 如何修改输出格式
**A**:
- 修改 Claude prompt 中的 "JSON 格式" 部分
- 在 "Parse JSON" 节点中修改 jsonPath
- 在最后的 HTTP Request 中调整 body 结构

---

## 📝 工作流最佳实践

1. **错误处理**: 为每个关键节点添加错误处理
2. **日志记录**: 在关键步骤添加日志节点
3. **超时配置**: 设置合理的超时时间（30-60秒）
4. **重试机制**: 启用自动重试（最多 3 次）
5. **版本控制**: 定期导出和保存工作流备份

---

## 🎯 下一步

1. ✅ 导入 3 个工作流到你的 N8N 实例
2. ✅ 配置环境变量
3. ✅ 测试每个工作流
4. ✅ 集成到 Next.js 应用
5. ✅ 创建相应的 API 端点

需要帮助？查看相关文档：
- API 配置：`API_AND_TOOLS.md`
- 每周任务：`WEEKLY_TASKS.md`
- 数据库：`DATABASE_MIGRATIONS.md`

