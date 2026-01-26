# Momentum - Task Breakdown

This document outlines the development tasks for the Momentum project, organized by milestone. Each task includes estimated time, dependencies, and acceptance criteria.

---

## Task Status Legend

- [ ] Not Started
- [~] In Progress  
- [x] Complete
- [!] Blocked

---

## Milestone 1: Goal Creation & Purpose (MVP Foundation)

**Milestone Goal**: Users can create a goal, articulate their personal motivation (Purpose), and see it on their dashboard.

**Estimated Duration**: 3-4 days  
**Priority**: P0 - Must complete for MVP demo

---

### Phase 1A: Project Setup & Infrastructure

#### Task 1.1: Initialize Next.js Project
- **Description**: Set up the Next.js 16+ project with App Router, TypeScript, and Tailwind CSS
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: None

**Subtasks**:
- [ ] Run `npx create-next-app@latest momentum --typescript --tailwind --app`
- [ ] Configure ESLint and Prettier
- [ ] Set up folder structure:
  ```
  /app
    /api
    /(auth)
    /(dashboard)
    /goals
  /components
    /ui
    /goals
    /layout
  /lib
    /db
    /agent
    /utils
  /types
  ```
- [ ] Create `.env.local` template with required variables
- [ ] Add README with setup instructions

**Acceptance Criteria**:
- [ ] `npm run dev` starts without errors
- [ ] Tailwind styles render correctly
- [ ] TypeScript compilation passes

---

#### Task 1.2: Database Setup with Prisma
- **Description**: Configure PostgreSQL database and Prisma ORM
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.1

**Subtasks**:
- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Create initial schema with User and Goal models:
  ```prisma
  model User {
    id        String   @id @default(cuid())
    email     String   @unique
    name      String?
    goals     Goal[]
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }

  model Goal {
    id            String        @id @default(cuid())
    userId        String
    user          User          @relation(fields: [userId], references: [id])
    title         String
    description   String?
    frequency     FrequencyType
    frequencyTarget Int?
    startDate     DateTime      @default(now())
    endDate       DateTime?
    purpose       String
    status        GoalStatus    @default(ACTIVE)
    createdAt     DateTime      @default(now())
    updatedAt     DateTime      @updatedAt
  }

  enum FrequencyType {
    DAILY
    WEEKLY
    CUSTOM
  }

  enum GoalStatus {
    DRAFT
    ACTIVE
    PAUSED
    COMPLETED
    ABANDONED
  }
  ```
- [ ] Set up database connection (local or hosted)
- [ ] Run initial migration: `npx prisma migrate dev`
- [ ] Create Prisma client utility (`/lib/db/prisma.ts`)
- [ ] Verify connection with test query

**Acceptance Criteria**:
- [ ] Prisma Studio shows database tables
- [ ] Can create/read records programmatically
- [ ] Migration files committed to repo

---

#### Task 1.3: Authentication Setup
- **Description**: Implement user authentication with StackAuth
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.2

**Subtasks**:
- [ ] Install StackAuth: `npm install @stackframe/stack @stackframe/stack-sc`
- [ ] Create auth configuration (`/app/api/auth/[...stack]/route.ts`)
- [ ] Configure at least one provider (email/magic link or OAuth)
- [ ] Create session provider wrapper component
- [ ] Add middleware for protected routes
- [ ] Create sign-in and sign-out UI components

**Acceptance Criteria**:
- [ ] User can sign in and sign out
- [ ] Session persists across page refreshes
- [ ] Protected routes redirect unauthenticated users

---

### Phase 1B: Goal Creation UI

#### Task 1.4: Create Goal Form Component
- **Description**: Build the multi-step goal creation form
- **Estimated Time**: 3-4 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.1

**Subtasks**:
- [ ] Create `/components/goals/GoalCreationWizard.tsx`
- [ ] Implement step state management (useState or useReducer)
- [ ] Build Step 1: Goal Title & Description
  - Text input for title (required, max 100 chars)
  - Textarea for description (optional, max 500 chars)
  - Character count display
- [ ] Build Step 2: Frequency Selection
  - Radio buttons: Daily, Weekly, Custom
  - Conditional input for "X times per week"
  - Visual examples for each option
- [ ] Build Step 3: Duration/Timeline
  - Date picker for start date (default: today)
  - Optional end date
  - Quick presets: "30 days", "90 days", "Ongoing"
- [ ] Add progress indicator showing current step
- [ ] Implement navigation (Next, Back, Cancel)
- [ ] Add form validation with helpful error messages

**Acceptance Criteria**:
- [ ] All steps render correctly
- [ ] Navigation between steps works
- [ ] Form validates required fields
- [ ] Data persists when navigating between steps

---

#### Task 1.5: Purpose Input Component
- **Description**: Build the dedicated Purpose capture experience
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.4

**Subtasks**:
- [ ] Create `/components/goals/PurposeInput.tsx`
- [ ] Design conversational prompt UI:
  ```
  "Before we begin tracking, let's capture the PURPOSE behind this goal.
   This isn't just a formality—we'll use this to support you when things get tough."
  ```
- [ ] Add rotating prompt questions to inspire users:
  - "What will achieving this goal make possible in your life?"
  - "Who are you doing this for?"
  - "How will you feel when you've built this habit?"
  - "What's the cost of NOT achieving this goal?"
- [ ] Create textarea with minimum character validation (20 chars)
- [ ] Add real-time character count
- [ ] Include "I need help writing this" button (shows additional prompts)
- [ ] Style with warm, encouraging visual design
- [ ] Add subtle animation/transition when section appears

**Acceptance Criteria**:
- [ ] Prompt questions rotate or are selectable
- [ ] Validation prevents submission under 20 characters
- [ ] UI feels conversational, not form-like
- [ ] Help option provides additional guidance

---

#### Task 1.6: Goal Creation Page
- **Description**: Create the page that hosts the goal creation flow
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.4, Task 1.5

**Subtasks**:
- [ ] Create `/app/goals/new/page.tsx`
- [ ] Integrate GoalCreationWizard component
- [ ] Add page header with back navigation
- [ ] Implement auto-save to localStorage (draft recovery)
- [ ] Add confirmation modal before abandoning incomplete form
- [ ] Create loading state for submission
- [ ] Redirect to dashboard on successful creation

**Acceptance Criteria**:
- [ ] Page is accessible at `/goals/new`
- [ ] Incomplete forms can be recovered
- [ ] Successful submission redirects to dashboard

---

### Phase 1C: Goal API & Data Persistence

#### Task 1.7: Goal API Routes
- **Description**: Create API endpoints for goal CRUD operations
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.2, Task 1.3

**Subtasks**:
- [ ] Create `/app/api/goals/route.ts` (GET all, POST new)
  ```typescript
  // POST /api/goals
  {
    title: string,
    description?: string,
    frequency: 'DAILY' | 'WEEKLY' | 'CUSTOM',
    frequencyTarget?: number,
    startDate?: string,
    endDate?: string,
    purpose: string
  }
  ```
- [ ] Create `/app/api/goals/[id]/route.ts` (GET one, PUT, DELETE)
- [ ] Add request validation (zod or manual)
- [ ] Implement proper error handling and status codes
- [ ] Ensure authentication check on all routes
- [ ] Add TypeScript types for request/response

**Acceptance Criteria**:
- [ ] Can create goal via POST request
- [ ] Can retrieve user's goals via GET
- [ ] Cannot access other users' goals
- [ ] Invalid requests return appropriate errors

---

#### Task 1.8: Connect Form to API
- **Description**: Wire up the goal creation form to the API
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.6, Task 1.7

**Subtasks**:
- [ ] Create form submission handler
- [ ] Implement API call with fetch or React Query
- [ ] Add loading state during submission
- [ ] Handle success response (redirect + toast)
- [ ] Handle error response (show message, preserve form data)
- [ ] Add optimistic UI update if using React Query

**Acceptance Criteria**:
- [ ] Submitting form creates goal in database
- [ ] User sees success feedback
- [ ] Errors are displayed helpfully
- [ ] Form doesn't lose data on error

---

### Phase 1D: Dashboard & Goal Display

#### Task 1.9: Dashboard Page
- **Description**: Create the main dashboard showing user's goals
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.7

**Subtasks**:
- [ ] Create `/app/(dashboard)/page.tsx`
- [ ] Fetch user's goals from API
- [ ] Display personalized greeting with user's name
- [ ] Show "Create your first goal" CTA if no goals exist
- [ ] Implement loading skeleton state
- [ ] Add error state handling

**Acceptance Criteria**:
- [ ] Dashboard loads user's goals
- [ ] Empty state encourages goal creation
- [ ] Loading state prevents layout shift

---

#### Task 1.10: Goal Card Component
- **Description**: Build reusable goal display card for dashboard
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.9

**Subtasks**:
- [ ] Create `/components/goals/GoalCard.tsx`
- [ ] Display goal title prominently
- [ ] Show frequency in human-readable format ("Daily", "3x per week")
- [ ] Include truncated Purpose (expandable on click)
- [ ] Add status indicator (Active, Paused, etc.)
- [ ] Include quick action buttons (Check-in, Edit, Pause)
- [ ] Design responsive layout (mobile-first)
- [ ] Add hover/active states for interactivity

**Acceptance Criteria**:
- [ ] Card displays all key goal information
- [ ] Purpose is visible but not overwhelming
- [ ] Actions are easily accessible
- [ ] Looks good on mobile and desktop

---

#### Task 1.11: Goal Detail View
- **Description**: Create detailed view for individual goal
- **Estimated Time**: 2-3 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.7, Task 1.10

**Subtasks**:
- [ ] Create `/app/goals/[id]/page.tsx`
- [ ] Fetch individual goal by ID
- [ ] Display full goal information
- [ ] Show complete Purpose prominently
- [ ] Add edit button linking to edit flow
- [ ] Include goal actions (Pause, Complete, Delete)
- [ ] Prepare placeholder for future check-in history
- [ ] Handle 404 for non-existent goals

**Acceptance Criteria**:
- [ ] Goal detail page loads correctly
- [ ] Full Purpose is displayed
- [ ] Edit and action buttons work
- [ ] Non-existent goals show 404

---

### Phase 1E: Polish & Testing

#### Task 1.12: Form Validation & Error States
- **Description**: Ensure robust validation and helpful error handling
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.4, Task 1.5, Task 1.7

**Subtasks**:
- [ ] Add client-side validation to all form fields
- [ ] Implement server-side validation (zod schemas)
- [ ] Create reusable error message component
- [ ] Ensure validation messages are helpful, not generic
- [ ] Test edge cases (empty strings, special characters, etc.)
- [ ] Add rate limiting protection

**Acceptance Criteria**:
- [ ] Invalid submissions are blocked client-side
- [ ] Server validates all inputs
- [ ] Error messages help users fix issues

---

#### Task 1.13: Responsive Design Polish
- **Description**: Ensure excellent experience across devices
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: Task 1.4, Task 1.9, Task 1.10

**Subtasks**:
- [ ] Test all pages on mobile viewport (375px)
- [ ] Test on tablet viewport (768px)
- [ ] Test on desktop viewport (1280px+)
- [ ] Fix any overflow or layout issues
- [ ] Ensure touch targets are at least 44x44px
- [ ] Verify text is readable without zooming

**Acceptance Criteria**:
- [ ] No horizontal scroll on any viewport
- [ ] All interactive elements are easily tappable
- [ ] Layout adapts appropriately to screen size

---

#### Task 1.14: Milestone 1 Integration Testing
- **Description**: End-to-end testing of the complete goal creation flow
- **Estimated Time**: 1-2 hours
- **Assignee**: TBD
- **Dependencies**: All previous tasks

**Subtasks**:
- [ ] Test complete user journey: Sign up → Create Goal → View Dashboard
- [ ] Verify data persists correctly in database
- [ ] Test form recovery after page refresh
- [ ] Check authentication flows
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Document any bugs found
- [ ] Fix critical bugs before moving to Milestone 2

**Acceptance Criteria**:
- [ ] Complete flow works without errors
- [ ] Data integrity is maintained
- [ ] No critical bugs remain

---

## Milestone 1 Completion Checklist

Before moving to Milestone 2, verify:

- [ ] User can sign up/sign in
- [ ] User can create a goal with title, frequency, and duration
- [ ] User is required to write a Purpose (min 20 chars)
- [ ] User sees helpful prompts for Purpose
- [ ] Created goal appears on dashboard
- [ ] Goal card shows key information including Purpose
- [ ] User can view full goal details
- [ ] All data persists across sessions
- [ ] Mobile experience is good
- [ ] No critical bugs

---

## Future Milestones (Overview)

### Milestone 2: Check-in System
- Check-in API and data model
- Check-in modal component
- Check-in scheduling logic
- Check-in history display

### Milestone 3: Drift Detection
- Behavioral signal tracking
- Drift score calculation
- Drift alert system
- Agent decision logging

### Milestone 4: Intervention System
- Intervention strategy implementation
- LLM integration for personalized messages
- Intervention delivery mechanism
- Outcome tracking

### Milestone 5: Opik Integration
- Trace logging setup
- Experiment framework
- Metrics dashboard
- Evaluation pipeline

---

## Task Assignment Template

When assigning tasks, copy this template:

```
### Task X.X: [Task Name]
**Assignee**: [Name]
**Status**: [ ] Not Started
**Started**: [Date]
**Completed**: [Date]
**Notes**: 
- 
**Blockers**:
- 
```

---

## Daily Standup Format

Use this format for daily check-ins:

```
**Yesterday**: What I completed
**Today**: What I'm working on
**Blockers**: What's preventing progress
**Help Needed**: Where I need support
```

---

*Last Updated: January 2025*
