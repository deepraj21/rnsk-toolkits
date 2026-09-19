// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { neon, setNested } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const neonCreateAuthKeys = tool({
    description: "Tool to generate SDK or API keys for authentication providers. Use when setting up authentication for a Neon project with providers like Stack Auth, Better Auth, or for testing with mock provider.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID (e.g., 'proud-meadow-87189985'). Must match the pattern: lowercase letters, numbers, and hyphens, 1-60 characters. You can obtain the project_id by listing the projects for your Neon account."),
        authProvider: z.enum(["mock", "stack", "stack_v2", "better_auth"]).describe("The authentication provider to create SDK keys for. Options: 'mock' (for testing), 'stack' (Stack Auth v1), 'stack_v2' (Stack Auth v2), 'better_auth' (Better Auth)."),
    }),
    execute: async ({ neonApiKey, projectId, authProvider }) => {
        const queryParams = undefined;
        const body = {};
        if (authProvider !== undefined) setNested(body, 'auth_provider', authProvider);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/auth/keys`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateAuthUser = tool({
    description: "Tool to create a new user in Neon Auth for a specific project branch. Use when you need to add authentication users to a branch that has Neon Auth enabled with the 'stack' provider. The branch must already have Neon Auth configured before creating users.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        name: z.string().describe("The display name for the new auth user. Required field, max 255 characters."),
        email: z.string().describe("The email address for the new auth user. Must be a valid email format and between 1-256 characters."),
        branchId: z.string().describe("The branch ID where the auth user will be created (e.g., 'br-lucky-water-afkw1lov'). The branch must have Neon Auth enabled. Obtain via NEON_GET_BRANCHES_FOR_PROJECT action."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
    }),
    execute: async ({ neonApiKey, name, email, branchId, projectId }) => {
        const queryParams = undefined;
        const body = {};
        if (email !== undefined) setNested(body, 'email', email);
        if (name !== undefined) setNested(body, 'name', name);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/users`, method: 'POST', query: queryParams, body });
    },
});

export const neonCreateBranchesAuth = tool({
    description: "Tool to enable Neon Auth integration for a branch. Use when you need to set up authentication for a specific branch in a Neon project.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID (e.g., 'br-gentle-lab-af8riisw'). You can obtain the branch_id by listing the branches for your project."),
        projectId: z.string().describe("The Neon project ID (e.g., 'small-recipe-63664710'). You can obtain the project_id by listing the projects for your Neon account."),
        authProvider: z.enum(["mock", "stack", "stack_v2", "better_auth"]).describe("The authentication provider to enable for the branch. Must be one of: mock, stack, stack_v2, or better_auth."),
        databaseName: z.string().optional().describe("The name of the database to use for authentication. If not specified, the default database will be used."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, authProvider, databaseName }) => {
        const queryParams = undefined;
        const body = {};
        if (authProvider !== undefined) setNested(body, 'auth_provider', authProvider);
        if (databaseName !== undefined) setNested(body, 'database_name', databaseName);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth`, method: 'POST', query: queryParams, body });
    },
});

export const neonDeleteAuthDomainFromProject = tool({
    description: "DEPRECATED: Use '/projects/{project_id}/branches/{branch_id}/auth/domains' instead. Deletes a domain from the redirect_uri whitelist for the specified project. Use when you need to remove an authorized redirect domain for an authentication provider. This operation permanently removes the domain from the whitelist, preventing it from being used as a valid redirect URI.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        domains: z.array(z.record(z.any())).describe("Array of domain objects to remove from the redirect_uri whitelist. Each domain must include the full URL with protocol."),
        projectId: z.string().describe("The unique identifier for the Neon project (e.g., 'proud-meadow-87189985'). Can be obtained from the list projects API."),
        authProvider: z.enum(["mock", "stack", "stack_v2", "better_auth"]).describe("The authentication provider for which to remove the domain from the redirect_uri whitelist."),
    }),
    execute: async ({ neonApiKey, domains, projectId, authProvider }) => {
        const queryParams = undefined;
        const body = {};
        if (authProvider !== undefined) setNested(body, 'auth_provider', authProvider);
        if (domains !== undefined) setNested(body, 'domains', domains);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/auth/domains`, method: 'DELETE', query: queryParams, body });
    },
});

export const neonDeleteAuthDomains = tool({
    description: "Deletes domains from the redirect_uri whitelist for a specific branch's authentication configuration. Use when you need to revoke access for specific domains in your Neon authentication setup.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        domains: z.array(z.record(z.any())).describe("Array of domain objects to remove from the redirect_uri whitelist"),
        branchId: z.string().describe("The Neon branch ID (e.g., 'br-lucky-water-afkw1lov')"),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271')"),
        authProvider: z.enum(["mock", "stack", "stack_v2", "better_auth"]).describe("The authentication provider for which to delete the domains"),
    }),
    execute: async ({ neonApiKey, domains, branchId, projectId, authProvider }) => {
        const queryParams = undefined;
        const body = {};
        if (authProvider !== undefined) setNested(body, 'auth_provider', authProvider);
        if (domains !== undefined) setNested(body, 'domains', domains);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/domains`, method: 'DELETE', query: queryParams, body });
    },
});

export const neonDeleteAuthOauthProvider = tool({
    description: "Deletes an OAuth provider configuration from a specific branch in a Neon project. This removes the OAuth authentication integration for the specified provider (Google, GitHub, or Vercel) from the given branch. Use this action when you need to revoke OAuth access or clean up authentication configurations for a particular branch. Note: This operation is permanent and will affect all users authenticating through this provider on this branch. Neon Auth must be enabled on the branch before OAuth providers can be deleted.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique branch identifier within the project (e.g., 'br-lucky-water-afkw1lov'). Can be retrieved using the list project branches endpoint."),
        projectId: z.string().describe("The unique identifier for the Neon project. Format: alphanumeric with hyphens (e.g., 'dry-smoke-26258271'). Can be found in the Neon console or via the list projects API."),
        oauthProviderId: z.enum(["google", "github", "vercel"]).describe("The OAuth provider ID to delete. Must be one of: google, github, or vercel."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, oauthProviderId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/oauth_providers/${encodeURIComponent(oauthProviderId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDeleteAuthUser = tool({
    description: "Deletes an authentication user from a specified branch within a Neon project. Use this endpoint to permanently remove user access from a particular branch. Important notes: - This operation is permanent and cannot be undone - Successful deletion returns a 204 No Content status - The deleted user will no longer be able to authenticate to the specified branch - This operation only affects the specified branch, not other branches in the project",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID. Format: 'br-' prefix followed by alphanumeric characters (e.g., 'br-lucky-water-afkw1lov'). Can be obtained from the list branches endpoint."),
        projectId: z.string().describe("The Neon project ID. Format: alphanumeric with hyphens (e.g., 'dry-smoke-26258271'). Can be obtained from the list projects endpoint."),
        authUserId: z.string().describe("The Neon user ID to delete. Format: UUID (e.g., 'f7a03453-e0c9-4c66-96ca-aee5e7936654'). This identifies the specific auth user to remove from the branch."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, authUserId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/users/${encodeURIComponent(authUserId)}`, method: 'DELETE', query: queryParams });
    },
});

export const neonDisableBranchesAuth = tool({
    description: "Tool to disable Neon Auth for a specific branch in a Neon project. Use when you need to remove authentication integration for a branch. This operation can optionally delete the 'neon_auth' schema from the database by setting delete_data to true.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID"),
        projectId: z.string().describe("The Neon project ID"),
        deleteData: z.boolean().optional().describe("If true, deletes the 'neon_auth' schema from the database"),
    }),
    execute: async ({ neonApiKey, branchId, projectId, deleteData }) => {
        const queryParams = undefined;
        const body = {};
        if (deleteData !== undefined) setNested(body, 'delete_data', deleteData);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth`, method: 'DELETE', query: queryParams, body });
    },
});

export const neonGetAuth = tool({
    description: "Retrieves authentication information about the current API request credentials. Use this action to verify which account and authentication method are being used for API calls, which is helpful for debugging authentication issues or confirming the identity of the calling user or API key.",
    inputSchema: z.object({
        neonApiKey: tokenField,
    }),
    execute: async ({ neonApiKey }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/auth`, method: 'GET', query: queryParams });
    },
});

export const neonGetAuthAllowLocalhost = tool({
    description: "Retrieves the allow localhost configuration for a specific branch in a Neon project. Use when you need to check if localhost connections are permitted for a branch's authentication settings.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/allow_localhost`, method: 'GET', query: queryParams });
    },
});

export const neonGetAuthEmailProvider = tool({
    description: "Retrieves the email provider configuration for Neon Auth on a specific branch. Returns SMTP configuration details if a custom provider is configured, or just sender information if using the default Neon email provider. Use this action to verify email settings before testing authentication flows or troubleshooting email delivery issues.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The unique identifier of the branch within the project (e.g., 'br-lucky-water-afkw1lov'). You can obtain this from the list branches endpoint."),
        projectId: z.string().describe("The unique Neon project ID. This is a string identifier in the format 'adjective-noun-number' (e.g., 'dry-smoke-26258271'). You can obtain project IDs by listing projects using the retrieve_projects_list action."),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/email_provider`, method: 'GET', query: queryParams });
    },
});

export const neonListAuthDomains = tool({
    description: "Lists the domains in the redirect_uri whitelist for the specified project and branch. Use when you need to retrieve or verify the allowed domains for authentication redirects.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID"),
        projectId: z.string().describe("The Neon project ID. This is a string identifier in the format 'adjective-noun-number' (e.g., 'proud-meadow-87189985')."),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/domains`, method: 'GET', query: queryParams });
    },
});

export const neonListAuthOauthProviders = tool({
    description: "Lists the OAuth providers for the specified project. DEPRECATED: Use /projects/{project_id}/branches/{branch_id}/auth/oauth_providers instead. This endpoint returns OAuth provider configurations including client IDs and types for the Neon Auth integration.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/auth/oauth_providers`, method: 'GET', query: queryParams });
    },
});

export const neonListAuthOauthProviders2 = tool({
    description: "Retrieves the OAuth providers configured for Neon Auth on a specific branch. Use this when you need to view the available OAuth authentication providers for a given project and branch combination. This is useful for managing authentication options and verifying which OAuth providers are enabled.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID"),
        projectId: z.string().describe("The Neon project ID"),
    }),
    execute: async ({ neonApiKey, branchId, projectId }) => {
        const queryParams = undefined;
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/oauth_providers`, method: 'GET', query: queryParams });
    },
});

export const neonSendAuthTestEmail = tool({
    description: "Tool to send a test email using specified SMTP configuration for Neon Auth. Use when validating SMTP settings or testing email delivery for Neon Auth integration on a specific branch.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        host: z.string().describe("SMTP server hostname (e.g., 'smtp.gmail.com', 'smtp.sendgrid.net')."),
        port: z.number().int().describe("SMTP server port number. Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)."),
        password: z.string().describe("SMTP authentication password or app-specific password."),
        username: z.string().describe("SMTP authentication username, typically an email address."),
        branchId: z.string().describe("The Neon branch ID (e.g., 'br-lucky-water-afkw1lov'). Obtain via NEON_GET_BRANCHES_FOR_PROJECT action."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Obtain via NEON_RETRIEVE_PROJECTS_LIST action."),
        senderName: z.string().describe("Display name that will appear as the sender of the test email."),
        senderEmail: z.string().describe("Email address that will appear as the sender of the test email."),
        recipientEmail: z.string().describe("Email address where the test email will be sent."),
    }),
    execute: async ({ neonApiKey, host, port, password, username, branchId, projectId, senderName, senderEmail, recipientEmail }) => {
        const body = { recipient_email: recipientEmail };
        if (host) body.email_provider = { type: 'standard', host, port, username, password, sender_email: senderEmail, sender_name: senderName };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/send_test_email`, method: 'POST', body });
    },
});

export const neonUpdateAuthAllowLocalhost = tool({
    description: "Updates the allow localhost configuration for a specific branch in a Neon project. This endpoint controls whether connections from localhost are permitted to the branch. Use this when you need to enable or disable localhost access for development or testing purposes.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        branchId: z.string().describe("The Neon branch ID (e.g., 'br-lucky-water-afkw1lov'). Can be obtained from the list branches API or Neon console."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271'). Can be found in the Neon console URL or via the list projects API."),
        allowLocalhost: z.boolean().describe("Whether to allow localhost connections to this branch. Set to true to enable localhost access, false to disable."),
    }),
    execute: async ({ neonApiKey, branchId, projectId, allowLocalhost }) => {
        const queryParams = undefined;
        const body = {};
        if (allowLocalhost !== undefined) setNested(body, 'allow_localhost', allowLocalhost);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/allow_localhost`, method: 'PATCH', query: queryParams, body });
    },
});

export const neonUpdateAuthEmailProvider = tool({
    description: "Updates the email provider configuration for a specific branch's authentication system. Currently, the Neon API only supports the 'shared' email provider type. To use this action, provide only sender_email and sender_name (leave host, port, username, and password empty). The shared provider uses Neon's managed email infrastructure. Note: Custom SMTP configuration (host, port, username, password) is not yet supported by the API. Attempting to configure a custom SMTP server will result in an error. Prerequisites: Neon Auth must be enabled for the branch before updating the email provider.",
    inputSchema: z.object({
        neonApiKey: tokenField,
        host: z.string().optional().describe("SMTP server hostname for custom email provider. Required if using a custom SMTP server instead of the shared provider (e.g., 'smtp.gmail.com', 'smtp.sendgrid.net'). Leave empty to use the shared Neon email provider."),
        port: z.number().int().optional().describe("SMTP server port. Required if using a custom SMTP server. Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted). Leave empty to use the shared Neon email provider."),
        password: z.string().optional().describe("SMTP authentication password. Required if using a custom SMTP server. Leave empty to use the shared Neon email provider."),
        username: z.string().optional().describe("SMTP authentication username. Required if using a custom SMTP server. Leave empty to use the shared Neon email provider."),
        branchId: z.string().describe("The Neon branch ID for which to update the email provider configuration. Format: 'br-name-id' (e.g., 'br-lucky-water-afkw1lov')."),
        projectId: z.string().describe("The Neon project ID. You can find this on the Settings page in the Neon Console or by listing projects. Format: 'adjective-noun-12345678' (e.g., 'dry-smoke-26258271')."),
        senderName: z.string().describe("The sender name to display in authentication emails. This appears as the 'From' name in email clients (e.g., 'Composio Support')."),
        senderEmail: z.string().describe("The sender email address to use for authentication emails sent from this branch. Must be a valid email format (e.g., 'noreply@example.com')."),
    }),
    execute: async ({ neonApiKey, host, port, password, username, branchId, projectId, senderName, senderEmail }) => {
        const emailProvider = host
            ? { type: 'standard', host, port, username, password, sender_email: senderEmail, sender_name: senderName }
            : { type: 'shared', sender_email: senderEmail, sender_name: senderName };
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/branches/${encodeURIComponent(branchId)}/auth/email_provider`, method: 'PATCH', body: emailProvider });
    },
});

export const neonUpdateAuthOauthProviders = tool({
    description: "Updates OAuth provider credentials for a Neon project's authentication configuration. DEPRECATED: Use '/projects/{project_id}/branches/{branch_id}/auth/oauth_providers/{oauth_provider_id}' instead. This endpoint allows updating client ID and client secret for OAuth providers (Google, GitHub, Microsoft, or Vercel).",
    inputSchema: z.object({
        neonApiKey: tokenField,
        clientId: z.string().optional().describe("The OAuth application client ID. Required when updating provider credentials."),
        projectId: z.string().describe("The Neon project ID (e.g., 'dry-smoke-26258271')"),
        clientSecret: z.string().optional().describe("The OAuth application client secret. Required when updating provider credentials."),
        oauthProviderId: z.enum(["google", "github", "microsoft", "vercel"]).describe("The OAuth provider ID to update (google, github, microsoft, or vercel)"),
        microsoftTenantId: z.string().optional().describe("The Microsoft tenant ID. Only applicable when updating Microsoft OAuth provider."),
    }),
    execute: async ({ neonApiKey, clientId, projectId, clientSecret, oauthProviderId, microsoftTenantId }) => {
        const queryParams = undefined;
        const body = {};
        if (clientId !== undefined) setNested(body, 'client_id', clientId);
        if (clientSecret !== undefined) setNested(body, 'client_secret', clientSecret);
        if (microsoftTenantId !== undefined) setNested(body, 'microsoft_tenant_id', microsoftTenantId);
        return neon(neonApiKey, { path: `/projects/${encodeURIComponent(projectId)}/auth/oauth_providers/${encodeURIComponent(oauthProviderId)}`, method: 'PATCH', query: queryParams, body });
    },
});
