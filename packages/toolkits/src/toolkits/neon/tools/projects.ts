// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonAcceptProjectsTransferRequests = tool({
    description: "Tool to accept a transfer request for a Neon project. Use when you need to accept an existing transfer request to transfer a project to your account or a specific organization.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        orgId: z.string().optional().describe("The Neon organization ID to transfer the project to (e.g., 'org-holy-recipe-01602027'). If not provided, the project will be transferred to the current user or organization account."),
        projectId: z.string().describe("The Neon project ID (e.g., 'small-recipe-63664710'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        requestId: z.string().describe("The Neon project transfer request ID (e.g., 'a321073e-3947-4545-bf4a-c6d5835226e7'). Obtain via NEON_CREATE_PROJECTS_TRANSFER_REQUESTS action."),
    }),
    execute: async ({ neonApiKey, orgId, projectId, requestId }) => {
        const queryParams = undefined;
        const body = {};
        if (orgId !== undefined) setNested(body, 'org_id', orgId);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/transfer_requests/${encodeURIComponent(requestId)}`, method: 'PUT', query: queryParams, body });
    },
});

export const neonAccessProjectDetailsById = tool({
    description: "Retrieves detailed information about a specific Neon serverless Postgres project. Returns comprehensive project data including configuration, database settings, compute resources, owner information, and consumption metrics. Use this action when you need to: - Get project configuration details (region, PostgreSQL version, settings) - Check project ownership and organization membership - Review compute and storage consumption metrics - Verify project settings before making updates The action is read-only and safe to call frequently. For listing multiple projects, use the retrieve_projects_list action instead.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique Neon project ID. This is a string identifier in the format 'adjective-noun-number' (e.g., 'dry-smoke-26258271'). You can obtain project IDs by listing projects using the retrieve_projects_list action."),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}`, method: 'GET', query: queryParams });
    },
});

export const neonAddNewJwksToProjectEndpoint = tool({
    description: "Adds a new JSON Web Key Set (JWKS) URL to a Neon project for JWT-based authentication. The JWKS URL must point to a valid HTTPS endpoint that returns cryptographic keys used to verify JSON Web Tokens (JWTs). Use this action to configure authentication with identity providers like Google, Microsoft, Apple, Auth0, Clerk, or Stytch. The JWKS can be scoped to specific branches and mapped to database roles. Maximum of 10 role names can be associated with each JWKS configuration.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        jwksUrl: z.string().describe("A valid HTTPS URL that returns a JSON Web Key Set (JWKS) for JWT verification. Examples: https://www.googleapis.com/oauth2/v3/certs (Google), https://login.microsoftonline.com/common/discovery/v2.0/keys (Microsoft), https://appleid.apple.com/auth/keys (Apple)."),
        branchId: z.string().optional().describe("The Neon branch ID to associate the JWKS with. If omitted, the JWKS applies to all branches in the project."),
        projectId: z.string().describe("The Neon project ID"),
        roleNames: z.array(z.string()).optional().describe("List of database role names that the JWKS should be mapped to. If omitted, defaults to authenticator, authenticated, and anonymous roles. Maximum of 10 role names allowed."),
        jwtAudience: z.string().optional().describe("The required 'aud' (audience) claim value that must be present in JWTs for authentication. Used to ensure tokens are intended for your specific application."),
        providerName: z.string().describe("The name of the authentication provider (e.g., Clerk, Stytch, Auth0)"),
    }),
    execute: async ({ neonApiKey, jwksUrl, branchId, projectId, roleNames, jwtAudience, providerName }) => {
        const queryParams = undefined;
        const body = {};
        if (jwksUrl !== undefined) setNested(body, 'jwks_url', jwksUrl);
        if (branchId !== undefined) setNested(body, 'branch_id', branchId);
        if (roleNames !== undefined) setNested(body, 'role_names', roleNames);
        if (jwtAudience !== undefined) setNested(body, 'jwt_audience', jwtAudience);
        if (providerName !== undefined) setNested(body, 'provider_name', providerName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/jwks`, method: 'POST', query: queryParams, body });
    },
});

export const neonAddProjectEmailPermission = tool({
    description: "Adds permissions for a specified email address to a particular project within the Neon B2B SaaS integration platform. This endpoint is used to grant access or specific rights to users for a given project, enabling collaboration and controlled resource sharing. It should be called when you need to add a new user to a project or modify existing user permissions. The endpoint associates the provided email with the specified project, likely setting up default or predefined permission levels. Note that this endpoint only adds permissions and does not provide information about existing permissions or remove them.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        email: z.string().describe("The email address of the user to grant project access to. The user will receive access to the project associated with this email address. Must be a valid email format (e.g., 'user@example.com')."),
        projectId: z.string().describe("The unique identifier of the Neon project to grant access to. Project IDs follow the pattern of lowercase alphanumeric characters with hyphens (e.g., 'dry-smoke-26258271'). You can obtain this from the project list or project details."),
    }),
    execute: async ({ neonApiKey, email, projectId }) => {
        const queryParams = undefined;
        const body = {};
        if (email !== undefined) setNested(body, 'email', email);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/permissions`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateProjectsTransferRequests = tool({
    description: "Tool to create a transfer request for a Neon project. Use when you need to transfer a project to another account or organization. The transfer request has an expiration time after which it can no longer be used.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID (e.g., 'small-recipe-63664710'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        ttlSeconds: z.number().int().optional().describe("Specifies the validity duration of the transfer request in seconds. If not provided, the request will expire after 24 hours (86,400 seconds)."),
    }),
    execute: async ({ neonApiKey, projectId, ttlSeconds }) => {
        const queryParams = undefined;
        const body = {};
        if (ttlSeconds !== undefined) setNested(body, 'ttl_seconds', ttlSeconds);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/transfer_requests`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateProjectWithQuotaAndSettings = tool({
    description: "Creates a new Neon project with specified configuration settings. This endpoint allows you to set up a customized PostgreSQL environment with various options for resource management, networking, and performance optimization. It's ideal for initializing a new database project with tailored settings for quota management, IP access control, autoscaling, and more. Use this when you need to establish a new Neon project with specific requirements or when you want to take advantage of Neon's advanced features like logical replication or custom maintenance windows. Note that some settings, once configured, may not be easily changed later, so careful consideration of your project needs is recommended before creation.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectName: z.string().optional().describe("The project name"),
        projectOrgId: z.string().optional().describe("Organization id in case the project created belongs to an organization. If not present, project is owned by a user and not by org.  "),
        projectRegionId: z.string().optional().describe("The region identifier. Refer to our [Regions](https://neon.tech/docs/introduction/regions) documentation for supported regions. Values are specified in this format: 'aws-us-east-1'  "),
        projectPgVersion: z.number().int().optional().describe("The major Postgres version number. Currently supported versions are '14', '15', '16', and '17'. "),
        projectProvisioner: z.string().optional().describe("The Neon compute provisioner. Specify the 'k8s-neonvm' provisioner to create a compute endpoint that supports Autoscaling. Provisioner can be one of the following values: * k8s-pod * k8s-neonvm Clients must expect, that any string value that is not documented in the description above should be treated as a error. UNKNOWN value if safe to treat as an error too.  "),
        projectBranchName: z.string().optional().describe("The default branch name. If not specified, the default branch name, 'main', will be used.  "),
        projectStorePasswords: z.boolean().optional().describe("Whether or not passwords are stored for roles in the Neon project. Storing passwords facilitates access to Neon features that require authorization.  "),
        projectBranchRoleName: z.string().optional().describe("The role name. If not specified, the default role name, '{database_name}_owner', will be used.  "),
        projectBranchDatabaseName: z.string().optional().describe("The database name. If not specified, the default database name, 'neondb', will be used.  "),
        projectAutoscalingLimitMaxCu: z.number().int().optional().describe("Autoscaling Limit Max Cu"),
        projectAutoscalingLimitMinCu: z.number().int().optional().describe("Autoscaling Limit Min Cu"),
        projectHistoryRetentionSeconds: z.number().int().optional().describe("The number of seconds to retain the shared history for all branches in this project. The default is 1 day (86400 seconds).  "),
        projectSettingsAllowedIpsIps: z.array(z.string()).optional().describe("A list of IP addresses that are allowed to connect to the endpoint."),
        projectSettingsBlockVpcConnections: z.boolean().optional().describe("When set, connections using VPC endpoints are disallowed. This parameter is under active development and its semantics may change in the future.  "),
        projectSettingsBlockPublicConnections: z.boolean().optional().describe("When set, connections from the public internet are disallowed. This supersedes the AllowedIPs list. This parameter is under active development and its semantics may change in the future.  "),
        projectSettingsQuotaLogicalSizeBytes: z.number().int().optional().describe("Limit on the logical size of every project\"s branch. "),
        projectSettingsQuotaWrittenDataBytes: z.number().int().optional().describe("Total amount of data written to all of a project\"s branches. "),
        projectSettingsEnableLogicalReplication: z.boolean().optional().describe("Sets wal_level=logical for all compute endpoints in this project. All active endpoints will be suspended. Once enabled, logical replication cannot be disabled.  "),
        projectSettingsQuotaActiveTimeSeconds: z.number().int().optional().describe("The total amount of wall-clock time allowed to be spent by the project\"s compute endpoints.  "),
        projectSettingsQuotaDataTransferBytes: z.number().int().optional().describe("Total amount of data transferred from all of a project\"s branches using the proxy.  "),
        projectSettingsMaintenanceWindowWeekdays: z.array(z.number().int()).optional().describe("A list of weekdays when the maintenance window is active. Encoded as ints, where 1 - Monday, and 7 - Sunday.  "),
        projectSettingsQuotaComputeTimeSeconds: z.number().int().optional().describe("The total amount of CPU seconds allowed to be spent by the project\"s compute endpoints.  "),
        projectSettingsMaintenanceWindowEndTime: z.string().optional().describe("End time of the maintenance window, in the format of \"HH:MM\". Uses UTC. "),
        projectDefaultEndpointSettingsPgSettings: z.record(z.any()).optional().describe("A raw representation of Postgres settings"),
        projectSettingsMaintenanceWindowStartTime: z.string().optional().describe("Start time of the maintenance window, in the format of \"HH:MM\". Uses UTC.  "),
        projectDefaultEndpointSettingsPgbouncerSettings: z.record(z.any()).optional().describe("A raw representation of PgBouncer settings"),
        projectDefaultEpSettingsSuspendTimeoutSeconds: z.number().int().optional().describe("Duration of inactivity in seconds after which the compute endpoint is automatically suspended. The value '0' means use the global default. The value '-1' means never suspend. The default value is '300' seconds (5 minutes). The minimum value is '60' seconds (1 minute). The maximum value is '604800' seconds (1 week). For more information, see [Auto-suspend configuration](https://neon.tech/docs/manage/endpoints#auto-suspend-configuration).  "),
        projectSettingsAllowedIpsProtectedBranchesOnly: z.boolean().optional().describe("If true, the list will be applied only to protected branches."),
        projectDefaultEpSettingsAutoscalingLimitMaxCu: z.number().int().optional().describe("Autoscaling Limit Max Cu"),
        projectDefaultEpSettingsAutoscalingLimitMinCu: z.number().int().optional().describe("Autoscaling Limit Min Cu"),
    }),
    execute: async ({ neonApiKey, projectName, projectOrgId, projectRegionId, projectPgVersion, projectProvisioner, projectBranchName, projectStorePasswords, projectBranchRoleName, projectBranchDatabaseName, projectAutoscalingLimitMaxCu, projectAutoscalingLimitMinCu, projectHistoryRetentionSeconds, projectSettingsAllowedIpsIps, projectSettingsBlockVpcConnections, projectSettingsBlockPublicConnections, projectSettingsQuotaLogicalSizeBytes, projectSettingsQuotaWrittenDataBytes, projectSettingsEnableLogicalReplication, projectSettingsQuotaActiveTimeSeconds, projectSettingsQuotaDataTransferBytes, projectSettingsMaintenanceWindowWeekdays, projectSettingsQuotaComputeTimeSeconds, projectSettingsMaintenanceWindowEndTime, projectDefaultEndpointSettingsPgSettings, projectSettingsMaintenanceWindowStartTime, projectDefaultEndpointSettingsPgbouncerSettings, projectDefaultEpSettingsSuspendTimeoutSeconds, projectSettingsAllowedIpsProtectedBranchesOnly, projectDefaultEpSettingsAutoscalingLimitMaxCu, projectDefaultEpSettingsAutoscalingLimitMinCu }) => {
        const queryParams = undefined;
        const body = {};
        if (projectName !== undefined) setNested(body, 'project.name', projectName);
        if (projectOrgId !== undefined) setNested(body, 'project.org_id', projectOrgId);
        if (projectRegionId !== undefined) setNested(body, 'project.region_id', projectRegionId);
        if (projectPgVersion !== undefined) setNested(body, 'project.pg_version', projectPgVersion);
        if (projectProvisioner !== undefined) setNested(body, 'project.provisioner', projectProvisioner);
        if (projectBranchName !== undefined) setNested(body, 'project.branch.name', projectBranchName);
        if (projectStorePasswords !== undefined) setNested(body, 'project.store_passwords', projectStorePasswords);
        if (projectBranchRoleName !== undefined) setNested(body, 'project.branch.role_name', projectBranchRoleName);
        if (projectBranchDatabaseName !== undefined) setNested(body, 'project.branch.database_name', projectBranchDatabaseName);
        if (projectAutoscalingLimitMaxCu !== undefined) setNested(body, 'project.autoscaling_limit_max_cu', projectAutoscalingLimitMaxCu);
        if (projectAutoscalingLimitMinCu !== undefined) setNested(body, 'project.autoscaling_limit_min_cu', projectAutoscalingLimitMinCu);
        if (projectHistoryRetentionSeconds !== undefined) setNested(body, 'project.history_retention_seconds', projectHistoryRetentionSeconds);
        if (projectSettingsAllowedIpsIps !== undefined) setNested(body, 'project.settings.allowed_ips.ips', projectSettingsAllowedIpsIps);
        if (projectSettingsBlockVpcConnections !== undefined) setNested(body, 'project.settings.block_vpc_connections', projectSettingsBlockVpcConnections);
        if (projectSettingsBlockPublicConnections !== undefined) setNested(body, 'project.settings.block_public_connections', projectSettingsBlockPublicConnections);
        if (projectSettingsQuotaLogicalSizeBytes !== undefined) setNested(body, 'project.settings.quota.logical_size_bytes', projectSettingsQuotaLogicalSizeBytes);
        if (projectSettingsQuotaWrittenDataBytes !== undefined) setNested(body, 'project.settings.quota.written_data_bytes', projectSettingsQuotaWrittenDataBytes);
        if (projectSettingsEnableLogicalReplication !== undefined) setNested(body, 'project.settings.enable_logical_replication', projectSettingsEnableLogicalReplication);
        if (projectSettingsQuotaActiveTimeSeconds !== undefined) setNested(body, 'project.settings.quota.active_time_seconds', projectSettingsQuotaActiveTimeSeconds);
        if (projectSettingsQuotaDataTransferBytes !== undefined) setNested(body, 'project.settings.quota.data_transfer_bytes', projectSettingsQuotaDataTransferBytes);
        if (projectSettingsMaintenanceWindowWeekdays !== undefined) setNested(body, 'project.settings.maintenance_window.weekdays', projectSettingsMaintenanceWindowWeekdays);
        if (projectSettingsQuotaComputeTimeSeconds !== undefined) setNested(body, 'project.settings.quota.compute_time_seconds', projectSettingsQuotaComputeTimeSeconds);
        if (projectSettingsMaintenanceWindowEndTime !== undefined) setNested(body, 'project.settings.maintenance_window.end_time', projectSettingsMaintenanceWindowEndTime);
        if (projectDefaultEndpointSettingsPgSettings !== undefined) setNested(body, 'project.default_endpoint_settings.pg_settings', projectDefaultEndpointSettingsPgSettings);
        if (projectSettingsMaintenanceWindowStartTime !== undefined) setNested(body, 'project.settings.maintenance_window.start_time', projectSettingsMaintenanceWindowStartTime);
        if (projectDefaultEndpointSettingsPgbouncerSettings !== undefined) setNested(body, 'project.default_endpoint_settings.pgbouncer_settings', projectDefaultEndpointSettingsPgbouncerSettings);
        if (projectDefaultEpSettingsSuspendTimeoutSeconds !== undefined) setNested(body, 'project.default_endpoint_settings.suspend_timeout_seconds', projectDefaultEpSettingsSuspendTimeoutSeconds);
        if (projectSettingsAllowedIpsProtectedBranchesOnly !== undefined) setNested(body, 'project.settings.allowed_ips.protected_branches_only', projectSettingsAllowedIpsProtectedBranchesOnly);
        if (projectDefaultEpSettingsAutoscalingLimitMaxCu !== undefined) setNested(body, 'project.default_endpoint_settings.autoscaling_limit_max_cu', projectDefaultEpSettingsAutoscalingLimitMaxCu);
        if (projectDefaultEpSettingsAutoscalingLimitMinCu !== undefined) setNested(body, 'project.default_endpoint_settings.autoscaling_limit_min_cu', projectDefaultEpSettingsAutoscalingLimitMinCu);
        return neon(neonApiKey, { path: `/projects`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateVpcEndpointLabel = tool({
    description: "Sets or updates a VPC endpoint restriction for a Neon project. When a VPC endpoint restriction is set, the project only accepts connections from the specified VPC endpoint, providing network-level security isolation. This is useful for Private Networking scenarios where you want to restrict database access to only connections coming through a specific AWS VPC endpoint. The VPC endpoint must first be assigned to the parent organization (using the organization-level VPC endpoint API) before it can be used as a project restriction. The operation is idempotent - repeated calls with the same parameters will not create additional changes. Note: This is a paid feature requiring a Neon Business or Enterprise plan.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        label: z.string().describe("A descriptive label for the VPC endpoint restriction. Used for identification and organization purposes. Example: 'Production VPC' or 'Dev Environment'."),
        projectId: z.string().describe("The Neon project ID. Must match pattern ^[a-z0-9-]{1,60}$. Example: 'dry-smoke-26258271'."),
        vpcEndpointId: z.string().describe("The AWS VPC endpoint ID to restrict connections to. Must start with 'vpce-' prefix followed by alphanumeric characters. Example: 'vpce-0f00567fa8EXAMPLE'. The VPC endpoint must first be assigned to the organization before it can be used as a project restriction."),
    }),
    execute: async ({ neonApiKey, label, projectId, vpcEndpointId }) => {
        const queryParams = undefined;
        const body = {};
        if (label !== undefined) setNested(body, 'label', label);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/vpc_endpoints/${encodeURIComponent(vpcEndpointId)}`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteProjectById = tool({
    description: "Permanently deletes a Neon PostgreSQL project and all its associated resources. WARNING: This is a destructive operation that cannot be undone. All data, branches, endpoints, databases, and configurations will be permanently removed. Use this action when: - A project is no longer needed - Cleaning up test/development resources - Removing unused projects to free up quota Returns the details of the deleted project upon successful deletion. Returns 404 if the project does not exist or is not accessible.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique Neon project ID to delete. This is a string identifier in the format 'adjective-noun-number' (e.g., 'cool-breeze-12345678'). Can be obtained from project creation or list projects API."),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteProjectJwksById = tool({
    description: "Deletes a specific JSON Web Key Set (JWKS) associated with a given project in the Neon B2B SaaS integration platform. This endpoint is used to remove outdated or unnecessary cryptographic keys from a project's key management system. It should be used when rotating keys, decommissioning integrations, or as part of regular key hygiene practices. The operation is irreversible, so caution should be exercised to ensure the correct JWKS is being deleted. This endpoint does not provide information about the JWKS being deleted or return the deleted keys for security reasons.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        jwksId: z.string().describe("The JWKS ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, jwksId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/jwks/${encodeURIComponent(jwksId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteProjectPermission = tool({
    description: "Deletes a specific permission associated with a project in the Neon B2B SaaS integration platform. This endpoint is used to remove access rights or privileges from a project, which is crucial for maintaining proper access control and security. It should be used when you need to revoke or remove a particular permission that is no longer required or valid for the project. This operation is permanent and cannot be undone, so it should be used with caution. The endpoint requires both the project ID and the specific permission ID to ensure precise permission management within the project context.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique identifier of the Neon project. Format: lowercase-words-numbers (e.g., 'dry-smoke-26258271'). Can be obtained from the projects list endpoint."),
        permissionId: z.string().describe("The unique identifier (UUID) of the permission to revoke. Format: UUID (e.g., '92a6ce17-b30d-40ce-aa30-bd0d1dc0de1c'). Can be obtained from the project permissions list endpoint."),
    }),
    execute: async ({ neonApiKey, projectId, permissionId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/permissions/${encodeURIComponent(permissionId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteVpcEndpointByProjectId = tool({
    description: "Deletes a specific VPC endpoint within a designated project in the Neon platform. This endpoint should be used when you need to remove a VPC endpoint that is no longer required or has become obsolete. The operation is irreversible, so it should be used with caution. Once a VPC endpoint is deleted, any connections or integrations relying on it will be disrupted. This endpoint is particularly useful for cleaning up resources and managing network configurations in your Neon projects.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
        vpcEndpointId: z.string().describe("The VPC endpoint ID"),
    }),
    execute: async ({ neonApiKey, projectId, vpcEndpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/vpc_endpoints/${encodeURIComponent(vpcEndpointId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonGetAvailablePreloadLibraries = tool({
    description: "Retrieves the list of available shared preload libraries for a Neon project. Shared preload libraries are PostgreSQL extensions that can be loaded at server startup using the shared_preload_libraries setting. Use this action when you need to: - Discover which PostgreSQL extensions are available for your project - Check versions of available extensions (TimescaleDB, pg_cron, etc.) - Identify experimental vs. stable extensions before configuration - Review default libraries included in your project configuration Returns details about each library including name, version, description, and whether it's experimental or included by default. Common extensions include timescaledb (time-series data), pg_cron (job scheduling), pg_partman_bgw (partition management), and vector search extensions.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique Neon project ID (e.g., 'proud-meadow-87189985'). Can be found in the Neon console URL or via the list projects API."),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/available_preload_libraries`, method: 'GET', query: queryParams });
    },
});

export const neonGetConsumptionHistoryProjects = tool({
    description: "Retrieves consumption history for projects within a Neon organization. IMPORTANT: This endpoint is only available for Scale, Business, and Enterprise plan accounts. Free and Launch plans do not have access to this endpoint. Returns metrics including: - active_time_seconds: Time computes were active - compute_time_seconds: Total CPU seconds used (2 CPUs for 1 second = 2) - written_data_bytes: Data written to branches - synthetic_storage_size_bytes: Total storage occupied The org_id parameter is required to identify which organization's projects to query. Results are ordered chronologically (oldest to newest). Rate limit: ~30 requests/minute shared with account consumption endpoint. Note: This API call does NOT wake sleeping compute endpoints.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        to: z.string().describe("Specify the end 'date-time' for the consumption period. The 'date-time' value is rounded according to the specified granularity. For example, '2024-03-15T15:30:00Z' for 'daily' granularity will be rounded to '2024-03-15T00:00:00Z'. The specified 'date-time' value must respect the specified 'granularity': - For 'hourly', consumption metrics are limited to the last 168 hours. - For 'daily', consumption metrics are limited to the last 60 days. - For 'monthly', consumption metrics are limited to the last year.  "),
        from: z.string().describe("Specify the start 'date-time' for the consumption period. The 'date-time' value is rounded according to the specified 'granularity'. For example, '2024-03-15T15:30:00Z' for 'daily' granularity will be rounded to '2024-03-15T00:00:00Z'. The specified 'date-time' value must respect the specified 'granularity': - For 'hourly', consumption metrics are limited to the last 168 hours. - For 'daily', consumption metrics are limited to the last 60 days. - For 'monthly', consumption metrics are limited to the last year. The consumption history is available starting from 'March 1, 2024, at 00:00:00 UTC'.  "),
        limit: z.number().int().optional().describe("Specify a value from 1 to 100 to limit number of projects in the response. "),
        cursor: z.string().optional().describe("Specify the cursor value from the previous response to get the next batch of projects. "),
        orgId: z.string().optional().describe("The organization ID to retrieve project consumption metrics for. IMPORTANT: This parameter is effectively required - API returns an error without it. Get your org_id from NEON_GET_USER_ORGANIZATIONS. Format: 'org-xxxx-xxxx-xxxxxxxx'."),
        granularity: z.enum(["hourly", "daily", "monthly"]).describe("Specify the granularity of consumption metrics. Hourly, daily, and monthly metrics are available for the last 168 hours, 60 days, and 1 year, respectively.  "),
        projectIds: z.array(z.string()).optional().describe("Specify a list of project IDs to filter the response. If omitted, the response will contain all projects. A list of project IDs can be specified as an array of parameter values or as a comma-separated list in a single parameter value. - As an array of parameter values: 'project_ids=cold-poetry-09157238%20&project_ids=quiet-snow-71788278' - As a comma-separated list in a single parameter value: 'project_ids=cold-poetry-09157238,quiet-snow-71788278'  "),
        includeV1Metrics: z.boolean().optional().describe("Include metrics utilized in previous pricing models. - **data_storage_bytes_hour**: The sum of the maximum observed storage values for each hour,   which never decreases.  "),
    }),
    execute: async ({ neonApiKey, to, from, limit, cursor, orgId, granularity, projectIds, includeV1Metrics }) => {
        const queryParams = { to: to, from: from, limit: limit, cursor: cursor, org_id: orgId, granularity: granularity, project_ids: projectIds, include_v1_metrics: includeV1Metrics };
        return neon(neonApiKey, { path: `/consumption_history/projects`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectConnectionUri = tool({
    description: "Retrieves the connection URI for a specified project within the Neon B2B SaaS integration platform. This endpoint is crucial for establishing connectivity to a project's resources, enabling access to its data and functionalities. Use this when you need to programmatically obtain the connection details for a specific project, which is essential for integrating with the project's data sources or services. The connection URI serves as a unique identifier and access point for the project, facilitating seamless data exchange and workflow automation between different systems and applications within the Neon ecosystem.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        pooled: z.boolean().optional().describe("Adds the '-pooler' option to the connection URI when set to 'true', creating a pooled connection URI. "),
        branchId: z.string().optional().describe("The branch ID. Defaults to the project's default branch_id if not specified. The branch must have an associated compute endpoint."),
        roleName: z.string().describe("The PostgreSQL role name to use for authentication (e.g., 'neondb_owner')."),
        projectId: z.string().describe("The Neon project ID"),
        endpointId: z.string().optional().describe("The compute endpoint ID (starts with 'ep-'). Defaults to the read-write endpoint associated with the branch_id if not specified. Required if the branch has multiple endpoints or no default read-write endpoint."),
        databaseName: z.string().describe("The name of the database to connect to within the branch (e.g., 'neondb')."),
    }),
    execute: async ({ neonApiKey, pooled, branchId, roleName, projectId, endpointId, databaseName }) => {
        const queryParams = { pooled: pooled, branch_id: branchId, role_name: roleName, endpoint_id: endpointId, database_name: databaseName };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/connection_uri`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectEndpointInformation = tool({
    description: "Retrieves a list of all compute endpoints associated with a specific Neon project. Compute endpoints are the connection points for your Neon PostgreSQL databases. Use this action to get information about endpoint hosts, states, autoscaling settings, and connection pooling configuration. Each endpoint is associated with a branch and includes details like the hostname for database connections, current state (active/idle/suspended), compute unit limits, and region. This is useful for monitoring endpoint health, getting connection strings, or managing compute resources.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique identifier for a Neon project (e.g., 'calm-breeze-57229290'). Can be obtained from the projects list endpoint."),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints`, method: 'GET', query: queryParams });
    },
});

export const neonGetProjectOperationById = tool({
    description: "Retrieves detailed information about a specific operation within a Neon serverless PostgreSQL project. Use this endpoint to check the status and details of operations such as compute start/suspend, branch creation/deletion, configuration changes, or timeline operations. This is useful for monitoring long-running tasks, verifying operation completion, or debugging failures. Requires both a project ID and operation ID. Returns operation details including status ('scheduling', 'running', 'finished', 'failed'), duration, and associated branch/endpoint IDs. This is a read-only endpoint.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Can be obtained from the list projects endpoint."),
        operationId: z.string().describe("The unique identifier (UUID) of the operation to retrieve (e.g., 'f3bcadce-07ac-4c2f-8dae-182d02da1518'). Can be obtained from the list project operations endpoint."),
    }),
    execute: async ({ neonApiKey, projectId, operationId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/operations/${encodeURIComponent(operationId)}`, method: 'GET', query: queryParams });
    },
});

export const neonListSharedProjects = tool({
    description: "Retrieves a list of Neon Postgres projects shared with your account. Returns projects that other users have granted you access to, along with pagination info. Use this to view and manage collaborative database projects. Supports filtering by project name/ID and pagination for large result sets.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        limit: z.number().int().optional().describe("Maximum number of projects to return per page (1-400). Defaults to 10."),
        cursor: z.string().optional().describe("Pagination cursor from a previous response to retrieve the next page of results. Omit for the first request."),
        search: z.string().optional().describe("Filter projects by name or project ID. Case-insensitive partial match."),
    }),
    execute: async ({ neonApiKey, limit, cursor, search }) => {
        const queryParams = { limit: limit, cursor: cursor, search: search };
        return neon(neonApiKey, { path: `/projects/shared`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveJwksForProject = tool({
    description: "Retrieves the JSON Web Key Set (JWKS) for a specified project. This endpoint should be used when a client needs to obtain the public keys necessary for verifying JSON Web Tokens (JWTs) issued by the project. The JWKS contains the cryptographic keys used in the project's authentication process. It's essential for implementing secure, token-based authentication in applications integrated with the Neon platform. This endpoint is typically called during the initial setup of a client application or when rotating security keys. Note that the JWKS should be cached by clients to reduce unnecessary API calls, but periodic refreshes are recommended to ensure up-to-date keys.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/jwks`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveProjectOperations = tool({
    description: "Retrieves a list of operations associated with a specific project in the Neon B2B SaaS integration platform. This endpoint should be used when you need to fetch all operations related to a particular project, such as for monitoring ongoing tasks, auditing completed actions, or planning future integrations. It provides a comprehensive view of the project's operational landscape, which is crucial for managing complex integration workflows. Note that this endpoint only returns the operations list and may not include detailed information about each operation's current status or results; separate API calls might be necessary for such details.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        limit: z.number().int().optional().describe("Specify a value from 1 to 1000 to limit number of operations in the response "),
        cursor: z.string().optional().describe("Specify the cursor value from the previous response to get the next batch of operations "),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, limit, cursor, projectId }) => {
        const queryParams = { limit: limit, cursor: cursor };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/operations`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveProjectPermissions = tool({
    description: "Retrieves the current permissions settings for a specific project within the Neon B2B SaaS integration platform. This endpoint allows users to view the access rights and roles assigned to various users or entities for the specified project. It should be used when you need to audit or review the current permission structure of a project, such as before making changes or for compliance checks. The endpoint returns a comprehensive list of permissions but does not modify any settings. It's important to note that this endpoint only provides a snapshot of permissions at the time of the call and does not reflect any pending changes or provide historical permission data.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("Project Id"),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/permissions`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveProjectsList = tool({
    description: "Retrieves a list of all Neon projects associated with the authenticated user's account. This endpoint provides a comprehensive overview of the user's projects, enabling efficient project management and integration workflows. It should be used when you need to obtain information about multiple projects at once, such as for dashboard displays, project selection interfaces, or batch processing tasks. The endpoint returns project details in JSON format, which can be easily parsed and utilized in various applications or data analysis processes. Note that while this endpoint gives a broad view of projects, it may not include detailed data sets or specific project contents, which might require additional API calls. IMPORTANT: When using a Personal API key with an organization account, the org_id parameter is REQUIRED. If you don't know the org_id, first call NEON_GET_USER_ORGANIZATIONS to discover it. Organization API keys don't need org_id as they're already scoped to an organization.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        limit: z.number().int().optional().describe("Specify a value from 1 to 400 to limit number of projects in the response. "),
        cursor: z.string().optional().describe("Specify the cursor value from the previous response to retrieve the next batch of projects. "),
        orgId: z.string().optional().describe("Organization ID to retrieve projects for. REQUIRED when using a Personal API key with an organization account (returns 400 error if omitted). NOT needed when using an Organization API key (key is already scoped). If you don't have the org_id, call NEON_GET_USER_ORGANIZATIONS to discover it."),
        search: z.string().optional().describe("Search by project 'name' or 'id'. You can specify partial 'name' or 'id' values to filter results. "),
        timeout: z.number().int().optional().describe("Specify an explicit timeout in milliseconds to limit response delay. After timing out, the incomplete list of project data fetched so far will be returned. Projects still being fetched when the timeout occurred are listed in the \"unavailable\" attribute of the response. If not specified, an implicit implementation defined timeout is chosen with the same behaviour as above  "),
    }),
    execute: async ({ neonApiKey, limit, cursor, orgId, search, timeout }) => {
        const queryParams = { limit: limit, cursor: cursor, org_id: orgId, search: search, timeout: timeout };
        return neon(neonApiKey, { path: `/projects`, method: 'GET', query: queryParams });
    },
});

export const neonRetrieveVpcEndpointsForProject = tool({
    description: "Retrieves a list of VPC (Virtual Private Cloud) endpoints associated with a specific project in the Neon B2B SaaS integration platform. This endpoint allows developers to fetch information about private network connections that enable secure communication between the project's resources and various AWS services without traversing the public internet. Use this endpoint when you need to audit, manage, or view the current VPC endpoint configurations for a given project. It's particularly useful for ensuring proper network isolation and security in complex integration scenarios. The endpoint does not create or modify VPC endpoints; it only provides read access to existing configurations.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/vpc_endpoints`, method: 'GET', query: queryParams });
    },
});

export const neonUpdateProjectSettingsById = tool({
    description: "Updates the configuration and settings of a specific Neon project. This endpoint allows fine-grained control over various aspects of a project, including resource quotas, security settings, maintenance windows, and default endpoint configurations. It's particularly useful for adjusting project parameters to optimize performance, enhance security, or comply with specific operational requirements. The endpoint should be used when changes to project-wide settings are necessary, such as modifying resource limits, adjusting IP access controls, or reconfiguring maintenance schedules. Note that some changes, like enabling logical replication, may have significant impacts on project operations and cannot be reversed. Care should be taken when modifying critical settings to avoid unintended consequences on project functionality or availability.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
        projectName: z.string().optional().describe("The project name"),
        projectHistoryRetentionSeconds: z.number().int().optional().describe("The number of seconds to retain the shared history for all branches in this project. The default is 1 day (604800 seconds).  "),
        projectSettingsAllowedIpsIps: z.array(z.string()).optional().describe("A list of IP addresses that are allowed to connect to the endpoint."),
        projectSettingsBlockVpcConnections: z.boolean().optional().describe("When set, connections using VPC endpoints are disallowed. This parameter is under active development and its semantics may change in the future.  "),
        projectSettingsBlockPublicConnections: z.boolean().optional().describe("When set, connections from the public internet are disallowed. This supersedes the AllowedIPs list. This parameter is under active development and its semantics may change in the future.  "),
        projectSettingsQuotaLogicalSizeBytes: z.number().int().optional().describe("Limit on the logical size of every project\"s branch. "),
        projectSettingsQuotaWrittenDataBytes: z.number().int().optional().describe("Total amount of data written to all of a project\"s branches. "),
        projectSettingsEnableLogicalReplication: z.boolean().optional().describe("Sets wal_level=logical for all compute endpoints in this project. All active endpoints will be suspended. Once enabled, logical replication cannot be disabled.  "),
        projectSettingsQuotaActiveTimeSeconds: z.number().int().optional().describe("The total amount of wall-clock time allowed to be spent by the project\"s compute endpoints.  "),
        projectSettingsQuotaDataTransferBytes: z.number().int().optional().describe("Total amount of data transferred from all of a project\"s branches using the proxy.  "),
        projectSettingsMaintenanceWindowWeekdays: z.array(z.number().int()).optional().describe("A list of weekdays when the maintenance window is active. Encoded as ints, where 1 - Monday, and 7 - Sunday.  "),
        projectSettingsQuotaComputeTimeSeconds: z.number().int().optional().describe("The total amount of CPU seconds allowed to be spent by the project\"s compute endpoints.  "),
        projectSettingsMaintenanceWindowEndTime: z.string().optional().describe("End time of the maintenance window, in the format of \"HH:MM\". Uses UTC. "),
        projectDefaultEndpointSettingsPgSettings: z.record(z.any()).optional().describe("A raw representation of Postgres settings"),
        projectSettingsMaintenanceWindowStartTime: z.string().optional().describe("Start time of the maintenance window, in the format of \"HH:MM\". Uses UTC.  "),
        projectDefaultEndpointSettingsPgbouncerSettings: z.record(z.any()).optional().describe("A raw representation of PgBouncer settings"),
        projectDefaultEpSettingsSuspendTimeoutSeconds: z.number().int().optional().describe("Duration of inactivity in seconds after which the compute endpoint is automatically suspended. The value '0' means use the global default. The value '-1' means never suspend. The default value is '300' seconds (5 minutes). The minimum value is '60' seconds (1 minute). The maximum value is '604800' seconds (1 week). For more information, see [Auto-suspend configuration](https://neon.tech/docs/manage/endpoints#auto-suspend-configuration).  "),
        projectSettingsAllowedIpsProtectedBranchesOnly: z.boolean().optional().describe("If true, the list will be applied only to protected branches."),
        projectDefaultEpSettingsAutoscalingLimitMaxCu: z.number().int().optional().describe("Autoscaling Limit Max Cu"),
        projectDefaultEpSettingsAutoscalingLimitMinCu: z.number().int().optional().describe("Autoscaling Limit Min Cu"),
    }),
    execute: async ({ neonApiKey, projectId, projectName, projectHistoryRetentionSeconds, projectSettingsAllowedIpsIps, projectSettingsBlockVpcConnections, projectSettingsBlockPublicConnections, projectSettingsQuotaLogicalSizeBytes, projectSettingsQuotaWrittenDataBytes, projectSettingsEnableLogicalReplication, projectSettingsQuotaActiveTimeSeconds, projectSettingsQuotaDataTransferBytes, projectSettingsMaintenanceWindowWeekdays, projectSettingsQuotaComputeTimeSeconds, projectSettingsMaintenanceWindowEndTime, projectDefaultEndpointSettingsPgSettings, projectSettingsMaintenanceWindowStartTime, projectDefaultEndpointSettingsPgbouncerSettings, projectDefaultEpSettingsSuspendTimeoutSeconds, projectSettingsAllowedIpsProtectedBranchesOnly, projectDefaultEpSettingsAutoscalingLimitMaxCu, projectDefaultEpSettingsAutoscalingLimitMinCu }) => {
        const queryParams = undefined;
        const body = {};
        if (projectName !== undefined) setNested(body, 'project.name', projectName);
        if (projectHistoryRetentionSeconds !== undefined) setNested(body, 'project.history_retention_seconds', projectHistoryRetentionSeconds);
        if (projectSettingsAllowedIpsIps !== undefined) setNested(body, 'project.settings.allowed_ips.ips', projectSettingsAllowedIpsIps);
        if (projectSettingsBlockVpcConnections !== undefined) setNested(body, 'project.settings.block_vpc_connections', projectSettingsBlockVpcConnections);
        if (projectSettingsBlockPublicConnections !== undefined) setNested(body, 'project.settings.block_public_connections', projectSettingsBlockPublicConnections);
        if (projectSettingsQuotaLogicalSizeBytes !== undefined) setNested(body, 'project.settings.quota.logical_size_bytes', projectSettingsQuotaLogicalSizeBytes);
        if (projectSettingsQuotaWrittenDataBytes !== undefined) setNested(body, 'project.settings.quota.written_data_bytes', projectSettingsQuotaWrittenDataBytes);
        if (projectSettingsEnableLogicalReplication !== undefined) setNested(body, 'project.settings.enable_logical_replication', projectSettingsEnableLogicalReplication);
        if (projectSettingsQuotaActiveTimeSeconds !== undefined) setNested(body, 'project.settings.quota.active_time_seconds', projectSettingsQuotaActiveTimeSeconds);
        if (projectSettingsQuotaDataTransferBytes !== undefined) setNested(body, 'project.settings.quota.data_transfer_bytes', projectSettingsQuotaDataTransferBytes);
        if (projectSettingsMaintenanceWindowWeekdays !== undefined) setNested(body, 'project.settings.maintenance_window.weekdays', projectSettingsMaintenanceWindowWeekdays);
        if (projectSettingsQuotaComputeTimeSeconds !== undefined) setNested(body, 'project.settings.quota.compute_time_seconds', projectSettingsQuotaComputeTimeSeconds);
        if (projectSettingsMaintenanceWindowEndTime !== undefined) setNested(body, 'project.settings.maintenance_window.end_time', projectSettingsMaintenanceWindowEndTime);
        if (projectDefaultEndpointSettingsPgSettings !== undefined) setNested(body, 'project.default_endpoint_settings.pg_settings', projectDefaultEndpointSettingsPgSettings);
        if (projectSettingsMaintenanceWindowStartTime !== undefined) setNested(body, 'project.settings.maintenance_window.start_time', projectSettingsMaintenanceWindowStartTime);
        if (projectDefaultEndpointSettingsPgbouncerSettings !== undefined) setNested(body, 'project.default_endpoint_settings.pgbouncer_settings', projectDefaultEndpointSettingsPgbouncerSettings);
        if (projectDefaultEpSettingsSuspendTimeoutSeconds !== undefined) setNested(body, 'project.default_endpoint_settings.suspend_timeout_seconds', projectDefaultEpSettingsSuspendTimeoutSeconds);
        if (projectSettingsAllowedIpsProtectedBranchesOnly !== undefined) setNested(body, 'project.settings.allowed_ips.protected_branches_only', projectSettingsAllowedIpsProtectedBranchesOnly);
        if (projectDefaultEpSettingsAutoscalingLimitMaxCu !== undefined) setNested(body, 'project.default_endpoint_settings.autoscaling_limit_max_cu', projectDefaultEpSettingsAutoscalingLimitMaxCu);
        if (projectDefaultEpSettingsAutoscalingLimitMinCu !== undefined) setNested(body, 'project.default_endpoint_settings.autoscaling_limit_min_cu', projectDefaultEpSettingsAutoscalingLimitMinCu);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}`, method: 'PATCH', query: queryParams, body });
    },
});
