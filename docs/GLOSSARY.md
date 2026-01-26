# Momentum - Domain Glossary

This glossary defines key terms and concepts used throughout the Momentum project. All team members should reference this document to ensure consistent terminology across documentation, code, and communications.

---

## Core Concepts

### Momentum
The overall state of a user's progress toward their goal. Positive momentum indicates consistent engagement; negative momentum indicates declining engagement or risk of abandonment.

### Goal
A specific, measurable objective the user wants to achieve (e.g., "Exercise 3 times per week", "Read 20 pages daily"). Goals are the foundation of all tracking and intervention logic.

### Purpose
The user's personal motivation for pursuing a goal. This emotional anchor is captured during goal creation and referenced in personalized interventions to reconnect users with their intrinsic motivation.

### Habit
A recurring behavior the user wants to establish or maintain. In Momentum, habits are the actionable components that support goal achievement.

---

## User States & Behaviors

### Check-in
A scheduled interaction where the user reports on their progress. Check-ins can be:
- **Proactive**: User initiates the update
- **Prompted**: System initiates based on schedule
- **Adaptive**: Timing adjusts based on user patterns

### Drift
The gradual disengagement from a goal without conscious decision to quit. Characterized by missed check-ins, declining response quality, or reduced interaction frequency.

### Drift Score
A numerical value (0-100) representing the likelihood that a user is in a drift state. Calculated from behavioral signals including:
- Check-in completion rate
- Response sentiment
- Time between interactions
- Goal activity frequency

### Re-engagement
The process of bringing a drifting user back to active goal pursuit. Successful re-engagement restores positive momentum.

### Silent Abandonment
When a user stops pursuing a goal without explicitly ending it. The primary failure mode Momentum is designed to prevent.

---

## Agent Components

### Scheduler Agent
The component responsible for determining optimal timing for check-ins and interventions. Learns from user response patterns to maximize engagement.

### Drift Detector
The analytical component that monitors user behavior signals and calculates drift scores. Triggers intervention workflows when thresholds are exceeded.

### Intervention Selector
The decision-making component that chooses appropriate intervention strategies based on:
- Current drift score
- User history
- Past intervention effectiveness
- Contextual factors

### Reasoning Engine
The LLM-powered core that generates personalized messages, analyzes user responses, and makes nuanced decisions about user state and appropriate actions.

---

## Intervention Types

### Intervention
Any proactive action taken by the system to support user progress or prevent drift. Interventions are categorized by approach and intensity.

### Empathetic Intervention
An intervention focused on emotional support and understanding. Uses language that acknowledges difficulty without judgment. Best for shame-based drift.

### Practical Intervention
An intervention focused on actionable adjustments. Suggests concrete modifications to goals, schedules, or approaches. Best for logistics-based drift.

### Motivational Intervention
An intervention focused on reconnecting users with their Purpose and past successes. Best for motivation-based drift.

### Goal Restructuring
A specific intervention type where the agent proposes modified, more achievable versions of the original goal to maintain momentum when the original goal proves unsustainable.

---

## Data & Storage

### User Memory
The persistent storage of user-specific information including:
- Goal definitions and Why Statements
- Check-in history
- Intervention history and outcomes
- Behavioral patterns
- Preferences and settings

### Conversation Context
The immediate context of the current interaction, including recent messages and current session state.

### Behavioral Signals
Observable data points that indicate user engagement level:
- Response latency
- Message length
- Sentiment indicators
- Check-in completion
- Goal activity reports

---

## Evaluation & Observability

### Trace
A complete record of a single agent decision, including:
- Input signals
- Retrieved context
- Reasoning steps
- Decision made
- Outcome (if known)

### Re-engagement Rate
The percentage of users who return to active goal pursuit after an intervention. Primary success metric for intervention effectiveness.

### Time to Intervention (TTI)
The elapsed time between drift detection and intervention delivery. Lower TTI generally correlates with higher re-engagement rates.

### False Positive Rate
The percentage of interventions triggered when the user was not actually drifting. High false positive rates lead to user annoyance and reduced trust.

### Intervention Effectiveness Score
A composite metric measuring how well an intervention achieved its intended outcome, considering:
- User response (did they reply?)
- Sentiment change
- Subsequent behavior change
- Goal activity resumption

---

## Technical Terms

### RAG (Retrieval-Augmented Generation)
The technique of retrieving relevant stored information (user history, Purpose, past successes) to augment LLM prompts for personalized responses.

### Reasoning Chain
The explicit step-by-step reasoning process the agent follows when making decisions, logged for observability and evaluation.

### Opik
The observability and evaluation platform used to track experiments, log traces, and monitor system performance.

### Experiment
A controlled variation in system behavior (e.g., different intervention wording) tracked in Opik to measure impact on outcomes.

---

## User Interface Terms

### Dashboard
The user-facing view showing goal progress, momentum status, and historical trends.

### Goal Card
The UI component displaying a single goal with its current status, recent activity, and quick actions.

### Check-in Modal
The interface presented to users during scheduled or prompted check-ins.

### Intervention Message
The user-facing communication delivered during an intervention, crafted by the Reasoning Engine.

---

## Metrics & KPIs

### Goal Completion Rate
Percentage of goals that reach their defined success criteria within the user's specified timeframe.

### 30-Day Retention
Percentage of users still actively engaging with at least one goal after 30 days.

### Average Momentum Score
The mean momentum value across all active goals for a user or cohort.

### Intervention Success Rate
Percentage of interventions that result in positive user re-engagement within 48 hours.

---

*Last Updated: January 2025*
*Version: 1.0*
