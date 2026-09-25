// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';

/**
 * Send a raw error event to Sentry through a project's DSN.
 * Uses the legacy store endpoint derived from the DSN (no API token needed).
 */
export const sentryIngestEventViaDsn = tool({
  description:
    'Ingest a raw error event into Sentry via a project DSN without an API token. Use to report test or synthetic errors directly to a project.',
  inputSchema: z.object({
    dsn: z.string().describe('Sentry DSN, e.g. https://<key>@o123.ingest.sentry.io/456.'),
    message: z.string().optional().describe('Error message.'),
    level: z.enum(['fatal', 'error', 'warning', 'info', 'debug']).optional().describe('Severity level.'),
    logger: z.string().optional().describe('Logger name.'),
    release: z.string().optional().describe('Release version.'),
    environment: z.string().optional().describe('Environment name.'),
    platform: z.string().optional().describe('Platform, e.g. javascript, python.'),
    eventId: z.string().optional().describe('Custom event id (hex, 32 chars).'),
    exceptionType: z.string().optional().describe('Exception class name.'),
    exceptionValue: z.string().optional().describe('Exception message.'),
    fingerprint: z.array(z.string()).optional().describe('Custom grouping fingerprint.'),
    tags: z.record(z.any()).optional().describe('Event tags.'),
    extra: z.record(z.any()).optional().describe('Extra event data.'),
    userId: z.string().optional().describe('Affected user id.'),
    userEmail: z.string().optional().describe('Affected user email.'),
    userUsername: z.string().optional().describe('Affected username.'),
    userIpAddress: z.string().optional().describe('Affected user IP.'),
  }),
  execute: async ({
    dsn,
    message,
    level,
    logger,
    release,
    environment,
    platform,
    eventId,
    exceptionType,
    exceptionValue,
    fingerprint,
    tags,
    extra,
    userId,
    userEmail,
    userUsername,
    userIpAddress,
  }) => {
    try {
      const match = dsn.match(/^(https?):\/\/([^@/:]+)@([^/]+)\/(\d+)\/?$/);
      if (!match) return { error: 'Invalid DSN format. Expected https://<key>@<host>/<projectId>.' };
      const [, protocol, key, host, projectId] = match;
      const payload: Record<string, unknown> = {
        event_id: eventId ?? Math.random().toString(16).slice(2).padEnd(32, '0').slice(0, 32),
        timestamp: Date.now() / 1000,
        message,
        level: level ?? 'error',
        logger,
        release,
        environment,
        platform: platform ?? 'other',
        fingerprint,
        tags,
        extra,
      };
      if (exceptionType || exceptionValue) {
        payload.exception = { values: [{ type: exceptionType ?? 'Error', value: exceptionValue ?? message ?? '' }] };
      }
      const user: Record<string, unknown> = { id: userId, email: userEmail, username: userUsername, ip_address: userIpAddress };
      if (Object.values(user).some((v) => v !== undefined)) payload.user = user;
      const auth =
        `Sentry sentry_version=7, sentry_key=${key}, ` +
        `sentry_client=rnsk-toolkits/0.0.12`;
      const response = await fetch(`${protocol}://${host}/api/${projectId}/store/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Sentry-Auth': auth },
        body: JSON.stringify(payload),
      });
      const text = await response.text();
      if (!response.ok) {
        return { error: `Sentry ingest error ${response.status}`, details: text };
      }
      return { ingested: true, eventId: payload.event_id, response: text };
    } catch (error) {
      return {
        error: 'Error ingesting Sentry event',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
