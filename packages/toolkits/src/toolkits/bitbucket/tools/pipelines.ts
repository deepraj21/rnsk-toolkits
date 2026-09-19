// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketListPipelines = tool({
    description: "Tool to find pipelines in a Bitbucket repository. Returns pipeline metadata including state, trigger, and duration. Use when you need to browse pipeline history or check pipeline status.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of pipelines per page (1-100). Bitbucket default is typically 10 if not specified."),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier)."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pipelines");
        }
    },
});

export const bitbucketGetPipeline = tool({
    description: "Retrieve a specified pipeline from a Bitbucket repository. Use when you need to get detailed information about a specific pipeline execution including its status, build number, and results.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) or UUID."),
        workspace: z.string().describe("The workspace ID (slug) or workspace UUID that owns the repository."),
        pipelineUuid: z.string().describe("The pipeline UUID to retrieve. Must be in UUID format, typically enclosed in curly braces."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pipelineUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines/${enc(pipelineUuid)}`);
        } catch (error) {
            return toBbError(error, "Failed to get pipeline");
        }
    },
});

export const bitbucketListPipelineSteps = tool({
    description: "Retrieves all steps for a given pipeline. Use when you need to inspect the individual steps of a pipeline execution, including their state, duration, and commands.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
        pipelineUuid: z.string().describe("The UUID of the pipeline. Must be enclosed in curly braces (e.g., '{f5500ca2-b74d-4e6a-84bf-5d2f73695152}')."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pipelineUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines/${enc(pipelineUuid)}/steps`);
        } catch (error) {
            return toBbError(error, "Failed to list pipeline steps");
        }
    },
});

export const bitbucketStopPipeline = tool({
    description: "Signal the stop of a pipeline and all of its steps that have not completed yet. This action is irreversible — once stopped, a pipeline cannot be restarted and must be re-triggered to run again. Use this action when you need to cancel a running pipeline execution that is no longer needed or was triggered incorrectly.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) or UUID."),
        workspace: z.string().describe("The workspace ID (slug) or workspace UUID that owns the repository."),
        pipelineUuid: z.string().describe("The pipeline UUID to stop. Must be in UUID format, typically enclosed in curly braces."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pipelineUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines/${enc(pipelineUuid)}/stopPipeline`);
        } catch (error) {
            return toBbError(error, "Failed to stop pipeline");
        }
    },
});

export const bitbucketListPipelineSchedules = tool({
    description: "Retrieves configured pipeline schedules for a Bitbucket repository. Use when you need to view scheduled pipeline runs and their cron patterns.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug or identifier of the repository."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines_config/schedules`);
        } catch (error) {
            return toBbError(error, "Failed to list pipeline schedules");
        }
    },
});

export const bitbucketListPipelineCaches = tool({
    description: "Retrieves the repository pipelines caches. Use when you need to list all caches configured for Bitbucket Pipelines in a specific repository.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines-config/caches`);
        } catch (error) {
            return toBbError(error, "Failed to list pipeline caches");
        }
    },
});

export const bitbucketListPipelineRunners = tool({
    description: "Retrieves the list of self-hosted runners configured for a repository's pipelines. Use when you need to view available runners for pipeline execution.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier) for the repository."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository. This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}')."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines-config/runners`);
        } catch (error) {
            return toBbError(error, "Failed to list pipeline runners");
        }
    },
});

export const bitbucketListPipelineSshKnownHosts = tool({
    description: "Retrieves repository-level SSH known hosts configured for Bitbucket Pipelines. Use when you need to list or verify SSH known hosts that Pipelines can connect to during builds.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier) for the repository."),
        workspace: z.string().describe("The workspace slug or UUID. This identifies the Bitbucket workspace that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines_config/ssh/known_hosts`);
        } catch (error) {
            return toBbError(error, "Failed to list pipeline ssh known hosts");
        }
    },
});

export const bitbucketListRepositoryPipelineVariables = tool({
    description: "Retrieves repository-level pipeline variables for a specific Bitbucket repository. Use when you need to view or audit pipeline configuration variables that are scoped to a repository.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string for filtering results using Bitbucket Query Language (BBQL)."),
        page: z.number().int().optional().describe("Page number for pagination. Use this to retrieve subsequent pages of results."),
        sort: z.string().optional().describe("Field to sort results by. Prefix with a hyphen (-) for descending order."),
        pagelen: z.number().int().optional().describe("Number of items to return per page. Controls the size of the paginated response."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, q, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pipelines_config/variables`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list repository pipeline variables");
        }
    },
});

export const bitbucketCreateTeamPipelineVariable = tool({
    description: "Creates a team-level pipeline configuration variable in Bitbucket. Use when you need to add environment variables or configuration values that should be available to all pipelines within a team.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        key: z.string().describe("The name/key of the pipeline variable. Must be unique within the team's pipeline configuration."),
        value: z.string().describe("The value of the pipeline variable. This will be available to all pipelines in the team."),
        secured: z.boolean().optional().describe("Whether the variable should be secured (masked in logs). Set to `True` for sensitive values like passwords or API keys, `False` for non-sensitive values."),
        username: z.string().describe("The team username that owns the pipeline configuration. This is the team identifier in Bitbucket."),
    }),
    execute: async ({ bitbucketToken, username, key, value, secured }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { key, value };
            if (secured !== undefined) body.secured = secured;
            return await bbRequest(bitbucketToken, 'POST', `/teams/${enc(username)}/pipelines_config/variables/`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create team pipeline variable");
        }
    },
});

export const bitbucketUpdateTeamPipelineVariable = tool({
    description: "Updates a team-level pipeline configuration variable in Bitbucket. Use when you need to modify existing environment variables or configuration values that are available to all pipelines within a team.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        key: z.string().describe("The name/key of the pipeline variable. Must be unique within the team's pipeline configuration."),
        value: z.string().describe("The updated value of the pipeline variable. This will be available to all pipelines in the team."),
        secured: z.boolean().optional().describe("Whether the variable should be secured (masked in logs). Set to `True` for sensitive values like passwords or API keys, `False` for non-sensitive values."),
        username: z.string().describe("The team username that owns the pipeline configuration. This is the team identifier in Bitbucket."),
        variableUuid: z.string().describe("The UUID of the pipeline variable to update. This must be in UUID format (e.g., 252a372b-3e5d-4869-9df5-c379d6b062e9) and can be optionally wrapped in curly braces."),
    }),
    execute: async ({ bitbucketToken, username, variableUuid, key, value, secured }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (key !== undefined) body.key = key;
            if (value !== undefined) body.value = value;
            if (secured !== undefined) body.secured = secured;
            return await bbRequest(bitbucketToken, 'PUT', `/teams/${enc(username)}/pipelines_config/variables/${enc(variableUuid)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update team pipeline variable");
        }
    },
});

export const bitbucketCreateUserPipelineVariable = tool({
    description: "Creates a user-level pipeline variable for Bitbucket pipelines. Use when you need to create account-level configuration variables that can be used across all repositories owned by the user.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        key: z.string().describe("The name/key of the pipeline variable. Must be unique for the user."),
        value: z.string().describe("The value of the pipeline variable."),
        secured: z.boolean().optional().describe("Whether the variable should be secured/encrypted (true) or stored as plain text (false). Defaults to false."),
        selectedUser: z.string().describe("The username or UUID of the user. Can be a username (e.g., 'myusername') or a UUID enclosed in curly braces (e.g., '{4f3ecac3-c951-41d4-8a4c-95f40be978fc}')."),
    }),
    execute: async ({ bitbucketToken, selectedUser, key, value, secured }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { key, value };
            if (secured !== undefined) body.secured = secured;
            return await bbRequest(bitbucketToken, 'POST', `/users/${enc(selectedUser)}/pipelines_config/variables/`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create user pipeline variable");
        }
    },
});

export const bitbucketUpdateUserPipelineVariable = tool({
    description: "Updates a user-level pipeline variable for Bitbucket pipelines. Use when you need to modify account-level configuration variables such as changing the value, key name, or security status.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        key: z.string().optional().describe("The updated name/key of the pipeline variable. If omitted, the key remains unchanged."),
        value: z.string().optional().describe("The updated value of the pipeline variable. If omitted, the value remains unchanged."),
        secured: z.boolean().optional().describe("Whether the variable should be secured/encrypted (true) or stored as plain text (false). If omitted, the secured status remains unchanged."),
        selectedUser: z.string().describe("The UUID or username of the user. When using UUID format, it should be URL-encoded (e.g., %7B4f3ecac3-c951-41d4-8a4c-95f40be978fc%7D for {4f3ecac3-c951-41d4-8a4c-95f40be978fc})."),
        variableUuid: z.string().describe("The UUID of the pipeline variable to update. This can be obtained from the list or get variable endpoints."),
    }),
    execute: async ({ bitbucketToken, selectedUser, variableUuid, key, value, secured }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (key !== undefined) body.key = key;
            if (value !== undefined) body.value = value;
            if (secured !== undefined) body.secured = secured;
            return await bbRequest(bitbucketToken, 'PUT', `/users/${enc(selectedUser)}/pipelines_config/variables/${enc(variableUuid)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update user pipeline variable");
        }
    },
});

export const bitbucketDeleteUserPipelineVariable = tool({
    description: "Permanently deletes a user-level pipeline configuration variable identified by its UUID. Use this to remove pipeline variables that are no longer needed at the account level.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        username: z.string().describe("The username of the Bitbucket account that owns the pipeline variable. This is the account identifier."),
        variableUuid: z.string().describe("The UUID of the pipeline variable to delete. This must be in UUID format (e.g., b070fa8a-c3db-42bd-870c-dea7c980c7b8) and can be optionally wrapped in curly braces."),
    }),
    execute: async ({ bitbucketToken, username, variableUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/users/${enc(username)}/pipelines_config/variables/${enc(variableUuid)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete user pipeline variable");
        }
    },
});

export const bitbucketListDeployments = tool({
    description: "Lists deployments for a specified Bitbucket repository. Use when you need to view deployment history and status across environments.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string for filtering deployment results using Bitbucket Query Language (BBQL). Use operators like '=' for exact match, '~' for contains, '!=' for not equal."),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        sort: z.string().optional().describe("Field designation for sorting results. Prefix with '-' for descending order."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to the Bitbucket API's default page length if not specified."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace ID or slug (URL-friendly name). This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}')."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, q, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/deployments`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list deployments");
        }
    },
});

export const bitbucketListRepositoryEnvironments = tool({
    description: "List all deployment environments configured for a Bitbucket repository. Use when you need to view available environments for deployments, check environment configurations, or select an environment for deployment operations.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string for filtering environment results using Bitbucket Query Language (BBQL). Use operators like '=' for exact match, '~' for contains, '!=' for not equal."),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        sort: z.string().optional().describe("Field designation for sorting results. Prefix with '-' for descending order."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to the Bitbucket API's default page length if not specified."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) or UUID."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}')."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, q, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/environments`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list repository environments");
        }
    },
});

export const bitbucketGetRepositoryEnvironment = tool({
    description: "Retrieve detailed information about a specific deployment environment in a Bitbucket repository. Use when you need to get environment configuration, deployment settings, or check environment properties like locks and restrictions.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug or UUID of the repository."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
        environmentUuid: z.string().describe("The UUID of the environment to retrieve. Must include curly braces (e.g., {2e1c3c19-12f2-4e9b-9ed7-45512af9a7ce})."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, environmentUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/environments/${enc(environmentUuid)}`);
        } catch (error) {
            return toBbError(error, "Failed to get repository environment");
        }
    },
});

export const bitbucketListDeploymentEnvironmentVariables = tool({
    description: "Retrieves deployment environment level variables for a specific Bitbucket repository environment. Use when you need to view or audit environment-specific configuration variables for deployments.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
        environmentUuid: z.string().describe("The UUID of the deployment environment. Must be provided with curly braces (e.g., {2e1c3c19-12f2-4e9b-9ed7-45512af9a7ce}). The API will handle URL-encoding automatically."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, environmentUuid }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/deployments_config/environments/${enc(environmentUuid)}/variables`);
        } catch (error) {
            return toBbError(error, "Failed to list deployment environment variables");
        }
    },
});

export const bitbucketGetOpenidConfiguration = tool({
    description: "Retrieves the OpenID Connect discovery configuration for Bitbucket Pipelines OIDC. Use when integrating Bitbucket Pipelines with resource servers (AWS, GCP, Vault) using OpenID Connect authentication. Returns issuer URL, JWKS URI, and supported capabilities.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        workspace: z.string().describe("The workspace identifier (workspace slug or UUID). This identifies the Bitbucket workspace for which to retrieve the OIDC configuration."),
    }),
    execute: async ({ bitbucketToken, workspace }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}/pipelines-config/identity/oidc/.well-known/openid-configuration`);
        } catch (error) {
            return toBbError(error, "Failed to get openid configuration");
        }
    },
});
