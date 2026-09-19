// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketApprovePullRequest = tool({
    description: "Tool to approve a pull request as the authenticated user. Use when you need to formally approve changes in a pull request review process.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to approve."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/approve`);
        } catch (error) {
            return toBbError(error, "Failed to approve pull request");
        }
    },
});

export const bitbucketCreatePullRequest = tool({
    description: "Creates a new pull request in a specified Bitbucket repository, ensuring the source branch exists and is distinct from the (optional) destination branch.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        title: z.string().describe("Concise title summarizing the changes for the pull request."),
        repoSlug: z.string().describe("Slug (URL-friendly name) of the repository for the pull request."),
        reviewers: z.array(z.object({ uuid: z.string().describe("UUID of the Bitbucket user to add as reviewer (with curly braces)") })).optional().describe("List of Bitbucket user UUIDs to be added as reviewers. Malformed or non-existent UUIDs trigger validation errors."),
        workspace: z.string().describe("Workspace ID (UUID or slug) of the repository owner."),
        description: z.string().optional().describe("Detailed Markdown description of the pull request, outlining changes and purpose."),
        sourceBranch: z.string().describe("Name of the source branch with changes to be merged."),
        destinationBranch: z.string().optional().describe("Name of the destination branch for merging; defaults to repository's main branch if unspecified."),
        closeSourceBranch: z.boolean().optional().describe("If true, automatically closes the source branch upon pull request merge."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, title, sourceBranch, reviewers, description, destinationBranch, closeSourceBranch }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {
                title,
                source: { branch: { name: sourceBranch } },
            };
            if (description !== undefined) body.description = description;
            if (destinationBranch !== undefined) body.destination = { branch: { name: destinationBranch } };
            if (reviewers !== undefined) body.reviewers = reviewers;
            if (closeSourceBranch !== undefined) body.close_source_branch = closeSourceBranch;
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create pull request");
        }
    },
});

export const bitbucketDeclinePullRequest = tool({
    description: "Decline a Bitbucket Cloud pull request via the REST API. Use this action when you need to reject a pull request that should not be merged. This action is irreversible — once declined, the pull request cannot be reopened and must be recreated if needed.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to decline."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/decline`);
        } catch (error) {
            return toBbError(error, "Failed to decline pull request");
        }
    },
});

export const bitbucketMergePullRequest = tool({
    description: "Tool to merge a Bitbucket Cloud pull request via the REST API. Use when you need to complete a PR merge after approval and checks pass. Supports custom merge messages, merge strategies, and source branch deletion.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        message: z.string().optional().describe("Custom merge commit message. If not provided, Bitbucket generates a default message."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        mergeStrategy: z.string().optional().describe("Merge strategy to use. Common values include 'merge_commit', 'squash', 'fast_forward'. If not specified, uses the repository's default merge strategy."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to merge."),
        closeSourceBranch: z.boolean().optional().describe("Whether to close the source branch after merging. If not specified, uses the repository's default setting."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, message, mergeStrategy, closeSourceBranch }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (message !== undefined) body.message = message;
            if (mergeStrategy !== undefined) body.merge_strategy = mergeStrategy;
            if (closeSourceBranch !== undefined) body.close_source_branch = closeSourceBranch;
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/merge`, { body });
        } catch (error) {
            return toBbError(error, "Failed to merge pull request");
        }
    },
});

export const bitbucketRequestPullRequestChanges = tool({
    description: "Tool to request changes on a pull request as the authenticated user. Use when you need to formally request changes in a pull request review process, indicating the PR needs modifications before approval.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to request changes on."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/request-changes`);
        } catch (error) {
            return toBbError(error, "Failed to request pull request changes");
        }
    },
});

export const bitbucketUpdatePullRequest = tool({
    description: "Tool to update an existing pull request's editable fields (e.g., title, description, reviewers) via the Bitbucket Cloud API. Use when you need to modify a pull request without creating a new one. Only sends fields that are explicitly provided to avoid accidental overwrites.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        draft: z.boolean().optional().describe("If true, marks the pull request as a draft. If false, marks it as ready for review. If omitted, draft status remains unchanged."),
        title: z.string().optional().describe("Updated title for the pull request. If omitted, title remains unchanged."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name) or UUID."),
        reviewers: z.array(z.record(z.any())).optional().describe("Updated list of Bitbucket user UUIDs to be reviewers. Replaces existing reviewers. If omitted, reviewers remain unchanged."),
        workspace: z.string().describe("Workspace ID (slug) or workspace UUID that owns the repository."),
        description: z.string().optional().describe("Updated Markdown description for the pull request. If omitted, description remains unchanged."),
        pullRequestId: z.number().int().positive().describe("Unique ID of the pull request to update."),
        closeSourceBranch: z.boolean().optional().describe("If true, automatically closes the source branch upon pull request merge. If omitted, setting remains unchanged."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, draft, title, reviewers, description, closeSourceBranch }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (title !== undefined) body.title = title;
            if (description !== undefined) body.description = description;
            if (reviewers !== undefined) body.reviewers = reviewers;
            if (closeSourceBranch !== undefined) body.close_source_branch = closeSourceBranch;
            if (draft !== undefined) body.draft = draft;
            return await bbRequest(bitbucketToken, 'PUT', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update pull request");
        }
    },
});

export const bitbucketGetPullRequest = tool({
    description: "Get a single pull request by ID with complete details.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name). Must exactly match the pull request's workspace (case-sensitive); slug and UUID are not interchangeable."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to retrieve."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}`);
        } catch (error) {
            return toBbError(error, "Failed to get pull request");
        }
    },
});

export const bitbucketListPullRequests = tool({
    description: "Lists pull requests in a specified, accessible Bitbucket repository, optionally filtering by state (OPEN, MERGED, DECLINED).",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        state: z.enum(["OPEN", "MERGED", "DECLINED"]).optional().describe("Lifecycle state of a pull request."),
        pagelen: z.number().int().min(1).max(50).optional().describe("Number of pull requests per page (1-50). Bitbucket default is 10 if not specified."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, state, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (state !== undefined) query["state"] = state;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pull requests");
        }
    },
});

export const bitbucketListPullRequestTasks = tool({
    description: "Lists all tasks associated with a pull request in a Bitbucket repository. Use when you need to view or track tasks on a PR.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of tasks per page (1-100). Bitbucket default is 10 if not specified."),
        repoSlug: z.string().describe("The slug (URL-friendly name) of the repository."),
        workspace: z.string().describe("The workspace ID or slug (URL-friendly name) that owns the repository."),
        pullRequestId: z.number().int().min(1).describe("The unique identifier of the pull request."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/tasks`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pull request tasks");
        }
    },
});

export const bitbucketListPullRequestCommits = tool({
    description: "Tool to retrieve commits for a specified pull request. Use when reviewing the commit history of a PR or analyzing changes included in a pull request.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100)."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to retrieve commits for."),
        responseDetail: z.enum(["minimal", "full"]).optional().describe("Level of detail in the response. 'minimal' (default) returns only essential commit information (hash, message, date, author name/email, html_link). 'full' returns the complete Bitbucket API response with all nested objects."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, pagelen, responseDetail }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            const data = await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/commits`, { query });
            if (responseDetail === 'full' || !data?.values) return data;
            return {
                ...data,
                values: data.values.map((c: any) => ({
                    hash: c.hash,
                    message: c.message,
                    date: c.date,
                    author_name: c.author?.user?.display_name ?? c.author?.raw,
                    author_email: /<([^>]+)>/.exec(c.author?.raw || '')?.[1],
                    html_link: c.links?.html?.href,
                })),
            };
        } catch (error) {
            return toBbError(error, "Failed to list pull request commits");
        }
    },
});

export const bitbucketGetPullRequestDiff = tool({
    description: "Tool to fetch the unified diff for a Bitbucket pull request (follows 302 redirect to repository diff). Use when reviewing code changes in a PR. Supports optional truncation for large diffs via max_chars parameter.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        maxChars: z.number().int().positive().optional().describe("Maximum number of characters to return in the diff. If the diff exceeds this limit, it will be truncated. If None, no truncation is applied. Use this to protect against very large diffs."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to retrieve the diff for."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, maxChars }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const data: string = await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/diff`, { accept: 'text/plain' });
            if (typeof maxChars === 'number' && data.length > maxChars) {
                return { diff: data.slice(0, maxChars), truncated: true, original_size: data.length };
            }
            return { diff: data, truncated: false };
        } catch (error) {
            return toBbError(error, "Failed to get pull request diff");
        }
    },
});

export const bitbucketGetPullRequestDiffstat = tool({
    description: "Tool to get the diffstat for a Bitbucket pull request, showing all changed files with their change statistics (lines added/removed, status). Use when you need to enumerate files modified in a PR.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of diffstat entries per page (1-100). Bitbucket default is 500 if not specified."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to get diffstat for."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/diffstat`, { query });
        } catch (error) {
            return toBbError(error, "Failed to get pull request diffstat");
        }
    },
});

export const bitbucketListPullRequestActivity = tool({
    description: "Get paginated activity log for all pull requests in a repository. Returns comments, updates, approvals, and request changes. Use when you need to track pull request activity history.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(50).optional().describe("Number of activity entries per page (1-50). Bitbucket default is 20 if not specified."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace ID or slug (URL-friendly name)."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/activity`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pull request activity");
        }
    },
});

export const bitbucketListPullRequestComments = tool({
    description: "Retrieves a paginated list of comments on a specific pull request in a Bitbucket repository. Returns global, inline, and threaded comments. Use when you need to view feedback, discussions, or reviews left on a pull request.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for pagination. Defaults to 1 if not specified."),
        sort: z.string().optional().describe("Sort order for results. Default is oldest to newest. Use '-created_on' for newest to oldest."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of items per page for pagination. Defaults to 10 if not specified."),
        repoSlug: z.string().describe("The slug (URL-friendly version) of the repository name."),
        workspace: z.string().describe("The ID or slug of the workspace that owns the repository."),
        pullRequestId: z.number().int().positive().describe("The pull request ID to retrieve comments for."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, page, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (sort !== undefined) query["sort"] = sort;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pull request comments");
        }
    },
});

export const bitbucketGetPullRequestComment = tool({
    description: "Tool to retrieve a specific comment from a pull request by its ID. Use when you need to fetch details of a particular pull request comment including content, author, timestamps, and inline location.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
        commentId: z.number().int().positive().describe("The unique identifier for the comment."),
        pullRequestId: z.number().int().positive().describe("The unique identifier of the pull request."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, commentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments/${enc(commentId)}`);
        } catch (error) {
            return toBbError(error, "Failed to get pull request comment");
        }
    },
});

export const bitbucketCreatePullRequestComment = tool({
    description: "Creates a new comment on a Bitbucket pull request. Supports top-level comments, threaded replies, and inline code comments. Use when providing feedback on a PR, replying to existing comments, or commenting on specific code lines.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        inline: z.object({ path: z.string().describe("File path for the inline comment"), from: z.number().int().min(1).optional().describe("Starting line number"), to: z.number().int().min(1).optional().describe("Ending line number") }).optional().describe("Location details for inline code comments."),
        repoSlug: z.string().describe("The slug (URL-friendly version) of the repository name."),
        workspace: z.string().describe("The ID or slug of the workspace that owns the repository."),
        contentRaw: z.string().describe("The raw text content for the comment. Supports markdown formatting which Bitbucket will render."),
        pullRequestId: z.number().int().positive().describe("The unique identifier of the pull request to comment on."),
        parentCommentId: z.number().int().optional().describe("ID of an existing comment to reply to, creating a threaded comment. If omitted, creates a top-level comment."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, contentRaw, inline, parentCommentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { content: { raw: contentRaw } };
            if (parentCommentId !== undefined) body.parent = { id: parentCommentId };
            if (inline !== undefined) body.inline = inline;
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create pull request comment");
        }
    },
});

export const bitbucketDeletePullRequestComment = tool({
    description: "Permanently deletes a specific pull request comment (top-level, inline, or threaded reply). Use when removing outdated, incorrect, or unwanted feedback from a pull request.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug of the repository. This is the repository's name, usually in lowercase and with hyphens instead of spaces."),
        workspace: z.string().describe("The workspace ID (slug) or UUID of the Bitbucket workspace that owns the repository. This can be the workspace name or its universally unique identifier."),
        commentId: z.number().int().describe("The unique identifier of the comment to be deleted from the pull request. This can be a top-level comment, inline comment, or threaded reply."),
        pullRequestId: z.number().int().describe("The unique identifier of the pull request containing the comment to be deleted."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, commentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments/${enc(commentId)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete pull request comment");
        }
    },
});

export const bitbucketResolvePullRequestComment = tool({
    description: "Tool to resolve or reopen a pull request comment thread. Use when marking a comment as addressed during review or reopening a previously resolved thread.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        action: z.enum(["resolve", "reopen"]).optional().describe("Action to perform: 'resolve' marks the comment thread as addressed, 'reopen' unmarks it."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
        commentId: z.number().int().positive().describe("The unique identifier for the comment to resolve or reopen."),
        pullRequestId: z.number().int().positive().describe("The unique identifier of the pull request."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, commentId, action }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
if (action === 'reopen') {
                return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments/${enc(commentId)}/resolve`);
            }
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/comments/${enc(commentId)}/resolve`);
        } catch (error) {
            return toBbError(error, "Failed to resolve pull request comment");
        }
    },
});

export const bitbucketListPullRequestStatuses = tool({
    description: "Returns all build statuses (e.g., CI/CD pipeline results) for a specific pull request. Use when you need to check build status, verify test results, or monitor deployment pipelines for a pull request.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of statuses per page (1-100). Bitbucket default is 30 if not specified."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
        pullRequestId: z.number().int().positive().describe("The ID of the pull request to retrieve statuses for."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, pullRequestId, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/pullrequests/${enc(pullRequestId)}/statuses`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list pull request statuses");
        }
    },
});

export const bitbucketGetWorkspacePullRequestsByUser = tool({
    description: "Tool to get all workspace pull requests authored by a specified user. Use when you need to retrieve pull requests created by a specific user across all repositories in a workspace.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        state: z.enum(["OPEN", "MERGED", "DECLINED"]).optional().describe("Lifecycle state of a pull request."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of pull requests per page (1-100). Bitbucket default is 10 if not specified."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
        selectedUser: z.string().describe("The username of the user whose pull requests you want to retrieve."),
    }),
    execute: async ({ bitbucketToken, workspace, selectedUser, page, state, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (state !== undefined) query["state"] = state;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/workspaces/${enc(workspace)}/pullrequests/${enc(selectedUser)}`, { query });
        } catch (error) {
            return toBbError(error, "Failed to get workspace pull requests by user");
        }
    },
});
