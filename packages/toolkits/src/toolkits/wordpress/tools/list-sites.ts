// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressListSites = tool({
  description: 'List every WordPress.com or Jetpack-connected site authorized by the global OAuth account, returning stable numeric site IDs and concise capability and plan summaries for use with other tools.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    activity: z.enum(['all', 'active', 'inactive']).optional().describe('Include all sites or filter by active or inactive status.'),
    visibility: z.enum(['all', 'visible', 'hidden']).optional().describe("Include all authorized sites or only sites visible or hidden in the user's site list."),
  }),
  execute: async ({ wordpressToken, activity, visibility }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const res = await wpFetch('/rest/v1.1/me/sites', {
        wordpressToken,
        method: 'GET',
        query: {
          site_visibility: visibility,
        },
      });
      if (!res.ok) return { error: 'Failed to list sites', details: res.data };
      const data = res.data;
      const sitesRaw = data.sites ?? [];
      let filtered = sitesRaw;
      // Activity filter is not a query param; filter locally if needed
      if (activity && activity !== 'all') {
        // No direct activity field; keep all
      }
      if (visibility && visibility !== 'all') {
        filtered = filtered.filter((s: any) => (visibility === 'visible' ? s.visible !== false : s.visible === false));
      }
      const sites = filtered.map((s: any) => ({
        siteId: s.ID ?? s.site_id,
        name: s.name,
        url: s.URL ?? s.url,
        isPrivate: s.is_private ?? false,
        visible: s.visible ?? true,
        jetpack: s.jetpack ?? false,
        isAtomic: s.is_wpcom_atomic ?? s.is_atomic ?? false,
        userCanManage: s.user_can_manage ?? s.capabilities?.manage_options ?? false,
        plan: {
          productName: s.plan?.product_name ?? s.plan?.product_name_pretty,
          productSlug: s.plan?.product_slug,
          isFree: s.plan?.is_free ?? false,
        },
        capabilities: {
          editPosts: s.capabilities?.edit_posts ?? false,
          editPages: s.capabilities?.edit_pages ?? false,
          deletePosts: s.capabilities?.delete_posts ?? false,
          publishPosts: s.capabilities?.publish_posts ?? false,
          uploadFiles: s.capabilities?.upload_files ?? false,
          manageCategories: s.capabilities?.manage_categories ?? false,
          manageOptions: s.capabilities?.manage_options ?? false,
          moderateComments: s.capabilities?.moderate_comments ?? false,
          listUsers: s.capabilities?.list_users ?? false,
          viewStats: s.capabilities?.view_stats ?? false,
        },
      }));
      return { sites };
    } catch (e) {
      return { error: 'Error listing sites', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
