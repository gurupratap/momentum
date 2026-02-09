/**
 * JSON Robustness Tracking for AI-Generated Responses
 *
 * Tracks concrete metrics about JSON parsing, repair, and schema validation
 * to identify model/prompt quality issues and optimize for robustness.
 */

export interface JSONParseMetrics {
  // Input characteristics
  rawTextLength: number
  rawTextSample: string // First 200 chars for debugging

  // Pre-parsing issues detected
  hadMarkdownFences: boolean
  hadCurlyQuotes: boolean
  hadContractions: boolean
  hadLeadingWhitespace: boolean
  hadTrailingWhitespace: boolean
  wasTruncated: boolean
  truncationRecovered: boolean

  // Repair steps applied
  repairSteps: string[] // e.g., ["stripped_fences", "fixed_quotes", "expanded_contractions"]
  repairCount: number

  // Parsing outcome
  parseSuccess: boolean
  parseAttempts: number // How many tries before success/failure
  parseErrorMessage?: string
  parseErrorPosition?: number

  // Schema validation outcome
  schemaValidation: boolean
  schemaErrors?: string[] // Zod validation errors

  // Semantic quality
  hasEmptyRequiredFields: boolean
  hasGenericValues: boolean // e.g., "string", "text", "example"
  fieldCompleteness: number // 0-100, percentage of expected fields populated

  // Final output
  finalWordCount?: number
  finalObjectSize?: number // Number of top-level fields
  finalArrayLengths?: Record<string, number> // For array fields

  // Timestamps
  startTime: number
  endTime: number
  durationMs: number
}

export interface JSONRobustnessScore {
  score: number // 0-100 overall robustness
  breakdown: {
    preParsingQuality: number // 0-100: lower = more issues in raw output
    repairComplexity: number // 0-100: lower = more repairs needed
    parseSuccess: number // 0 or 100: binary
    schemaCompliance: number // 0-100: based on validation
    semanticQuality: number // 0-100: based on field quality
  }
  metrics: JSONParseMetrics
  recommendation: string
}

/**
 * Calculate JSON robustness score from parse metrics
 */
export function calculateJSONRobustness(metrics: JSONParseMetrics): JSONRobustnessScore {
  // 1. Pre-parsing quality (0-100): measures how clean the raw output was
  let preParsingPenalty = 0
  if (metrics.hadMarkdownFences) preParsingPenalty += 15
  if (metrics.hadCurlyQuotes) preParsingPenalty += 20
  if (metrics.hadContractions) preParsingPenalty += 10
  if (metrics.hadLeadingWhitespace || metrics.hadTrailingWhitespace) preParsingPenalty += 5
  const preParsingQuality = Math.max(0, 100 - preParsingPenalty)

  // 2. Repair complexity (0-100): measures how many repairs were needed
  // 0 repairs = 100, 5+ repairs = 0
  const repairComplexity = Math.max(0, 100 - (metrics.repairCount * 20))

  // 3. Parse success (0 or 100): binary
  const parseSuccess = metrics.parseSuccess ? 100 : 0

  // 4. Schema compliance (0-100): based on validation
  let schemaCompliance = 100
  if (!metrics.schemaValidation) {
    schemaCompliance = 0
  } else if (metrics.schemaErrors && metrics.schemaErrors.length > 0) {
    // Partial credit if validation passed but with warnings
    schemaCompliance = Math.max(0, 100 - (metrics.schemaErrors.length * 20))
  }

  // 5. Semantic quality (0-100): based on field quality
  let semanticQuality = 100
  if (metrics.hasEmptyRequiredFields) semanticQuality -= 30
  if (metrics.hasGenericValues) semanticQuality -= 20
  // Factor in field completeness
  semanticQuality = (semanticQuality * metrics.fieldCompleteness) / 100

  // Overall score: weighted average
  const weights = {
    preParsingQuality: 15,
    repairComplexity: 15,
    parseSuccess: 40, // Most important: did it parse?
    schemaCompliance: 20,
    semanticQuality: 10,
  }

  const score =
    (preParsingQuality * weights.preParsingQuality +
      repairComplexity * weights.repairComplexity +
      parseSuccess * weights.parseSuccess +
      schemaCompliance * weights.schemaCompliance +
      semanticQuality * weights.semanticQuality) /
    100

  // Generate recommendation
  let recommendation = ''
  if (score >= 90) {
    recommendation = 'Excellent: JSON output is robust and requires minimal repair'
  } else if (score >= 70) {
    recommendation = 'Good: Minor formatting issues, but parseable'
  } else if (score >= 50) {
    recommendation = 'Fair: Significant repairs needed, consider prompt improvements'
  } else if (score >= 30) {
    recommendation = 'Poor: Frequent parsing issues, prompt optimization required'
  } else {
    recommendation = 'Critical: JSON output unreliable, review prompt and model temperature'
  }

  // Add specific recommendations based on issues
  const issues: string[] = []
  if (metrics.hadCurlyQuotes) issues.push('Use explicit quote instructions in prompt')
  if (metrics.hadContractions) issues.push('Prohibit contractions in prompt')
  if (metrics.wasTruncated && !metrics.truncationRecovered) issues.push('Increase MAX_TOKENS')
  if (!metrics.parseSuccess) issues.push('Review error context and adjust prompt format')
  if (metrics.hasEmptyRequiredFields) issues.push('Add field examples to prompt')
  if (metrics.hasGenericValues) issues.push('Request specific, concrete values in prompt')

  if (issues.length > 0) {
    recommendation += '. Specific actions: ' + issues.join('; ')
  }

  return {
    score: Math.round(score),
    breakdown: {
      preParsingQuality: Math.round(preParsingQuality),
      repairComplexity: Math.round(repairComplexity),
      parseSuccess: Math.round(parseSuccess),
      schemaCompliance: Math.round(schemaCompliance),
      semanticQuality: Math.round(semanticQuality),
    },
    metrics,
    recommendation,
  }
}

/**
 * Initialize metrics tracking for a JSON parse operation
 */
export function initJSONParseMetrics(rawText: string): JSONParseMetrics {
  return {
    rawTextLength: rawText.length,
    rawTextSample: rawText.substring(0, 200),
    hadMarkdownFences: /^```(?:json)?/m.test(rawText) || /```\s*$/m.test(rawText),
    hadCurlyQuotes: /[\u201C\u201D\u2018\u2019]/.test(rawText),
    hadContractions: /\b(don't|doesn't|can't|won't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|wouldn't|shouldn't|couldn't|it's|that's|what's|there's|here's|you're|we're|they're|I'm|you'll|we'll|they'll|let's)\b/.test(
      rawText
    ),
    hadLeadingWhitespace: rawText !== rawText.trimStart(),
    hadTrailingWhitespace: rawText !== rawText.trimEnd(),
    wasTruncated: false, // Will be updated by fixTruncatedJSON
    truncationRecovered: false,
    repairSteps: [],
    repairCount: 0,
    parseSuccess: false,
    parseAttempts: 0,
    schemaValidation: false,
    hasEmptyRequiredFields: false,
    hasGenericValues: false,
    fieldCompleteness: 0,
    startTime: Date.now(),
    endTime: 0,
    durationMs: 0,
  }
}

/**
 * Record a repair step in the metrics
 */
export function recordRepairStep(metrics: JSONParseMetrics, step: string): void {
  metrics.repairSteps.push(step)
  metrics.repairCount++
}

/**
 * Finalize metrics after parsing complete
 */
export function finalizeJSONParseMetrics(
  metrics: JSONParseMetrics,
  parseSuccess: boolean,
  schemaValidation: boolean,
  parsedData?: unknown,
  error?: Error
): void {
  metrics.parseSuccess = parseSuccess
  metrics.schemaValidation = schemaValidation
  metrics.endTime = Date.now()
  metrics.durationMs = metrics.endTime - metrics.startTime

  if (error) {
    metrics.parseErrorMessage = error.message
    // Try to extract position from syntax errors
    const posMatch = error.message.match(/position (\d+)/)
    if (posMatch) {
      metrics.parseErrorPosition = parseInt(posMatch[1], 10)
    }
  }

  if (parsedData && parseSuccess && schemaValidation) {
    // Analyze semantic quality
    analyzeSemanticQuality(metrics, parsedData)
  }
}

/**
 * Analyze semantic quality of parsed data
 */
function analyzeSemanticQuality(metrics: JSONParseMetrics, data: unknown): void {
  // Check for empty required fields
  const hasEmpty = checkForEmptyFields(data)
  metrics.hasEmptyRequiredFields = hasEmpty

  // Check for generic placeholder values
  const hasGeneric = checkForGenericValues(data)
  metrics.hasGenericValues = hasGeneric

  // Calculate field completeness
  const completeness = calculateFieldCompleteness(data)
  metrics.fieldCompleteness = completeness

  // Track array lengths for goal suggestions
  if (data.suggestedHabits && Array.isArray(data.suggestedHabits)) {
    metrics.finalArrayLengths = { suggestedHabits: data.suggestedHabits.length }
  }

  // Track word count for analysis text
  if (data.analysis && typeof data.analysis === 'string') {
    metrics.finalWordCount = data.analysis.split(/\s+/).filter((w: string) => w.length > 0).length
  }
  if (data.research && typeof data.research === 'string') {
    metrics.finalWordCount = data.research.split(/\s+/).filter((w: string) => w.length > 0).length
  }

  // Count top-level fields
  if (typeof data === 'object' && data !== null) {
    metrics.finalObjectSize = Object.keys(data).length
  }
}

/**
 * Check if data contains empty required fields
 */
function checkForEmptyFields(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) return false

  for (const value of Object.values(data as Record<string, unknown>)) {
    if (value === '' || value === null || value === undefined) {
      return true
    }
    if (typeof value === 'string' && value.trim().length === 0) {
      return true
    }
    if (Array.isArray(value) && value.length === 0) {
      return true
    }
    if (typeof value === 'object' && checkForEmptyFields(value)) {
      return true
    }
  }
  return false
}

/**
 * Check if data contains generic placeholder values
 */
function checkForGenericValues(data: unknown): boolean {
  const genericPatterns = [
    /^(string|text|example|sample|placeholder|lorem ipsum|test|demo|todo|tbd|n\/a)$/i,
    /^habit \d+$/i,
    /^item \d+$/i,
    /^untitled/i,
  ]

  if (typeof data === 'string') {
    return genericPatterns.some(pattern => pattern.test(data.trim()))
  }

  if (Array.isArray(data)) {
    return data.some(item => checkForGenericValues(item))
  }

  if (typeof data === 'object' && data !== null) {
    return Object.values(data as Record<string, unknown>).some(value => checkForGenericValues(value))
  }

  return false
}

/**
 * Calculate field completeness percentage
 */
function calculateFieldCompleteness(data: unknown): number {
  if (typeof data !== 'object' || data === null) return 0

  let totalFields = 0
  let populatedFields = 0

  function countFields(obj: unknown): void {
    if (typeof obj !== 'object' || obj === null) return

    for (const value of Object.values(obj as Record<string, unknown>)) {
      totalFields++

      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string' && value.trim().length > 0) {
          populatedFields++
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          populatedFields++
        } else if (Array.isArray(value) && value.length > 0) {
          populatedFields++
          // Count array items
          value.forEach(item => countFields(item))
        } else if (typeof value === 'object') {
          populatedFields++
          countFields(value)
        }
      }
    }
  }

  countFields(data)

  return totalFields > 0 ? Math.round((populatedFields / totalFields) * 100) : 0
}
