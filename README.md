# AutoMarketing Pro - Enhanced MVP

AI-driven global marketing automation system for managing products, generating user personas, creating optimized content, and tracking performance.

## 📋 Quick Start

### Prerequisites
- Node.js v18+
- pnpm (or npm)
- A code editor (VS Code recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/372768498/AutoMarketingforme1105.git
cd AutoMarketingforme1105

# Install dependencies
pnpm install

# Create .env.local file
cp .env.example .env.local

# Update .env.local with your API keys
# See API_AND_TOOLS.md for detailed setup instructions
```

### Running Locally

```bash
# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

## 🏗️ Project Structure

```
AutoMarketingforme1105/
├── app/                          # Next.js App Router
│   ├── api/                       # API routes
│   │   ├── health/               # Health check
│   │   └── products/             # Product CRUD endpoints
│   ├── dashboard/                # Dashboard pages
│   │   └── products/             # Product management
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── lib/                          # Utilities and libraries
│   ├── ai/                       # AI integrations (Claude, OpenAI)
│   ├── cache/                    # Redis cache manager
│   ├── supabase/                 # Supabase clients
│   └── queue/                    # Task queue (BullMQ)
├── types/                        # TypeScript type definitions
├── components/                   # React components
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript configuration
└── next.config.js                # Next.js configuration
```

## 🚀 Features

### Week 1: Foundation
- ✅ Product management (CRUD)
- ✅ Type definitions and API structure
- ✅ Redis caching system
- ✅ Health check endpoint

### Week 2-3: AI Analysis
- User persona generation with Claude
- Market analysis and insights
- Smart AI model routing (cost optimization)
- Caching for repeat requests

### Week 4-5: Content Generation
- AI-powered content creation
- SEO score calculation
- Readability analysis
- Async task queue system

### Week 6-7: Content Management
- Content calendar and scheduling
- Bulk content generation
- Status tracking and versioning

### Week 8: Analytics
- SEO ranking tracking
- Competitor monitoring
- Performance analytics
- Automated report generation

### Week 9-10: Optimization & Deployment
- Performance optimization
- Complete test coverage
- Production deployment
- Monitoring and alerts

## 📚 Documentation

- **[PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)** - Project overview and architecture
- **[REQUIREMENTS_DETAILED.md](REQUIREMENTS_DETAILED.md)** - Detailed feature requirements
- **[IMPLEMENTATION_ROADMAP.md](IMPLEMENTATION_ROADMAP.md)** - Technical implementation guide
- **[API_AND_TOOLS.md](API_AND_TOOLS.md)** - API and tool configuration
- **[WEEKLY_TASKS.md](WEEKLY_TASKS.md)** - Week-by-week task breakdown
- **[DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md)** - Database schema and migrations
- **[SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)** - Pre-development setup checklist
- **[ENHANCED_STRATEGY.md](ENHANCED_STRATEGY.md)** - Enhanced MVP optimization strategy

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Cache**: Upstash Redis
- **Queue**: BullMQ
- **AI**: Claude API, OpenAI API (GPT-4o, GPT-4o-mini)
- **Automation**: N8N (local Docker)
- **Deployment**: Vercel

## 🔑 Environment Variables

Create `.env.local` with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# AI APIs
CLAUDE_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-proj-xxx

# Redis Cache
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXXXxxx

# N8N
N8N_WEBHOOK_URL=http://localhost:5678/webhook/xxx

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

See [API_AND_TOOLS.md](API_AND_TOOLS.md) for detailed configuration instructions.

## 🧪 Testing

```bash
# Check types
pnpm type-check

# Run linter
pnpm lint

# Format code
pnpm format

# Run all checks
pnpm check
```

## 📊 Project Timeline

- **Week 1-2**: Infrastructure and product management ✅
- **Week 3-4**: AI analysis engine (personas, market analysis)
- **Week 5-6**: Content generation and task queue
- **Week 7**: Content calendar and scheduling
- **Week 8**: SEO tracking and competitor monitoring
- **Week 9-10**: Optimization, testing, and deployment

## 🚨 Troubleshooting

### Supabase Connection Failed
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Verify Supabase project is active
- Check network connectivity

### Claude API Errors
- Verify `CLAUDE_API_KEY` is correct
- Check API usage in Anthropic console
- Ensure budget limit is sufficient

### Redis Connection Timeout
- Check `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- Verify Upstash account is active
- For China users: Consider using VPN or proxy

## 📞 Support

For issues and questions:
1. Check the relevant documentation file
2. Review [WEEKLY_TASKS.md](WEEKLY_TASKS.md) for context
3. Check GitHub Issues
4. Contact the development team

## 📝 License

This project is part of the AutoMarketing Pro suite.

## 🎯 Success Metrics

By the end of Week 1:
- ✅ Product CRUD functionality working
- ✅ Data persisting to Supabase
- ✅ Caching system operational
- ✅ All API endpoints functional
- ✅ No console errors

---

**Last Updated**: November 5, 2025
**Version**: 0.1.0
**Status**: Foundation Phase
