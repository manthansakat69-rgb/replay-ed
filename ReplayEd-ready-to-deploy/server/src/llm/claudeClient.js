import Anthropic from '@anthropic-ai/sdk';

export function stripCodeFences(text) {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Invokes Claude with system prompt and messages.
 * Falls back gracefully to intelligent mock logic if ANTHROPIC_API_KEY is not set or network fails.
 */
export async function callClaude({ systemPrompt, messages, temperature = 0.2, maxTokens = 1500 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022';

  if (apiKey && apiKey !== 'your_anthropic_api_key' && !apiKey.startsWith('demo')) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemPrompt,
        messages,
      });

      const firstContent = response.content?.[0];
      if (firstContent?.type === 'text') {
        return firstContent.text;
      }
      return '';
    } catch (err) {
      console.warn(`[Claude API Notice] Claude API error (${err.message}). Using fallback generator.`);
    }
  }

  // Graceful heuristic fallback for demo environments without an Anthropic API key
  return null;
}
