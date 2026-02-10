import { google } from '@ai-sdk/google'

// AI Model Configuration from environment variables
export const MODEL_ID = process.env.AI_MODEL_ID || 'gemini-2.0-flash-exp'
export const PROVIDER = process.env.AI_MODEL_PROVIDER || 'google'
export const TEMPERATURE = parseFloat(process.env.AI_MODEL_TEMPERATURE || '0.3')
// No default max tokens - let the model use its natural maximum
export const MAX_TOKENS = process.env.AI_MODEL_MAX_TOKENS ? parseInt(process.env.AI_MODEL_MAX_TOKENS, 10) : undefined

// Initialize the model based on provider
export const model = PROVIDER === 'google' ? google(MODEL_ID) : google(MODEL_ID)
