import Firecrawl from 'firecrawl';

export function createFirecrawlClient(apiKey?: string): Firecrawl {
  const key = apiKey ?? process.env.FIRECRAWL_API_KEY;
  return new Firecrawl(key ? { apiKey: key } : {});
}

export function extractSnippet(entry: Record<string, unknown>): string {
  if (typeof entry.markdown === 'string' && entry.markdown.trim()) {
    return entry.markdown.trim().slice(0, 500);
  }
  if (typeof entry.description === 'string' && entry.description.trim()) {
    return entry.description.trim();
  }
  return '';
}
