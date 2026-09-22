// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelGetTeam = tool({
    description: 'Retrieves detailed information about a specific Vercel team by its ID or slug. Returns comprehensive team metadata including billing, membership, resource configuration, and settings. Use this to get team details before performing team-specific operations. The teamId parameter accepts either a team ID (e.g., \'team_xxx\') or team slug (e.g., \'my-team\').',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Optional team slug to scope the request. Used for authorization when accessing team-specific resources.'),
        teamId: z.string().describe('The Team identifier or slug to retrieve information for. Can be either a team ID (e.g., \'team_RcupkAQdr25D0qQu2MmPu6Th\') or a team slug (e.g., \'my-team\').'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/teams/${p.teamId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Team Details failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetTeam', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetTeams = tool({
    description: 'Tool to list all teams accessible to the authenticated user with detailed information. Use when you need comprehensive team data including membership, configuration, and settings.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        limit: z.number().optional().describe('Maximum number of Teams which may be returned.'),
        since: z.number().optional().describe('Timestamp (in milliseconds) to only include Teams created since then.'),
        until: z.number().optional().describe('Timestamp (in milliseconds) to only include Teams created until then.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/teams`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get All Teams failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetTeams', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListTeamMembers = tool({
    description: 'Tool to list all members of a Vercel team. Use when you need to retrieve team member information, check team access permissions, or audit team membership.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        role: z.string().optional().describe('Only return members with the specified team role.'),
        limit: z.number().optional().describe('Maximum number of team members to return per request.'),
        since: z.number().optional().describe('Timestamp in milliseconds to only include members added since then.'),
        until: z.number().optional().describe('Timestamp in milliseconds to only include members added until then.'),
        search: z.string().optional().describe('Search team members by their name, username, and email.'),
        teamId: z.string().describe('The team\'s unique identifier. Required to specify which team\'s members to list.'),
        excludeProject: z.string().optional().describe('Exclude members who belong to the specified project.'),
        eligibleMembersForProjectId: z.string().optional().describe('Include team members who are eligible to be members of the specified project.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/teams/${p.teamId}/members`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Team Members failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListTeamMembers', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListTeams = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_GET_TEAMS instead. Tool to list all teams accessible to the authenticated user. Use after authentication to retrieve team IDs and slugs; resolve the correct teamId or slug here before passing it to other Vercel tools (e.g., VERCEL_GET_PROJECT, deployment queries) — an incorrect or missing teamId causes 404 or scoping errors.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        limit: z.number().optional().describe('Maximum number of teams to return (max 100)'),
        since: z.number().optional().describe('Timestamp in milliseconds; include teams created since this time'),
        until: z.number().optional().describe('Timestamp in milliseconds; include teams created until this time'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/teams`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List All Teams (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListTeams', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateTeam = tool({
    description: 'Tool to update a Vercel team\'s configuration. Use when you need to modify team settings like name, description, security policies, or deployment settings.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().optional().describe('The name of the team.'),
        saml: z.record(z.any()).optional().describe('SAML configuration for the team.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        avatar: z.string().optional().describe('The hash value of an uploaded image.'),
        teamId: z.string().describe('The Team identifier to perform the request on behalf of.'),
        newSlug: z.string().optional().describe('A new slug for the team.'),
        description: z.string().optional().describe('A short text that describes the team.'),
        emailDomain: z.string().optional().describe('Email domain for the team.'),
        remoteCaching: z.record(z.any()).optional().describe('Whether or not remote caching is enabled for the team'),
        hideIpAddresses: z.boolean().optional().describe('Display or hide IP addresses in Monitoring queries.'),
        regenerateInviteCode: z.boolean().optional().describe('Create a new invite code and replace the current one.'),
        enablePreviewFeedback: z.string().optional().describe('Enable preview toolbar: one of on, off or default.'),
        previewDeploymentSuffix: z.string().optional().describe('Suffix that will be used for all preview deployments.'),
        enableProductionFeedback: z.string().optional().describe('Enable production toolbar: one of on, off or default.'),
        defaultExpirationSettings: z.record(z.any()).optional().describe('Default deployment expiration settings for new projects.'),
        hideIpAddressesInLogDrains: z.boolean().optional().describe('Display or hide IP addresses in Log Drains.'),
        defaultDeploymentProtection: z.record(z.any()).optional().describe('Default deployment protection settings for new projects.'),
        sensitiveEnvironmentVariablePolicy: z.string().optional().describe('Sensitive environment variable policy: one of on, off or default.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/teams/${p.teamId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Team failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateTeam', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
