// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelAddEnvironmentVariable = tool({
    description: 'Tool to add an environment variable to a Vercel project. Variables only take effect in subsequent deployments — already-running deployments are not updated. Use after confirming the project exists and you need to configure secrets or configuration values across environments before deployment. Example: "Add API_KEY=secret to production".',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        key: z.string().describe('Name of the environment variable'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        type: z.string().describe('Type of the variable storage: \'plain\' (non-sensitive values), \'encrypted\' (standard encrypted values visible to project users), or \'sensitive\' (values that are non-readable once created, only de'),
        value: z.string().describe('Value of the environment variable'),
        target: z.array(z.enum(['production','preview','development'])).describe('List of environments where this variable should be available. Must be provided as a list even for a single environment. Valid values: \'production\', \'preview\', \'development\'. NOTE: When type=\'se'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        upsert: z.boolean().optional().describe('If true, overwrite existing variables with the same key Silently overwrites without confirmation — only set true when user has explicitly confirmed the existing value should be replaced.'),
        comment: z.string().optional().describe('Optional comment for context'),
        idOrName: z.string().describe('The unique identifier or name of the project'),
        gitBranch: z.string().optional().describe('Git branch to scope this variable to'),
        customEnvironmentIds: z.array(z.string()).optional().describe('List of custom environment identifiers. Must be provided as a list even for a single ID'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v10/projects/${p.idOrName}/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Add Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelAddEnvironmentVariable', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelBatchRemoveProjectEnv = tool({
    description: 'Tool to batch remove environment variables from a Vercel project. Use when you need to delete multiple environment variables at once. More efficient than deleting variables one by one when removing multiple variables.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        ids: z.array(z.string()).describe('Array of environment variable IDs to delete. Must contain at least 1 and at most 1000 IDs.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Batch Remove Project Environment Variables failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelBatchRemoveProjectEnv', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateProjectEnv = tool({
    description: 'DEPRECATED: Use VERCEL_ADD_ENVIRONMENT_VARIABLE instead. Tool to create environment variables in a Vercel project. Use when you need to configure secrets or configuration values across environments.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        key: z.string().describe('Name of the environment variable'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        type: z.string().describe('Type of the variable storage: \'plain\' (non-sensitive values), \'encrypted\' (standard encrypted values visible to project users), or \'sensitive\' (values that are non-readable once created, only de'),
        value: z.string().describe('Value of the environment variable'),
        target: z.array(z.enum(['production','preview','development'])).optional().describe('List of environments where this variable should be available. Valid values: \'production\', \'preview\', \'development\'. Note: When type is \'sensitive\', \'development\' is not allowed and will be a'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        upsert: z.string().optional().describe('Set to \'true\' to update an existing environment variable instead of failing with ENV_CONFLICT. When creating a variable that may already exist, use upsert=\'true\' to overwrite its value.'),
        comment: z.string().optional().describe('Optional comment for context'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        gitBranch: z.string().optional().describe('Git branch to scope this variable to'),
        customEnvironmentIds: z.array(z.string()).optional().describe('List of custom environment identifiers'),
        SensitiveDevRemoved: z.boolean().optional().describe('Internal flag: True if \'development\' was auto-removed from target for sensitive type'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v10/projects/${p.idOrName}/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Project Environment Variables (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateProjectEnv', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateSharedEnvVariable = tool({
    description: 'Tool to create one or more shared environment variables in Vercel. Use when you need to create environment variables that can be shared across multiple projects or applied to specific target environments. Supports creating 1-50 variables in a single request.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        evs: z.array(z.record(z.any())).describe('Array of environment variables to create (minimum 1, maximum 50)'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        type: z.string().optional().describe('Type of environment variable storage: \'encrypted\' (standard encrypted values visible to users) or \'sensitive\' (values that are non-readable once created). Defaults to \'encrypted\' if not specifie'),
        target: z.array(z.enum(['production','preview','development'])).optional().describe('Target environments where the variable should be available. Required if applyToAllCustomEnvironments is not set. Valid values: \'production\', \'preview\', \'development\''),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        projectId: z.array(z.string()).optional().describe('Associate the shared environment variable with specific projects by providing a list of project IDs'),
        applyToAllCustomEnvironments: z.boolean().optional().describe('Apply the environment variable to all custom environments. Required if target is not set. Cannot be used together with target.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Shared Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateSharedEnvVariable', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteProjectEnv = tool({
    description: 'Tool to remove an environment variable from a Vercel project. Use when you need to delete a specific environment variable by its ID.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique environment variable identifier'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        customEnvironmentId: z.string().optional().describe('The unique custom environment identifier within the project'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/env/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Remove Project Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteProjectEnv', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteSharedEnvVariable = tool({
    description: 'Tool to delete one or more shared environment variables. Use when you need to remove shared env vars by their IDs (up to 50 at a time).',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        ids: z.array(z.string()).describe('IDs of the Shared Environment Variables to delete. Minimum 1, maximum 50.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Shared Env Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteSharedEnvVariable', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelEditProjectEnv = tool({
    description: 'Tool to edit an environment variable in a Vercel project. Use when you need to update an existing environment variable\'s value, type, target environments, or other properties. Requires both the project identifier and the environment variable ID.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique environment variable identifier'),
        key: z.string().optional().describe('The name of the environment variable'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        type: z.string().optional().describe('The type of environment variable'),
        value: z.string().optional().describe('The value of the environment variable'),
        target: z.array(z.enum(['production','preview','development'])).optional().describe('The target environment of the environment variable. Must be provided as a list even for a single environment'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        comment: z.string().optional().describe('A comment to add context on what this env var is for'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        gitBranch: z.string().optional().describe('If defined, the git branch of the environment variable (must have target=preview)'),
        customEnvironmentIds: z.array(z.string()).optional().describe('The custom environments that the environment variable should be synced to. Must be provided as a list even for a single ID'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/env/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Edit Project Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelEditProjectEnv', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelFilterProjectEnvs = tool({
    description: 'Tool to retrieve environment variables of a Vercel project by id or name. Use when you need to list and filter environment variables for a specific project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        source: z.string().optional().describe('The source that is calling the endpoint'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        decrypt: z.string().optional().describe('If true, the environment variable value will be decrypted'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        gitBranch: z.string().optional().describe('If defined, the git branch of the environment variable to filter the results (must have target=preview)'),
        customEnvironmentId: z.string().optional().describe('The unique custom environment identifier within the project'),
        customEnvironmentSlug: z.string().optional().describe('The custom environment slug (name) within the project'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Filter Project Environment Variables failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelFilterProjectEnvs', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProjectEnv = tool({
    description: 'Tool to retrieve the decrypted value of an environment variable from a Vercel project. Use when you need to access the actual value of a specific environment variable by its ID.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique ID for the environment variable to get the decrypted value.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/env/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Project Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProjectEnv', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetSharedEnvVar = tool({
    description: 'Tool to retrieve the decrypted value of a Shared Environment Variable by id. Use when you need to inspect a specific shared environment variable value.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique ID for the Shared Environment Variable to get the decrypted value.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Shared Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetSharedEnvVar', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetSharedEnvVariables = tool({
    description: 'Tool to list all shared environment variables for a team. Use when you need to retrieve or inspect shared environment variables across projects.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        ids: z.string().optional().describe('Filter shared environment variables based on comma-separated IDs.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        search: z.string().optional().describe('Search term to filter environment variables by key name.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().optional().describe('Filter shared environment variables that belong to a specific project.'),
        excludeIds: z.string().optional().describe('Exclude shared environment variables based on comma-separated IDs.'),
        excludeProjectId: z.string().optional().describe('Exclude shared environment variables that belong to a specific project.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Shared Environment Variables failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetSharedEnvVariables', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListEnvVariables = tool({
    description: 'DEPRECATED: Use FilterProjectEnvs instead. Tool to list environment variables for a specific project. Use when you need to inspect or page through the environment settings before deployment. Each returned env var has independent target scopes (production/preview/development); never assume a variable applies to all environments. Env var changes require a new deployment to take effect. Example: { "projectId": "prj_nos3l9LxEmu8dYCFBaUVlox26eRJ", "decrypt": false, "limit": 20 }',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        limit: z.number().optional().describe('Maximum number of variables to return (1-100).'),
        until: z.number().optional().describe('Pagination cursor. Use the `pagination.next` timestamp from a prior response. Repeat requests with each new `pagination.next` value until no cursor is returned to avoid missing variables.'),
        decrypt: z.boolean().optional().describe('Whether to return decrypted values. Even with decrypt=true, values may still be redacted if the token lacks sufficient permissions; treat empty values as potentially redacted, not absent.'),
        gitBranch: z.string().optional().describe('Filter variables for a specific git branch.'),
        projectId: z.string().describe('Unique identifier of the project. Must be the internal Vercel project ID (e.g., from VERCEL_LIST_PROJECTS), not the project name — using the name returns empty or misleading results.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.projectId}/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Environment Variables (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListEnvVariables', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListProjectCustomEnvironments = tool({
    description: 'Tool to retrieve custom environments for a Vercel project. Use when you need to list all custom environments or filter by git branch.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        gitBranch: z.string().optional().describe('Fetch custom environments for a specific git branch'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/custom-environments`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Project Custom Environments failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListProjectCustomEnvironments', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUnlinkSharedEnvVariable = tool({
    description: 'Tool to disconnect a shared environment variable from a Vercel project. Use when you need to remove the linkage between a shared environment variable and a specific project without deleting the variable itself.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique ID for the Shared Environment Variable to unlink from the project.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique identifier of the project to unlink the shared environment variable from.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env/${p.id}/unlink/${p.projectId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Unlink Shared Environment Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUnlinkSharedEnvVariable', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateSharedEnvVariable = tool({
    description: 'Tool to update one or more shared environment variables. Use when you need to modify shared env var properties like value, target environments, or project linkages using their IDs.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        updates: z.record(z.any()).describe('Object where each key is an environment variable ID (not the key name) and the value contains the updates to apply. The ID format is typically \'env_\' followed by alphanumeric characters.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/env`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Shared Env Variable failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateSharedEnvVariable', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
