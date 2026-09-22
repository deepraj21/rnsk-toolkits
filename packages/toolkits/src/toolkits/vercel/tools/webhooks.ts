// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelCreateWebhook = tool({
    description: 'Tool to create a webhook for receiving notifications about Vercel events. Use when you need to set up automated responses to deployment, domain, project, or other Vercel events.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        url: z.string().describe('The URL to call when the webhook is triggered. Must start with http:// or https://'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        events: z.array(z.enum(['budget.reached','domain.created','domain.dns.records.changed','domain.transfer-in.started','domain.transfer-in.completed','domain.transfer-in.failed','domain.certificate.add','domain.certificate.add.failed','domain.certificate.renew','domain.certificate.renew.failed','domain.certificate.deleted','domain.renewal','domain.renewal.failed','domain.auto-renew.changed','deployment.created','deployment.cleanup','deployment.error','deployment.canceled','deployment.succeeded','deployment.ready','deployment.check-rerequested','deployment.promoted','deployment.integration.action.start','deployment.integration.action.cancel','deployment.integration.action.cleanup','deployment.checkrun.start','deployment.checkrun.cancel','edge-config.created','edge-config.deleted','edge-config.items.updated','firewall.attack','firewall.system-rule-anomaly','firewall.custom-rule-anomaly','alerts.triggered','integration-configuration.permission-upgraded','integration-configuration.removed','integration-configuration.scope-change-confirmed','integration-configuration.transferred','integration-resource.project-connected','integration-resource.project-disconnected','project.created','project.removed','project.renamed','project.domain.created','project.domain.updated','project.domain.deleted','project.domain.verified','project.domain.unverified','project.domain.moved','project.rolling-release.started','project.rolling-release.aborted','project.rolling-release.completed','project.rolling-release.approved','deployment.checks.failed','deployment.checks.succeeded','deployment-checks-completed','deployment-ready','deployment-prepared','deployment-error','deployment-check-rerequested','deployment-canceled','project-created','project-removed','domain-created','deployment','integration-configuration-permission-updated','integration-configuration-removed','integration-configuration-scope-change-confirmed','marketplace.member.changed','marketplace.invoice.created','marketplace.invoice.paid','marketplace.invoice.notpaid','marketplace.invoice.refunded','observability.anomaly','observability.anomaly-error','observability.usage-anomaly','observability.error-anomaly','botid.anomaly','test-webhook'])).describe('List of event types that should trigger this webhook. At least one event is required.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectIds: z.array(z.string()).optional().describe('Optional list of project IDs to scope the webhook to specific projects. Minimum 1, maximum 50 project IDs. Each project ID must contain only alphanumeric characters and underscores.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/webhooks`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Webhook failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateWebhook', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteWebhook = tool({
    description: 'Delete a webhook by its unique ID to stop receiving event notifications. This action permanently removes the webhook configuration. Use VERCEL_GET_WEBHOOKS to find webhook IDs if needed. The deletion is idempotent - deleting an already deleted webhook returns a 404 error.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique identifier of the webhook to delete.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/webhooks/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Vercel Webhook failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteWebhook', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetWebhook = tool({
    description: 'Tool to retrieve details of a specific webhook by ID. Use when you need to inspect webhook configuration, events, or metadata.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique identifier of the webhook to retrieve (e.g., \'account_hook_v3dYzpfkptKPBE483PIHvN0y\')'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of. Alternative to team_id.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Required when accessing team webhooks.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/webhooks/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Webhook failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetWebhook', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListWebhooks = tool({
    description: 'Tool to retrieve a list of all webhooks for the authenticated account or team. Use this to discover configured webhooks and their event subscriptions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().optional().describe('Filter webhooks by project identifier.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/webhooks`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get List of Webhooks failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListWebhooks', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
