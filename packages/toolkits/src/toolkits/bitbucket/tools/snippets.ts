// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketGetSnippet = tool({
    description: "Retrieves a specific Bitbucket snippet by its encoded ID from an existing workspace, returning its metadata and file structure.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        workspace: z.string().describe("The workspace ID (slug) or the workspace UUID surrounded by curly braces, identifying the Bitbucket workspace."),
        encodedId: z.string().describe("The unique identifier (encoded ID) of the snippet to be retrieved."),
        acceptFormat: z.string().optional().describe("The desired format for the response. Valid options are 'application/json', 'multipart/related', or 'multipart/form-data'. This may affect how snippet content or file data is presented."),
    }),
    execute: async ({ bitbucketToken, workspace, encodedId, acceptFormat }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/snippets/${enc(workspace)}/${enc(encodedId)}`, { accept: acceptFormat ?? 'application/json' });
        } catch (error) {
            return toBbError(error, "Failed to get snippet");
        }
    },
});

export const bitbucketListSnippets = tool({
    description: "Returns all snippets accessible to the authenticated user. Use when you need to discover or list snippets, optionally filtered by role (owner, contributor, or member).",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        role: z.enum(["owner", "contributor", "member"]).optional().describe("Enum for snippet role filter values."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to the Bitbucket API's default page length if not specified."),
    }),
    execute: async ({ bitbucketToken, page, role, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (role !== undefined) query["role"] = role;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/snippets`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list snippets");
        }
    },
});

export const bitbucketCreateSnippetComment = tool({
    description: "Posts a new top-level comment or a threaded reply to an existing comment on a specified Bitbucket snippet.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        content: z.string().describe("Raw text content of the comment; Bitbucket will render any included markup (like Markdown)."),
        parentId: z.number().int().optional().describe("ID of an existing comment to reply to, creating a threaded comment; if omitted, a top-level comment is created."),
        workspace: z.string().describe("Workspace ID or slug (e.g., 'my_workspace_slug' or a UUID) for the Bitbucket workspace containing the snippet."),
        encodedId: z.string().describe("Unique, encoded ID of the Bitbucket snippet to comment on (typically part of the snippet's URL)."),
    }),
    execute: async ({ bitbucketToken, workspace, encodedId, content, parentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { content: { raw: content } };
            if (parentId !== undefined) body.parent = { id: parentId };
            return await bbRequest(bitbucketToken, 'POST', `/snippets/${enc(workspace)}/${enc(encodedId)}/comments`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create snippet comment");
        }
    },
});

export const bitbucketGetSnippetWatchStatus = tool({
    description: "Checks if the current user is watching a specific snippet. Use when you need to verify watch status for a snippet.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        workspace: z.string().describe("The workspace ID (slug) or the workspace UUID surrounded by curly braces, identifying the Bitbucket workspace."),
        encodedId: z.string().describe("The unique identifier (encoded ID) of the snippet to check watch status for."),
    }),
    execute: async ({ bitbucketToken, workspace, encodedId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
try {
                await bbRequest(bitbucketToken, 'GET', `/snippets/${enc(workspace)}/${enc(encodedId)}/watch`);
                return { is_watching: true };
            } catch (error) {
                if (error instanceof BitbucketApiError && error.status === 404) return { is_watching: false };
                return toBbError(error, 'Failed to get snippet watch status');
            }
        } catch (error) {
            return toBbError(error, "Failed to get snippet watch status");
        }
    },
});

export const bitbucketDeleteSnippetWatch = tool({
    description: "Stops watching a specific snippet. Use when you want to unsubscribe from notifications for a snippet.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        workspace: z.string().describe("The workspace ID (slug) or the workspace UUID surrounded by curly braces, identifying the Bitbucket workspace."),
        encodedId: z.string().describe("The unique identifier (encoded ID) of the snippet to stop watching."),
    }),
    execute: async ({ bitbucketToken, workspace, encodedId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/snippets/${enc(workspace)}/${enc(encodedId)}/watch`);
        } catch (error) {
            return toBbError(error, "Failed to delete snippet watch");
        }
    },
});
