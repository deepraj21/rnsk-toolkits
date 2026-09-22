// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressListReaderSubscriptions = tool({
  description: 'List feeds and sites followed by the connected WordPress.com account without changing subscriptions.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
  }),
  execute: async ({ wordpressToken }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const res = await wpFetch('/rest/v1.1/read/following/mine', {
        wordpressToken,
        method: 'GET',
      });
      if (!res.ok) return { error: 'Failed to list reader subscriptions', details: res.data };
      const data = res.data;
      const subs = data.subscriptions ?? data.feeds ?? data.sites ?? [];
      const normalized = (Array.isArray(subs) ? subs : []).map((s: any) => ({
        subscriptionId: String(s.ID ?? s.subscription_id ?? s.feed_ID ?? ''),
        blogId: String(s.blog_ID ?? s.blog_id ?? s.feed_ID ?? '0'),
        url: s.URL ?? s.url ?? s.feed_url ?? '',
        title: s.name ?? s.title ?? '',
        feedUrl: s.feed_URL ?? s.feed_url ?? '',
        siteIcon: s.site_icon ?? s.icon ?? '',
      }));
      return {
        subscriptions: normalized.length ? normalized : subs,
      };
    } catch (e) {
      return { error: 'Error listing reader subscriptions', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
