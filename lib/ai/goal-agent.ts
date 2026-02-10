import { generateText } from 'ai'
import { prisma } from '@/lib/db/prisma'
import { getOpik } from '@/lib/ai/opik'
import { model, MODEL_ID, PROVIDER, TEMPERATURE, MAX_TOKENS } from '@/lib/ai/model'
import { buildGoalAnalysisPrompt } from '@/lib/ai/prompts'
import { parseGoalAnalysis } from '@/lib/ai/parse-goal-suggestions'

export async function analyzeGoal(goalId: string): Promise<void> {
  const startTime = Date.now()
  const opik = getOpik()
  let trace: ReturnType<typeof opik.trace> | undefined

  try {
    // Step 1: Fetch goal, update insight status, create Opik trace
    const goal = await prisma.goal.findUniqueOrThrow({
      where: { id: goalId },
    })

    const insight = await prisma.goalInsight.update({
      where: { goalId },
      data: { status: 'PROCESSING' },
    })

    trace = opik.trace({
      name: 'goal-analysis',
      input: {
        goalId: goal.id,
        goalTitle: goal.title,
        description: goal.description,
        category: goal.category,
      },
      metadata: {
        userId: goal.userId,
        goalId: goal.id,
      },
      tags: ['goal-analysis', goal.id, goal.userId],
    })

    console.log(`[goal-agent] Using model: ${MODEL_ID}`)

    // Step 2: Single LLM call — analysis + habit suggestions
    const prompt = buildGoalAnalysisPrompt(
      goal.title,
      goal.description,
      goal.category,
    )

    const span = trace.span({
      name: 'analyze-goal',
      type: 'llm',
      input: { prompt },
      model: MODEL_ID,
      provider: PROVIDER,
      metadata: {
        model: MODEL_ID,
        provider: PROVIDER,
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      },
    })

    const result = await generateText({
      model,
      prompt,
      ...(MAX_TOKENS && { maxOutputTokens: MAX_TOKENS }),
      temperature: TEMPERATURE,
    })

    span.update({
      output: { raw: result.text },
      model: MODEL_ID,
      provider: PROVIDER,
      usage: {
        prompt_tokens: result.usage.inputTokens ?? 0,
        completion_tokens: result.usage.outputTokens ?? 0,
        total_tokens: result.usage.totalTokens ?? 0,
      },
      metadata: {
        model: MODEL_ID,
        provider: PROVIDER,
        temperature: TEMPERATURE,
      },
    }).end()

    // Step 3: Parse and store results
    const parseResult = parseGoalAnalysis(result.text)
    const { analysis, suggestedHabits } = parseResult.data
    const jsonRobustness = parseResult.robustness

    await prisma.goalInsight.update({
      where: { id: insight.id },
      data: {
        status: 'COMPLETED',
        analysis,
        suggestions: suggestedHabits,
        opikTraceId: trace!.data.id,
      },
    })

    // Step 4: End trace with success metadata
    trace.update({
      output: {
        status: 'COMPLETED',
        habitCount: suggestedHabits.length,
        analysis,
        suggestedHabits,
      },
      metadata: {
        durationMs: Date.now() - startTime,
        totalTokens: result.usage.totalTokens ?? 0,
        // JSON robustness metrics
        json_robustnessScore: jsonRobustness.score,
        json_preParsingQuality: jsonRobustness.breakdown.preParsingQuality,
        json_repairComplexity: jsonRobustness.breakdown.repairComplexity,
        json_parseSuccess: jsonRobustness.breakdown.parseSuccess,
        json_schemaCompliance: jsonRobustness.breakdown.schemaCompliance,
        json_semanticQuality: jsonRobustness.breakdown.semanticQuality,
        json_repairSteps: jsonRobustness.metrics.repairSteps,
        json_repairCount: jsonRobustness.metrics.repairCount,
        json_recommendation: jsonRobustness.recommendation,
      },
      tags: [
        'goal-analysis',
        goal.id,
        goal.userId,
        // Add JSON robustness tags
        jsonRobustness.score >= 90 ? 'json-excellent' : jsonRobustness.score >= 70 ? 'json-good' : 'json-poor',
        jsonRobustness.metrics.repairCount === 0 ? 'json-perfect' : 'json-repaired',
      ],
    }).end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update insight to FAILED
    await prisma.goalInsight.update({
      where: { goalId },
      data: {
        status: 'FAILED',
        errorMessage,
        opikTraceId: trace?.data.id ?? null,
      },
    }).catch(() => {})

    // End trace with error
    if (trace) {
      trace.update({
        output: { status: 'FAILED', error: errorMessage },
        metadata: { durationMs: Date.now() - startTime },
      }).end()
    }

    console.error(`[goal-agent] Failed to analyze goal ${goalId}:`, error)
  } finally {
    // Flush Opik telemetry before serverless shutdown
    await opik.flush()
  }
}
