import { Opik } from 'opik'

const globalForOpik = globalThis as unknown as {
  opik: Opik | undefined
}

export function getOpik(): Opik {
  if (!globalForOpik.opik) {
    globalForOpik.opik = new Opik({
      apiKey: process.env.OPIK_API_KEY!,
      workspaceName: process.env.OPIK_WORKSPACE!,
      projectName: process.env.OPIK_PROJECT_NAME ?? 'momentum',
    })
  }
  return globalForOpik.opik
}
