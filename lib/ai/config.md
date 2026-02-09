# AI Configuration

## Environment Variables

All AI model settings are configured via environment variables in `.env`:

### Required Variables

```env
# Google AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key

# AI Model Configuration
AI_MODEL_ID=gemini-2.0-flash-exp
AI_MODEL_PROVIDER=google
AI_MODEL_TEMPERATURE=0.3
AI_MODEL_MAX_TOKENS=3000
```

### Configuration Options

#### `AI_MODEL_ID`
- **Description**: The specific model to use for AI generation
- **Default**: `gemini-2.0-flash-exp`
- **Options**:
  - `gemini-2.0-flash-exp` - Fast, experimental model
  - `gemini-1.5-flash` - Stable flash model
  - `gemini-1.5-pro` - More powerful but slower

#### `AI_MODEL_PROVIDER`
- **Description**: The AI provider
- **Default**: `google`
- **Options**: Currently only `google` is supported

#### `AI_MODEL_TEMPERATURE`
- **Description**: Controls randomness in responses (0.0 = deterministic, 1.0 = creative)
- **Default**: `0.3`
- **Range**: 0.0 - 1.0
- **Recommendation**: Keep at 0.3 for consistent JSON formatting

#### `AI_MODEL_MAX_TOKENS`
- **Description**: Maximum tokens in the AI response
- **Default**: `4096`
- **Range**: 1 - 8000 (varies by model)
- **Recommendation**: Keep at 4096 to prevent response truncation

## Changing Models

To switch models, update `.env`:

```env
# Switch to a more powerful model
AI_MODEL_ID=gemini-1.5-pro
AI_MODEL_TEMPERATURE=0.3
AI_MODEL_MAX_TOKENS=4000
```

Then restart your development server:
```bash
npm run dev
```

## Cost Optimization

- **gemini-2.0-flash-exp**: Fastest, cheapest, experimental
- **gemini-1.5-flash**: Balanced speed/cost
- **gemini-1.5-pro**: Highest quality, most expensive

Lower `AI_MODEL_TEMPERATURE` (0.1-0.3) for more consistent, cheaper responses.
