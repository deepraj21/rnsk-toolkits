// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { linkedInRequest, missingToken, toLinkedInError } from './client.js';

const authField = {
  linkedinToken: z.string().optional().describe('Injected by system; do not provide'),
};

export const linkedinGetAdTargetingFacets = tool({
  description:
    'List available LinkedIn ad targeting facets (locations, industries, titles, seniorities, ...). Call first to discover valid facet URNs for audience planning and entity search.',
  inputSchema: z.object({
    ...authField,
  }),
  execute: async ({ linkedinToken }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/adTargetingFacets');
    } catch (error) {
      return toLinkedInError(error, 'Failed to get ad targeting facets');
    }
  },
});

export const linkedinGetAudienceCounts = tool({
  description:
    'Estimate audience reach for targeting criteria (ad campaign sizing or targeted content planning). Pass targeting criteria using facet URNs.',
  inputSchema: z.object({
    ...authField,
    targetingCriteria: z
      .string()
      .describe(
        "Targeting criteria, e.g. '(include:(and:List((or:(urn:li:adTargetingFacet:locations:List(urn:li:geo:103644278))))))'. Colons inside URNs may be %3A-encoded",
      ),
  }),
  execute: async ({ linkedinToken, targetingCriteria }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/audienceCounts', {
        query: { q: 'targetingCriteriaV2', targetingCriteria },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to get audience counts');
    }
  },
});

export const linkedinSearchAdTargetingEntities = tool({
  description:
    'Typeahead search for ad targeting entities: locations, job titles, industries, and more. Use to resolve names like "united states" into targeting URNs for audience criteria.',
  inputSchema: z.object({
    ...authField,
    query: z
      .string()
      .describe("Search text, e.g. 'united states', 'software engineer', 'technology'"),
    facet: z
      .string()
      .describe(
        "Facet URN scoping the search, e.g. 'urn:li:adTargetingFacet:locations', 'urn:li:adTargetingFacet:titles', 'urn:li:adTargetingFacet:industries'",
      ),
    count: z.number().int().min(1).max(100).optional().describe('Max results per page'),
    start: z.number().int().min(0).optional().describe('Pagination offset'),
    queryVersion: z
      .enum(['QUERY_USES_URNS'])
      .optional()
      .describe("Use 'QUERY_USES_URNS' for URN-based results"),
  }),
  execute: async ({ linkedinToken, query, facet, count, start, queryVersion }) => {
    try {
      if (!linkedinToken) return missingToken();
      return await linkedInRequest(linkedinToken, '/rest/adTargetingEntities', {
        query: {
          q: 'typeahead',
          query,
          facet,
          ...(count !== undefined ? { count } : {}),
          ...(start !== undefined ? { start } : {}),
          queryVersion: queryVersion ?? 'QUERY_USES_URNS',
        },
      });
    } catch (error) {
      return toLinkedInError(error, 'Failed to search ad targeting entities');
    }
  },
});
