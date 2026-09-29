// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotGetAccountInfo = tool({
  description:
    'Gets current HubSpot account info (email, hubId, user details) using access-token lookup.',
  inputSchema: z.object({
    hubspotToken: tokenField,
  }),
  execute: async ({ hubspotToken }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/account-info/v3/details`);
  },
});

export const hubspotListAuditLogs = tool({
  description:
    'Lists Enterprise-only HubSpot account audit logs with optional filters and pagination.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    sort: z
      .array(z.string())
      .optional()
      .describe('HubSpot sort expressions, sent as repeated `sort` query parameters.'),
    after: z
      .string()
      .optional()
      .describe("Paging cursor from a previous response's `paging.next.after` field."),
    limit: z
      .number()
      .int()
      .optional()
      .describe('Maximum number of audit log entries to return per page.'),
    actingUserId: z
      .array(z.string())
      .optional()
      .describe(
        'User IDs whose actions should be returned. Each ID is sent as a repeated `actingUserId` query parameter.',
      ),
    occurredAfter: z
      .string()
      .optional()
      .describe('Return actions that occurred after this RFC3339 timestamp.'),
    occurredBefore: z
      .string()
      .optional()
      .describe('Return actions that occurred before this RFC3339 timestamp.'),
    fillFinalTimestamp: z
      .boolean()
      .optional()
      .describe(
        "Value for HubSpot's `fillFinalTimestamp` query parameter. HubSpot does not document its behavior.",
      ),
  }),
  execute: async ({
    hubspotToken,
    sort,
    after,
    limit,
    actingUserId,
    occurredAfter,
    occurredBefore,
    fillFinalTimestamp,
  }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/audit-logs/v1/events`, {
      query: pickDefined({
        sort: sort,
        after: after,
        limit: limit,
        actingUserId: actingUserId,
        occurredAfter: occurredAfter,
        occurredBefore: occurredBefore,
        fillFinalTimestamp: fillFinalTimestamp,
      }),
    });
  },
});

export const hubspotListGrantedScopes = tool({
  description:
    'Tool to introspect the current OAuth access token and return its granted scopes and metadata. Use when you need to check which permissions are available before calling an endpoint (e.g., workflows, automation) to proactively detect missing scopes and provide clear remediation guidance. Introspects the current OAuth token. The token value is redacted unless include_token is true.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    includeToken: z
      .boolean()
      .optional()
      .describe(
        'Whether to include the full access token in the response. Default is false to avoid exposing sensitive token values in logs.',
      ),
  }),
  execute: async ({ hubspotToken, includeToken }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    const data = await hubGet(
      hubspotToken,
      `/oauth/v1/access-tokens/${encodeURIComponent(hubspotToken)}`,
    );
    if (includeToken !== true && data && typeof data === 'object' && 'token' in data) {
      const { token, ...rest } = data;
      return rest;
    }
    return data;
  },
});

export const hubspotWhoAmI = tool({
  description:
    'Return the connected HubSpot account (portal id, domain). HubSpot identity is account-level, not per-user. HubSpot identity is account-level (portal id and domain), not per-user.',
  inputSchema: z.object({
    hubspotToken: tokenField,
  }),
  execute: async ({ hubspotToken }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/oauth/v1/access-tokens/${encodeURIComponent(hubspotToken)}`);
  },
});
