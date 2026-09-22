// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressDeleteDraftPost = tool({
  description: 'Permanently delete an existing draft post after verifying it is still a draft. The tool refuses to delete published, scheduled, pending, or private posts.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    postId: z.number().describe('ID of a draft post to permanently delete.'),
  }),
  execute: async ({ wordpressToken, siteId, postId }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      // Verify status is draft first
      const getRes = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/${postId}`, {
        wordpressToken,
        method: 'GET',
        query: { context: 'edit' },
      });
      if (!getRes.ok) return { error: 'Failed to fetch post for verification', details: getRes.data };
      const existing = getRes.data;
      const status = existing.status ?? existing.post?.status;
      if (status && status !== 'draft') {
        return { error: `Refusing to delete post with status '${status}'. Only draft posts can be deleted with this tool.`, details: existing };
      }
      const delRes = await wpFetch(`/rest/v1.1/sites/${siteId}/posts/${postId}/delete`, {
        wordpressToken,
        method: 'POST',
      });
      if (!delRes.ok) return { error: 'Failed to delete draft post', details: delRes.data };
      const data = delRes.data;
      return {
        deleted: true,
        post: {
          id: existing.ID ?? existing.id ?? postId,
          status: 'draft',
          title: existing.title,
        },
        raw: data,
      };
    } catch (e) {
      return { error: 'Error deleting draft post', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
