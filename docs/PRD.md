# Product Requirements Document (PRD)
## Momentum - Agentic Habit Accountability Partner

**Version:** 1.0  
**Last Updated:** January 2025  
**Author:** Product Team  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Product Vision
Momentum is an agentic AI system that acts as a non-judgmental accountability partner for habit-based New Year's resolutions and personal goals. Unlike traditional reminder apps, Momentum actively monitors behavioral patterns, detects early warning signs of goal abandonment, and takes autonomous action to help users course-correct before they silently give up.

### 1.2 Problem Statement
The majority of New Year's resolutions fail not due to lack of initial motivation, but because of "silent drift"—the gradual, unconscious disengagement that occurs when users miss a session, experience shame, and avoid thinking about their goal entirely. Current solutions (reminder apps, habit trackers) only address forgetting, not the psychological barriers that lead to abandonment.

### 1.3 Target Users
- Adults (25-45) who set personal improvement goals
- Users who have previously failed at habit formation
- People who respond well to accountability but lack consistent human support
- Individuals who prefer conversational interfaces over rigid tracking apps

### 1.4 Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| 30-Day Goal Retention | >60% | Users with active goals after 30 days |
| Re-engagement Rate | >40% | Successful interventions / Total interventions |
| User Satisfaction | >4.2/5 | Post-interaction surveys |
| Daily Active Users | Growth 10% MoM | Analytics tracking |

---

## 2. Product Overview

### 2.1 Core Value Proposition
"An AI partner that notices when you're drifting from your goals and gently pulls you back—before you've decided to quit."

### 2.2 Key Differentiators
1. **Proactive, not reactive**: Detects drift before users realize they're disengaging
2. **Empathetic intervention**: Addresses shame and emotional barriers, not just logistics
3. **Adaptive intelligence**: Learns what works for each individual user
4. **Non-judgmental tone**: Creates psychological safety that encourages honesty

### 2.3 Product Principles
- **Respect autonomy**: Guide, don't control. Users make their own decisions.
- **Minimize friction**: Interactions should feel natural, not like chores.
- **Celebrate progress**: Recognize effort, not just outcomes.
- **Fail gracefully**: When interventions don't work, learn and adapt.

---

## 3. Feature Requirements

### 3.1 Milestone 1: Goal Creation & Purpose (MVP)

#### 3.1.1 Goal Creation Flow

**User Story**: As a user, I want to create a goal and explain why it matters to me, so that the system understands my motivation and can support me effectively.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| GC-01 | User can create a new goal with a title | P0 |
| GC-02 | User can specify goal frequency (daily, X times per week, etc.) | P0 |
| GC-03 | User can set a target duration or end date | P1 |
| GC-04 | System prompts user to write a "Purpose" | P0 |
| GC-05 | Purpose input supports free-form text (min 20 characters) | P0 |
| GC-06 | System provides prompting questions to help users articulate their Purpose | P1 |
| GC-07 | User can save goal as draft before completing Purpose | P2 |
| GC-08 | System confirms goal creation with summary | P0 |

**Purpose Prompts** (GC-06):
- "What will achieving this goal make possible in your life?"
- "Who are you doing this for? (It's okay if it's just yourself)"
- "How will you feel when you've built this habit?"
- "What's the cost of NOT achieving this goal?"

**UI/UX Requirements**:
- Single-page flow with clear progress indication
- Conversational tone in all prompts and labels
- Mobile-first design with thumb-friendly touch targets
- Auto-save functionality to prevent data loss
- Estimated completion time displayed (< 2 minutes)

**Data Model**:
```
Goal {
  id: string (UUID)
  userId: string
  title: string
  description?: string
  frequency: FrequencyType
  frequencyTarget?: number
  startDate: Date
  endDate?: Date
  purpose: string
  status: 'active' | 'paused' | 'completed' | 'abandoned'
  createdAt: Date
  updatedAt: Date
}

FrequencyType: 'daily' | 'weekly' | 'custom'
```

**Acceptance Criteria**:
- [ ] User can complete goal creation flow in under 2 minutes
- [ ] Purpose is required before goal can be activated
- [ ] Goal appears on dashboard immediately after creation
- [ ] All goal data persists across sessions
- [ ] Form validates input and shows helpful error messages

---

### 3.2 Milestone 2: Check-in System

#### 3.2.1 Scheduled Check-ins

**User Story**: As a user, I want to receive check-ins at times that work for me, so I can report my progress without disruption.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| CI-01 | User can set preferred check-in time(s) | P0 |
| CI-02 | System sends check-in prompts at scheduled times | P0 |
| CI-03 | Check-in allows simple yes/no progress report | P0 |
| CI-04 | Check-in allows optional notes/context | P1 |
| CI-05 | User can snooze check-in for configurable duration | P1 |
| CI-06 | System tracks check-in completion rate | P0 |

#### 3.2.2 Adaptive Check-in Timing

**User Story**: As a user, I want the system to learn when I'm most responsive, so check-ins happen at optimal times.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| AT-01 | System tracks response times for each check-in | P1 |
| AT-02 | System adjusts check-in timing based on response patterns | P1 |
| AT-03 | System increases check-in frequency during vulnerable periods | P2 |
| AT-04 | System decreases check-in frequency when momentum is strong | P2 |

---

### 3.3 Milestone 3: Drift Detection

#### 3.3.1 Behavioral Signal Monitoring

**User Story**: As a system, I need to monitor user behavior signals to detect early signs of disengagement.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| DD-01 | System tracks consecutive missed check-ins | P0 |
| DD-02 | System analyzes response sentiment over time | P1 |
| DD-03 | System monitors response length trends | P2 |
| DD-04 | System calculates drift score (0-100) | P0 |
| DD-05 | System triggers alert when drift score exceeds threshold | P0 |

**Drift Score Calculation**:
```
Base Score Components:
- Missed check-ins: +20 points per miss (max 60)
- Declining sentiment: +15 points (if detected)
- Shortened responses: +10 points (if significant)
- Days since last positive report: +5 points per day (max 25)

Threshold: 50 = Intervention triggered
```

---

### 3.4 Milestone 4: Intervention System

#### 3.4.1 Intervention Selection

**User Story**: As a system, I need to choose the most appropriate intervention strategy based on user context and history.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| IS-01 | System supports multiple intervention strategies | P0 |
| IS-02 | System selects strategy based on drift cause analysis | P0 |
| IS-03 | System personalizes intervention message using Purpose | P0 |
| IS-04 | System tracks intervention outcomes | P0 |
| IS-05 | System learns from intervention effectiveness | P1 |

**Intervention Strategies**:

1. **Empathetic**: For shame-based drift
   - Acknowledges difficulty without judgment
   - Normalizes setbacks
   - References user's Purpose

2. **Practical**: For logistics-based drift
   - Suggests schedule adjustments
   - Proposes goal modifications
   - Offers specific next steps

3. **Motivational**: For motivation-based drift
   - Recalls past successes
   - Reconnects to Purpose
   - Highlights progress made

#### 3.4.2 Goal Restructuring

**User Story**: As a user struggling with my goal, I want the system to suggest achievable modifications rather than letting me fail completely.

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| GR-01 | System can propose reduced goal frequency | P1 |
| GR-02 | System can suggest smaller habit increments | P1 |
| GR-03 | User can accept, modify, or reject restructuring proposals | P1 |
| GR-04 | Original goal is preserved for reference | P2 |

---

### 3.5 Milestone 5: Observability & Evaluation (Opik Integration)

#### 3.5.1 Trace Logging

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| OB-01 | All agent decisions are logged as traces | P0 |
| OB-02 | Traces include input signals, reasoning, and output | P0 |
| OB-03 | Traces are linked to outcomes when known | P0 |
| OB-04 | Traces are searchable and filterable | P1 |

#### 3.5.2 Experiment Tracking

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| ET-01 | System supports A/B testing of intervention strategies | P1 |
| ET-02 | Experiments are tracked with clear metrics | P1 |
| ET-03 | Results are visualized in Opik dashboard | P1 |

#### 3.5.3 Evaluation Metrics

**Functional Requirements**:

| ID | Requirement | Priority |
|----|-------------|----------|
| EM-01 | Re-engagement rate tracked per intervention type | P0 |
| EM-02 | Time to intervention tracked and visualized | P1 |
| EM-03 | False positive rate monitored | P1 |
| EM-04 | Goal completion rate tracked over time | P0 |

---

## 4. Technical Requirements

### 4.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16+ (App Router) | SSR, file-based routing, React ecosystem |
| Styling | Tailwind CSS | Rapid development, consistent design |
| State Management | React Context + useState | Simplicity for MVP |
| Backend | Next.js API Routes | Unified codebase, serverless deployment |
| Database | PostgreSQL (via Prisma) | Relational data, proven reliability |
| LLM | Claude API (Anthropic) | Reasoning quality, safety |
| Observability | Opik | Experiment tracking, evaluation |
| Deployment | Vercel | Next.js optimization, easy CI/CD |
| Authentication | StackAuth | Flexible, secure auth |

### 4.2 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                       │
├─────────────────────────────────────────────────────────────┤
│  Pages/Components          │  API Routes                    │
│  - Dashboard               │  - /api/goals                  │
│  - Goal Creation           │  - /api/checkins               │
│  - Check-in Modal          │  - /api/interventions          │
│  - Settings                │  - /api/agent                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Agent Service                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Scheduler  │  │   Drift     │  │  Intervention       │  │
│  │             │  │  Detector   │  │  Selector           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                              │                               │
│                    ┌─────────▼─────────┐                    │
│                    │   Claude API      │                    │
│                    └───────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐    ┌─────────────┐
│  PostgreSQL  │    │      Opik        │    │   Vercel    │
│  (Prisma)    │    │   Observability  │    │   Cron      │
└──────────────┘    └──────────────────┘    └─────────────┘
```

### 4.3 Performance Requirements

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds (LCP) |
| API Response Time | < 500ms (p95) |
| Agent Decision Time | < 3 seconds |
| Uptime | 99.5% |

### 4.4 Security Requirements

- All data encrypted in transit (HTTPS)
- User data encrypted at rest
- Authentication required for all user data access
- Rate limiting on API endpoints
- Input sanitization for all user inputs
- GDPR-compliant data handling

---

## 5. User Experience

### 5.1 Design Principles

1. **Conversational over transactional**: Interactions feel like talking to a supportive friend
2. **Progress over perfection**: Celebrate consistency, not streaks
3. **Minimal cognitive load**: One clear action at a time
4. **Emotional safety**: Never shame, always encourage

### 5.2 Key User Flows

#### Flow 1: New User Onboarding
```
Welcome Screen → Sign Up → Create First Goal → Write Purpose → 
Set Check-in Preferences → Dashboard
```

#### Flow 2: Daily Check-in
```
Notification → Open App → Check-in Modal → Quick Response → 
Encouragement/Feedback → Close
```

#### Flow 3: Intervention Response
```
Intervention Message → User Opens → Reads Personalized Message → 
Responds/Takes Action → System Logs Outcome
```

### 5.3 Wireframe Descriptions

**Dashboard**:
- Header with greeting and overall momentum indicator
- Goal cards showing individual progress
- Quick check-in action button
- Navigation to settings and history

**Goal Creation**:
- Step-by-step wizard (not overwhelming form)
- Conversational prompts for each field
- Progress indicator
- Preview before confirmation

**Check-in Modal**:
- Large, friendly illustration
- Simple question: "Did you [goal action] today?"
- Yes/No buttons prominently displayed
- Optional "Tell me more" expansion

---

## 6. Constraints & Assumptions

### 6.1 Constraints
- MVP timeline: 2-week hackathon
- Team size: Limited to hackathon participants
- Budget: Free tier services where possible
- LLM costs: Must optimize for token efficiency

### 6.2 Assumptions
- Users have smartphones with push notification capability
- Users are English-speaking (v1)
- Users create 1-3 active goals (MVP scope)
- Check-in frequency is at least weekly

### 6.3 Out of Scope (v1)
- Native mobile apps (web-first)
- Multi-language support
- Team/social features
- Integration with fitness trackers
- Voice-based interactions

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| LLM response quality issues | Medium | High | Human-in-the-loop review, prompt engineering |
| User annoyance from too many interventions | Medium | High | Conservative thresholds, user controls |
| Scope creep during hackathon | High | Medium | Strict milestone adherence |
| Database scaling issues | Low | Medium | Use managed service, optimize queries |

---

## 8. Success Criteria for Hackathon

### Must Have (Demo-Ready)
- [ ] User can create a goal with Purpose
- [ ] Check-ins work and are recorded
- [ ] Drift detection triggers interventions
- [ ] At least one intervention type works end-to-end
- [ ] Opik dashboard shows meaningful metrics

### Should Have
- [ ] Multiple intervention strategies
- [ ] Adaptive check-in timing
- [ ] Goal restructuring suggestions

### Nice to Have
- [ ] A/B testing framework
- [ ] Historical trend visualizations
- [ ] User preference learning

---

## 9. Appendix

### 9.1 Competitive Analysis

| Competitor | Strengths | Weaknesses | Our Differentiation |
|------------|-----------|------------|---------------------|
| Habitica | Gamification, community | Complex, not personalized | Empathetic AI, simplicity |
| Streaks | Simple, beautiful | No intelligence, passive | Proactive interventions |
| Coach.me | Human coaching | Expensive, scheduling | AI availability, personalization |
| Fabulous | Guided journeys | Rigid structure | Adaptive, individual-focused |

### 9.2 References
- [Momentum Glossary](./GLOSSARY.md)
- [Task Breakdown](./tasks.md)

---

*Document Version History*

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Product Team | Initial draft |
