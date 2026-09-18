// @ts-nocheck
import { addSite } from './add-site.js';
import { deleteSite } from './delete-site.js';
import { getSite } from './get-site.js';
import { getSitemap } from './get-sitemap.js';
import { inspectUrl } from './inspect-url.js';
import { listSitemaps } from './list-sitemaps.js';
import { listSites } from './list-sites.js';
import { searchAnalyticsQuery } from './search-analytics-query.js';
import { submitSitemap } from './submit-sitemap.js';

export {
    addSite,
    deleteSite,
    getSite,
    getSitemap,
    inspectUrl,
    listSitemaps,
    listSites,
    searchAnalyticsQuery,
    submitSitemap,
};

export const googleSearchConsoleTools = [
    {
        name: 'googleSearchConsoleAddSite',
        description:
            'Adds a site to the set of the user\'s sites in Google Search Console. This action registers a new property (site) in Google Search Console for the authenticated user. After adding the site, you will need to verify own...',
        tool: addSite,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleSearchConsoleDeleteSite',
        description:
            'Removes a site from the user\'s Google Search Console sites. This action permanently removes a site property from the authenticated user\'s Search Console account. The site URL must be URL-encoded. Use this when you n...',
        tool: deleteSite,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleSearchConsoleGetSite',
        description:
            'Retrieves information about a specific Search Console site. Use when you need to get site details including permission level for a specific property.',
        tool: getSite,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleGetSitemap',
        description:
            'Retrieves sitemap metadata (submitted/indexed counts, errors, warnings, last-submission timestamps) for a specific sitemap in Search Console. Returns metadata only, not raw XML content. Note: numeric fields like `erro...',
        tool: getSitemap,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleInspectUrl',
        description:
            'Inspects a URL for indexing issues and status in Google Search Console. Results may reflect cached data lagging real changes by several days. High-volume use can trigger 429 quota errors; limit to priority URLs.',
        tool: inspectUrl,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleListSitemaps',
        description:
            'Lists all sitemaps for a site in Google Search Console. Response fields `errors`, `warnings`, `contents.submitted`, and `contents.indexed` may be returned as strings; cast to integers before numeric operations. Evalua...',
        tool: listSitemaps,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleListSites',
        description:
            'Lists all verified sites (properties) owned by the authenticated user in Google Search Console. Response contains a siteEntry array — always iterate it, never assume a single object. Each entry includes permissionLeve...',
        tool: listSites,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleSearchAnalyticsQuery',
        description:
            'Queries Google Search Console for search analytics data including clicks, impressions, CTR, and position metrics. Only returns URLs with at least one impression; missing rows do not confirm non-indexing. Position is a...',
        tool: searchAnalyticsQuery,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleSearchConsoleSubmitSitemap',
        description:
            'Submits a sitemap to Google Search Console for indexing. This action registers or resubmits a sitemap for a verified property in Google Search Console. The sitemap file must be accessible at the specified URL and prop...',
        tool: submitSitemap,
        requiredAuth: 'googleSearchConsoleToken' as const,
        scope: 'write' as const,
    },
];
