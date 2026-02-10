import { generateText } from 'ai'
import { prisma } from '@/lib/db/prisma'
import { getOpik } from '@/lib/ai/opik'
import { model, MODEL_ID, PROVIDER, TEMPERATURE, MAX_TOKENS } from '@/lib/ai/model'
import { buildAnalysisPrompt } from '@/lib/ai/prompts'
import { parseAnalysis } from '@/lib/ai/parse-questions'

export async function analyzeHabit(habitId: string): Promise<void> {
  const startTime = Date.now()
  const opik = getOpik()
  let trace: ReturnType<typeof opik.trace> | undefined

  try {
    // Step 1: Fetch habit, update insight status, create Opik trace
    const habit = await prisma.habit.findUniqueOrThrow({
      where: { id: habitId },
    })

    const insight = await prisma.habitInsight.update({
      where: { habitId },
      data: { status: 'PROCESSING' },
    })

    trace = opik.trace({
      name: 'habit-analysis',
      input: {
        habitId: habit.id,
        habitName: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        frequencyTarget: habit.frequencyTarget,
      },
      metadata: {
        userId: habit.userId,
        habitId: habit.id,
      },
      tags: ['habit-analysis', habit.id, habit.userId],
    })

    console.log(`[habit-agent] Using model: ${MODEL_ID}`)

    // Step 2: Single LLM call — research only
    const prompt = buildAnalysisPrompt(
      habit.name,
      habit.description,
      habit.frequency,
      habit.frequencyTarget,
    )

    const span = trace.span({
      name: 'analyze-habit',
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
    const parseResult = parseAnalysis(result.text)
    const { research } = parseResult.data
    const jsonRobustness = parseResult.robustness

    await prisma.habitInsight.update({
      where: { id: insight.id },
      data: {
        status: 'COMPLETED',
        research,
        opikTraceId: trace!.data.id,
      },
    })

    // Step 4: End trace with success metadata
    trace.update({
      output: {
        status: 'COMPLETED',
        research,
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
        'habit-analysis',
        habit.id,
        habit.userId,
        // Add JSON robustness tags
        jsonRobustness.score >= 90 ? 'json-excellent' : jsonRobustness.score >= 70 ? 'json-good' : 'json-poor',
        jsonRobustness.metrics.repairCount === 0 ? 'json-perfect' : 'json-repaired',
      ],
    }).end()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Update insight to FAILED
    await prisma.habitInsight.update({
      where: { habitId },
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

    console.error(`[habit-agent] Failed to analyze habit ${habitId}:`, error)
  } finally {
    // Flush Opik telemetry before serverless shutdown
    await opik.flush()
  }
}
