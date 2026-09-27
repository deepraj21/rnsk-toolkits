// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe('Injected Pinterest OAuth access token — match manifest tokenField');
const dateField = z.string().describe('UTC date YYYY-MM-DD');

export const getAccountAnalytics = tool({
  description:
    'Get aggregate account analytics over a UTC date range (max 90 days, starting at most 90 days ago), with metric, content, platform, and split filters.',
  inputSchema: z.object({
    pinterestToken: tokenField,
    startDate: dateField,
    endDate: dateField,
    metricTypes: z
      .array(z.string())
      .optional()
      .describe(
        'Metrics, e.g. ["IMPRESSION","SAVE"]. Sent comma-separated. Omit for defaults. Options: ENGAGEMENT, ENGAGEMENT_RATE, IMPRESSION, OUTBOUND_CLICK, OUTBOUND_CLICK_RATE, PIN_CLICK, PIN_CLICK_RATE, SAVE, SAVE_RATE.',
      ),
    contentType: z
      .enum(['ALL', 'PAID', 'ORGANIC'])
      .optional()
      .describe('Content filter (default ALL)'),
    pinFormat: z
      .enum([
        'ALL',
        'ORGANIC_IMAGE',
        'ORGANIC_PRODUCT',
        'ORGANIC_VIDEO',
        'ADS_STANDARD',
        'ADS_PRODUCT',
        'ADS_VIDEO',
        'ADS_IDEA',
      ])
      .optional()
      .describe('Pin format filter (default ALL)'),
    appType: z
      .enum(['ALL', 'MOBILE', 'TABLET', 'WEB'])
      .optional()
      .describe('Device filter (default ALL)'),
    source: z
      .enum(['ALL', 'YOUR_PINS', 'OTHER_PINS'])
      .optional()
      .describe('Activity source (default ALL)'),
    claimedContent: z
      .enum(['OTHER', 'CLAIMED', 'BOTH'])
      .optional()
      .describe('Claimed-domain filter (default BOTH)'),
    splitField: z
      .enum(['NO_SPLIT', 'APP_TYPE', 'OWNED_CONTENT', 'SOURCE', 'PIN_FORMAT'])
      .optional()
      .describe('Group results; NO_SPLIT returns one aggregate bucket'),
  }),
  execute: async ({
    pinterestToken,
    startDate,
    endDate,
    metricTypes,
    contentType,
    pinFormat,
    appType,
    source,
    claimedContent,
    splitField,
  }) => {
    try {
      const result = await pinterestRequest(pinterestToken, '/user_account/analytics', {
        query: {
          start_date: startDate,
          end_date: endDate,
          metric_types: metricTypes?.join(','),
          content_type: contentType,
          pin_format: pinFormat,
          app_types: appType,
          source,
          from_claimed_content: claimedContent,
          split_field: splitField,
        },
      });
      if (!result.ok) return failedResult('Failed to get Pinterest account analytics', result);
      return result.data;
    } catch (error) {
      return toPinterestError(error, 'Error getting Pinterest account analytics');
    }
  },
});

export const getTopPins = tool({
  description:
    'Get top regular or video Pins ranked by an analytics metric, with per-Pin metric values and date availability.',
  inputSchema: z.object({
    pinterestToken: tokenField,
    startDate: dateField,
    endDate: dateField,
    sortBy: z
      .string()
      .describe(
        'Ranking metric. all: ENGAGEMENT, ENGAGEMENT_RATE, IMPRESSION, OUTBOUND_CLICK, OUTBOUND_CLICK_RATE, PIN_CLICK, PIN_CLICK_RATE, SAVE, SAVE_RATE. video: IMPRESSION, SAVE, OUTBOUND_CLICK, VIDEO_MRC_VIEW, VIDEO_AVG_WATCH_TIME, VIDEO_V50_WATCH_TIME, QUARTILE_95_PERCENT_VIEW, VIDEO_10S_VIEW, VIDEO_START.',
      ),
    pinKind: z
      .enum(['all', 'video'])
      .optional()
      .describe('Ranking route: all or video (default all)'),
    numPins: z
      .number()
      .int()
      .min(1)
      .max(50)
      .optional()
      .describe('Pins to return, 1-50 (default 10)'),
    metricTypes: z
      .array(z.string())
      .optional()
      .describe('Extra per-Pin metrics. Sent comma-separated.'),
    contentType: z
      .enum(['ALL', 'PAID', 'ORGANIC'])
      .optional()
      .describe('Content filter (default ALL)'),
    claimedContent: z
      .enum(['OTHER', 'CLAIMED', 'BOTH'])
      .optional()
      .describe('Claimed-domain filter (default BOTH)'),
    createdInLast30Days: z
      .boolean()
      .optional()
      .describe('Restrict to Pins created in the last 30 days'),
  }),
  execute: async ({
    pinterestToken,
    startDate,
    endDate,
    sortBy,
    pinKind,
    numPins,
    metricTypes,
    contentType,
    claimedContent,
    createdInLast30Days,
  }) => {
    try {
      const route = pinKind === 'video' ? 'top_video_pins' : 'top_pins';
      const result = await pinterestRequest(pinterestToken, `/user_account/analytics/${route}`, {
        query: {
          start_date: startDate,
          end_date: endDate,
          sort_by: sortBy,
          num_of_pins: numPins,
          metric_types: metricTypes?.join(','),
          content_type: contentType,
          from_claimed_content: claimedContent,
          created_in_last_n_days: createdInLast30Days ? 30 : undefined,
        },
      });
      if (!result.ok) return failedResult('Failed to get Pinterest top Pins', result);
      return result.data;
    } catch (error) {
      return toPinterestError(error, 'Error getting Pinterest top Pins');
    }
  },
});
