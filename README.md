# Momentum

A goal-first habit-building app with AI-powered coaching. Set goals, receive AI-generated habit suggestions, and get personalized research-based coaching for each habit you adopt.

## 🎯 Core Flow

1. **User creates a goal** → AI analyzes and suggests 3-5 actionable habits
2. **User selects habits** → Each habit gets AI coaching (research/analysis)
3. **Dashboard shows goals** → Drill down: Goals → Habits → Details

## ✨ Features

- **Goal-First Architecture**: Start with what you want to achieve
- **AI Habit Generation**: Get 3-5 personalized habit suggestions per goal
- **AI Coaching**: Research-backed insights for each habit
- **Smart Parsing**: Automatic JSON repair with robustness tracking
- **Observability**: Full telemetry with Opik integration
- **Type-Safe**: End-to-end TypeScript with Prisma ORM

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **AI**: Google Gemini 2.0 Flash via Vercel AI SDK
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: StackAuth
- **Observability**: Opik (Comet ML)
- **Styling**: Tailwind CSS
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Google AI API key
- Opik account (optional, for telemetry)
- StackAuth project

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd momentum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in required variables:
   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # StackAuth
   NEXT_PUBLIC_STACK_PROJECT_ID="..."
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="..."
   STACK_SECRET_SERVER_KEY="..."

   # Google AI
   GOOGLE_GENERATIVE_AI_API_KEY="..."

   # Opik (optional)
   OPIK_API_KEY="..."
   OPIK_WORKSPACE="..."

   # AI Configuration
   AI_MODEL_ID="gemini-2.0-flash-exp"
   AI_MODEL_TEMPERATURE="0.3"
   AI_MODEL_MAX_TOKENS="4096"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📝 Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate              # Generate Prisma client
npx prisma migrate dev           # Create and apply migration
npx prisma migrate deploy        # Apply migrations (production)
npx prisma db push               # Sync schema without migration
npx prisma studio               # Open database GUI
```

## 🐳 Docker

### Quick Start with Docker

```bash
# Development (with hot reload)
docker compose -f docker-compose.dev.yml up

# Production
docker compose up --build -d
```

### Features

- ✅ **Multi-stage builds** - Optimized production images (~200MB)
- ✅ **Hot reload** - Development mode with live code updates
- ✅ **PostgreSQL included** - No external database setup needed
- ✅ **Health checks** - Automatic container monitoring
- ✅ **Non-root user** - Security best practices

### CI/CD Pipeline

GitHub Actions workflow included:
- **Lint** → **TypeCheck** → **Build** → **Test** → **Docker Build**
- **Deploy** (manual trigger only, requires all checks to pass)

See [DOCKER.md](./DOCKER.md) for complete Docker and CI/CD documentation.

## 📁 Project Structure

```
momentum/
├── app/                      # Next.js app directory
│   ├── (dashboard)/         # Dashboard routes
│   ├── api/                 # API routes
│   │   ├── goals/          # Goal endpoints
│   │   └── habits/         # Habit endpoints
│   ├── goals/              # Goal pages
│   └── habits/             # Habit pages
├── components/              # React components
│   ├── goals/              # Goal components
│   └── habits/             # Habit components
├── lib/                     # Shared utilities
│   ├── ai/                 # AI system
│   │   ├── goal-agent.ts   # Goal analysis
│   │   ├── habit-agent.ts  # Habit analysis
│   │   ├── prompts.ts      # AI prompts
│   │   ├── parse-*.ts      # JSON parsers
│   │   └── opik.ts         # Telemetry
│   ├── db/                 # Database
│   │   └── prisma.ts       # Prisma client
│   └── validations/        # Zod schemas
├── prisma/                  # Database schema
│   └── schema.prisma       # Prisma schema
└── types/                   # TypeScript types
```

## 🤖 AI System

### Architecture

**Two AI Agents:**
1. **goal-agent.ts**: Analyzes goals → generates 3-5 habit suggestions
2. **habit-agent.ts**: Analyzes habits → generates research/coaching

**Configuration** (`lib/ai/model.ts`):
- All settings read from `.env`
- Change model: update `AI_MODEL_ID` and restart server
- Default: `gemini-2.0-flash-exp`

**JSON Parsing** (`lib/ai/parse-*.ts`):
- AI responses must be valid JSON
- Auto-repairs common issues (curly quotes, contractions, truncation)
- Temperature set low (0.3) for consistent formatting
- Robustness tracking logs to Opik

**Telemetry** (`lib/ai/opik.ts`):
- All AI calls traced to Opik
- Token usage tracking
- JSON robustness metrics
- Error tracking

### Opik Evaluations

7 LLM-based evaluations for monitoring AI quality:

**Goal Analysis (2):**
- `goal_understanding_accuracy` (1-10)
- `goal_actionability_and_clarity` (1-10)

**Habit Overview (2):**
- `habit_overview_goal_alignment` (1-10)
- `habit_overview_clarity` (1-10)

**Habit Suggestions (3):**
- `habit_relevance_personalization` (1-10)
- `habit_personal_motivation_alignment` (1-10)
- `habit_adoption_likelihood` (0-100)

See `lib/ai/opik-evaluations.yaml` for full configuration.

## 🗄 Database Schema

### Core Models

**User** → **Goals** → **Habits**
- Goals belong to Users
- Habits belong to Goals (required: `goalId`)
- Every Habit has exactly one parent Goal

**Insights (1:1 relationships):**
- `GoalInsight`: AI analysis + suggested habits (JSON)
- `HabitInsight`: AI research/coaching

### Key Fields

**Goal:**
- `title`: What user wants to achieve
- `description`: Optional details
- `category`: Health, Fitness, Productivity, etc.
- `status`: Active, Paused, Achieved, Abandoned

**Habit:**
- `name`: Habit name
- `description`: What it involves
- `frequency`: Daily, Weekly, Custom
- `isAiSuggested`: Whether from AI or manual

## 🔐 Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `STACK_*` | StackAuth credentials (3 keys) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `OPIK_API_KEY` | Opik API key | - |
| `OPIK_WORKSPACE` | Opik workspace name | - |
| `AI_MODEL_ID` | Gemini model to use | `gemini-2.0-flash-exp` |
| `AI_MODEL_TEMPERATURE` | Temperature (0-1) | `0.3` |
| `AI_MODEL_MAX_TOKENS` | Max output tokens | `4096` |

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

**Important settings:**
- Framework: Next.js
- Build command: `npm run build`
- Install command: `npm install`
- Root directory: `./`

### Database

Use a hosted PostgreSQL database:
- Vercel Postgres
- Supabase
- Railway
- Neon

Run migrations after deployment:
```bash
npx prisma migrate deploy
```

## 📚 Additional Documentation

- **DOCKER.md**: Complete Docker and CI/CD guide
- **CLAUDE.md**: Instructions for Claude Code (AI assistant)
- **lib/ai/config.md**: AI model configuration guide
- **lib/ai/EVALUATIONS.md**: Evaluation system documentation
- **START_HERE_OPIK.md**: Opik evaluation setup guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

[Your License Here]

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- AI powered by [Google Gemini](https://ai.google.dev)
- Auth by [StackAuth](https://stack-auth.com)
- Observability by [Opik](https://www.comet.com/docs/opik)
