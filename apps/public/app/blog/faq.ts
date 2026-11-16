/**
 * Extract the `## FAQ` section of a post body into question/answer pairs for
 * FAQPage JSON-LD. Every post ends with an FAQ written as `### question`
 * headings followed by prose; as structured data those pairs are exactly what
 * generative engines and rich results quote, and until now they were invisible.
 *
 * Parsing is deliberately conservative: if a post has no `## FAQ` section, or
 * the section yields no pairs, the caller emits nothing. Bad markup degrades to
 * absent schema, never to wrong schema.
 */

export type FaqPair = { q: string; a: string };

/** Strip the markdown that would leak into JSON-LD text values. */
function plainText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1') // italics
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractFaq(body: string): FaqPair[] {
  // Matches both "## FAQ" and subtitled variants like
  // "## FAQ: cookie banners and cookieless analytics".
  const afterHeading = body.split(/^## FAQ\b[^\n]*$/m)[1];
  if (!afterHeading) {
    return [];
  }
  // The FAQ runs until the next h2, if any.
  const section = afterHeading.split(/^## /m)[0];

  const pairs: FaqPair[] = [];
  for (const chunk of section.split(/^### /m).slice(1)) {
    const newline = chunk.indexOf('\n');
    if (newline === -1) {
      continue;
    }
    const q = plainText(chunk.slice(0, newline));
    const a = plainText(chunk.slice(newline + 1));
    if (q && a) {
      pairs.push({ q, a });
    }
  }
  return pairs;
}
