// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, normalizeUrn, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

export const linkedinGetCompanyInfo = tool({
  description:
    'List organizations where you hold a role (admin, content poster). Use to discover organization URNs and confirm posting rights before publishing as a company page.',
  inputSchema: z.object({
    ...authField,
    role: z
      .enum(['ADMINISTRATOR', 'DIRECT_SPONSORED_CONTENT_POSTER'])
      .optional()
      .describe('Filter to a specific role'),
    state: z.enum(['APPROVED', 'REQUESTED']).optional().describe('Filter by role approval state'),
    count: z.number().int().min(1).max(100).optional().describe('Results per page (max 100)'),
    start: z.number().int().min(0).optional().describe('Pagination offset'),
  }),
  execute: async ({ linkedinToken, role, state, count, start }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/organizationAcls', {
        query: {
          q: 'roleAssignee',
          ...(role !== undefined ? { role } : {}),
          ...(state !== undefined ? { state } : {}),
          ...(count !== undefined ? { count } : {}),
          ...(start !== undefined ? { start } : {}),
          projection: '(elements*(organization~:(localizedName,vanityName,logoV2)))',
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get company info');
    }
  },
});

export const linkedinGetNetworkSize = tool({
  description:
    'Get the follower count of a LinkedIn organization page. Use for company page reach snapshots.',
  inputSchema: z.object({
    ...authField,
    organizationId: z
      .string()
      .describe(
        "Numeric org ID (e.g. '3803' from 'urn:li:organization:3803') or a full organization URN",
      ),
    edgeType: z
      .enum(['COMPANY_FOLLOWED_BY_MEMBER'])
      .optional()
      .describe("Relationship counted (default 'COMPANY_FOLLOWED_BY_MEMBER' = followers)"),
  }),
  execute: async ({ linkedinToken, organizationId, edgeType }) => {
    try {
      if (!linkedinToken) return missingToken();
      const urn = normalizeUrn(organizationId, 'organization');
      return await linkedInRequest(linkedinToken, `/rest/networkSizes/${encodeURIComponent(urn)}`, {
        query: { edgeType: edgeType ?? 'COMPANY_FOLLOWED_BY_MEMBER' },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get network size');
    }
  },
});

export const linkedinGetOrgPageStats = tool({
  description:
    'Get organization page statistics: lifetime totals segmented by demographics, or time-bound aggregates (page views, button clicks) for a date range. Requires page admin role.',
  inputSchema: z.object({
    ...authField,
    organization: z.string().describe("Organization URN, e.g. 'urn:li:organization:2414183'"),
    timeRangeStart: z
      .number()
      .int()
      .optional()
      .describe(
        'Range start in ms since epoch (exclusive). Omit both timestamps for lifetime statistics',
      ),
    timeRangeEnd: z.number().int().optional().describe('Range end in ms since epoch (inclusive)'),
    timeGranularityType: z
      .enum(['DAY', 'MONTH'])
      .optional()
      .describe('DAY or MONTH granularity (required with a time range)'),
  }),
  execute: async ({
    linkedinToken,
    organization,
    timeRangeStart,
    timeRangeEnd,
    timeGranularityType,
  }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/organizationPageStatistics', {
        query: {
          q: 'organization',
          organization,
          ...(timeRangeStart !== undefined ? { 'timeRange.start': timeRangeStart } : {}),
          ...(timeRangeEnd !== undefined ? { 'timeRange.end': timeRangeEnd } : {}),
          ...(timeGranularityType !== undefined ? { timeGranularityType } : {}),
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get organization page statistics');
    }
  },
});

export const linkedinGetShareStats = tool({
  description:
    'Get content performance for an organization page: impressions, clicks, likes, comments, shares. Lifetime by default; add a time range for daily/monthly breakdowns.',
  inputSchema: z.object({
    ...authField,
    organizationalEntity: z
      .string()
      .describe("Organization URN, e.g. 'urn:li:organization:2414183'"),
    timeRangeStart: z
      .number()
      .int()
      .optional()
      .describe('Range start in ms since epoch. Omit for lifetime statistics'),
    timeRangeEnd: z.number().int().optional().describe('Range end in ms since epoch'),
    timeGranularityType: z
      .enum(['DAY', 'MONTH'])
      .optional()
      .describe('DAY or MONTH granularity (required with a time range)'),
  }),
  execute: async ({
    linkedinToken,
    organizationalEntity,
    timeRangeStart,
    timeRangeEnd,
    timeGranularityType,
  }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/organizationalEntityShareStatistics', {
        query: {
          q: 'organizationalEntity',
          organizationalEntity,
          ...(timeGranularityType !== undefined
            ? { 'timeIntervals.timeGranularityType': timeGranularityType }
            : {}),
          ...(timeRangeStart !== undefined
            ? { 'timeIntervals.timeRange.start': timeRangeStart }
            : {}),
          ...(timeRangeEnd !== undefined ? { 'timeIntervals.timeRange.end': timeRangeEnd } : {}),
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get share statistics');
    }
  },
});
