// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackListApprovedApps = tool({
    description:
        'List apps approved for installation on an org or workspace (Enterprise Grid / Business+ admin). Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID (required with org-level tokens)'),
        enterpriseId: z.string().optional().describe('Enterprise Grid org ID'),
        certified: z.boolean().optional().describe('True for certified apps only, false to exclude them'),
        limit: z.number().min(1).max(1000).optional().describe('Apps per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, enterpriseId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.apps.approved.list', {
                ...rest,
                team_id: teamId,
                enterprise_id: enterpriseId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list approved apps');
        }
    },
});

export const slackListAppRequests = tool({
    description:
        'List pending app installation requests (who requested what). Requires admin.apps:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID'),
        enterpriseId: z.string().optional().describe('Enterprise Grid org ID'),
        certified: z.boolean().optional().describe('True for certified apps only, false to exclude them'),
        limit: z.number().min(1).max(1000).optional().describe('Requests per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, enterpriseId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.apps.requests.list', {
                ...rest,
                team_id: teamId,
                enterprise_id: enterpriseId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list app requests');
        }
    },
});

export const slackListRestrictedApps = tool({
    description:
        'List apps restricted from installation on an org or workspace. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID (Enterprise Grid filter)'),
        enterpriseId: z.string().optional().describe('Enterprise Grid org ID filter'),
        certified: z.boolean().optional().describe('True for certified apps only, false to exclude them'),
        limit: z.number().min(1).max(1000).optional().describe('Apps per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, enterpriseId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.apps.restricted.list', {
                ...rest,
                team_id: teamId,
                enterprise_id: enterpriseId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list restricted apps');
        }
    },
});

export const slackRestrictApp = tool({
    description:
        'Restrict an app from being installed. Provide app_id or request_id, plus team_id or enterprise_id. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        appId: z.string().optional().describe('App ID, e.g. A08U8HZHY0Y'),
        requestId: z.string().optional().describe('App installation request ID, e.g. Ar1234567890'),
        teamId: z.string().optional().describe('Workspace ID to restrict on'),
        enterpriseId: z.string().optional().describe('Enterprise org ID to restrict on'),
    }),
    execute: async ({ slackToken, appId, requestId, teamId, enterpriseId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!appId && !requestId) {
                return { error: 'Provide appId or requestId.' };
            }
            if (!teamId && !enterpriseId) {
                return { error: 'Provide teamId or enterpriseId.' };
            }
            return await slackApi(slackToken, 'admin.apps.restrict', {
                app_id: appId,
                request_id: requestId,
                team_id: teamId,
                enterprise_id: enterpriseId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to restrict app');
        }
    },
});
