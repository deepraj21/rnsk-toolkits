// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelCreateEdgeConfig = tool({
    description: 'Creates a new Edge Config for storing key-value data at the edge. Edge Configs enable ultra-low latency data reads from Vercel\'s edge network. Use this to store feature flags, A/B test configurations, or other data that needs to be read quickly from edge functions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().describe('Unique slug identifier for the Edge Config. Can only contain alphanumeric characters, underscores (_) and hyphens (-). Maximum 64 characters.'),
        items: z.record(z.any()).optional().describe('Optional initial key-value items to populate the Edge Config. Each key should be a string and values can be any JSON-serializable type.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Required if the Edge Config belongs to a team.'),
        teamSlug: z.string().optional().describe('The Team URL slug to perform the request on behalf of. Alternative to teamId.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Edge Config failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateEdgeConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateEdgeConfigToken = tool({
    description: 'Create a read access token for a specific Edge Config. The generated token is used to authenticate against the Edge Config\'s endpoint for high-volume, low-latency read operations. Use this when you need to grant read access to an Edge Config from your application.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        label: z.string().describe('A label for the token to help identify its purpose (max length 52 characters).'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('The unique identifier of the Edge Config for which the token is being created.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/token`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Edge Config Token failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateEdgeConfigToken', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteEdgeConfig = tool({
    description: 'Tool to delete an Edge Config by its unique identifier. Use when you need to permanently remove an Edge Config and all its associated data.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to delete.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Edge Config failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteEdgeConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteEdgeConfigTokens = tool({
    description: 'Tool to delete one or more Edge Config tokens. Use when you need to revoke access tokens from an Edge Config. Note: The tokens array must contain the actual token values, not token IDs.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        tokens: z.array(z.string()).describe('List of token values (not token IDs) to delete. Each token is the actual token string that was generated when the token was created.'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config from which to delete tokens.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/tokens`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Edge Config Tokens (v2) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteEdgeConfigTokens', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetEdgeConfig = tool({
    description: 'Tool to retrieve detailed information about a specific Edge Config by ID. Use when you need to inspect edge config metadata including transfer status, sync information, and purpose details.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to retrieve'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetEdgeConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetEdgeConfigBackup = tool({
    description: 'Tool to retrieve a specific backup version of an Edge Config. Use when you need to inspect or restore a previous version of edge config data.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Optional Team ID to perform the request on behalf of'),
        backupId: z.string().describe('The backup ID or version to retrieve'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/backup/${p.backupId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Backup failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetEdgeConfigBackup', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetEdgeConfigItem = tool({
    description: 'Tool to retrieve a specific item within an Edge Config. Use after obtaining the Edge Config ID and when you need to inspect or validate a particular configuration item by its key.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config (must start with ecfg_ prefix)'),
        edgeConfigItemKey: z.string().describe('Key of the Edge Config item to retrieve'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/items/${p.edgeConfigItemKey}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Item failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetEdgeConfigItem', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetEdgeConfigSchema = tool({
    description: 'Tool to retrieve the JSON schema of a specific Edge Config. Use when you need to inspect the schema definition of an edge config.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Optional Team ID to perform the request on behalf of'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to retrieve the schema for'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/schema`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Schema failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetEdgeConfigSchema', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetEdgeConfigToken = tool({
    description: 'Tool to retrieve details of a specific token associated with an Edge Config. Use when you need metadata for an existing Edge Config token.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of.'),
        token: z.string().describe('The token string (read access token) whose metadata is to be retrieved. This is the token value returned when creating a token, not the token ID.'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('The unique identifier of the Edge Config.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/token/${p.token}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Token failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetEdgeConfigToken', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListEdgeConfigBackups = tool({
    description: 'Tool to retrieve backups for a specific Edge Config. Use when you need to list or inspect available backups for recovery purposes.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        next: z.string().optional().describe('Pagination cursor for the next page of results'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of backups to return (max 50)'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        metadata: z.string().optional().describe('Metadata filter for backups'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to retrieve backups for'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/backups`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Backups failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListEdgeConfigBackups', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListEdgeConfigItems = tool({
    description: 'Tool to retrieve all items from a specific Edge Config. Use when you need to inspect all key-value pairs stored in an Edge Config.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to retrieve items from'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/items`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Items failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListEdgeConfigItems', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListEdgeConfigs = tool({
    description: 'Tool to retrieve all Edge Configs for an account or team. Use when you need to list all Edge Config definitions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Configs failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListEdgeConfigs', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListEdgeConfigTokens = tool({
    description: 'Tool to get all tokens of an Edge Config. Use when you need to retrieve the complete list of tokens associated with a specific Edge Config.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('The unique identifier of the Edge Config.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/tokens`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Edge Config Tokens failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListEdgeConfigTokens', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateEdgeConfig = tool({
    description: 'Tool to update an Edge Config by changing its slug. Use when you need to rename an Edge Config to reflect a new purpose or organizational structure.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().describe('The new slug name for the Edge Config. Must contain only alphanumeric characters, underscores, and hyphens, with a maximum length of 64 characters'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        teamSlug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        edgeConfigId: z.string().describe('The unique identifier of the Edge Config to update'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Edge Config failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateEdgeConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateEdgeConfigItems = tool({
    description: 'Tool to update items within a specific Edge Config. Use when you need to batch modify, add, or remove key-value pairs in an existing Edge Config.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of.'),
        items: z.array(z.record(z.any())).describe('List of operations to perform on Edge Config items.'),
        dryRun: z.boolean().optional().describe('If true, validates the request without applying changes.'),
        teamId: z.string().optional().describe('Team ID to perform the request on behalf of.'),
        edgeConfigId: z.string().describe('The unique identifier of the Edge Config to update.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/items`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Edge Config Items failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateEdgeConfigItems', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateEdgeConfigSchema = tool({
    description: 'Tool to update the JSON Schema for an Edge Config. Use when you need to define or modify validation rules for Edge Config items.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        dryRun: z.string().optional().describe('Optional parameter to perform a dry run without applying changes'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        requestBody: z.record(z.any()).describe('Body object containing the schema definition to update'),
        edgeConfigId: z.string().describe('Unique identifier of the Edge Config to update the schema for'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/edge-config/${p.edgeConfigId}/schema`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PUT', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Edge Config Schema failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateEdgeConfigSchema', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
