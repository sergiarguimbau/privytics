import { generateText } from 'ai';
import type { CoreConfig } from '../../../config';
import { withAiContext } from '../../ai/ai.service';
import { resolveUtilityModel } from './providers';

const MAX_INPUT_CHARS = 400;
const MAX_TITLE_CHARS = 80;
const MAX_OUTPUT_TOKENS = 40;
const QUOTES = /^["'“”]+|["'“”.]+$/g;

/** A 3 to 6 word title from the first message; null when nothing usable comes back. */
export async function generateConversationTitle(
  config: CoreConfig,
  firstMessage: string
): Promise<string | null> {
  const model = resolveUtilityModel(config);
  const text = firstMessage.trim().slice(0, MAX_INPUT_CHARS);
  if (!(model && text)) {
    return null;
  }
  try {
    const result = await withAiContext({ name: 'conversation-title' }, () =>
      generateText({
        model,
        instructions:
          'Write a 3 to 6 word title for a chat that starts with the user message below. Reply with the title only: no quotes, no trailing period.',
        prompt: text,
        // Reasoning tokens count against the 40-token cap and could leave no
        // title: 'none' is effort none on gpt-6-luna, thinking off on Haiku 5.5.
        reasoning: 'none',
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      })
    );
    const title = result.text
      .trim()
      .replace(QUOTES, '')
      .slice(0, MAX_TITLE_CHARS);
    return title || null;
  } catch {
    return null;
  }
}
