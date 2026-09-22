// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { vercelFetch } from './client.js';

export const vercelCreateDeployment = tool({
    description: 'DEPRECATED: Use VERCEL_CREATE_NEW_DEPLOYMENT instead. Create a new deployment on Vercel. Deploys static files or connects to a Git repository. **File-based deployments**: Provide `name` and `files` array with file content (inline HTML/CSS/JS). **Git-based deployments**: Provide `name` and `gitSource` with repository details. IMPORTANT: Always provide either `slug` (team slug) or `teamId` (team ID starting with \'team_\') to specify the team context. Use VERCEL_GET_TEAMS to find the correct team slug. Example minimal file deployment: { "name": "my-project", "slug": "my-team", "files": [{"file": "index.html", "data": "<html><body>Hello World</body></html>"}] }',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        meta: z.record(z.any()).optional().describe('An object containing the deployment\'s metadata. Multiple key-value pairs can be attached to a deployment'),
        name: z.string().describe('A string with the project name used in the deployment URL'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        files: z.array(z.any()).optional().describe('A list of objects with the files to be deployed. Required if not using gitSource.'),
        target: z.string().optional().describe('Either not defined, `staging`, `production`, or a custom environment identifier. If `staging`, a staging alias in the format `<project>-<team>.vercel.app` will be assigned. If `production`, any aliase'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        project: z.string().optional().describe('The target project identifier in which the deployment will be created. When defined, this parameter overrides name'),
        forceNew: z.string().optional().describe('Forces a new deployment even if there is a previous similar deployment'),
        gitSource: z.record(z.any()).optional().describe('Git source information for git-based deployments.'),
        gitMetadata: z.record(z.any()).optional().describe('Git metadata for the deployment.'),
        deploymentId: z.string().optional().describe('An deployment id for an existing deployment to redeploy'),
        monorepoManager: z.string().optional().describe('The monorepo manager that is being used for this deployment. When `null` is used no monorepo manager is selected'),
        projectSettings: z.record(z.any()).optional().describe('Project settings for the deployment.'),
        withLatestCommit: z.boolean().optional().describe('When `true` and `deploymentId` is passed in, the sha from the previous deployment\'s `gitSource` is removed forcing the latest commit to be used.'),
        customEnvironmentSlugOrId: z.string().optional().describe('Deploy to a custom environment, which will override the default environment'),
        skipAutoDetectionConfirmation: z.string().optional().describe('Allows to skip framework detection so the API would not fail to ask for confirmation'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v13/deployments`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create Deployment failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateDeployment', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelCreateNewDeployment = tool({
    description: 'Tool to create a new deployment. Use when you need to deploy files or a Git commit to a Vercel project. Example for file deployment: { "name": "my-app", "files": [ {"file": "index.html", "data": "<html><body>Hello World</body></html>"}, {"file": "style.css", "data": "body { font-family: Arial; }"} ], "target": "production" } Example for Git source deployment (deploy from GitHub branch - uses latest commit): { "name": "my-app", "gitSource": { "type": "github", "repoId": "668449998", "ref": "main" } } Example for Git source deployment (deploy specific commit): { "name": "my-app", "gitSource": { "type": "github", "repoId": "668449998", "ref": "main", "sha": "a1b2c3d4e5f6g7h8i9j0" } } Note: repoId must be the numeric GitHub repository ID (NOT \'owner/repo\'). Get it via: GET https://api.github.com/repos/{owner}/{repo} -> use the \'id\' field. Example for redeployment: { "deploymentId": "dpl_Br7FSrRXuUkSHj7t7GVVadyuGvFg", "target": "production" }',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        meta: z.record(z.any()).optional().describe('User-defined metadata key/value pairs'),
        name: z.string().describe('Name for the deployment. Required by API - must be non-null.'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        files: z.array(z.record(z.any())).optional().describe('List of files for non-git deployments. Required if no gitSource is provided (gitMetadata alone is insufficient).'),
        target: z.string().optional().describe('Deployment target environment'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        project: z.string().optional().describe('Project ID or name to deploy to. Note: Providing a project ID alone is not sufficient - you must also provide deployment source (files, gitSource, or deploymentId).'),
        forceNew: z.string().optional().describe('Forces a new deployment even if there is a previous similar deployment'),
        gitSource: z.record(z.any()).optional().describe('Git source information for git-based deployments'),
        gitMetadata: z.record(z.any()).optional().describe('Git commit metadata for git-based deployments'),
        deploymentId: z.string().optional().describe('Specify an existing deployment ID to redeploy the same version'),
        projectSettings: z.record(z.any()).optional().describe('Project-specific build settings (buildCommand, installCommand, devCommand, outputDirectory, rootDirectory, framework). If not provided or all fields are None, skipAutoDetectionConfirmation=1 is automa'),
        skipAutoDetectionConfirmation: z.string().optional().describe('Allows skipping framework detection confirmation. Required for new projects if projectSettings is not provided'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v13/deployments`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'POST', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Create new deployment failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelCreateNewDeployment', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelDeleteDeployment = tool({
    description: 'Permanently delete a Vercel deployment by its ID or URL. Use this action to remove a deployment from Vercel. The deployment can be identified either by its unique deployment ID (e.g., \'dpl_xxx\') or by providing the deployment URL as a query parameter. Note: This action is destructive and cannot be undone. The deployment will be permanently removed. Do not target the latest production deployment. When filtering deployments by branch or status before deletion, use `meta.githubCommitRef` for branch and `readyState` for status — misreading these fields can cause unintended deletions.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique deployment ID (starts with \'dpl_\'). Required but ignored if \'url\' query parameter is provided.'),
        url: z.string().optional().describe('A deployment URL or alias URL to identify the deployment to delete. When provided, this takes precedence over the \'id\' parameter.'),
        slug: z.string().optional().describe('The Team slug (URL-friendly name) to perform the request on behalf of. Can be used instead of team_id.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of. Required when the deployment belongs to a team.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v13/deployments/${p.id}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'DELETE', teamId, slug, body: rest, query: undefined });
            if (!res.ok) return { error: 'Delete Deployment (V2) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelDeleteDeployment', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeployment = tool({
    description: 'Tool to get a deployment by ID or URL. Use when you need to retrieve detailed information about a specific deployment.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
        idOrUrl: z.string().describe('The unique identifier or hostname of the deployment.'),
        withGitRepoInfo: z.string().optional().describe('Whether to add in gitRepo information.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v13/deployments/${p.idOrUrl}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment by ID or URL failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeployment', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentDetails = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT instead. Retrieves detailed information about a specific deployment. Use after triggering a deployment to inspect status and configuration. Poll with exponential backoff (5–30s) since deployments may remain in QUEUED or BUILDING state for minutes; tight polling triggers HTTP 429. Deployment is live only when readyState=READY and errorCode is absent; other states (QUEUED, BUILDING, CANCELED, ERROR) mean no traffic is served. Build failures surface in readyState=ERROR with errorCode and errorMessage fields — successful creation does not guarantee a successful build. Example: { "idOrUrl": "dpl_Br7FSrRXuUkSHj7t7GVVadyuGvFg" }',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrUrl: z.string().describe('The unique identifier or hostname of the deployment'),
        withGitRepoInfo: z.boolean().optional().describe('Whether to include Git repository information'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v13/deployments/${p.idOrUrl}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get deployment details failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentDetails', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentEvents = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT_EVENTS2 instead. Tool to retrieve events related to a specific deployment. Use when monitoring or debugging deployment history or streaming real-time events. Example: "Get events for deployment dpl_xxx since 1540095775941."',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().optional().describe('Deployment build ID'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of events to return; use -1 for all available logs'),
        since: z.number().optional().describe('Timestamp (ms) for when events should be pulled from Must be UTC milliseconds; seconds or other units yield empty/partial results.'),
        until: z.number().optional().describe('Timestamp (ms) for when events should be pulled up until Must be UTC milliseconds; seconds or other units yield empty/partial results.'),
        builds: z.number().optional().describe('Include build events; set to 1 to enable'),
        follow: z.number().optional().describe('When enabled (1), this endpoint will stream live events as they happen'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrUrl: z.string().describe('Unique identifier (e.g., dpl_xxx) or hostname (e.g., my-deployment.vercel.app) of an existing deployment. Use VERCEL_LIST_ALL_DEPLOYMENTS to find valid deployment IDs.'),
        delimiter: z.number().optional().describe('Include delimiter events; set to 1 to enable'),
        direction: z.string().optional().describe('Order of the returned events based on the timestamp'),
        statusCode: z.string().optional().describe('HTTP status code range to filter events by (e.g., \'5xx\')'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/deployments/${p.idOrUrl}/events`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment Events (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentEvents', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentEvents2 = tool({
    description: 'Tool to get deployment events for a specific Vercel deployment by ID or URL. Use when you need to retrieve build logs, event streams, or monitor deployment progress.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        name: z.string().optional().describe('Deployment build ID'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of events to return. Provide -1 to return all available logs'),
        since: z.number().optional().describe('Timestamp for when build logs should be pulled from'),
        until: z.number().optional().describe('Timestamp for when the build logs should be pulled up until'),
        builds: z.number().optional().describe('Include build events. Set to 1 to enable'),
        follow: z.number().optional().describe('When enabled (1), this endpoint will return live events as they happen'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        idOrUrl: z.string().describe('The unique identifier or hostname of the deployment'),
        delimiter: z.number().optional().describe('Include delimiter events. Set to 1 to enable'),
        direction: z.string().optional().describe('Order of the returned events based on the timestamp. Default is \'forward\''),
        statusCode: z.string().optional().describe('HTTP status code range to filter events by'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/deployments/${p.idOrUrl}/events`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment Events failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentEvents2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentFileContents = tool({
    description: 'Retrieve the contents of a specific file from a Vercel deployment. Returns the file content as a base64-encoded string. First use \'List Deployment Files\' to get the file_id (uid), then use this action to get the actual file contents.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique deployment identifier (starts with \'dpl_\'). Obtain this from the List All Deployments action.'),
        path: z.string().optional().describe('Path to the file to fetch (only for Git deployments)'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        fileId: z.string().describe('The unique file identifier (SHA hash). Obtain this from the \'uid\' field returned by the List Deployment Files action.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v6/deployments/${p.id}/files/${p.fileId}`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment File Contents failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentFileContents', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentLogs = tool({
    description: 'DEPRECATED: Use VERCEL_VERCEL_GET_DEPLOYMENT_EVENTS2 instead. Tool to retrieve logs for a specific Vercel deployment. Use when monitoring deployment execution, debugging issues, or analyzing deployment performance. Example: "Get logs for deployment dpl_xxx since 1540095775941."',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of log entries to return; use -1 for all available logs'),
        since: z.number().optional().describe('Timestamp (ms) for when logs should be pulled from Must be UTC. Wrong timezone or mismatched since/until window yields empty or partial results.'),
        until: z.number().optional().describe('Timestamp (ms) for when logs should be pulled up until'),
        builds: z.number().optional().describe('Include build logs; set to 1 to enable'),
        follow: z.number().optional().describe('When enabled (1), this endpoint will stream live logs as they happen'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        idOrUrl: z.string().describe('Full deployment ID starting with \'dpl_\' prefix (e.g., \'dpl_5WJWYSyB7BpgTj3EuwF37WMRBXBtPQ2iTMJHJBJyRfd\') or deployment hostname (e.g., \'my-app-abc123.vercel.app\'). Short IDs without the \'dpl_\''),
        direction: z.string().optional().describe('Order of the returned logs based on the timestamp'),
        statusCode: z.string().optional().describe('HTTP status code range to filter logs by (e.g., \'5xx\')'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/deployments/${p.idOrUrl}/events`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment Logs (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentLogs', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeploymentLogs2 = tool({
    description: 'Tool to retrieve runtime logs for a specific Vercel deployment by project and deployment ID. Use when you need to debug or monitor deployment execution with detailed runtime information.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        maxLogs: z.number().optional().describe('Maximum number of log entries to return (default: 100). The endpoint streams logs, so this limits how many to collect.'),
        projectId: z.string().describe('The unique identifier of the project'),
        deploymentId: z.string().describe('The unique identifier of the deployment'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/projects/${p.projectId}/deployments/${p.deploymentId}/logs`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployment Runtime Logs failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeploymentLogs2', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelGetDeployments = tool({
    description: 'Tool to list deployments from Vercel. Use when you need to retrieve deployment information for a project or team.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        to: z.number().optional().describe('Gets the deployment created before this Date timestamp. (default: current time)'),
        app: z.string().optional().describe('Name of the deployment to filter by'),
        sha: z.string().optional().describe('Filter deployments based on the SHA'),
        from: z.number().optional().describe('Gets the deployment created after this Date timestamp. (default: current time)'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of deployments to list from a request'),
        since: z.number().optional().describe('Get Deployments created after this JavaScript timestamp'),
        state: z.string().optional().describe('Filter deployments based on their state (BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED)'),
        until: z.number().optional().describe('Get Deployments created before this JavaScript timestamp'),
        users: z.string().optional().describe('Filter out deployments based on users who have created the deployment'),
        branch: z.string().optional().describe('Filter deployments based on the branch name'),
        target: z.string().optional().describe('Filter deployments based on the environment'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of'),
        projectId: z.string().optional().describe('Filter deployments from the given ID or name'),
        projectIds: z.array(z.string()).optional().describe('Filter deployments from the given project IDs. Cannot be used when projectId is specified'),
        rollbackCandidate: z.boolean().optional().describe('Filter deployments based on their rollback candidacy'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v6/deployments`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'Get Deployments failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelGetDeployments', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListAllDeployments = tool({
    description: 'DEPRECATED: Use VERCEL_GET_DEPLOYMENTS instead. Lists deployments under your user or team context. Results are cursor-paginated; follow `pagination.next` until null to retrieve all pages. In team contexts, omitting `teamId` or `slug` will cause deployments to appear missing. Example: "List deployments for project QmX...".',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        app: z.string().optional().describe('Name of the deployment to filter by'),
        sha: z.string().optional().describe('Filter deployments based on the commit SHA'),
        slug: z.string().optional().describe('Team slug to perform the request on behalf of'),
        limit: z.number().optional().describe('Maximum number of deployments to return'),
        since: z.number().optional().describe('Get deployments created after this JavaScript timestamp Value must be in milliseconds UTC.'),
        state: z.string().optional().describe('Comma-separated list of states to filter by. Allowed: BUILDING, ERROR, INITIALIZING, QUEUED, READY, CANCELED'),
        until: z.number().optional().describe('Get deployments created before this JavaScript timestamp'),
        users: z.string().optional().describe('Comma-separated list of user IDs to filter by creator. Example: \'kr1PsOIzqEL5Xg6M4VZcZosf,K4amb7K9dAt5R2vBJWF32bmY\''),
        branch: z.string().optional().describe('Filter deployments based on the branch name'),
        target: z.string().optional().describe('Filter deployments based on the environment (e.g., \'production\')'),
        teamId: z.string().optional().describe('Team identifier to perform the request on behalf of'),
        projectId: z.string().optional().describe('Filter deployments from the given project ID or name'),
        rollbackCandidate: z.boolean().optional().describe('Filter deployments based on rollback candidacy'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v6/deployments`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List All Deployments (Deprecated) failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListAllDeployments', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListDeploymentAliases = tool({
    description: 'Tool to list all aliases assigned to a specific deployment. Use when you need to retrieve the aliases (custom domains or URLs) that point to a particular deployment.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The ID of the deployment the aliases should be listed for'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v2/deployments/${p.id}/aliases`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Deployment Aliases failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListDeploymentAliases', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListDeploymentChecks = tool({
    description: 'Tool to retrieve a list of checks for a specific deployment. Use after a deployment to inspect check statuses and results.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        slug: z.string().optional().describe('Team slug on whose behalf to perform the request.'),
        teamId: z.string().optional().describe('Team ID on whose behalf to perform the request.'),
        deploymentId: z.string().describe('The ID of the deployment to retrieve checks for.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v1/deployments/${p.deploymentId}/checks`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Deployment Checks failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListDeploymentChecks', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});

export const vercelListDeploymentFiles = tool({
    description: 'Tool to list all files in a specific deployment. Use when you need to inspect the file tree structure of a deployed application.',
    inputSchema: z.object({
        vercelToken: z.string().describe('Vercel access token (Bearer).'),
        id: z.string().describe('The unique deployment identifier'),
        slug: z.string().optional().describe('The Team slug to perform the request on behalf of.'),
        teamId: z.string().optional().describe('The Team identifier to perform the request on behalf of.'),
    }),
    execute: async (params) => {
        const { vercelToken, teamId, slug, ...rest } = params as any;
        if (!vercelToken) return { error: 'Vercel token is required. Connect Vercel first.' };
        try {
            const path = (() => { const p: any = rest; return `/v6/deployments/${p.id}/files`; })();
            const res = await vercelFetch(path, { vercelToken, method: 'GET', teamId, slug, body: undefined, query: rest });
            if (!res.ok) return { error: 'List Deployment Files failed', details: res.data };
            return res.data;
        } catch (e) { return { error: 'Error in vercelListDeploymentFiles', message: e instanceof Error ? e.message : 'Unknown error' }; }
    },
});
