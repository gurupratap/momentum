export function buildGoalAnalysisPrompt(
  goalTitle: string,
  goalDescription: string | null,
  category: string | null
): string {
  return `You are a behavioral psychology expert specializing in goal achievement and habit formation.

A user wants to achieve the following goal:
- Goal: ${goalTitle}
${goalDescription ? `- Details: ${goalDescription}` : ''}
${category ? `- Category: ${category}` : ''}

**IMPORTANT SAFETY CHECK:**
Before proceeding, verify this goal is constructive and does not involve:
- Harm to self or others (physical, mental, emotional)
- Illegal activities
- Manipulation or deception
- Unhealthy restrictions (extreme dieting, overwork, etc.)

If the goal raises safety concerns, respond with an error message explaining why it cannot be supported.

**Your Task:**
Break down this goal into 3-5 specific, actionable habits that would help achieve it. Each habit should be:
- Small and achievable (not overwhelming)
- Challenging enough to create progress
- Directly connected to the goal
- Based on behavioral science principles

For each suggested habit, provide:
1. **name**: Concise, actionable habit (max 80 chars)
2. **description**: Why it matters and how it contributes to the goal (max 250 chars - be concise!)
3. **frequency**: Recommended frequency (DAILY, WEEKLY, or CUSTOM)
4. **frequencyTarget**: If CUSTOM, number of days per week (1-7), otherwise null
5. **rationale**: Why this habit is important for achieving the goal (max 150 chars - be brief!)
6. **impact**: Estimated impact level (high/medium/low)
7. **difficulty**: How challenging this habit is (easy/moderate/challenging)

**IMPORTANT:** Keep your response concise to avoid truncation. Aim for brevity while maintaining clarity.

**CRITICAL JSON FORMATTING RULES:**
- All text must use straight double quotes ("), not curly quotes ("")
- Escape all internal quotes with backslash (\")
- No line breaks within string values
- Do not use apostrophes (') in contractions - write them out (don't → do not)
- Keep all text on single lines

Respond with ONLY valid JSON in this exact format (no markdown code fences, no backticks):
{
  "analysis": "Your understanding of the goal and approach in 100-200 words. Be concise. Use only straight quotes. Avoid apostrophes.",
  "suggestedHabits": [
    {
      "name": "Meditate for 10 minutes",
      "description": "Daily meditation reduces anxiety and improves focus.",
      "frequency": "DAILY",
      "frequencyTarget": null,
      "rationale": "Builds mental resilience and stress management.",
      "impact": "high",
      "difficulty": "easy"
    }
  ]
}`
}

export function buildAnalysisPrompt(
  habitName: string,
  description: string | null,
  frequency: string,
  frequencyTarget: number | null,
): string {
  const frequencyText = frequency === 'CUSTOM' && frequencyTarget
    ? `${frequencyTarget} times per week`
    : frequency === 'DAILY' ? 'every day' : 'once per week'

  return `You are a behavioral psychology expert and coach specializing in habit formation.

A user wants to build the following habit:
- Habit: ${habitName}
${description ? `- Description: ${description}` : ''}
- Target frequency: ${frequencyText}

**Your Task:**
Analyze the 3-5 most common challenges people face when building this specific habit, including:
- Common failure patterns and what makes people give up
- Environmental, psychological, and scheduling barriers specific to this habit
- Evidence-based strategies that help with adherence

Be specific to this exact habit — do not give generic habit advice. Provide actionable insights the user can apply immediately.

**CRITICAL JSON FORMATTING RULES:**
- Use only straight double quotes ("), not curly quotes ("")
- Avoid apostrophes in contractions - write them out (don't → do not)
- Keep all text on a single line within the string
- No line breaks within the research string value

Respond with ONLY valid JSON in this exact format (no markdown code fences, no backticks):
{
  "research": "Your research analysis here as a single string. Use only straight quotes. Avoid apostrophes in contractions."
}`
}
