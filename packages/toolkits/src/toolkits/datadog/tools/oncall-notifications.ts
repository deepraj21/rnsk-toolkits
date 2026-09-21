// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ddApi, toDatadogError } from './client.js';

const credsField = z.string().describe('Datadog credentials JSON with apiKey and appKey (injected by system)');

export const datadogCreateNotificationChannel = tool({
    description:
        'Create an email or phone notification channel for a user (E.164 for phone, address+formats for email).',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        data: z.record(z.any()).describe("JSON:API data object with type 'notification_channels' and config attributes"),
    }),
    execute: async ({ datadogCredentials, user_id, data }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', `/api/v2/on-call/users/${user_id}/notification-channels`, {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to create notification channel');
        }
    },
});

export const datadogGetNotificationChannel = tool({
    description:
        'Get one notification channel for a user by channel ID.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        channel_id: z.string().describe('Notification channel ID'),
    }),
    execute: async ({ datadogCredentials, user_id, channel_id }) => {
        try {
            return await ddApi(
                datadogCredentials,
                'GET',
                `/api/v2/on-call/users/${user_id}/notification-channels/${channel_id}`,
            );
        } catch (error) {
            return toDatadogError(error, 'Failed to get notification channel');
        }
    },
});

export const datadogListNotificationChannels = tool({
    description:
        'List all notification channels configured for a user.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
    }),
    execute: async ({ datadogCredentials, user_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/users/${user_id}/notification-channels`);
        } catch (error) {
            return toDatadogError(error, 'Failed to list notification channels');
        }
    },
});

export const datadogDeleteNotificationChannel = tool({
    description:
        'Delete a user notification channel. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        channel_id: z.string().describe('Notification channel ID to delete'),
    }),
    execute: async ({ datadogCredentials, user_id, channel_id }) => {
        try {
            await ddApi(
                datadogCredentials,
                'DELETE',
                `/api/v2/on-call/users/${user_id}/notification-channels/${channel_id}`,
            );
            return { success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete notification channel');
        }
    },
});

export const datadogCreateNotificationRule = tool({
    description:
        'Create a notification rule for a user: urgency category, delay, and the channel it routes to.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        data: z.record(z.any()).describe("JSON:API data object with type 'notification_rules', attributes, and channel relationships"),
    }),
    execute: async ({ datadogCredentials, user_id, data }) => {
        try {
            return await ddApi(datadogCredentials, 'POST', `/api/v2/on-call/users/${user_id}/notification-rules`, {
                body: { data },
            });
        } catch (error) {
            return toDatadogError(error, 'Failed to create notification rule');
        }
    },
});

export const datadogGetNotificationRule = tool({
    description:
        'Get one notification rule for a user by rule ID.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        rule_id: z.string().describe('Notification rule ID'),
    }),
    execute: async ({ datadogCredentials, user_id, rule_id }) => {
        try {
            return await ddApi(
                datadogCredentials,
                'GET',
                `/api/v2/on-call/users/${user_id}/notification-rules/${rule_id}`,
            );
        } catch (error) {
            return toDatadogError(error, 'Failed to get notification rule');
        }
    },
});

export const datadogListNotificationRules = tool({
    description:
        'List all notification rules configured for a user.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
    }),
    execute: async ({ datadogCredentials, user_id }) => {
        try {
            return await ddApi(datadogCredentials, 'GET', `/api/v2/on-call/users/${user_id}/notification-rules`);
        } catch (error) {
            return toDatadogError(error, 'Failed to list notification rules');
        }
    },
});

export const datadogUpdateNotificationRule = tool({
    description:
        'Update a user notification rule by ID (category, delay, channel).',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        rule_id: z.string().describe('Notification rule ID to update'),
        data: z.record(z.any()).describe("JSON:API data object with the rule update"),
    }),
    execute: async ({ datadogCredentials, user_id, rule_id, data }) => {
        try {
            return await ddApi(
                datadogCredentials,
                'PUT',
                `/api/v2/on-call/users/${user_id}/notification-rules/${rule_id}`,
                { body: { data } },
            );
        } catch (error) {
            return toDatadogError(error, 'Failed to update notification rule');
        }
    },
});

export const datadogDeleteNotificationRule = tool({
    description:
        'Delete a user notification rule. Irreversible — confirm with the user first.',
    inputSchema: z.object({
        datadogCredentials: credsField,
        user_id: z.string().describe('Owner user ID'),
        rule_id: z.string().describe('Notification rule ID to delete'),
    }),
    execute: async ({ datadogCredentials, user_id, rule_id }) => {
        try {
            await ddApi(
                datadogCredentials,
                'DELETE',
                `/api/v2/on-call/users/${user_id}/notification-rules/${rule_id}`,
            );
            return { success: true };
        } catch (error) {
            return toDatadogError(error, 'Failed to delete notification rule');
        }
    },
});
