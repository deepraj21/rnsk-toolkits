// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackListApprovedInvites = tool({
    description:
        'List approved workspace invite requests with approver details. Enterprise Grid with admin.invites:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID filter (omit for all org workspaces)'),
        limit: z.number().min(1).max(1000).optional().describe('Invites per page (max 1000, default 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.inviteRequests.approved.list', {
                ...rest,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list approved invites');
        }
    },
});

export const slackListDeniedInvites = tool({
    description:
        'List denied workspace invite requests with who denied them and when. Enterprise Grid with admin.invites:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID (required for Enterprise Grid orgs)'),
        limit: z.number().min(1).max(1000).optional().describe('Invites per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.inviteRequests.denied.list', {
                ...rest,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list denied invites');
        }
    },
});

export const slackListPendingInvites = tool({
    description:
        'List pending workspace invite requests (invited but not yet joined). Requires admin.invites:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID filter (omit for all accessible workspaces)'),
        limit: z.number().min(1).max(1000).optional().describe('Invites per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.inviteRequests.list', {
                ...rest,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list pending invites');
        }
    },
});
