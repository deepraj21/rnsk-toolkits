// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressCreateDraftPost = tool({
  description: 'Create a non-public draft post on an authorized WordPress.com site. This tool never publishes content; use the returned post ID for review, update, and cleanup.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    title: z.string().describe('Draft title as plain text.'),
    content: z.string().optional().describe('Draft body as HTML or WordPress block markup.'),
    excerpt: z.string().optional().describe('Optional draft excerpt.'),
    categoryIds: z.array(z.number()).optional().describe('Category IDs to assign.'),
    tagIds: z.array(z.number()).optional().describe('Tag IDs to assign.'),
    featuredMediaId: z.number().optional().describe('Existing media item ID to use as the featured image.'),
    commentStatus: z.enum(['open', 'closed']).optional().describe('Whether comments should be open if the draft is later published.'),
  }),
  execute: async ({ wordpressToken, siteId, title, content, excerpt, categoryIds, tagIds, featuredMediaId, commentStatus }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const body: Record<string, unknown> = {
        title,
        content: content ?? '',
        excerpt,
        status: 'draft',
      };
      if (categoryIds) body.categories = categoryIds;
      if (tagIds) body.tags = tagIds;
      if (featuredMediaId) body.featured_image = featuredMediaId;
      if (commentStatus) body.comment_status = commentStatus;

      const res = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/new`, {
        wordpressToken,
        method: 'POST',
        body,
      });
      if (!res.ok) return { error: 'Failed to create draft post', details: res.data };
      const post = res.data;
      return {
        post: {
          id: post.ID ?? post.id,
          status: post.status ?? 'draft',
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          link: post.URL ?? post.link,
          slug: post.slug,
          authorId: post.author?.ID ?? post.author_id,
          categoryIds: post.categories ? Object.keys(post.categories).map(Number) : categoryIds,
          tagIds: post.tags ? Object.keys(post.tags).map(Number) : tagIds,
          commentStatus: post.discussion?.comment_status ?? post.comment_status,
          featuredMediaId: post.featured_image ?? featuredMediaId ?? 0,
          date: post.date,
          modified: post.modified,
        },
      };
    } catch (e) {
      return { error: 'Error creating draft post', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
