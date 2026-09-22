// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressListContent = tool({
  description: 'List and search editable posts or pages on an authorized site, including drafts, with compact raw and rendered content fields and agent-controlled pagination.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    contentType: z.enum(['posts', 'pages']).describe('Content collection to list: posts or pages.'),
    search: z.string().optional().describe('Limit results to content matching this text.'),
    statuses: z.array(z.string()).optional().describe('Filter by provider-defined status names such as draft, pending, private, future, or publish.'),
    authorId: z.number().optional().describe('Limit results to one author ID.'),
    orderBy: z.enum(['date', 'id', 'modified', 'relevance', 'slug', 'title']).optional().describe('Field used to sort results.'),
    order: z.enum(['asc', 'desc']).optional().describe('Sort direction.'),
    cursor: z.string().optional().describe('Opaque continuation cursor returned by a previous call.'),
    pageSize: z.number().min(1).max(100).optional().describe('Maximum content items in this page.'),
  }),
  execute: async ({ wordpressToken, siteId, contentType, search, statuses, authorId, orderBy, order, cursor, pageSize }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const path = contentType === 'pages' ? `/rest/v1.1/sites/${siteId}/pages` : `/rest/v1.1/sites/${siteId}/posts`;
      const query: Record<string, any> = {
        number: pageSize ?? 20,
        search,
        status: statuses?.join(','),
        author: authorId,
        order_by: orderBy,
        order,
        offset: cursor,
        context: 'edit',
      };
      const res = await wpFetch(path, { wordpressToken, method: 'GET', query });
      if (!res.ok) return { error: `Failed to list ${contentType}`, details: res.data };
      const data = res.data;
      const itemsRaw = data.posts ?? data.pages ?? data.found ? data.posts ?? data.pages : [];
      const items = (itemsRaw ?? []).map((p: any) => ({
        id: p.ID ?? p.id,
        type: p.type ?? contentType.slice(0, -1),
        status: p.status,
        title: p.title,
        content: p.content,
        excerpt: p.excerpt,
        slug: p.slug,
        link: p.URL ?? p.link,
        date: p.date,
        modified: p.modified,
        authorId: p.author?.ID ?? p.author_id,
        parent: p.parent?.ID ?? p.parent ?? 0,
        categoryIds: p.categories ? Object.keys(p.categories).map(Number) : undefined,
        tagIds: p.tags ? Object.keys(p.tags).map(Number) : undefined,
        featuredMediaId: p.featured_image ?? 0,
        commentStatus: p.discussion?.comment_status,
        menuOrder: p.menu_order,
      }));
      return {
        items,
        hasMore: !!data.meta?.next_page || (data.found != null && items.length < data.found),
        nextCursor: data.meta?.next_page ?? null,
        total: data.found ?? undefined,
        totalPages: data.found && pageSize ? Math.ceil(data.found / (pageSize ?? 20)) : undefined,
      };
    } catch (e) {
      return { error: 'Error listing content', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
