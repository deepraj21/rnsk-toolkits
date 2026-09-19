// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackCreateReminder = tool({
    description:
        'Create a reminder with text and time. Time accepts a Unix timestamp, seconds-from-now, or natural language (e.g. "in 15 minutes", "every Monday at 10am"). Only bot tokens can target other users.',
    inputSchema: z.object({
        slackToken: tokenField,
        text: z.string().describe("Reminder text, e.g. 'Submit weekly report'"),
        time: z.string().describe("When: Unix timestamp, seconds, or natural language"),
        user: z.string().optional().describe('Recipient user ID (omit for self; bot tokens only)'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, text, time, user, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reminders.add', { text, time, user, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to create reminder');
        }
    },
});

export const slackGetReminder = tool({
    description:
        'Get details for a reminder by ID (Rm-prefixed). Read-only.',
    inputSchema: z.object({
        slackToken: tokenField,
        reminder: z.string().describe('Reminder ID, e.g. Rm12345678'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, reminder, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reminders.info', { reminder, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to get reminder');
        }
    },
});

export const slackListReminders = tool({
    description:
        'List reminders for the caller. An empty array is valid (no reminders), not an error. Match client-side on returned objects before deleting by ID.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reminders.list', { team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to list reminders');
        }
    },
});

export const slackDeleteReminder = tool({
    description:
        'Delete a reminder by ID. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        reminder: z.string().describe('Reminder ID, e.g. Rm1234567890'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, reminder, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reminders.delete', { reminder, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to delete reminder');
        }
    },
});
