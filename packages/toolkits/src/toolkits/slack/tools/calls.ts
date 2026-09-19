// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackStartCall = tool({
    description:
        'Register a third-party call in Slack (calls.add). Requires a provider join_url and unique external_unique_id. Returns the Slack call ID for later updates.',
    inputSchema: z.object({
        slackToken: tokenField,
        externalUniqueId: z.string().describe('Provider-unique call ID'),
        joinUrl: z.string().describe('Web join URL (third-party, not a Slack URL)'),
        title: z.string().optional().describe('Call title shown in Slack'),
        users: z.string().optional().describe('JSON array of participants, e.g. [{"slack_id":"U123"}]'),
        createdBy: z.string().optional().describe('Creator user ID (required without a user token)'),
        dateStart: z.number().optional().describe('Start time as UTC Unix timestamp'),
        externalDisplayId: z.string().optional().describe('Human-friendly meeting label, e.g. CONF-7890'),
        desktopAppJoinUrl: z.string().optional().describe('Deep link to launch the calling app'),
    }),
    execute: async ({ slackToken, externalUniqueId, joinUrl, title, users, createdBy, dateStart, externalDisplayId, desktopAppJoinUrl }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.add', {
                external_unique_id: externalUniqueId,
                join_url: joinUrl,
                title,
                users,
                created_by: createdBy,
                date_start: dateStart,
                external_display_id: externalDisplayId,
                desktop_app_join_url: desktopAppJoinUrl,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to start call');
        }
    },
});

export const slackGetCallInfo = tool({
    description:
        'Get a point-in-time snapshot of a call by its Slack call ID (from slackStartCall).',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('Call ID, e.g. R1234567890'),
    }),
    execute: async ({ slackToken, id }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.info', { id });
        } catch (error) {
            return toSlackError(error, 'Failed to get call info');
        }
    },
});

export const slackUpdateCallInfo = tool({
    description:
        'Update the title, join URL, or desktop app URL of an existing call by ID.',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('Call ID to update'),
        title: z.string().optional().describe('New call title'),
        joinUrl: z.string().optional().describe('New web join URL'),
        desktopAppJoinUrl: z.string().optional().describe('New desktop app deep link'),
    }),
    execute: async ({ slackToken, id, title, joinUrl, desktopAppJoinUrl }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.update', {
                id,
                title,
                join_url: joinUrl,
                desktop_app_join_url: desktopAppJoinUrl,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update call');
        }
    },
});

export const slackEndCall = tool({
    description:
        'End an ongoing call by ID, optionally recording its duration in seconds.',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('Call ID to end'),
        duration: z.number().optional().describe('Call duration in seconds'),
    }),
    execute: async ({ slackToken, id, duration }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.end', { id, duration });
        } catch (error) {
            return toSlackError(error, 'Failed to end call');
        }
    },
});

export const slackAddCallParticipants = tool({
    description:
        'Add participants to an ongoing call. Users is a JSON array string of {"slack_id":"U..."} objects.',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('Call ID from slackStartCall'),
        users: z.string().describe('JSON array, e.g. [{"slack_id":"U1H77"},{"slack_id":"U2ABC123"}]'),
    }),
    execute: async ({ slackToken, id, users }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.participants.add', { id, users });
        } catch (error) {
            return toSlackError(error, 'Failed to add call participants');
        }
    },
});

export const slackRemoveCallParticipants = tool({
    description:
        'Remove participants from an ongoing call. Users is a JSON array string with slack_id and/or external_id per user.',
    inputSchema: z.object({
        slackToken: tokenField,
        id: z.string().describe('Call ID to update'),
        users: z.string().describe('JSON array, e.g. [{"slack_id":"U1H77"}]'),
    }),
    execute: async ({ slackToken, id, users }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'calls.participants.remove', { id, users });
        } catch (error) {
            return toSlackError(error, 'Failed to remove call participants');
        }
    },
});
