import { defineToolkit, defineTool } from '../../core/define.js';
import { FIRECRAWL_ICON } from './icon.js';
import { webSearch } from './tools/web-search.js';
import { webScrape } from './tools/web-scrape.js';

export default defineToolkit({
  id: 'web-search',
  displayName: 'Firecrawl',
  shortDescription: 'Search the web and scrape pages for current information.',
  category: 'Data & Analytics',
  icon: FIRECRAWL_ICON,
  auth: {
    type: 'service_env',
    env: [{ name: 'FIRECRAWL_API_KEY', description: 'Firecrawl API key for web search and scraping' }],
  },
  allowedHosts: ['api.firecrawl.dev'],
  tools: [
    defineTool({ name: 'webSearch', tool: webSearch, scope: 'read' }),
    defineTool({ name: 'webScrape', tool: webScrape, scope: 'read' }),
  ],
  meta: { since: '0.0.1', homepage: 'https://firecrawl.dev' },
});
