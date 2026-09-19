// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfStream, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceGetJobsHardware = tool({
    description: "Tool to retrieve available hardware configurations for Hugging Face Jobs with their specifications and pricing. Use when you need to discover compute options for running jobs.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/jobs/hardware`, queryParams });
    },
});

export const huggingFaceGetSettingsBillingUsageJobs = tool({
    description: "Tool to retrieve Jobs usage and billing information for the current subscription period from Hugging Face. Use when you need to check compute usage, costs, or job execution details for the authenticated user or organization.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/settings/billing/usage/jobs`, queryParams });
    },
});

export const huggingFaceGetSettingsBillingUsageLive = tool({
    description: "Tool to retrieve live billing usage stream from Hugging Face. Use when you need real-time updates on storage, inference, Zero GPU usage, and rate limits.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        timeout: z.number().int().min(1).max(30).optional().describe("Maximum time in seconds to wait for live usage updates. Defaults to 5 seconds."),
    }),
    execute: async ({ huggingFaceToken, timeout }) => {
        const queryParams = { timeout: timeout };
        return hfStream(huggingFaceToken, { url: `${HOSTS.HUB}/api/settings/billing/usage/live`, queryParams, timeoutMs: ((timeout ?? 5) * 1000) });
    },
});

export const huggingFaceGetSettingsBillingUsageV2 = tool({
    description: "Tool to retrieve user billing usage for a custom date range from Hugging Face. Use when you need to check usage statistics or resource consumption between specific dates using Unix timestamps.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        endDate: z.number().int().describe("End date of the billing period as Unix timestamp (seconds since epoch). Defines the end of the date range for which to retrieve usage data. Must be after start_date."),
        startDate: z.number().int().describe("Start date of the billing period as Unix timestamp (seconds since epoch). Defines the beginning of the date range for which to retrieve usage data."),
    }),
    execute: async ({ huggingFaceToken, endDate, startDate }) => {
        const queryParams = { start_date: startDate, end_date: endDate };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/settings/billing/usage/v2`, queryParams });
    },
});

export const huggingFaceGetSettingsMcp = tool({
    description: "Tool to retrieve MCP (Model Context Protocol) tools configuration for the authenticated user. Use when you need to discover available built-in tools and space-based tools configured in the user's Hugging Face settings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/settings/mcp`, queryParams });
    },
});

export const huggingFaceUpdateSettingsNotifications = tool({
    description: "Tool to update notification settings for the authenticated Hugging Face user. Use when you need to enable or disable various notification types such as announcements, discussions, paper digests, or product updates.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        notifications: z.record(z.any()).describe("Notification settings to update. Only include the specific notification preferences you want to change."),
        prepaidAmount: z.string().max(24).optional().describe("Prepaid amount to be provided when enabling launch_prepaid_credits notification. Maximum length is 24 characters."),
    }),
    execute: async ({ huggingFaceToken, notifications, prepaidAmount }) => {
        const queryParams = undefined;
        const body = { notifications: notifications, prepaid_amount: prepaidAmount };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/settings/notifications`, queryParams, body });
    },
});

export const huggingFaceUpdateSettingsWatch = tool({
    description: "Tool to update watch settings for your Hugging Face account. Use when you want to get notified about discussions on organizations, users, or repositories. You can add new items to watch and/or remove items from your watch list in a single request.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        add: z.array(z.record(z.any())).optional().describe("Array of items to start watching. Each item must specify an 'id' and 'type'. You will receive notifications when discussions happen on these items. Leave empty if you only want to remove items from watch list."),
        deleteList: z.array(z.record(z.any())).optional().describe("Array of items to stop watching. Each item must specify an 'id' and 'type'. You will no longer receive notifications for discussions on these items. Leave empty if you only want to add items to watch list."),
    }),
    execute: async ({ huggingFaceToken, add, deleteList }) => {
        const queryParams = undefined;
        const body = { add: add, delete: deleteList };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/settings/watch`, queryParams, body });
    },
});
