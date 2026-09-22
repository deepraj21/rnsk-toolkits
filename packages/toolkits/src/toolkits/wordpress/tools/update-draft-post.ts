// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressUpdateDraftPost = tool({
  description: 'Update title, body, excerpt, taxonomy, featured media, or comment policy for an existing draft. Provide at least one field to update. The tool refuses to modify a post whose current status is not draft.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    postId: z.number().describe('ID of a draft post to update.'),
    title: z.string().optional().describe('Replacement draft title.'),
    content: z.string().optional().describe('Replacement draft body as HTML or WordPress block markup.'),
    excerpt: z.string().optional().describe('Replacement excerpt.'),
    categoryIds: z.array(z.number()).optional().describe('Replacement category IDs; use an empty list to clear them.'),
    tagIds: z.array(z.number()).optional().describe('Replacement tag IDs; use an empty list to clear them.'),
    featuredMediaId: z.number().optional().describe('Replacement featured media ID; use 0 to remove it.'),
    commentStatus: z.enum(['open', 'closed']).optional().describe('Replacement comment policy.'),
  }),
  execute: async ({ wordpressToken, siteId, postId, title, content, excerpt, categoryIds, tagIds, featuredMediaId, commentStatus }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    if (
      title === undefined &&
      content === undefined &&
      excerpt === undefined &&
      categoryIds === undefined &&
      tagIds === undefined &&
      featuredMediaId === undefined &&
      commentStatus === undefined
    ) {
      return { error: 'Provide at least one field to update: title, content, excerpt, categoryIds, tagIds, featuredMediaId, or commentStatus' };
    }
    try {
      // Verify draft status
      const getRes = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/${postId}`, {
        wordpressToken,
        method: 'GET',
        query: { context: 'edit' },
      });
      if (!getRes.ok) return { error: 'Failed to fetch post for verification', details: getRes.data };
      const existing = getRes.data;
      const status = existing.status;
      if (status && status !== 'draft') {
        return { error: `Refusing to update post with status '${status}'. Only draft posts can be updated with this tool.`, details: existing };
      }
      const body: Record<string, unknown> = {};
      if (title !== undefined) body.title = title;
      if (content !== undefined) body.content = content;
      if (excerpt !== undefined) body.excerpt = excerpt;
      if (categoryIds !== undefined) body.categories = categoryIds;
      if (tagIds !== undefined) body.tags = tagIds;
      if (featuredMediaId !== undefined) body.featured_image = featuredMediaId;
      if (commentStatus !== undefined) body.discussion = { comment_status: commentStatus };

      const res = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/${postId}`, {
        wordpressToken,
        method: 'POST',
        body,
      });
      if (!res.ok) return { error: 'Failed to update draft post', details: res.data };
      const p = res.data;
      const updatedFields = Object.keys(body);
      return {
        post: {
          id: p.ID ?? p.id ?? postId,
          status: p.status ?? 'draft',
          title: p.title,
          content: p.content,
          excerpt: p.excerpt,
          slug: p.slug,
          link: p.URL ?? p.link,
          modified: p.modified,
          authorId: p.author?.ID,
          categoryIds: p.categories ? Object.keys(p.categories).map(Number) : categoryIds,
          tagIds: p.tags ? Object.keys(p.tags).map(Number) : tagIds,
          featuredMediaId: p.featured_image ?? featuredMediaId,
          commentStatus: p.discussion?.comment_status ?? commentStatus,
        },
        updatedFields,
      };
    } catch (e) {
      return { error: 'Error updating draft post', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
