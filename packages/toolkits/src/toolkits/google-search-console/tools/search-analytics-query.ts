// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { encodeSiteUrl, webmastersRequest } from './utils.js';

export const searchAnalyticsQuery = tool({
  description:
    'Query Google Search Console search analytics data for a site over a date range with optional dimensions and filters.',
  inputSchema: z.object({
    googleSearchConsoleToken: z.string().describe('The Google Search Console access token'),
    site_url: z.string().describe('The site URL including protocol or domain property'),
    start_date: z.string().describe('Start date in YYYY-MM-DD format'),
    end_date: z.string().describe('End date in YYYY-MM-DD format'),
    dimensions: z
      .array(z.string())
      .optional()
      .describe('Dimensions to group by (e.g. query, page, country, device, date)'),
    search_type: z
      .enum(['web', 'image', 'video', 'news', 'discover', 'googleNews'])
      .optional()
      .describe('Search type filter'),
    aggregation_type: z
      .enum(['auto', 'byPage', 'byProperty'])
      .optional()
      .describe('How data is aggregated'),
    row_limit: z.number().min(1).max(25000).optional().describe('Maximum rows to return (1-25000)'),
    start_row: z.number().min(0).optional().describe('First row for pagination'),
    data_state: z.enum(['final', 'all']).optional().describe('Data state to return'),
    dimension_filter_groups: z
      .array(z.record(z.unknown()))
      .optional()
      .describe('Optional dimension filter groups'),
  }),
  execute: async ({
    googleSearchConsoleToken,
    site_url,
    start_date,
    end_date,
    dimensions,
    search_type,
    aggregation_type,
    row_limit,
    start_row,
    data_state,
    dimension_filter_groups,
  }) => {
    try {
      const body: Record<string, unknown> = {
        startDate: start_date,
        endDate: end_date,
      };

      if (dimensions) body.dimensions = dimensions;
      if (search_type) body.type = search_type;
      if (aggregation_type) body.aggregationType = aggregation_type;
      if (row_limit !== undefined) body.rowLimit = row_limit;
      if (start_row !== undefined) body.startRow = start_row;
      if (data_state) body.dataState = data_state;
      if (dimension_filter_groups) body.dimensionFilterGroups = dimension_filter_groups;

      const result = await webmastersRequest(
        googleSearchConsoleToken,
        `/sites/${encodeSiteUrl(site_url)}/searchAnalytics/query`,
        {
          method: 'POST',
          body,
        },
      );

      if (!result.ok) {
        return {
          error: 'Failed to query search analytics',
          details: result.data,
          statusCode: result.status,
        };
      }

      return result.data;
    } catch (error) {
      return {
        error: 'Error querying search analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
