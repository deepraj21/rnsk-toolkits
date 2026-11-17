// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { posthogRequest } from './client.js';

export const posthogListEventDefinitions = tool({
  description:
    'Lists the event taxonomy of a project — event names with descriptions, tags, verification, last-seen time, and property lists. Use it to discover which events exist before building queries, insights, or cohorts. Needs event_definition:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    search: z
      .string()
      .optional()
      .describe('Case-insensitive event name search (every term must match)'),
    names: z
      .array(z.string())
      .optional()
      .describe('Exact event names to return, e.g. ["user sign up"]'),
    eventType: z
      .enum(['event', 'event_custom', 'event_posthog'])
      .optional()
      .describe('event_custom = no $ prefix, event_posthog = PostHog internal $ events'),
    excludeStale: z
      .boolean()
      .optional()
      .describe('Omit events not seen in the last 30 days (never-ingested events are kept)'),
    excludeHidden: z.boolean().optional().describe('Omit events hidden by a team admin'),
    verified: z
      .boolean()
      .optional()
      .describe('Only verified (true) or only unverified (false) events'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Only events carrying any of these tags (JSON-encoded)'),
    fuzzySearch: z
      .boolean()
      .optional()
      .describe('Fall back to similar event names when the exact search finds nothing'),
    ordering: z
      .string()
      .optional()
      .describe(
        'Sort key, e.g. "-last_seen_at" (default), "name", "created_at"; prefix - for descending',
      ),
    limit: z.number().int().min(1).optional().describe('Max definitions per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    search,
    names,
    eventType,
    excludeStale,
    excludeHidden,
    verified,
    tags,
    fuzzySearch,
    ordering,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/event_definitions/`,
      {
        query: {
          search,
          names,
          event_type: eventType,
          exclude_stale: excludeStale,
          exclude_hidden: excludeHidden,
          verified,
          tags: tags ? JSON.stringify(tags) : undefined,
          fuzzy_search: fuzzySearch,
          ordering,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});

export const posthogListPropertyDefinitions = tool({
  description:
    'Lists the property taxonomy of a project — property names, types (String, Numeric, Boolean, DateTime), tags, and verification, scoped to event/person/group/session properties or to specific events. Use it to find valid property keys for filters and queries. Needs property_definition:read.',
  inputSchema: z.object({
    posthogCredentials: z
      .string()
      .optional()
      .describe('PostHog credentials JSON with baseUrl and apiToken (injected by system)'),
    projectId: z.coerce.number().int().describe('Project ID (from posthogListProjects)'),
    type: z
      .enum(['event', 'person', 'group', 'session'])
      .optional()
      .describe('Which property family to list (default event)'),
    search: z.string().optional().describe('Search properties by name'),
    eventNames: z
      .array(z.string())
      .optional()
      .describe(
        'Restrict to properties seen on these events (JSON-encoded), e.g. ["user sign up"]',
      ),
    properties: z.array(z.string()).optional().describe('Only these exact property names'),
    groupTypeIndex: z.coerce.number().int().optional().describe('Group type index when type=group'),
    isFeatureFlag: z
      .boolean()
      .optional()
      .describe('Only (true) or exclude (false) $feature/* flag properties'),
    isNumerical: z
      .boolean()
      .optional()
      .describe('Only (true) or exclude (false) numerical properties'),
    verified: z
      .boolean()
      .optional()
      .describe('Only verified (true) or unverified (false) properties'),
    excludeCore: z
      .boolean()
      .optional()
      .describe('Exclude PostHog core properties ($set, $browser, ...)'),
    excludeHidden: z.boolean().optional().describe('Exclude properties marked hidden'),
    limit: z.number().int().min(1).optional().describe('Max definitions per page'),
    offset: z.number().int().min(0).optional().describe('Rows to skip for pagination'),
  }),
  execute: async ({
    posthogCredentials,
    projectId,
    type,
    search,
    eventNames,
    properties,
    groupTypeIndex,
    isFeatureFlag,
    isNumerical,
    verified,
    excludeCore,
    excludeHidden,
    limit,
    offset,
  }) => {
    if (!projectId) return { error: 'projectId is required.' };

    const result = await posthogRequest(
      posthogCredentials,
      `/api/projects/${projectId}/property_definitions/`,
      {
        query: {
          type,
          search,
          event_names: eventNames ? JSON.stringify(eventNames) : undefined,
          properties,
          group_type_index: groupTypeIndex,
          is_feature_flag: isFeatureFlag,
          is_numerical: isNumerical,
          verified,
          exclude_core_properties: excludeCore,
          exclude_hidden: excludeHidden,
          limit,
          offset,
        },
      },
    );
    if (result.error) return result;

    return result.data ?? {};
  },
});
