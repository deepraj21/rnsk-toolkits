// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');

export const xCreateActivitySubscription = tool({
  description:
    'Create an X activity subscription to monitor events like profile updates, follows, likes, spaces, news, or chat. OAuth tokens need the scope matching the event type (e.g. follows.read for follow events, tweet.read for profile events).',
  inputSchema: z.object({
    xToken: tokenField,
    eventType: z
      .string()
      .describe(
        'Event type, e.g. profile.update.bio, follow.follow, follow.unfollow, spaces.create, news.new',
      ),
    filter: z
      .object({
        keyword: z.string().optional().describe('Keyword to filter on'),
        userId: z.string().optional().describe('User ID to filter on'),
      })
      .describe('Filter criteria; include at least one of userId or keyword'),
    tag: z.string().optional().describe('Label for this subscription (1-200 chars)'),
    webhookId: z.string().optional().describe('Webhook ID to deliver events to'),
  }),
  execute: async ({ xToken, eventType, filter, tag, webhookId }) => {
    try {
      const result = await xRequest(xToken, '/activity/subscriptions', {
        method: 'POST',
        body: {
          event_type: eventType,
          filter: {
            ...(filter?.keyword ? { keyword: filter.keyword } : {}),
            ...(filter?.userId ? { user_id: filter.userId } : {}),
          },
          ...(tag ? { tag } : {}),
          ...(webhookId ? { webhook_id: webhookId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create activity subscription', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error creating activity subscription');
    }
  },
});

export const xGetOpenApiSpec = tool({
  description:
    'Fetch the official X API v2 OpenAPI specification. Returns a summary of paths and operations; pass includePaths to list every path, or a pathPrefix to filter.',
  inputSchema: z.object({
    pathPrefix: z
      .string()
      .optional()
      .describe("Filter paths by prefix, e.g. '/2/tweets' or '/2/users'"),
    includePaths: z
      .boolean()
      .optional()
      .describe('Include the full sorted path list (default false)'),
  }),
  execute: async ({ pathPrefix, includePaths }) => {
    try {
      const response = await fetch('https://api.x.com/2/openapi.json', {
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        return {
          error: 'Failed to fetch the X OpenAPI specification',
          statusCode: response.status,
        };
      }
      const spec = (await response.json().catch(() => null)) as any;
      if (!spec || typeof spec !== 'object')
        return { error: 'Failed to parse the X OpenAPI specification' };
      const allPaths = Object.keys(spec.paths ?? {});
      const paths = pathPrefix ? allPaths.filter((p) => p.startsWith(pathPrefix)) : allPaths;
      const operations = paths.flatMap((p) =>
        Object.entries(spec.paths[p] ?? {})
          .filter(([, op]) => op && typeof op === 'object' && 'operationId' in (op as object))
          .map(([method, op]: [string, any]) => ({
            method: method.toUpperCase(),
            path: p,
            operationId: op.operationId,
          })),
      );
      return {
        title: spec.info?.title,
        version: spec.info?.version,
        pathCount: paths.length,
        ...(includePaths ? { paths: paths.sort() } : { operations }),
      };
    } catch (error) {
      return toXError(error, 'Error fetching the X OpenAPI specification');
    }
  },
});
