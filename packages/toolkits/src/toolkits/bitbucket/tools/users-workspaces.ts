// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketGetCurrentUser = tool({
    description: "Tool to retrieve complete profile information for the currently authenticated Bitbucket user. Use when you need comprehensive user details including account_id, username, nickname, and other profile fields.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
    }),
    execute: async ({ bitbucketToken }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/user`);
        } catch (error) {
            return toBbError(error, "Failed to get current user");
        }
    },
});

export const bitbucketGetUser = tool({
    description: "Retrieves public profile information for a specific Bitbucket user by username or UUID. Use when you need to get user details like display name, avatar, creation date, and links to related resources.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        selectedUser: z.string().describe("The username or UUID of the user to retrieve. Can be a username (e.g., 'john_doe') or a UUID enclosed in curly braces (e.g., '{4f3ecac3-c951-41d4-8a4c-95f40be978fc}')."),
    }),
    execute: async ({ bitbucketToken, selectedUser }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/users/${enc(selectedUser)}`);
        } catch (error) {
            return toBbError(error, "Failed to get user");
        }
    },
});

export const bitbucketGetUserEmails = tool({
    description: "Returns all the authenticated user's email addresses, both confirmed and unconfirmed. Use when you need to retrieve all email addresses associated with the current user's account.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
    }),
    execute: async ({ bitbucketToken }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/user/emails`);
        } catch (error) {
            return toBbError(error, "Failed to get user emails");
        }
    },
});

export const bitbucketGetUserEmailDetails = tool({
    description: "Retrieves details about a specific email address for the authenticated user. Use when you need to check if an email is primary, confirmed, or verify email ownership.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        email: z.string().describe("The email address to retrieve details for. Must be one of the authenticated user's email addresses."),
    }),
    execute: async ({ bitbucketToken, email }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/user/emails/${enc(email)}`);
        } catch (error) {
            return toBbError(error, "Failed to get user email details");
        }
    },
});

export const bitbucketListUserSshKeys = tool({
    description: "Retrieves a paginated list of SSH keys for a specified Bitbucket user. Use when you need to view or audit SSH keys configured for a user account.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("The page number for pagination. Starts at 1."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of SSH keys to return per page. Default is typically 10."),
        username: z.string().describe("The username of the Bitbucket user to retrieve SSH keys for. This is the account username (slug), not the display name or UUID."),
    }),
    execute: async ({ bitbucketToken, username, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/users/${enc(username)}/ssh-keys`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list user ssh keys");
        }
    },
});

export const bitbucketListUserRepositoryPermissions = tool({
    description: "Returns an object for each repository the caller has explicit access to, including their permission level. Use when you need to discover which repositories the authenticated user can access and their specific permissions.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results. Used to retrieve a specific page in a multi-page result set. Page numbers start at 1."),
        pagelen: z.number().int().min(1).optional().describe("Number of items to return per page for pagination. Controls the size of the paginated result set. Default is typically 10 if not specified."),
    }),
    execute: async ({ bitbucketToken, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/user/permissions/repositories`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list user repository permissions");
        }
    },
});

export const bitbucketListUserWorkspacePermissions = tool({
    description: "Retrieves workspace memberships and permission levels for the authenticated user. Returns an object for each workspace the caller is a member of, along with their effective role (highest privilege level). Use when you need to determine which workspaces a user can access and their permission level in each.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string to filter results by workspace slug or permission level using Bitbucket's filtering syntax. Examples: q=workspace.slug=\"workspace1\" or q=permission=\"owner\". Supported fields: workspace.slug (workspace identifier), permission (permission level). Use exact match with = operator. String values must be enclosed in double quotes."),
        page: z.number().int().optional().describe("Page number for pagination. Use this to navigate through multiple pages of results."),
        pagelen: z.number().int().optional().describe("Number of items per page for pagination. Controls how many workspace permission objects are returned in a single response."),
    }),
    execute: async ({ bitbucketToken, q, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/user/permissions/workspaces`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list user workspace permissions");
        }
    },
});

export const bitbucketListUserWorkspaces = tool({
    description: "Tool to retrieve all workspaces accessible to the authenticated user. Use when you need to list workspaces the current user can access, optionally filtered by workspace slug or permission level.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string to filter workspaces by attributes such as workspace slug or permission level. Examples: 'workspace.slug=\"my-workspace\"' or 'permission=\"owner\"'. Follow Bitbucket's filtering syntax for complex queries."),
    }),
    execute: async ({ bitbucketToken, q }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            return await bbRequest(bitbucketToken, 'GET', `/user/permissions/workspaces`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list user workspaces");
        }
    },
});

export const bitbucketListWorkspaceMembers = tool({
    description: "Lists all members of a specified Bitbucket workspace; the workspace must exist.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to the Bitbucket API's default page length if not specified."),
        workspace: z.string().describe("The workspace ID (UUID) or slug from which to list members. The slug is the user-friendly, URL-safe identifier for the workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}/members`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list workspace members");
        }
    },
});

export const bitbucketListWorkspaceProjects = tool({
    description: "Lists projects in a specified Bitbucket workspace. Use when you need to retrieve all projects belonging to a workspace.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string to filter projects by attributes, following Bitbucket's filtering syntax. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal). String values MUST be enclosed in double quotes. Valid project fields: 'name', 'key', 'is_private'. Combine multiple conditions with AND/OR (e.g., 'name~\"api\" AND is_private=true')."),
        page: z.number().int().optional().describe("Specifies which page of results to return. Page numbering starts at 1."),
        sort: z.string().optional().describe("Field to sort returned projects by; prefix with a hyphen (-) for descending order. Common sortable fields: 'name', 'key', 'created_on', 'updated_on'."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Controls the number of items per page. Must be between 1 and 100."),
        workspace: z.string().describe("The identifier of the Bitbucket workspace. This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}')."),
    }),
    execute: async ({ bitbucketToken, workspace, q, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}/projects`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list workspace projects");
        }
    },
});

export const bitbucketGetWorkspace = tool({
    description: "Retrieves detailed information about a specific Bitbucket workspace. Use when you need to get workspace metadata, settings, or details.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        workspace: z.string().describe("The workspace ID (slug) or workspace UUID surrounded by curly-braces. Example: 'my-workspace' or '{workspace-uuid}'."),
    }),
    execute: async ({ bitbucketToken, workspace }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}`);
        } catch (error) {
            return toBbError(error, "Failed to get workspace");
        }
    },
});

export const bitbucketListWorkspaces = tool({
    description: "Lists Bitbucket workspaces accessible to the authenticated user, optionally filtered and sorted. Results are paginated; follow the `next` field in each response to retrieve subsequent pages until `next` is absent. When multiple workspaces are returned, verify the correct `slug` or UUID before passing to downstream tools.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string to filter workspaces by attributes, following Bitbucket's filtering syntax."),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        sort: z.string().optional().describe("Field to sort returned workspaces by; prefix with a hyphen (-) for descending order."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to 10 if not specified."),
    }),
    execute: async ({ bitbucketToken, q, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/workspaces`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list workspaces");
        }
    },
});

export const bitbucketListHookEvents = tool({
    description: "Retrieves a paginated list of all valid webhook events for a specified entity type (repository or workspace). Use when you need to discover available webhook event types for subscription or webhook configuration.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        subjectType: z.enum(["repository", "workspace"]).describe("The type of entity for which to retrieve available webhook events. Use 'repository' for repository-level events or 'workspace' for workspace-level events. Note: team and user webhooks are deprecated; use workspace instead."),
    }),
    execute: async ({ bitbucketToken, subjectType }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/hook_events/${enc(subjectType)}`);
        } catch (error) {
            return toBbError(error, "Failed to list hook events");
        }
    },
});
