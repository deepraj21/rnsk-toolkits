// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelCreateProject = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_CREATE_PROJECT2 instead. Tool to create a new Vercel project. Use when automating project provisioning in CI/CD before deployment. Project names must be unique per team; duplicate names cause 409 conflicts — check for existing projects first.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().describe('Project name. Must be lowercase, up to 100 characters, and can only contain alphanumeric characters (a-z, 0-9) and hyphens (-). Cannot contain \'---\' sequence. Spaces and uppercase letters will be au'),
        slug: z.string().optional().describe('Team slug to run the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to run the request on behalf of'),
        gitRepository: z.record(z.any()).optional().describe('Git repository configuration for automatic deployments.'),
        skipGitConnectDuringLink: z.boolean().optional().describe('When true, skips the Git connect prompt during project linking in the CLI.'),
        composioExecutionMessage: z.string().optional().describe('Message explaining any automatic transformations applied to user input'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Vercel Project (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateProject2 = tool({
    description: 'Tool to create a new Vercel project with comprehensive configuration options. Use when you need to create a project with specific settings like environment variables, framework selection, Git repository connection, resource configuration, or deployment policies.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().describe('The desired name for the project. Must be lowercase and can only contain letters, digits, \'.\', \'_\', and \'-\'. Cannot contain the sequence \'---\'. Maximum 100 characters.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        framework: z.string().optional().describe('The framework being used for this project. When null, no framework is selected'),
        devCommand: z.string().optional().describe('The dev command for this project. When null is used, this value will be automatically detected'),
        buildCommand: z.string().optional().describe('The build command for this project. When null is used, this value will be automatically detected'),
        publicSource: z.boolean().optional().describe('Specifies whether the source code and logs of the deployments for this project should be public or not'),
        gitRepository: z.record(z.any()).optional().describe('Git repository configuration for automatic deployments.'),
        rootDirectory: z.string().optional().describe('The name of a directory or relative path to the source code. When null, it will default to the project root'),
        ssoProtection: z.record(z.any()).optional().describe('SSO protection configuration for the project.'),
        installCommand: z.string().optional().describe('The install command for this project. When null is used, this value will be automatically detected'),
        resourceConfig: z.record(z.any()).optional().describe('Resource override configuration for the project.'),
        oidcTokenConfig: z.record(z.any()).optional().describe('OpenID Connect JSON Web Token generation configuration.'),
        outputDirectory: z.string().optional().describe('The output directory of the project. When null is used, this value will be automatically detected'),
        environmentVariables: z.array(z.record(z.any())).optional().describe('Collection of environment variables the project will use'),
        enablePreviewFeedback: z.boolean().optional().describe('Opt-in to preview toolbar on the project level'),
        previewDeploymentSuffix: z.string().optional().describe('Custom domain suffix for preview deployments. Must be a domain owned by the team'),
        enableProductionFeedback: z.boolean().optional().describe('Opt-in to production toolbar on the project level'),
        serverlessFunctionRegion: z.string().optional().describe('The region to deploy Serverless Functions in this project'),
        skipGitConnectDuringLink: z.boolean().optional().describe('Opts-out of the message prompting a CLI user to connect a Git repository in vercel link'),
        previewDeploymentsDisabled: z.boolean().optional().describe('Specifies whether preview deployments are disabled for this project'),
        commandForIgnoringBuildStep: z.string().optional().describe('Command to determine whether to skip the build step'),
        enableAffectedProjectsDeployments: z.boolean().optional().describe('Opt-in to skip deployments when there are no changes to the root directory and its dependencies'),
        serverlessFunctionZeroConfigFailover: z.boolean().optional().describe('Specifies whether Zero Config Failover is enabled for this project'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Vercel Project (v2) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateProject2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateProjectTransferRequest = tool({
    description: 'Tool to create a project transfer request. Use when you need to initiate a transfer of a Vercel project to another account or team.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The ID or name of the project to transfer.'),
        callbackUrl: z.string().optional().describe('The URL to send a webhook to when the transfer is accepted.'),
        callbackSecret: z.string().optional().describe('The secret to use to sign the webhook payload with HMAC-SHA256.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/transfer-request`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Project Transfer Request failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateProjectTransferRequest', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteProject = tool({
    description: 'Tool to delete a Vercel project by ID or name. Use after confirming the correct project identifier to permanently remove the project.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Vercel Project (v2) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProject = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_GET_PROJECT2 instead. Tool to retrieve information about a Vercel project by ID or name. Use when you need project metadata after obtaining its identifier.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Required for team projects, omit for personal account projects.'),
        projectIdOrName: z.string().describe('The unique project identifier (e.g., \'prj_xxxx\') or project name (e.g., \'my-app\').'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.projectIdOrName}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Vercel Project (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProject2 = tool({
    description: 'Tool to find a project by ID or name with comprehensive details. Use when you need complete project metadata including configuration, deployments, security settings, and analytics.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Find Project by ID or Name failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProject2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetProjects = tool({
    description: 'Tool to retrieve a list of projects from Vercel. Use this to get project information with optional filtering by repository, team, or other criteria.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        from: z.string().optional().describe('Query only projects updated after the given timestamp or continuation token.'),
        repo: z.string().optional().describe('Filter results by repo. Also used for project count.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        limit: z.string().optional().describe('Limit the number of projects returned.'),
        repoId: z.string().optional().describe('Filter results by Repository ID.'),
        search: z.string().optional().describe('Search projects by the name field.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        repoUrl: z.string().optional().describe('Filter results by Repository URL.'),
        deprecated: z.boolean().optional().describe('Filter results by deprecated projects.'),
        edgeConfigId: z.string().optional().describe('Filter results by connected Edge Config ID.'),
        excludeRepos: z.string().optional().describe('Filter results by excluding those projects that belong to a repo.'),
        staticIpsEnabled: z.string().optional().describe('Filter results by projects with Static IPs enabled. Use \'1\' for enabled, \'0\' for disabled.'),
        buildMachineTypes: z.string().optional().describe('Filter results by build machine types. Accepts comma-separated values. Use \'default\' for projects without a build machine type set.'),
        edgeConfigTokenId: z.string().optional().describe('Filter results by connected Edge Config Token ID.'),
        gitForkProtection: z.string().optional().describe('Specifies whether PRs from Git forks should require a team member\'s authorization before it can be deployed. Use \'1\' for enabled, \'0\' for disabled.'),
        elasticConcurrencyEnabled: z.string().optional().describe('Filter results by projects with elastic concurrency enabled. Use \'1\' for enabled, \'0\' for disabled.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Projects failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetProjects', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListProjectMembers = tool({
    description: 'Tool to list all members of a Vercel project. Use when you need to retrieve member information, check access permissions, or audit project membership.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of.'),
        limit: z.number().optional().describe('Maximum number of project members to return per request (1-100, default 20).'),
        since: z.number().optional().describe('Timestamp in milliseconds to only include members added since then.'),
        until: z.number().optional().describe('Timestamp in milliseconds to only include members added until then.'),
        search: z.string().optional().describe('Search project members by their name, username, and email.'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Omit for personal account.'),
        idOrName: z.string().describe('The project\'s unique identifier or project name.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}/members`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Project Members failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListProjectMembers', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListProjects = tool({
    description: 'DEPRECATED: Use GetProjects instead. Tool to list all projects accessible to the authenticated user or team. Use this to retrieve project IDs and metadata for further operations. Results are paginated (max 100 per page); iterate using the `pagination.next` cursor to retrieve all pages — `pagination.count` reflects only the current page, not the total.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        limit: z.number().optional().describe('Maximum number of projects to return (max 100)'),
        since: z.number().optional().describe('Timestamp in milliseconds; include projects created since this time Must be UTC milliseconds; passing seconds or non-UTC values silently excludes expected projects.'),
        until: z.number().optional().describe('Timestamp in milliseconds; include projects created until this time'),
        search: z.string().optional().describe('Search query to filter projects by name'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of. Omit for personal account.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List All Projects (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListProjects', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelPauseProject = tool({
    description: 'Tool to pause a Vercel project. Use when you need to temporarily disable a project to prevent new deployments and stop serving traffic.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique project identifier. Must be the project ID (e.g., \'prj_xxxx\'), not the project name. You can get project IDs from the list projects action.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/pause`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Pause Vercel Project failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelPauseProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUnpauseProject = tool({
    description: 'Tool to unpause a specific project by its ID. Use after identifying a paused project to enable auto assigning custom production domains and unblock the active Production Deployment.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        projectId: z.string().describe('The unique project identifier.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/unpause`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Unpause Vercel Project failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUnpauseProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateProject = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_UPDATE_PROJECT2 instead. Tool to update an existing project. Partial-update: omitted fields are preserved, but nullable fields explicitly set to null will be cleared. Changes (including rootDirectory, buildCommand) only take effect on subsequent deployments — trigger a new deployment with VERCEL_CREATE_NEW_DEPLOYMENT after updating. Use after confirming the project ID or name.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().optional().describe('New name for the project (max 100 characters)'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        gitLFS: z.boolean().optional().describe('Enable Git Large File Storage (LFS) for the project'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier (e.g., prj_xxxx) or project name to update'),
        framework: z.string().optional().describe('The framework preset for the project. Common values: nextjs, react, vue, svelte, nuxtjs, gatsby, angular, astro, remix. Set to null for no framework'),
        devCommand: z.string().optional().describe('The dev command for local development (max 256 chars). Set to null to use framework default'),
        nodeVersion: z.string().optional().describe('Node.js version for builds and serverless functions'),
        buildCommand: z.string().optional().describe('The build command for the project (max 256 chars). Set to null to use framework default'),
        publicSource: z.boolean().optional().describe('Make deployment source code and build logs publicly visible'),
        rootDirectory: z.string().optional().describe('Directory or relative path to project source code (max 256 chars). Set to null for project root'),
        ssoProtection: z.record(z.any()).optional().describe('SSO protection configuration requiring team authentication to access deployments'),
        installCommand: z.string().optional().describe('The install command for dependencies (max 256 chars). Set to null to use auto-detected package manager'),
        oidcTokenConfig: z.record(z.any()).optional().describe('OpenID Connect JSON Web Token generation settings for serverless functions'),
        outputDirectory: z.string().optional().describe('The directory where build output is located (max 256 chars). Set to null for framework default'),
        directoryListing: z.boolean().optional().describe('Show directory listing for folders without an index file'),
        gitForkProtection: z.boolean().optional().describe('Require team member approval before deploying PRs from forked repositories'),
        passwordProtection: z.record(z.any()).optional().describe('Password protection configuration for restricting access to deployments'),
        autoExposeSystemEnvs: z.boolean().optional().describe('Automatically expose Vercel system environment variables (VERCEL, VERCEL_ENV, etc.) to builds'),
        autoAssignCustomDomains: z.boolean().optional().describe('Automatically assign custom domains to new production deployments'),
        serverlessFunctionRegion: z.string().optional().describe('Default region for Serverless Functions (e.g., iad1=Washington DC, sfo1=San Francisco, cdg1=Paris)'),
        previewDeploymentsDisabled: z.boolean().optional().describe('Disable automatic preview deployments for pull requests/branches'),
        commandForIgnoringBuildStep: z.string().optional().describe('Custom command to determine if build should be skipped (exit 0 to skip, exit 1 to build)'),
        customerSupportCodeVisibility: z.boolean().optional().describe('Allow Vercel customer support to view git source for debugging'),
        sourceFilesOutsideRootDirectory: z.boolean().optional().describe('Enable if source files exist outside the configured root directory (for monorepos)'),
        autoAssignCustomDomainsUpdatedBy: z.string().optional().describe('User ID or email who last updated auto-assign custom domains setting'),
        enableAffectedProjectsDeployments: z.boolean().optional().describe('Skip deployments when no changes detected in root directory and its dependencies'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Vercel Project (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateProject', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateProject2 = tool({
    description: 'Tool to update an existing Vercel project configuration. Use when you need to modify project settings such as framework, build commands, environment configuration, or deployment protection settings.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().optional().describe('The desired name for the project'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        gitLFS: z.boolean().optional().describe('Specifies whether Git LFS is enabled for this project'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
        framework: z.string().optional().describe('The framework that is being used for this project. When `null` is used no framework is selected'),
        staticIps: z.record(z.any()).optional().describe('Static IPs configuration.'),
        devCommand: z.string().optional().describe('The dev command for this project. When `null` is used this value will be automatically detected'),
        nodeVersion: z.string().optional().describe('Node.js version for the project'),
        buildCommand: z.string().optional().describe('The build command for this project. When `null` is used this value will be automatically detected'),
        publicSource: z.boolean().optional().describe('Specifies whether the source code and logs of the deployments for this project should be public or not'),
        rootDirectory: z.string().optional().describe('The name of a directory or relative path to the source code of your project. When `null` is used it will default to the project root'),
        ssoProtection: z.record(z.any()).optional().describe('SSO protection configuration.'),
        installCommand: z.string().optional().describe('The install command for this project. When `null` is used this value will be automatically detected'),
        resourceConfig: z.record(z.any()).optional().describe('Resource configuration for the project.'),
        oidcTokenConfig: z.record(z.any()).optional().describe('OIDC token configuration.'),
        outputDirectory: z.string().optional().describe('The output directory of the project. When `null` is used this value will be automatically detected'),
        directoryListing: z.boolean().optional().describe('Whether directory listing is enabled'),
        gitForkProtection: z.boolean().optional().describe('Specifies whether PRs from Git forks should require a team member\'s authorization before it can be deployed'),
        passwordProtection: z.record(z.any()).optional().describe('Password protection configuration.'),
        autoExposeSystemEnvs: z.boolean().optional().describe('Whether to automatically expose system environment variables'),
        enablePreviewFeedback: z.boolean().optional().describe('Opt-in to preview toolbar on the project level'),
        autoAssignCustomDomains: z.boolean().optional().describe('Whether to automatically assign custom domains'),
        previewDeploymentSuffix: z.string().optional().describe('Custom domain suffix for preview deployments. Takes precedence over team-level suffix. Must be a domain owned by the team'),
        enableProductionFeedback: z.boolean().optional().describe('Opt-in to production toolbar on the project level'),
        serverlessFunctionRegion: z.string().optional().describe('The region to deploy Serverless Functions in this project'),
        skipGitConnectDuringLink: z.boolean().optional().describe('Opts-out of the message prompting a CLI user to connect a Git repository in `vercel link`'),
        previewDeploymentsDisabled: z.boolean().optional().describe('Specifies whether preview deployments are disabled for this project'),
        commandForIgnoringBuildStep: z.string().optional().describe('Command to determine if build step should be ignored'),
        customerSupportCodeVisibility: z.boolean().optional().describe('Specifies whether customer support can see git source for a deployment'),
        sourceFilesOutsideRootDirectory: z.boolean().optional().describe('Indicates if there are source files outside of the root directory'),
        autoAssignCustomDomainsUpdatedBy: z.string().optional().describe('User who updated auto-assign custom domains setting'),
        enableAffectedProjectsDeployments: z.boolean().optional().describe('Opt-in to skip deployments when there are no changes to the root directory and its dependencies'),
        serverlessFunctionZeroConfigFailover: z.boolean().optional().describe('Specifies whether Zero Config Failover is enabled for this project'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v9/projects/${p.idOrName}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Vercel Project (v2) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateProject2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateProjectDataCache = tool({
    description: 'Tool to update the data cache feature for a Vercel project. Use when you need to enable or disable data caching for a project\'s deployments.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        disabled: z.boolean().optional().describe('Enable or disable data cache for the project. Set to true to disable, false to enable. Default is false (enabled).'),
        projectId: z.string().describe('The unique project identifier (e.g., \'prj_xxxx\'). Note: Project names are not accepted, only project IDs.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/data-cache`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'PATCH', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Project Data Cache failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateProjectDataCache', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelUpdateProjectProtectionBypass = tool({
    description: 'Tool to update protection bypass for automation on a Vercel project. Use when you need to generate, revoke, or update automation bypass secrets for deployment protection.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        revoke: z.record(z.any()).optional().describe('Instructions for revoking and regenerating an automation bypass.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        update: z.record(z.any()).optional().describe('Instructions for updating an existing automation bypass.'),
        generate: z.record(z.any()).optional().describe('Instructions for generating a new automation bypass secret.'),
        idOrName: z.string().describe('The unique project identifier or the project name'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.idOrName}/protection-bypass`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Update Project Protection Bypass failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelUpdateProjectProtectionBypass', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
