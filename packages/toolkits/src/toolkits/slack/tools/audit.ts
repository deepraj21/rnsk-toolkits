// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, slackGet, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackReadAuditLogs = tool({
    description:
        'Read Enterprise Grid audit logs (logins, admin changes, app installs, channel changes) with filters and pagination. Requires an owner/admin user token with auditlogs:read.',
    inputSchema: z.object({
        slackToken: tokenField,
        action: z.string().optional().describe("Comma-separated actions (max 30), e.g. 'user_login,channel_created'"),
        actor: z.string().optional().describe('Filter to actions by this user ID'),
        entity: z.string().optional().describe('Filter to actions affecting this entity ID'),
        oldest: z.number().optional().describe('Oldest entry Unix timestamp (inclusive)'),
        latest: z.number().optional().describe('Latest entry Unix timestamp (inclusive)'),
        limit: z.number().max(9999).optional().describe('Max entries to return (max 9999)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackGet(slackToken, 'https://api.slack.com/audit/v1/logs', rest);
        } catch (error) {
            return toSlackError(error, 'Failed to read audit logs');
        }
    },
});

export const slackGetAuditActions = tool({
    description:
        'List action types available in the Audit Logs API by category. Use to build action filters for slackReadAuditLogs.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackGet(slackToken, 'https://api.slack.com/audit/v1/actions');
        } catch (error) {
            return toSlackError(error, 'Failed to get audit actions');
        }
    },
});

export const slackGetAuditSchemas = tool({
    description:
        'List object schemas returned by the Audit Logs API (workspaces, users, channels, etc.).',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackGet(slackToken, 'https://api.slack.com/audit/v1/schemas');
        } catch (error) {
            return toSlackError(error, 'Failed to get audit schemas');
        }
    },
});

export const slackGetScimConfig = tool({
    description:
        "Get the SCIM service provider configuration (auth schemes, filtering, sorting, bulk support). No parameters. Needs a token with admin scope; SCIM-provisioned tokens may be required.",
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackGet(slackToken, 'https://api.slack.com/scim/v1/ServiceProviderConfig');
        } catch (error) {
            return toSlackError(error, 'Failed to get SCIM config');
        }
    },
});
