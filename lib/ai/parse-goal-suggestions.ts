import { z } from 'zod'
import {
  initJSONParseMetrics,
  recordRepairStep,
  finalizeJSONParseMetrics,
  calculateJSONRobustness,
  type JSONParseMetrics,
  type JSONRobustnessScore,
} from './json-robustness'

const suggestedHabitSchema = z.object({
  name: z.string().max(100),
  description: z.string().max(300), // Increased slightly from prompt to allow some flexibility
  frequency: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']),
  frequencyTarget: z.number().int().min(1).max(7).nullable(),
  rationale: z.string().max(200), // Increased slightly from prompt to allow some flexibility
  impact: z.enum(['high', 'medium', 'low']),
  difficulty: z.enum(['easy', 'moderate', 'challenging'])
})

const goalAnalysisSchema = z.object({
  analysis: z.string().min(50),
  suggestedHabits: z.array(suggestedHabitSchema).min(3).max(5)
})

export type SuggestedHabit = z.infer<typeof suggestedHabitSchema>
export type ParsedGoalAnalysis = z.infer<typeof goalAnalysisSchema>

export interface ParseResult {
  data: ParsedGoalAnalysis
  robustness: JSONRobustnessScore
}

function repairJSON(text: string, metrics: JSONParseMetrics): string {
  let repaired = text

  // Replace curly quotes with straight quotes
  const beforeQuotes = repaired
  repaired = repaired
    .replace(/[\u201C\u201D]/g, '"') // curly double quotes
    .replace(/[\u2018\u2019]/g, "'") // curly single quotes

  if (repaired !== beforeQuotes) {
    recordRepairStep(metrics, 'replaced_curly_quotes')
  }

  // Try to fix common apostrophe issues in contractions
  const beforeContractions = repaired
  repaired = repaired
    .replace(/don't/g, 'do not')
    .replace(/doesn't/g, 'does not')
    .replace(/can't/g, 'cannot')
    .replace(/won't/g, 'will not')
    .replace(/isn't/g, 'is not')
    .replace(/aren't/g, 'are not')
    .replace(/wasn't/g, 'was not')
    .replace(/weren't/g, 'were not')
    .replace(/haven't/g, 'have not')
    .replace(/hasn't/g, 'has not')
    .replace(/hadn't/g, 'had not')
    .replace(/wouldn't/g, 'would not')
    .replace(/shouldn't/g, 'should not')
    .replace(/couldn't/g, 'could not')
    .replace(/it's/g, 'it is')
    .replace(/that's/g, 'that is')
    .replace(/what's/g, 'what is')
    .replace(/there's/g, 'there is')
    .replace(/here's/g, 'here is')
    .replace(/you're/g, 'you are')
    .replace(/we're/g, 'we are')
    .replace(/they're/g, 'they are')
    .replace(/I'm/g, 'I am')
    .replace(/you'll/g, 'you will')
    .replace(/we'll/g, 'we will')
    .replace(/they'll/g, 'they will')
    .replace(/let's/g, 'let us')

  if (repaired !== beforeContractions) {
    recordRepairStep(metrics, 'expanded_contractions')
  }

  return repaired
}

function fixTruncatedJSON(text: string, metrics: JSONParseMetrics): string {
  // Check if JSON appears to be truncated (ends mid-string or mid-object)
  const trimmed = text.trim()

  // If it ends with an incomplete string (odd number of quotes after last closing brace/bracket)
  const lastBrace = Math.max(trimmed.lastIndexOf('}'), trimmed.lastIndexOf(']'))

  if (lastBrace === -1) {
    // No closing braces found - severely truncated
    throw new Error('JSON appears to be severely truncated - no closing braces found')
  }

  // Check if there's unterminated content after the last proper closing brace
  const afterLastBrace = trimmed.substring(lastBrace + 1).trim()
  if (afterLastBrace.length > 0) {
    // Truncate at the last valid closing brace
    console.warn('[parse-goal-suggestions] Detected truncated content after last closing brace, trimming')
    metrics.wasTruncated = true
    metrics.truncationRecovered = true
    recordRepairStep(metrics, 'truncated_after_brace')
    return trimmed.substring(0, lastBrace + 1)
  }

  // Try to fix unterminated strings by finding the last complete object
  // Count opening/closing braces to find where the JSON is complete
  let braceCount = 0
  let bracketCount = 0
  let inString = false
  let lastCompletePos = -1

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]
    const prevChar = i > 0 ? trimmed[i - 1] : ''

    // Track string state (ignore escaped quotes)
    if (char === '"' && prevChar !== '\\') {
      inString = !inString
    }

    if (!inString) {
      if (char === '{') braceCount++
      if (char === '}') braceCount--
      if (char === '[') bracketCount++
      if (char === ']') bracketCount--

      // Found a complete JSON structure
      if (braceCount === 0 && bracketCount === 0 && i > 0) {
        lastCompletePos = i
      }
    }
  }

  // If we're still in a string or have unbalanced braces at the end, truncate
  if ((inString || braceCount !== 0 || bracketCount !== 0) && lastCompletePos > 0) {
    console.warn('[parse-goal-suggestions] Detected incomplete JSON structure, truncating to last complete position')
    metrics.wasTruncated = true
    metrics.truncationRecovered = true
    recordRepairStep(metrics, 'truncated_incomplete_structure')
    return trimmed.substring(0, lastCompletePos + 1)
  }

  return trimmed
}

export function parseGoalAnalysis(rawText: string): ParseResult {
  // Initialize metrics tracking
  const metrics = initJSONParseMetrics(rawText)

  // Strip markdown code fences if present
  let cleaned = rawText
  const beforeTrim = cleaned
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  if (cleaned !== beforeTrim) {
    recordRepairStep(metrics, 'stripped_markdown_fences')
  }

  // Try to repair common JSON issues
  cleaned = repairJSON(cleaned, metrics)

  // Try to fix truncated JSON
  try {
    cleaned = fixTruncatedJSON(cleaned, metrics)
  } catch (truncError) {
    console.error('[parse-goal-suggestions] Truncation fix failed:', truncError)
    metrics.wasTruncated = true
    metrics.truncationRecovered = false
    // Continue anyway, let JSON.parse fail with a better error
  }

  let parsed: unknown
  let parseSuccess = false
  let schemaValidation = false

  try {
    metrics.parseAttempts++
    parsed = JSON.parse(cleaned)
    parseSuccess = true

    // Validate against schema
    const validated = goalAnalysisSchema.parse(parsed)
    schemaValidation = true

    // Finalize metrics
    finalizeJSONParseMetrics(metrics, parseSuccess, schemaValidation, validated)

    // Calculate robustness score
    const robustness = calculateJSONRobustness(metrics)

    // Log robustness summary
    console.log('[parse-goal-suggestions] JSON Robustness:', {
      score: robustness.score,
      repairSteps: metrics.repairCount,
      recommendation: robustness.recommendation,
    })

    return { data: validated, robustness }
  } catch (error) {
    // Finalize metrics with error
    finalizeJSONParseMetrics(metrics, parseSuccess, schemaValidation, undefined, error as Error)

    // Calculate robustness score even on failure
    const robustness = calculateJSONRobustness(metrics)

    console.error('[parse-goal-suggestions] Failed to parse goal analysis JSON')
    console.error('Robustness Score:', robustness.score)
    console.error('Error:', error)
    console.error('Text length:', cleaned.length)
    console.error('First 500 chars:', cleaned.substring(0, 500))

    // Try to find the error position if it's a JSON parse error
    if (error instanceof SyntaxError && error.message.includes('position')) {
      const match = error.message.match(/position (\d+)/)
      if (match) {
        const pos = parseInt(match[1], 10)
        const contextStart = Math.max(0, pos - 100)
        const contextEnd = Math.min(cleaned.length, pos + 100)
        console.error(`Context around position ${pos}:`)
        console.error(cleaned.substring(contextStart, contextEnd))
        console.error(' '.repeat(pos - contextStart) + '^')
      }
    }

    console.error('Full cleaned text:', cleaned)
    throw new Error(`Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`)
  }
}
