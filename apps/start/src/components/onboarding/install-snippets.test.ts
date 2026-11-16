import { frameworks } from '@openpanel/sdk-info';
import { describe, expect, it } from 'vitest';
import { buildAiInstallPrompt } from './ai-install-prompt';
import { getInstallSnippets, SCRIPT_URL } from './install-snippets';

const context = {
  clientId: 'client-1',
  clientSecret: null,
  apiUrl: 'https://api.privytics.com',
};

const framework = (key: string) => {
  const found = frameworks.find((item) => item.key === key);
  if (!found) {
    throw new Error(`No framework ${key}`);
  }
  return found;
};

describe('install snippets', () => {
  // The published components load op1.js from openpanel.dev unless told otherwise.
  it.each([
    'html',
    'nextjs',
    'astro',
  ])('%s loads the script from Privytics', (key) => {
    const code = getInstallSnippets(framework(key), context)
      .map((snippet) => snippet.code)
      .join('\n');
    expect(code).toContain(SCRIPT_URL);
    expect(code).toContain(context.apiUrl);
    expect(code).not.toContain('openpanel.dev');
  });

  it('the next.js and astro components get it as scriptUrl', () => {
    for (const key of ['nextjs', 'astro']) {
      const code = getInstallSnippets(framework(key), context)
        .map((snippet) => snippet.code)
        .join('\n');
      expect(code).toContain(`scriptUrl="${SCRIPT_URL}"`);
    }
  });
});

describe('AI install prompt', () => {
  it('tells the agent to set apiUrl and scriptUrl for a website', () => {
    const prompt = buildAiInstallPrompt({
      projectName: 'Acme',
      projectTypes: ['website'],
      framework: null,
      context,
    });
    expect(prompt).toContain('`apiUrl` option');
    expect(prompt).toContain(`- Script URL: ${SCRIPT_URL}`);
    expect(prompt).toContain(
      `@openpanel/nextjs (render <OpenPanelComponent clientId="…" scriptUrl="${SCRIPT_URL}" />`
    );
  });

  it('leaves scriptUrl out for a backend', () => {
    const prompt = buildAiInstallPrompt({
      projectName: 'Acme',
      projectTypes: ['backend'],
      framework: framework('node'),
      context,
    });
    expect(prompt).not.toContain('scriptUrl');
  });
});
