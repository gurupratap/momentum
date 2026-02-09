# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Momentum** is a goal-first habit-building app with AI-powered coaching. Users set goals, receive AI-generated habit suggestions, and get personalized research-based coaching for each habit they adopt.

### Core Flow
1. **User creates a goal** → AI analyzes and suggests 3-5 actionable habits
2. **User selects habits** → Each habit gets AI coaching (research/analysis)
3. **Dashboard shows goals** → Drill down: Goals → Habits → Details

## Commands

### Development
```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Production build (verifies TypeScript)
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate              # Generate Prisma client after schema changes
npx prisma migrate dev           # Create and apply migration
npx prisma migrate deploy        # Apply migrations (production)
npx prisma db push               # Sync schema without migration (dev only)
npx prisma studio               # Open database GUI
```

**Important**: Prisma client is generated to `app/generated/prisma` (not default location).

## Architecture

### Goal-First Data Model

```
User → Goals → Habits
         ↓        ↓
   GoalInsight  HabitInsight
```

- **Goal**: What user wants to achieve (title, category, targetDate)
- **GoalInsight**: AI analysis + suggested habits (stored as JSON)
- **Habit**: Actionable behavior (name, description, frequency, isAiSuggested)
- **HabitInsight**: AI research/coaching (research text only, no questions)

**Key relationships**:
- Goals belong to Users
- Habits belong to Goals (required: `goalId`)
- Every Habit has exactly one parent Goal
- Insights are 1:1 with their entities

### AI System Architecture

**Two AI agents** (`lib/ai/`):
1. **goal-agent.ts**: Analyzes goals → generates 3-5 habit suggestions
2. **habit-agent.ts**: Analyzes habits → generates research/coaching

**Configuration** (`lib/ai/model.ts`):
- All AI settings read from `.env` (MODEL_ID, TEMPERATURE, MAX_TOKENS)
- Change model: update `.env` and restart server
- See `lib/ai/config.md` for model options

**JSON Parsing** (`lib/ai/parse-*.ts`):
- AI responses must be valid JSON (no markdown fences)
- Auto-repairs common issues (curly quotes, contractions, truncation)
- Temperature set low (0.3) for consistent formatting
- **JSON Robustness Tracking** (`lib/ai/json-robustness.ts`):
  - Tracks concrete metrics for every parse (repairs applied, errors, semantic quality)
  - Calculates robustness score (0-100) with actionable recommendations
  - Logs to Opik: `json_robustnessScore`, `json_repairSteps`, `json_recommendation`
  - Better than abstract scores: shows exactly what failed and how to fix it

**Telemetry** (`lib/ai/opik.ts`):
- All AI calls traced to Opik for monitoring
- Include `model`, `provider`, `usage` metadata for cost tracking

**Evaluations** (`lib/ai/evaluations.ts`, `lib/ai/json-robustness.ts`, `lib/ai/opik-evaluations.yaml`):
- **Two-tier evaluation system**: Local metrics (immediate) + Opik LLM judges (async)
- **Three-stage pipeline**: Goal analysis + Habit overview + Habit suggestion evaluations
- **Plus: JSON robustness tracking** on every parse operation
- **Local evaluations** (auto-run on every analysis):
  - Goal: `evaluateGoalCompleteness()`: Extracts attributes (goal, time, motivators, constraints, success, uncertainties) (0-100)
  - Habit Overview: `evaluateOverviewScannability()`: Word count, paragraph breaks, clear opening (0-100)
  - Habit: `evaluateSpecificity()`: Checks for action, cue, frequency, metrics, duration (0-100)
  - Habit: `evaluateProgression()`: Checks for ramp-up plans, plateau mitigation (0-100)
  - Habit: `evaluateDiversity()`: Checks for varied options across constraints (0-100)
  - **JSON: `calculateJSONRobustness()`**: Tracks repairs, parse success, schema compliance, semantic quality (0-100)
- **Results logged to Opik**: `json_robustnessScore`, `json_repairSteps`, `evaluation_goalCompleteness`, `evaluation_avgSpecificity`, etc.
- **LLM-based evaluations** (35 total, configured in Opik platform):
  - Goal (11): `goal_understanding_accuracy`, `goal_assumptions_and_risk_detection`, `goal_actionability_and_clarity` (+8 more)
  - Habit Overview (9): `habit_overview_goal_alignment`, `habit_overview_faithfulness`, `habit_overview_clarity` (+6 more)
  - Habit (15): `habit_relevance_personalization`, `habit_safety_check`, `habit_adoption_likelihood` (+12 more)
  - Composites: `goal_overall_analysis_composite`, `habit_overview_overall_quality`, `overall_quality_composite` for A/B testing
- **Total**: 41 evaluations (6 local + 35 LLM) across 3 stages + JSON parsing
- **See `lib/ai/EVALUATIONS.md`** for full documentation and setup guide
- **See `lib/ai/JSON_ROBUSTNESS_ADDED.md`** for JSON robustness details
- **Test locally**: `npx tsx lib/ai/test-evaluations.ts`

**Cost Tracking** (`lib/ai/cost.ts`):
- All AI calls log estimated cost in USD to Opik
- Based on token usage and model-specific pricing
- Tracks: `estimated_cost_usd`, `estimated_cost_formatted`
- Current model (Gemini 2.0 Flash Exp): FREE during preview
- **See `lib/ai/COST_TRACKING_ADDED.md`** for pricing details and optimization

### API Architecture

**Pattern**: Next.js 15 Route Handlers with `after()` for background jobs

**Goal endpoints**:
```
POST   /api/goals                     # Create goal → trigger AI analysis
GET    /api/goals                     # List user's goals
GET    /api/goals/[id]                # Get goal + habits + insight
PATCH  /api/goals/[id]                # Update goal
DELETE /api/goals/[id]                # Delete goal (cascades)
GET    /api/goals/[id]/insight        # Get AI analysis
POST   /api/goals/[id]/insight/retry  # Retry failed analysis
POST   /api/goals/[id]/habits         # Create habits from suggestion indices
```

**Habit endpoints**:
```
POST   /api/habits                    # Create manual habit (requires goalId)
GET    /api/habits/[id]               # Get habit
GET    /api/habits/[id]/insight       # Get AI coaching
POST   /api/habits/[id]/insight/retry # Retry failed analysis
```

**Background AI pattern**:
```typescript
// Create entity + pending insight
await prisma.goal.create({ ... })
await prisma.goalInsight.create({ status: 'PENDING' })

// Trigger AI in background (non-blocking)
after(async () => {
  await analyzeGoal(goalId)
})

// Return immediately to user
return NextResponse.json({ data: goal })
```

### UI Architecture

**Pages** (`app/`):
- `/dashboard` - Shows user's goals (server component)
- `/goals/new` - Create goal form
- `/goals/[id]` - Goal detail: habits (top), collapsible AI sections (bottom)
- `/goals/[id]/add-habit` - Manual habit creation
- `/habits/[id]` - Habit detail with coaching
- `/habits/new` - Redirects to goal creation (habits must belong to goals)

**Components** (`components/`):
- `goals/GoalForm` - Create goal (title, description, category, targetDate)
- `goals/GoalCard` - Display goal with habit count
- `goals/GoalInsightSection` - AI analysis + suggestions (collapsible when habits exist)
- `goals/HabitSuggestionList` - Multi-select to add habits
- `habits/HabitForm` - Requires `goalId` prop
- `habits/HabitCard` - Shows description, AI badge, optional goal context

**Data fetching optimization**:
- Goal detail page fetches goal + habits + insight in **one server query**
- Pass `initialInsight` to client component to avoid loading state
- Client component only polls while status is PENDING/PROCESSING

### Authentication

Uses **StackAuth** (`@stackframe/stack`):
```typescript
import { stackServerApp } from '@/stack'

const user = await stackServerApp.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

All API routes must verify user ownership before mutations.

## Environment Variables

Copy `.env.example` to `.env`:

**Required**:
- `DATABASE_URL` - PostgreSQL connection
- `STACK_*` - StackAuth credentials
- `GOOGLE_GENERATIVE_AI_API_KEY` - Google AI API key
- `OPIK_*` - Opik observability credentials

**AI Configuration** (see `lib/ai/config.md`):
- `AI_MODEL_ID` - Which model to use (default: `gemini-2.0-flash-exp`)
- `AI_MODEL_TEMPERATURE` - 0.3 recommended for consistent JSON
- `AI_MODEL_MAX_TOKENS` - 4096 to avoid truncation

## Common Patterns

### Creating a new AI agent
1. Add function in `lib/ai/` (follow `goal-agent.ts` pattern)
2. Create prompt in `lib/ai/prompts.ts` with explicit JSON formatting rules
3. Create parser in `lib/ai/parse-*.ts` with `repairJSON()` function
4. Import model config: `import { model, MODEL_ID, PROVIDER, TEMPERATURE, MAX_TOKENS }`
5. Create Opik trace with `model` and `provider` fields
6. Handle errors and flush Opik: `await opik.flush()`

### Adding a new API route
1. Verify authentication with `stackServerApp.getUser()`
2. Validate request body with Zod schema (`lib/validations/`)
3. Verify ownership before mutations
4. Use `after()` for background AI jobs
5. Return immediately (don't await background work)
6. Set `maxDuration = 60` for AI routes

### Database schema changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Run `npx prisma migrate dev --name description`
4. Import types from `@/app/generated/prisma/client`

## Key Constraints

- **Habits must have a goal**: `goalId` is required (enforced at API + validation layers)
- **AI responses are JSON**: Must parse correctly or fail gracefully with retry
- **Insights are 1:1**: One GoalInsight per Goal, one HabitInsight per Habit
- **Background AI jobs**: Always use `after()`, never block the response
- **Opik cost tracking**: Include `model`, `provider`, `usage` in all LLM spans
