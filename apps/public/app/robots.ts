import type { MetadataRoute } from 'next';

// Nothing here varies per request, so prerender it at build time. Required by
// `output: 'export'`, and a no-op on any other target.
export const dynamic = 'force-static';

// AI crawlers are listed explicitly even though `*: allow` already covers
// them. 100% of growth is organic search plus AI assistants, so the intent
// should be unambiguous to an operator reading the file and robust to any
// future rule added above the wildcard. The non-standard Yandex-only `host`
// field was removed; every other engine ignores it and it added noise.
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/' })),
    ],
    sitemap: 'https://privytics.com/sitemap.xml',
  };
}
