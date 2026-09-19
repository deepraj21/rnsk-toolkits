// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCreateWebhook = tool({
    description: "Tool to create a webhook on Hugging Face that triggers on repository or discussion events. Use when you need to receive notifications for changes to specific models, datasets, or spaces.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        url: z.string().describe("The webhook URL endpoint that will receive POST requests when events occur. Must be a valid HTTP/HTTPS URL."),
        secret: z.string().optional().describe("Optional secret string used to sign webhook payloads for verification. Must contain only printable ASCII characters (spaces and characters from 0x20 to 0x7F)."),
        domains: z.array(z.string()).min(1).describe("List of event domains to monitor. At least one domain must be specified. Use 'repo' for repository events or 'discussion' for discussion events."),
        watched: z.array(z.record(z.any())).min(1).describe("List of repositories to watch for changes. At least one repository must be specified. Events from these repositories will trigger webhook calls."),
        jobSourceId: z.string().optional().describe("Optional job source identifier for associating the webhook with a specific job source."),
    }),
    execute: async ({ huggingFaceToken, url, secret, domains, watched, jobSourceId }) => {
        const queryParams = undefined;
        const body = { url: url, secret: secret, domains: domains, watched: watched, job_source_id: jobSourceId };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/settings/webhooks`, queryParams, body });
    },
});

export const huggingFaceDeleteSettingsWebhooks = tool({
    description: "Tool to delete a webhook from Hugging Face settings. Use when you need to remove a webhook configuration that is no longer needed.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        webhookId: z.string().min(24).max(24).describe("The unique identifier of the webhook to delete. Must be a 24-character hexadecimal string."),
    }),
    execute: async ({ huggingFaceToken, webhookId }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/settings/webhooks/${encodeURIComponent(webhookId)}`, queryParams });
    },
});

export const huggingFaceGetSettingsWebhooks = tool({
    description: "Tool to retrieve a specific webhook configuration from Hugging Face settings. Use when you need to inspect webhook details, verify webhook status, or check webhook configuration for a given webhook ID.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        webhookId: z.string().min(24).max(24).describe("The unique identifier of the webhook to retrieve. Must be a 24-character hexadecimal string."),
    }),
    execute: async ({ huggingFaceToken, webhookId }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/settings/webhooks/${encodeURIComponent(webhookId)}`, queryParams });
    },
});

export const huggingFaceListSettingsWebhooks = tool({
    description: "Tool to list all webhooks configured in Hugging Face settings. Use when you need to retrieve webhook configurations for the authenticated user's account.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/settings/webhooks`, queryParams });
    },
});

export const huggingFaceUpdateSettingsWebhooks = tool({
    description: "Tool to update an existing webhook in Hugging Face settings. Use when you need to modify webhook configuration such as watched entities, event domains, target URL, or job settings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        job: z.record(z.any()).optional().describe("Model for webhook job configuration to execute when webhook triggers."),
        url: z.string().optional().describe("URL endpoint where webhook POST requests will be sent when events occur. Must be a valid HTTP/HTTPS URL."),
        secret: z.string().optional().describe("Secret string used to sign webhook requests for verification. Must contain only printable ASCII characters."),
        domains: z.array(z.string()).min(1).describe("List of event domains that trigger the webhook. At least one domain is required. 'repo' for repository events, 'discussion' for discussion events."),
        watched: z.array(z.record(z.any())).min(1).describe("List of entities to watch (users, organizations, or repositories). At least one item is required. Events from these entities will trigger the webhook."),
        webhookId: z.string().min(24).max(24).describe("The unique identifier of the webhook to update (24-character hexadecimal string). Get this from the list webhooks action."),
        jobSourceId: z.string().optional().describe("Source identifier for the job. Used to track the origin of the job execution."),
    }),
    execute: async ({ huggingFaceToken, job, url, secret, domains, watched, webhookId, jobSourceId }) => {
        const queryParams = undefined;
        const body = { job: job, url: url, secret: secret, domains: domains, watched: watched, job_source_id: jobSourceId };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/settings/webhooks/${encodeURIComponent(webhookId)}`, queryParams, body });
    },
});

export const huggingFaceUpdateWebhookStatus = tool({
    description: "Tool to enable or disable a webhook on Hugging Face. Use when you need to temporarily deactivate a webhook without deleting it, or reactivate a previously disabled webhook.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        action: z.enum(["enable", "disable"]).describe("The action to perform on the webhook: 'enable' to activate the webhook or 'disable' to deactivate it."),
        webhookId: z.string().min(24).max(24).describe("The unique identifier of the webhook to enable or disable. Must be a 24-character hexadecimal string."),
    }),
    execute: async ({ huggingFaceToken, action, webhookId }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/settings/webhooks/${encodeURIComponent(webhookId)}/${encodeURIComponent(action)}`, queryParams });
    },
});
