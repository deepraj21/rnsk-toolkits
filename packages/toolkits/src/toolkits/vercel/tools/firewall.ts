// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelGetActiveAttackStatus = tool({
    description: 'Tool to read active attack data from Vercel Firewall for a specific project. Use when you need to check if a project is under attack or retrieve security anomaly information.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        since: z.number().optional().describe('Timestamp in milliseconds to retrieve attack data since this time.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique identifier of the project to check attack status for.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/attack-status/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Active Attack Status failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetActiveAttackStatus', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetFirewallConfig = tool({
    description: 'Tool to retrieve firewall configuration for a Vercel project. Use when you need to inspect current firewall rules and settings.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().describe('The unique identifier of the project'),
        configVersion: z.string().describe('The deployed configVersion for the firewall configuration. Use \'active\' for the currently deployed configuration.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/firewall/config/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Firewall Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetFirewallConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListFirewallEvents = tool({
    description: 'Retrieve firewall events and security actions for a specific Vercel project. Use this tool when you need to: - Monitor security events and blocked requests for a project - Analyze firewall actions (blocks, challenges, rate limits) over a time period - Investigate suspicious activity or attack patterns - Review which firewall rules are being triggered Note: This endpoint requires appropriate permissions. Enterprise or Pro plans may be required.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        hosts: z.string().optional().describe('Comma-separated list of hostnames to filter firewall events by. Only events affecting these domains will be returned. Example: \'example.com,www.example.com\'.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Required when accessing team resources.'),
        projectId: z.string().describe('The unique identifier of the Vercel project (e.g., \'prj_abc123\'). Required parameter to retrieve firewall events for that specific project.'),
        endTimestamp: z.number().optional().describe('End timestamp in milliseconds (Unix epoch) to filter firewall events until. Events returned will be up to this time. If not provided, returns events up to the current time.'),
        startTimestamp: z.number().optional().describe('Start timestamp in milliseconds (Unix epoch) to filter firewall events from. Events returned will be from this time onwards. If not provided, returns recent events.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/firewall/events/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Firewall Events by Project failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListFirewallEvents', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelReadFirewallConfig = tool({
    description: 'Tool to read firewall configuration for a Vercel project. Use when you need to inspect current firewall settings, IP rules, or custom security rules for a project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Omit for personal account.'),
        projectId: z.string().describe('The ID of the project to retrieve firewall configuration for. This is a required parameter.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/firewall/config/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Read Firewall Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelReadFirewallConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelReplaceFirewallConfig = tool({
    description: 'Tool to update firewall configuration for a Vercel project. Use when you need to enable/disable firewall, configure CRS rules, or manage custom firewall rules and IP restrictions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        crs: z.record(z.any()).optional().describe('Common Request Security (CRS) configuration.'),
        ips: z.array(z.record(z.any())).optional().describe('IP-based firewall rules'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        rules: z.array(z.record(z.any())).optional().describe('Custom firewall rules'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().describe('The unique project identifier'),
        botIdEnabled: z.boolean().optional().describe('Whether bot identification is enabled'),
        managedRules: z.record(z.any()).optional().describe('Managed rules configuration'),
        firewallEnabled: z.boolean().describe('Whether the firewall is enabled for this project'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/firewall/config/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PUT', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Vercel Firewall Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelReplaceFirewallConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateAttackChallengeMode = tool({
    description: 'Tool to update Attack Challenge mode for a Vercel project. Use when you need to enable or disable enhanced security protection against potential attacks. Attack Challenge mode adds an extra verification layer to protect deployments.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of. Alternative to teamId.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Omit for personal account.'),
        projectId: z.string().describe('The unique identifier of the project to update Attack Challenge mode for'),
        attackModeEnabled: z.boolean().describe('Whether to enable or disable Attack Challenge mode for the project'),
        attackModeActiveUntil: z.number().describe('Required timestamp in milliseconds specifying when Attack Challenge mode should automatically be disabled. Must be a future date within 24 hours from now. The API will reject timestamps in the past or'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/attack-mode/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Attack Challenge Mode failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateAttackChallengeMode', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateFirewallConfig = tool({
    description: 'Tool to incrementally update Vercel Firewall configuration for a project using PATCH. Use when you need to: enable/disable the firewall (\'firewallEnabled\'), add/remove IP blocking rules (\'ip.insert\'/\'ip.remove\'), manage custom rules (\'rules.insert\'/\'rules.update\'/\'rules.remove\'), or configure OWASP CRS rules (\'crs.update\'/\'crs.disable\'). Each call modifies a single aspect of the configuration. For full replacement of firewall config, use VERCEL_PUT_FIREWALL_CONFIG instead.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().optional().describe('Identifier for the specific firewall rule or configuration being modified. Required for update/remove actions: \'ip.remove\' (ip_xxx), \'rules.update\'/\'rules.remove\' (rule_xxx), \'crs.update\'/\'cr'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        value: z.string().optional().describe('The value for the firewall action. Type depends on action: boolean for \'firewallEnabled\' (true/false), object for \'ip.insert\' (e.g., {hostname: \'*\', ip: \'192.168.1.1\', action: \'deny\', notes:'),
        action: z.string().describe('The firewall configuration action to perform. Supported actions: \'firewallEnabled\' (enable/disable the firewall with boolean value), \'ip.insert\' (add IP blocking rule with value containing hostnam'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('Project identifier to update firewall configuration for'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/security/firewall/config/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Firewall Configuration failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateFirewallConfig', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
