// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { wpFetch } from './utils.js';

export const wordpressGetSiteOverview = tool({
  description: 'Get concise identity, plan, capabilities, editable settings, and traffic summary for one authorized site. Settings or stats that are unavailable by capability are reported as unavailable without hiding valid site details.',
  inputSchema: z.object({
    wordpressToken: z.string().describe('WordPress.com OAuth access token.'),
    siteId: z.number().describe('Numeric site ID returned by WORDPRESS_COM_LIST_SITES.'),
    statsPeriod: z.enum(['day', 'week', 'month', 'year']).optional().describe('Period for the traffic summary.'),
    statsPeriods: z.number().min(1).max(90).optional().describe('Number of periods to aggregate in the traffic summary.'),
  }),
  execute: async ({ wordpressToken, siteId, statsPeriod = 'day', statsPeriods = 1 }) => {
    if (!wordpressToken) return { error: 'WordPress token is required. Connect WordPress.com first.' };
    try {
      const warnings: string[] = [];
      // Site identity + settings
      const siteRes = await wpFetch(`/rest/v1.1/sites/${siteId}`, {
        wordpressToken,
        method: 'GET',
      });
      if (!siteRes.ok) return { error: 'Failed to get site overview', details: siteRes.data };
      const siteData = siteRes.data;

      // Stats (capability-gated)
      let stats: any = null;
      const statsRes = await wpFetch(`/rest/v1.1/sites/${siteId}/stats`, {
        wordpressToken,
        method: 'GET',
        query: { period: statsPeriod, num: statsPeriods },
      });
      if (statsRes.ok) {
        const s = statsRes.data;
        // Try to normalize to SiteStats shape
        stats = {
          period: statsPeriod,
          date: s.date ?? s.endDate ?? new Date().toISOString(),
          views: s.views ?? s.stats?.views ?? 0,
          visitors: s.visitors ?? s.stats?.visitors ?? 0,
          likes: s.likes ?? 0,
          comments: s.comments ?? 0,
          reblogs: s.reblogs ?? 0,
          followers: s.followers ?? 0,
        };
      } else {
        warnings.push(`Stats unavailable: ${statsRes.data?.message ?? statsRes.data?.error ?? 'no capability'}`);
      }

      // Settings are part of siteData.options
      const opts = siteData.options ?? {};
      const settings = {
        title: siteData.name ?? opts.blogname,
        description: siteData.description ?? opts.blogdescription,
        language: siteData.lang ?? opts.lang,
        timezone: opts.timezone,
        dateFormat: opts.date_format,
        timeFormat: opts.time_format,
        startOfWeek: opts.start_of_week,
        postsPerPage: opts.posts_per_page,
        defaultCategory: opts.default_category,
        defaultPostFormat: opts.default_post_format,
        showOnFront: opts.show_on_front,
        pageOnFront: opts.page_on_front,
        pageForPosts: opts.page_for_posts,
      };

      return {
        site: {
          siteId: siteData.ID ?? siteData.site_id ?? siteId,
          name: siteData.name,
          url: siteData.URL ?? siteData.url,
          description: siteData.description,
          language: siteData.lang,
          isPrivate: siteData.is_private ?? false,
          isAtomic: siteData.is_wpcom_atomic ?? siteData.is_atomic ?? false,
          isComingSoon: siteData.is_coming_soon ?? false,
          jetpack: siteData.jetpack ?? false,
          plan: siteData.plan ?? siteData.products?.[0],
          capabilities: siteData.capabilities ?? siteData.user_can_manage ? { manage_options: siteData.capabilities?.manage_options } : undefined,
        },
        settings,
        stats,
        warnings,
      };
    } catch (e) {
      return { error: 'Error getting site overview', message: e instanceof Error ? e.message : 'Unknown error' };
    }
  },
});
