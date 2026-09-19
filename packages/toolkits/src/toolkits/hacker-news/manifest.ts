import { defineToolkit, defineTool } from '../../core/define.js';
import { HACKER_NEWS_ICON } from './icon.js';
import { hackerNewsTools } from './tools/index.js';

export default defineToolkit({
  id: 'hacker-news',
  displayName: 'Hacker News',
  shortDescription: 'Top stories, discussions, search, items, and user profiles from Hacker News.',
  category: 'Social Media',
  icon: HACKER_NEWS_ICON,
  auth: { type: 'none' },
  allowedHosts: ['hacker-news.firebaseio.com', 'hn.algolia.com'],
  tools: hackerNewsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.9',
    homepage: 'https://news.ycombinator.com',
    docsUrl: 'https://github.com/HackerNews/API',
    apiDocsUrl: 'https://github.com/HackerNews/API',
  },
});
