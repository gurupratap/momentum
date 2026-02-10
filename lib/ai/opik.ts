import { Opik } from 'opik'

const globalForOpik = globalThis as unknown as {
  opik: Opik | undefined
}

let opikEnabled = false

export function getOpik(): Opik {
  // Check if Opik is configured
  const hasConfig = process.env.OPIK_API_KEY && process.env.OPIK_WORKSPACE

  if (!hasConfig && !opikEnabled) {
    console.warn('[opik] Opik observability disabled - OPIK_API_KEY or OPIK_WORKSPACE not set')
    opikEnabled = false
  } else {
    opikEnabled = true
  }

  if (!globalForOpik.opik && opikEnabled) {
    globalForOpik.opik = new Opik({
      apiKey: process.env.OPIK_API_KEY!,
      workspaceName: process.env.OPIK_WORKSPACE!,
      projectName: process.env.OPIK_PROJECT_NAME ?? 'momentum',
    })
  }

  // Return a no-op Opik if not configured
  if (!globalForOpik.opik) {
    return createNoOpOpik()
  }

  return globalForOpik.opik
}

/**
 * Create a no-op Opik client for when observability is disabled
 */
function createNoOpOpik(): Opik {
  const noOpSpan = {
    update: () => noOpSpan,
    end: () => noOpSpan,
    span: () => noOpSpan,
    generation: () => noOpSpan,
    data: { id: 'noop' },
  }

  return {
    trace: () => noOpSpan,
    flush: async () => {},
  } as unknown as Opik
}
