// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackCustomizeUnfurl = tool({
    description:
        'Customize link previews (unfurls) on a message: provide custom preview content per URL or empty objects to remove previews. Target by channel+ts, or by unfurl_id+source. Either unfurls or metadata is required.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID (requires ts)'),
        ts: z.string().optional().describe('Message ts (requires channel)'),
        unfurlId: z.string().optional().describe('Link ID (requires source; alternative to channel+ts)'),
        source: z.string().optional().describe("Link source: 'composer' or 'conversations_history' (requires unfurlId)"),
        unfurls: z.record(z.any()).optional().describe('Map of URL to preview content (empty object removes the preview)'),
        metadata: z.record(z.any()).optional().describe('Work-object metadata alternative to unfurls'),
        userAuthRequired: z.boolean().optional().describe('Require user auth before unfurling a domain'),
        userAuthUrl: z.string().optional().describe('Auth URL for the unfurl flow'),
        userAuthMessage: z.string().optional().describe('Ephemeral prompt asking the user to authenticate'),
        userAuthBlocks: z.array(z.record(z.any())).optional().describe('Block Kit auth invitation (richer alternative)'),
    }),
    execute: async ({ slackToken, ts, unfurlId, userAuthRequired, userAuthUrl, userAuthMessage, userAuthBlocks, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.unfurl', {
                ...rest,
                ts,
                unfurl_id: unfurlId,
                user_auth_required: userAuthRequired,
                user_auth_url: userAuthUrl,
                user_auth_message: userAuthMessage,
                user_auth_blocks: userAuthBlocks,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to customize unfurl');
        }
    },
});

export const slackApiTest = tool({
    description:
        'Test Slack API connectivity and auth. Pass foo to echo a value, or error to simulate an error response.',
    inputSchema: z.object({
        slackToken: tokenField,
        foo: z.string().optional().describe('Arbitrary value echoed back in args'),
        error: z.string().optional().describe('Error code to simulate, e.g. my_error'),
    }),
    execute: async ({ slackToken, foo, error }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'api.test', { foo, error });
        } catch (error) {
            return toSlackError(error, 'Failed to test API');
        }
    },
});

export const slackTestAuth = tool({
    description:
        'Verify authentication and get the caller identity (user, team, bot). Use first when diagnosing scope or token issues. Replaces the deprecated permission-scopes check.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'auth.test', {});
        } catch (error) {
            return toSlackError(error, 'Failed to test auth');
        }
    },
});

export const slackWhoAmI = tool({
    description:
        'Return the connected account identity (user ID + workspace ID). User IDs are workspace-scoped, so both are included in the label.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const auth = await slackApi(slackToken, 'auth.test', {});
            return {
                data: {
                    user_id: auth?.user_id,
                    team_id: auth?.team_id,
                    user: auth?.user,
                    team: auth?.team,
                    url: auth?.url,
                    is_enterprise_install: auth?.is_enterprise_install,
                },
                display_name: auth?.user && auth?.team ? `${auth.user} @ ${auth.team}` : null,
            };
        } catch (error) {
            return toSlackError(error, 'Failed to get identity');
        }
    },
});

export const slackRtmConnect = tool({
    description:
        'Start a Real Time Messaging session and get a WebSocket URL for persistent event streaming. Connect to the returned URL separately; the URL is short-lived.',
    inputSchema: z.object({
        slackToken: tokenField,
        presenceSub: z.boolean().optional().describe('Only deliver presence events on subscription'),
        batchPresenceAware: z.boolean().optional().describe('Batch presence deliveries (changes event shape)'),
    }),
    execute: async ({ slackToken, presenceSub, batchPresenceAware }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'rtm.connect', {
                presence_sub: presenceSub,
                batch_presence_aware: batchPresenceAware,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to start RTM session');
        }
    },
});
