// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketSearchWorkspaceCode = tool({
    description: "Tool to search for code in the repositories of the specified workspace. Use when you need to find specific code patterns, function definitions, or text across all repositories in a workspace.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().optional().describe("Page number for pagination. Use this to navigate through multiple pages of search results."),
        fields: z.string().optional().describe("Additional fields to include in the response, using the fields parameter syntax. For example, '+values.file.commit.repository' to include repository details for each code match."),
        pagelen: z.number().int().optional().describe("Number of results per page. Controls how many code search results are returned in a single response."),
        workspace: z.string().describe("The workspace identifier. This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}')."),
        searchQuery: z.string().describe("The search query string to search for in the code. Can use advanced syntax like 'foo+repo:demo' to search within specific repositories, or 'test+ext:py' to filter by file extension."),
    }),
    execute: async ({ bitbucketToken, workspace, searchQuery, page, fields, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (searchQuery !== undefined) query["search_query"] = searchQuery;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (fields !== undefined) query["fields"] = fields;
            return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}/search/code`, { query });
        } catch (error) {
            return toBbError(error, "Failed to search workspace code");
        }
    },
});

export const bitbucketSearchUserCode = tool({
    description: "Tool to search for code in the repositories of a specified user. Use when you need to find specific code patterns, functions, or text across all repositories owned by a user.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Which page of search results to retrieve (default: 1)."),
        fields: z.string().optional().describe("Request additional fields in the response. Use '+' prefix to expand nested fields (e.g., '+values.file.commit.repository' to include repository details)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("How many search results per page (default: 10)."),
        searchQuery: z.string().describe("The search query using the same syntax as the Bitbucket UI. Can include repo filters (e.g., 'test', 'foo+repo:demo')."),
        selectedUser: z.string().describe("The username of the user whose repositories to search."),
    }),
    execute: async ({ bitbucketToken, selectedUser, searchQuery, page, fields, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (searchQuery !== undefined) query["search_query"] = searchQuery;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (fields !== undefined) query["fields"] = fields;
            return await bbRequest(bitbucketToken, 'GET', `/users/${enc(selectedUser)}/search/code`, { query });
        } catch (error) {
            return toBbError(error, "Failed to search user code");
        }
    },
});
