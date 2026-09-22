// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressGetPost = tool({
  description: 'Get one post by ID in editable context, including raw content and its current status.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    postId: z.number().describe('Post ID returned by create, list, or search.'),
  }),
  execute: async ({ wordpressToken, siteId, postId }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const res = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/${postId}`, {
        wordpressToken,
        method: 'GET',
        query: { context: 'edit' },
      });
      if (!res.ok) return { error: 'Failed to get post', details: res.data };
      const p = res.data;
      return {
        post: {
          id: p.ID ?? p.id,
          status: p.status,
          title: p.title,
          content: p.content,
          excerpt: p.excerpt,
          slug: p.slug,
          link: p.URL ?? p.link,
          date: p.date,
          modified: p.modified,
          authorId: p.author?.ID ?? p.author_id,
          categoryIds: p.categories ? Object.keys(p.categories).map(Number) : p.category_ids,
          tagIds: p.tags ? Object.keys(p.tags).map(Number) : p.tag_ids,
          commentStatus: p.discussion?.comment_status ?? p.comment_status,
          featuredMediaId: p.featured_image ?? p.featured_media_id ?? 0,
        },
      };
    } catch (e) {
      return { error: 'Error getting post', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
