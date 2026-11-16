import { afterAll, beforeAll, expect, test } from 'bun:test';
import { streamText } from 'ai';
import { testCoreConfig } from '../../../../test/config-fixture';
import { CHAT_MODELS } from '../assistant.constants';
import {
  OPENAI_TASK_MODELS,
  reasoningProviderOptions,
  resolveChatModel,
  UTILITY_MODEL_BY_PROVIDER,
} from './providers';
import { generateConversationTitle } from './title';

const NOT_FOUND = 404;

let server: ReturnType<typeof Bun.serve>;
let captured: { body: Record<string, unknown>; headers: Headers } | null = null;

beforeAll(() => {
  server = Bun.serve({
    port: 0,
    fetch: async (request) => {
      captured = {
        body: (await request.json()) as Record<string, unknown>,
        headers: request.headers,
      };
      return new Response('', { status: NOT_FOUND });
    },
  });
});

afterAll(() => {
  server.stop(true);
});

// A thinking block replayed after any change to the conversation before it is
// a 400 unless the request opts into dropping it instead.
test('a Claude turn asks Anthropic to drop stale thinking blocks', async () => {
  const config = testCoreConfig();
  config.ai.anthropic.apiKey = 'test-key';
  config.ai.anthropic.baseUrl = server.url.origin;
  const entry = CHAT_MODELS.find((model) => model.provider === 'anthropic');
  if (!entry) {
    throw new Error('no Anthropic chat model in the catalog');
  }

  const result = streamText({
    model: resolveChatModel(config, entry),
    prompt: 'hi',
    providerOptions: reasoningProviderOptions(entry),
    onError: () => undefined,
  });
  // The stub answers 404 on purpose; only the request matters.
  await result.consumeStream();

  expect(captured?.body.thinking).toEqual({
    type: 'adaptive',
    display: 'summarized',
    block_binding: { prefix_mismatch_behavior: 'drop_block' },
  });
  expect(captured?.headers.get('anthropic-beta')?.split(',')).toContain(
    'thinking-binding-controls-2026-08-01'
  );
});

// Privytics: only these two models are approved (cost and key scope). A merge
// that brings back upstream's wider catalog, or pins a utility or task model
// outside it, fails here.
const APPROVED_MODEL_IDS: string[] = ['gpt-6-luna', 'claude-haiku-5-5'];

test('only the approved models are reachable', () => {
  const chatModelIds: string[] = CHAT_MODELS.map((model) => model.modelId);
  expect(chatModelIds).toEqual(APPROVED_MODEL_IDS);
  for (const modelId of [
    ...Object.values(UTILITY_MODEL_BY_PROVIDER),
    ...Object.values(OPENAI_TASK_MODELS),
  ]) {
    expect(APPROVED_MODEL_IDS).toContain(modelId);
  }
});

// Reasoning tokens count against the title's 40-token cap, so the title call
// must turn reasoning off on both utility models.
test('the title call turns thinking off on Claude Haiku', async () => {
  const config = testCoreConfig();
  config.ai.anthropic.apiKey = 'test-key';
  config.ai.anthropic.baseUrl = server.url.origin;
  captured = null as typeof captured;

  await generateConversationTitle(config, 'Where do my visitors come from?');

  expect(captured?.body.model).toBe('claude-haiku-5-5');
  expect(captured?.body.thinking).toEqual({ type: 'disabled' });
  expect(captured?.body.max_tokens).toBe(40);
});

test('the title call asks gpt-6-luna for no reasoning', async () => {
  const config = testCoreConfig();
  config.ai.openai.apiKey = 'test-key';
  config.ai.openai.baseUrl = server.url.origin;
  captured = null as typeof captured;

  await generateConversationTitle(config, 'Where do my visitors come from?');

  expect(captured?.body.model).toBe('gpt-6-luna');
  expect(captured?.body.reasoning).toEqual({ effort: 'none' });
  expect(captured?.body.max_output_tokens).toBe(40);
});
