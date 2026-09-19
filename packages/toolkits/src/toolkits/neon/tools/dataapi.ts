// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonCreateBranchesDataApi = tool({
    description: "Creates a new instance of Neon Data API in the specified branch. The Data API provides a RESTful interface to query your Postgres database using HTTP requests. Use this action when you need to expose database access via REST API endpoints with JWT-based authentication.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        jwksUrl: z.string().optional().describe("The URL that lists the JWKS (JSON Web Key Set) for external authentication. Required when auth_provider is 'external'."),
        settings: z.record(z.any()).optional().describe("Configuration settings for the Neon Data API"),
        branchId: z.string().describe("The branch ID where the Data API will be created (e.g., 'br-muddy-pond-ahkofech'). Obtain via NEON_GET_BRANCHES_FOR_PROJECT action."),
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        jwtAudience: z.string().optional().describe("JWT audience claim to validate. WARNING: tokens without audience claim will still be accepted."),
        authProvider: z.enum(["neon_auth", "external"]).optional().describe("Authentication provider options for Neon Data API"),
        databaseName: z.string().describe("The database name for the Data API (e.g., 'neondb'). Must be an existing database in the branch."),
        providerName: z.string().optional().describe("The name of the authentication provider (e.g., 'Clerk', 'Stytch', 'Auth0'). Used for documentation purposes."),
        skipAuthSchema: z.boolean().optional().describe("Skip creating the auth schema and RLS functions. Default: false"),
        addDefaultGrants: z.boolean().optional().describe("Grant all permissions to the tables in the public schema to authenticated users. Default: false"),
    }),
    execute: async ({ neonApiKey, jwksUrl, settings, branchId, projectId, jwtAudience, authProvider, databaseName, providerName, skipAuthSchema, addDefaultGrants }) => {
        const queryParams = undefined;
        const body = {};
        if (jwksUrl !== undefined) setNested(body, 'jwks_url', jwksUrl);
        if (settings !== undefined) setNested(body, 'settings', settings);
        if (jwtAudience !== undefined) setNested(body, 'jwt_audience', jwtAudience);
        if (authProvider !== undefined) setNested(body, 'auth_provider', authProvider);
        if (providerName !== undefined) setNested(body, 'provider_name', providerName);
        if (skipAuthSchema !== undefined) setNested(body, 'skip_auth_schema', skipAuthSchema);
        if (addDefaultGrants !== undefined) setNested(body, 'add_default_grants', addDefaultGrants);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/data-api/${encodeURIComponent(databaseName)}`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteBranchDataApi = tool({
    description: "Deletes the Neon Data API for a specified branch and database. Use this when you need to remove Data API access for a specific database within a branch.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The branch ID. Format: 'br-' prefix followed by alphanumeric characters (e.g., 'br-rough-voice-ah2lazzk'). Obtain from list branches endpoint."),
        projectId: z.string().describe("The Neon project ID. Format: {adjective}-{noun}-{number} (e.g., 'proud-meadow-87189985'). Obtain from list projects endpoint."),
        databaseName: z.string().describe("The database name for which to delete the Neon Data API. This is the database name as it appears in PostgreSQL (e.g., 'neondb')."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/data-api/${encodeURIComponent(databaseName)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonGetBranchesDataApi = tool({
    description: "Retrieves the Neon Data API information for a specific branch and database. Use when you need to access the Data API URL, deployment status, or configuration settings for a particular database within a branch.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID"),
        projectId: z.string().describe("The Neon project ID"),
        databaseName: z.string().describe("The database name"),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/data-api/${encodeURIComponent(databaseName)}`, method: 'GET', query: queryParams });
    },
});

export const neonUpdateBranchesDataApi = tool({
    description: "Updates the Neon Data API configuration for the specified branch. Use when you need to modify Data API settings such as aggregates, anonymous role, search paths, schemas, JWT settings, or CORS configuration. The schema cache is always refreshed as part of this operation.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID (e.g., 'br-gentle-lab-af8riisw')"),
        projectId: z.string().describe("The Neon project ID (e.g., 'small-recipe-63664710')"),
        databaseName: z.string().describe("The database name (e.g., 'neondb')"),
        settingsDbSchemas: z.array(z.string()).optional().describe("List of schemas to expose via the API. Default: [\"public\"]"),
        settingsDbMaxRows: z.number().int().optional().describe("Maximum number of rows that can be returned in a single request"),
        settingsOpenapiMode: z.string().optional().describe("OpenAPI specification mode (ignore-privileges, disabled). Default: 'disabled'"),
        settingsDbAnonRole: z.string().optional().describe("Database role to use for anonymous requests. Default: 'anonymous'"),
        settingsJwtRoleClaimKey: z.string().optional().describe("JWT claim key to use for role extraction. Default: \".\\\"role\\\"\""),
        settingsDbAggregatesEnabled: z.boolean().optional().describe("Enable aggregates feature. Default: true"),
        settingsDbExtraSearchPath: z.string().optional().describe("Extra schemas to add to the search path"),
        settingsServerTimingEnabled: z.boolean().optional().describe("Enable server timing headers"),
        settingsJwtCacheMaxLifetime: z.number().int().optional().describe("Maximum lifetime for JWT cache in seconds"),
        settingsServerCorsAllowedOrigins: z.string().optional().describe("CORS allowed origins"),
    }),
    execute: async ({ neonApiKey, branchId, projectId, databaseName, settingsDbSchemas, settingsDbMaxRows, settingsOpenapiMode, settingsDbAnonRole, settingsJwtRoleClaimKey, settingsDbAggregatesEnabled, settingsDbExtraSearchPath, settingsServerTimingEnabled, settingsJwtCacheMaxLifetime, settingsServerCorsAllowedOrigins }) => {
        const queryParams = undefined;
        const body = {};
        if (settingsDbSchemas !== undefined) setNested(body, 'settings.db_schemas', settingsDbSchemas);
        if (settingsDbMaxRows !== undefined) setNested(body, 'settings.db_max_rows', settingsDbMaxRows);
        if (settingsOpenapiMode !== undefined) setNested(body, 'settings.openapi_mode', settingsOpenapiMode);
        if (settingsDbAnonRole !== undefined) setNested(body, 'settings.db_anon_role', settingsDbAnonRole);
        if (settingsJwtRoleClaimKey !== undefined) setNested(body, 'settings.jwt_role_claim_key', settingsJwtRoleClaimKey);
        if (settingsDbAggregatesEnabled !== undefined) setNested(body, 'settings.db_aggregates_enabled', settingsDbAggregatesEnabled);
        if (settingsDbExtraSearchPath !== undefined) setNested(body, 'settings.db_extra_search_path', settingsDbExtraSearchPath);
        if (settingsServerTimingEnabled !== undefined) setNested(body, 'settings.server_timing_enabled', settingsServerTimingEnabled);
        if (settingsJwtCacheMaxLifetime !== undefined) setNested(body, 'settings.jwt_cache_max_lifetime', settingsJwtCacheMaxLifetime);
        if (settingsServerCorsAllowedOrigins !== undefined) setNested(body, 'settings.server_cors_allowed_origins', settingsServerCorsAllowedOrigins);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/data-api/${encodeURIComponent(databaseName)}`, method: 'PATCH', query: queryParams, body });
    },
});
