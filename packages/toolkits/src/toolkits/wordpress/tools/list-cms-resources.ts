// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressListCmsResources = tool({
  description: 'List categories, tags, comments, media, or users for an authorized site through one consistent paginated read tool.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    resource: z.enum(['categories', 'tags', 'comments', 'media', 'users']).describe('CMS resource collection to list.'),
    search: z.string().optional().describe('Limit results to records matching this text where the resource supports search.'),
    cursor: z.string().optional().describe('Opaque continuation cursor returned by a previous call.'),
    pageSize: z.number().min(1).max(100).optional().describe('Maximum resources in this page.'),
  }),
  execute: async ({ wordpressToken, siteId, resource, search, cursor, pageSize }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      let path = '';
      const query: Record<string, any> = { number: pageSize ?? 20, search, offset: cursor };
      // WordPress.com REST mapping
      switch (resource) {
        case 'categories':
          path = `/rest/v1.1/sites/${siteId}/categories`;
          break;
        case 'tags':
          path = `/rest/v1.1/sites/${siteId}/tags`;
          query.number = pageSize;
          break;
        case 'comments':
          path = `/rest/v1.1/sites/${siteId}/comments`;
          query.number = pageSize;
          query.status = 'all';
          if (search) query.search = search;
          break;
        case 'media':
          path = `/rest/v1.1/sites/${siteId}/media`;
          query.number = pageSize;
          if (search) query.search = search;
          break;
        case 'users':
          path = `/rest/v1.1/sites/${siteId}/users`;
          query.number = pageSize;
          if (search) query.search = search;
          break;
        default:
          return { error: `Unknown resource ${resource}` };
      }
      const res = await wpFetch(path, { wordpressToken, method: 'GET', query });
      if (!res.ok) return { error: `Failed to list ${resource}`, details: res.data };
      const data = res.data;
      const items = data.categories ?? data.tags ?? data.comments ?? data.media ?? data.users ?? data.found ? Object.values(data) : data.users ?? data.media ?? data.comments ?? [];
      // Fallback generic
      const normalizedItems = Array.isArray(data) ? data : data.categories ?? data.tags ?? data.media ?? data.comments ?? data.users ?? data.found ?? [];
      const actualItems = Array.isArray(normalizedItems) ? normalizedItems : [];
      // Try alternative shape
      const finalItems = actualItems.length ? actualItems : (Array.isArray(data) ? data : []);
      // For categories/tags, ensure resource field
      const enriched = finalItems.map((it: any) => ({ resource, ...it }));
      return {
        resource,
        items: enriched.length ? enriched : (data.categories ?? data.tags ?? []),
        hasMore: data.meta?.next_page ? true : false,
        nextCursor: data.meta?.next_page ?? data.found ? null : null,
        total: data.found ?? data.total ?? undefined,
      };
    } catch (e) {
      return { error: 'Error listing CMS resources', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
