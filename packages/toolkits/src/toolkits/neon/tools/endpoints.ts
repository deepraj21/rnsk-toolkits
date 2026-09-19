// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonCreateComputeEndpoint = tool({
    description: "Creates a new compute endpoint for a specified branch within a Neon project. This endpoint allows for detailed configuration of database resources, including read/write capabilities, regional placement, autoscaling limits, and connection pooling settings. It's primarily used when setting up new database instances or modifying existing database configurations to meet specific performance, scaling, or operational requirements. The endpoint provides fine-grained control over compute resources, enabling optimized database operations for various use cases from development to production environments.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
        endpointType: z.enum(["read_only", "read_write"]).optional().describe("The compute endpoint type. Either 'read_write' or 'read_only'. "),
        endpointDisabled: z.boolean().optional().describe("Whether to restrict connections to the compute endpoint. Enabling this option schedules a suspend compute operation. A disabled compute endpoint cannot be enabled by a connection or console action. However, the compute endpoint is periodically enabled by check_availability operations.  "),
        endpointBranchId: z.string().optional().describe("The ID of the branch the compute endpoint will be associated with "),
        endpointRegionId: z.string().optional().describe("The region where the compute endpoint will be created. Only the project\"s 'region_id' is permitted.  "),
        endpointProvisioner: z.string().optional().describe("The Neon compute provisioner. Specify the 'k8s-neonvm' provisioner to create a compute endpoint that supports Autoscaling. Provisioner can be one of the following values: * k8s-pod * k8s-neonvm Clients must expect, that any string value that is not documented in the description above should be treated as a error. UNKNOWN value if safe to treat as an error too.  "),
        endpointPoolerMode: z.enum(["transaction"]).optional().describe("The connection pooler mode. Neon supports PgBouncer in 'transaction' mode only.  "),
        endpointPoolerEnabled: z.boolean().optional().describe("Whether to enable connection pooling for the compute endpoint "),
        endpointPasswordlessAccess: z.boolean().optional().describe("NOT YET IMPLEMENTED. Whether to permit passwordless access to the compute endpoint.  "),
        endpointSettingsPgSettings: z.record(z.any()).optional().describe("A raw representation of Postgres settings"),
        endpointSuspendTimeoutSeconds: z.number().int().optional().describe("Duration of inactivity in seconds after which the compute endpoint is automatically suspended. The value '0' means use the global default. The value '-1' means never suspend. The default value is '300' seconds (5 minutes). The minimum value is '60' seconds (1 minute). The maximum value is '604800' seconds (1 week). For more information, see [Auto-suspend configuration](https://neon.tech/docs/manage/endpoints#auto-suspend-configuration).  "),
        endpointAutoscalingLimitMaxCu: z.number().int().optional().describe("Autoscaling Limit Max Cu"),
        endpointAutoscalingLimitMinCu: z.number().int().optional().describe("Autoscaling Limit Min Cu"),
        endpointSettingsPgbouncerSettings: z.record(z.any()).optional().describe("A raw representation of PgBouncer settings"),
    }),
    execute: async ({ neonApiKey, projectId, endpointType, endpointDisabled, endpointBranchId, endpointRegionId, endpointProvisioner, endpointPoolerMode, endpointPoolerEnabled, endpointPasswordlessAccess, endpointSettingsPgSettings, endpointSuspendTimeoutSeconds, endpointAutoscalingLimitMaxCu, endpointAutoscalingLimitMinCu, endpointSettingsPgbouncerSettings }) => {
        const queryParams = undefined;
        const body = {};
        if (endpointType !== undefined) setNested(body, 'endpoint.type', endpointType);
        if (endpointDisabled !== undefined) setNested(body, 'endpoint.disabled', endpointDisabled);
        if (endpointBranchId !== undefined) setNested(body, 'endpoint.branch_id', endpointBranchId);
        if (endpointRegionId !== undefined) setNested(body, 'endpoint.region_id', endpointRegionId);
        if (endpointProvisioner !== undefined) setNested(body, 'endpoint.provisioner', endpointProvisioner);
        if (endpointPoolerMode !== undefined) setNested(body, 'endpoint.pooler_mode', endpointPoolerMode);
        if (endpointPoolerEnabled !== undefined) setNested(body, 'endpoint.pooler_enabled', endpointPoolerEnabled);
        if (endpointPasswordlessAccess !== undefined) setNested(body, 'endpoint.passwordless_access', endpointPasswordlessAccess);
        if (endpointSettingsPgSettings !== undefined) setNested(body, 'endpoint.settings.pg_settings', endpointSettingsPgSettings);
        if (endpointSuspendTimeoutSeconds !== undefined) setNested(body, 'endpoint.suspend_timeout_seconds', endpointSuspendTimeoutSeconds);
        if (endpointAutoscalingLimitMaxCu !== undefined) setNested(body, 'endpoint.autoscaling_limit_max_cu', endpointAutoscalingLimitMaxCu);
        if (endpointAutoscalingLimitMinCu !== undefined) setNested(body, 'endpoint.autoscaling_limit_min_cu', endpointAutoscalingLimitMinCu);
        if (endpointSettingsPgbouncerSettings !== undefined) setNested(body, 'endpoint.settings.pgbouncer_settings', endpointSettingsPgbouncerSettings);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteProjectEndpoint = tool({
    description: "Deletes a specific endpoint within a Neon project. This operation permanently removes the endpoint and all associated resources, such as configurations and access points. Use this endpoint when you need to decommission or clean up unused endpoints in your project. It's important to note that this action is irreversible, so ensure you have backed up any necessary data or configurations before proceeding. This endpoint should be used with caution, as it will immediately terminate access to the specified endpoint and may impact any systems or applications relying on it.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID. Format: {adjective}-{noun}-{number} (e.g., 'dry-smoke-26258271'). Obtain from NEON_RETRIEVE_PROJECTS_LIST."),
        endpointId: z.string().describe("The compute endpoint ID to delete. Format: ep-{name}-{id} (e.g., 'ep-flat-mud-af9isowb'). Obtain from NEON_GET_PROJECT_ENDPOINT_INFORMATION."),
    }),
    execute: async ({ neonApiKey, projectId, endpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonRestartProjectEndpoint = tool({
    description: "Restarts a Neon compute endpoint (Postgres instance) within a project. The restart operation suspends and then starts the compute endpoint, which is useful for: - Applying configuration changes - Clearing cached data or connections - Troubleshooting connection or performance issues - Recovering from error states The operation triggers two sequential actions: 'suspend_compute' followed by 'start_compute'. During restart, the endpoint will be briefly unavailable. The response includes the updated endpoint details and the operations triggered. Note: If the endpoint is in a 'locked' state (HTTP 423) due to an ongoing operation, wait for it to complete before retrying. If the endpoint is 'idle', it will be started directly without suspension.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Can be obtained from list projects API."),
        endpointId: z.string().describe("The Neon compute endpoint ID to restart (e.g., 'ep-patient-morning-afvkyj5f'). Can be obtained from list project endpoints API."),
    }),
    execute: async ({ neonApiKey, projectId, endpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}/restart`, method: 'POST', query: queryParams });
    },
});

export const neonRetrieveProjectEndpointDetails = tool({
    description: "Retrieves detailed information about a specific compute endpoint within a Neon serverless PostgreSQL project. Compute endpoints are the connection points for your Neon databases. Use this action to get information about a specific endpoint including its hostname for connections, autoscaling settings, current state (active/idle/suspended), connection pooling config, and PostgreSQL settings. This is useful for getting the connection hostname, checking endpoint health, verifying compute resources, or troubleshooting connection issues. The endpoint_id can be obtained from the list endpoints action. Note: This is a read-only operation.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique identifier for a Neon project (e.g., 'dry-smoke-26258271'). Can be obtained from the projects list endpoint or project details."),
        endpointId: z.string().describe("The unique identifier of the compute endpoint (e.g., 'ep-empty-bush-af3x7l26'). Endpoint IDs start with 'ep-' prefix. Can be obtained from the list endpoints action."),
    }),
    execute: async ({ neonApiKey, projectId, endpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}`, method: 'GET', query: queryParams });
    },
});

export const neonStartEndpointForProject = tool({
    description: "Starts a suspended or idle compute endpoint for a Neon PostgreSQL project. Neon compute endpoints automatically suspend after a period of inactivity to save resources. Use this action to wake up a suspended endpoint and make it available for database connections. The endpoint will transition from 'idle' or 'suspended' state to 'active'. If the endpoint is already active, the call is idempotent and returns the current endpoint state with no operations. The response includes the endpoint details and any triggered operations. Note: Endpoint startup typically takes a few seconds.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The unique Neon project identifier (e.g., 'dry-smoke-26258271'). Can be obtained from the projects list endpoint."),
        endpointId: z.string().describe("The unique compute endpoint identifier (e.g., 'ep-patient-morning-afvkyj5f'). Can be obtained from the project endpoints list."),
    }),
    execute: async ({ neonApiKey, projectId, endpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}/start`, method: 'POST', query: queryParams });
    },
});

export const neonSuspendProjectEndpointById = tool({
    description: "Suspends a specific endpoint within a project in the Neon B2B SaaS integration platform. This operation temporarily disables the endpoint, preventing it from processing further requests until it is resumed. Use this endpoint when you need to conserve resources, perform maintenance, or temporarily halt operations for a particular integration point. The suspension is reversible, allowing you to resume the endpoint's functionality when needed. This tool is particularly useful for managing resource utilization and costs in your Neon project by allowing fine-grained control over individual endpoints.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
        endpointId: z.string().describe("The endpoint ID"),
    }),
    execute: async ({ neonApiKey, projectId, endpointId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}/suspend`, method: 'POST', query: queryParams });
    },
});

export const neonUpdateProjectComputeEndpointSettings = tool({
    description: "Updates the configuration of a specific compute endpoint within a Neon project. This endpoint allows fine-tuning of various settings such as autoscaling limits, provisioner type, connection pooling, and auto-suspend behavior. It's particularly useful for optimizing performance, resource allocation, and cost management of your Neon compute endpoints. The endpoint should be used when you need to modify the behavior or resources of an existing compute endpoint to better suit your application's needs or to implement changes in your infrastructure strategy. Note that some parameters are deprecated, and care should be taken to use the most current features and settings.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
        endpointId: z.string().describe("The endpoint ID"),
        endpointDisabled: z.boolean().optional().describe("Whether to restrict connections to the compute endpoint. Enabling this option schedules a suspend compute operation. A disabled compute endpoint cannot be enabled by a connection or console action. However, the compute endpoint is periodically enabled by check_availability operations.  "),
        endpointBranchId: z.string().optional().describe("DEPRECATED: This field will be removed in a future release. The destination branch ID. The destination branch must not have an exsiting read-write endpoint.  "),
        endpointProvisioner: z.string().optional().describe("The Neon compute provisioner. Specify the 'k8s-neonvm' provisioner to create a compute endpoint that supports Autoscaling. Provisioner can be one of the following values: * k8s-pod * k8s-neonvm Clients must expect, that any string value that is not documented in the description above should be treated as a error. UNKNOWN value if safe to treat as an error too.  "),
        endpointPoolerMode: z.enum(["transaction"]).optional().describe("The connection pooler mode. Neon supports PgBouncer in 'transaction' mode only.  "),
        endpointPoolerEnabled: z.boolean().optional().describe("Whether to enable connection pooling for the compute endpoint "),
        endpointPasswordlessAccess: z.boolean().optional().describe("NOT YET IMPLEMENTED. Whether to permit passwordless access to the compute endpoint.  "),
        endpointSettingsPgSettings: z.record(z.any()).optional().describe("A raw representation of Postgres settings"),
        endpointSuspendTimeoutSeconds: z.number().int().optional().describe("Duration of inactivity in seconds after which the compute endpoint is automatically suspended. The value '0' means use the global default. The value '-1' means never suspend. The default value is '300' seconds (5 minutes). The minimum value is '60' seconds (1 minute). The maximum value is '604800' seconds (1 week). For more information, see [Auto-suspend configuration](https://neon.tech/docs/manage/endpoints#auto-suspend-configuration).  "),
        endpointAutoscalingLimitMaxCu: z.number().int().optional().describe("Autoscaling Limit Max Cu"),
        endpointAutoscalingLimitMinCu: z.number().int().optional().describe("Autoscaling Limit Min Cu"),
        endpointSettingsPgbouncerSettings: z.record(z.any()).optional().describe("A raw representation of PgBouncer settings"),
    }),
    execute: async ({ neonApiKey, projectId, endpointId, endpointDisabled, endpointBranchId, endpointProvisioner, endpointPoolerMode, endpointPoolerEnabled, endpointPasswordlessAccess, endpointSettingsPgSettings, endpointSuspendTimeoutSeconds, endpointAutoscalingLimitMaxCu, endpointAutoscalingLimitMinCu, endpointSettingsPgbouncerSettings }) => {
        const queryParams = undefined;
        const body = {};
        if (endpointDisabled !== undefined) setNested(body, 'endpoint.disabled', endpointDisabled);
        if (endpointBranchId !== undefined) setNested(body, 'endpoint.branch_id', endpointBranchId);
        if (endpointProvisioner !== undefined) setNested(body, 'endpoint.provisioner', endpointProvisioner);
        if (endpointPoolerMode !== undefined) setNested(body, 'endpoint.pooler_mode', endpointPoolerMode);
        if (endpointPoolerEnabled !== undefined) setNested(body, 'endpoint.pooler_enabled', endpointPoolerEnabled);
        if (endpointPasswordlessAccess !== undefined) setNested(body, 'endpoint.passwordless_access', endpointPasswordlessAccess);
        if (endpointSettingsPgSettings !== undefined) setNested(body, 'endpoint.settings.pg_settings', endpointSettingsPgSettings);
        if (endpointSuspendTimeoutSeconds !== undefined) setNested(body, 'endpoint.suspend_timeout_seconds', endpointSuspendTimeoutSeconds);
        if (endpointAutoscalingLimitMaxCu !== undefined) setNested(body, 'endpoint.autoscaling_limit_max_cu', endpointAutoscalingLimitMaxCu);
        if (endpointAutoscalingLimitMinCu !== undefined) setNested(body, 'endpoint.autoscaling_limit_min_cu', endpointAutoscalingLimitMinCu);
        if (endpointSettingsPgbouncerSettings !== undefined) setNested(body, 'endpoint.settings.pgbouncer_settings', endpointSettingsPgbouncerSettings);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/endpoints/${encodeURIComponent(endpointId)}`, method: 'PATCH', query: queryParams, body });
    },
});
