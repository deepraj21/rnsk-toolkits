// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketCreateIssue = tool({
    description: "Creates a new issue in a Bitbucket repository, setting the authenticated user as reporter; ensures assignee (if provided) has repository access, and that any specified milestone, version, or component IDs exist.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        kind: z.string().optional().describe("Type of the issue (e.g., 'bug', 'enhancement', 'proposal', 'task')."),
        title: z.string().describe("Title for the new issue."),
        dueOn: z.string().optional().describe("Due date for the issue in ISO 8601 format (e.g., 'YYYY-MM-DDTHH:mm:ssZ')."),
        content: z.string().describe("Detailed description for the new issue."),
        assignee: z.string().optional().describe("Bitbucket username of the assignee. The assignee must have repository access."),
        priority: z.string().optional().describe("Priority level of the issue (e.g., 'trivial', 'minor', 'major', 'critical', 'blocker')."),
        repoSlug: z.string().describe("The slug of the Bitbucket repository."),
        workspace: z.string().describe("The ID or slug of the Bitbucket workspace."),
        versionId: z.number().int().optional().describe("Numeric ID of an existing version to associate with this issue."),
        componentId: z.number().int().optional().describe("Numeric ID of an existing component to associate with this issue."),
        milestoneId: z.number().int().optional().describe("Numeric ID of an existing milestone to associate with this issue."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, title, content, kind, dueOn, assignee, priority, versionId, componentId, milestoneId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { title, content: { raw: content } };
            if (kind !== undefined) body.kind = kind;
            if (priority !== undefined) body.priority = priority;
            if (assignee !== undefined) body.assignee = { username: assignee };
            if (milestoneId !== undefined) body.milestone = nameOrIdRef(milestoneId);
            if (versionId !== undefined) body.version = nameOrIdRef(versionId);
            if (componentId !== undefined) body.component = nameOrIdRef(componentId);
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create issue");
        }
    },
});

export const bitbucketUpdateIssue = tool({
    description: "Updates an existing issue in a Bitbucket repository by modifying specified attributes; requires `workspace`, `repo_slug`, `issue_id`, and at least one attribute to update.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        kind: z.enum(["bug", "enhancement", "proposal", "task"]).optional().describe("Types/kinds of Bitbucket issues."),
        state: z.enum(["new", "open", "resolved", "on hold", "invalid", "duplicate", "wontfix", "closed"]).optional().describe("States for Bitbucket issues."),
        title: z.string().optional().describe("The new title for the issue. If omitted, the title remains unchanged."),
        content: z.string().optional().describe("The new content or description for the issue, in raw text format. If omitted, the content remains unchanged."),
        version: z.string().optional().describe("The name of the version affected by this issue (e.g., '1.0.0', '2.0-beta'). If omitted, the version remains unchanged."),
        issueId: z.string().describe("The unique identifier (ID) of the issue to be updated."),
        priority: z.enum(["trivial", "minor", "major", "critical", "blocker"]).optional().describe("Priority levels for Bitbucket issues."),
        component: z.string().optional().describe("The name of the component to associate with the issue (e.g., 'API', 'Frontend'). If omitted, the component remains unchanged."),
        milestone: z.string().optional().describe("The name of the milestone to associate with the issue (e.g., 'Sprint 1', 'v1.0 Launch'). If omitted, the milestone remains unchanged."),
        repoSlug: z.string().describe("The slug or name of the repository (e.g., 'my-app-repo')."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository (e.g., 'my-company' or '{123e4567-e89b-12d3-a456-426614174000}')."),
        assigneeAccountId: z.string().optional().describe("The Bitbucket account ID (UUID) of the user to assign the issue to. If omitted, the assignee remains unchanged."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, issueId, kind, state, title, content, version, priority, component, milestone, assigneeAccountId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (title !== undefined) body.title = title;
            if (content !== undefined) body.content = { raw: content };
            if (kind !== undefined) body.kind = kind;
            if (state !== undefined) body.state = state;
            if (priority !== undefined) body.priority = priority;
            if (component !== undefined) body.component = nameOrIdRef(component);
            if (milestone !== undefined) body.milestone = nameOrIdRef(milestone);
            if (version !== undefined) body.version = nameOrIdRef(version);
            if (assigneeAccountId !== undefined) body.assignee = { account_id: assigneeAccountId };
            return await bbRequest(bitbucketToken, 'PUT', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues/${enc(issueId)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update issue");
        }
    },
});

export const bitbucketDeleteIssue = tool({
    description: "Permanently deletes a specific issue, identified by its `issue_id`, from the repository specified by `repo_slug` within the given `workspace`.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        issueId: z.string().describe("The unique identifier of the issue to be deleted from the specified repository."),
        repoSlug: z.string().describe("The slug of the repository. This is the repository's name, usually in lowercase and with hyphens instead of spaces."),
        workspace: z.string().describe("The workspace ID (slug) or UUID of the Bitbucket workspace that owns the repository. This can be the workspace name or its universally unique identifier."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, issueId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues/${enc(issueId)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete issue");
        }
    },
});

export const bitbucketListIssues = tool({
    description: "Lists issues in a Bitbucket repository with optional filtering by state, priority, kind, or assignee. Use when you need to discover issue IDs or get an overview of repository issues.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        kind: z.string().optional().describe("Filter issues by kind (type). Use 'bug', 'enhancement', 'proposal', or 'task'. If not provided, issues of all kinds are returned."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        state: z.string().optional().describe("Filter issues by state. Use a specific state like 'new', 'open', 'resolved', 'on hold', 'invalid', 'duplicate', 'wontfix', or 'closed'. If not provided, all issues regardless of state are returned."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of issues per page (1-100). Bitbucket default is 10 if not specified."),
        assignee: z.string().optional().describe("Filter issues by assignee. Provide the Bitbucket account ID (UUID) of the assignee. Use 'null' (as a string) to find unassigned issues. If not provided, issues with any assignee (or no assignee) are returned."),
        priority: z.string().optional().describe("Filter issues by priority. Use 'trivial', 'minor', 'major', 'critical', or 'blocker'. If not provided, issues of all priorities are returned."),
        repoSlug: z.string().describe("The slug (URL-friendly name) of the repository."),
        workspace: z.string().describe("The workspace ID or slug (URL-friendly name) that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, kind, page, state, pagelen, assignee, priority }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (state !== undefined) query["state"] = state;
            if (kind !== undefined) query["kind"] = kind;
            if (priority !== undefined) query["priority"] = priority;
            if (assignee !== undefined) query["assignee"] = assignee;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list issues");
        }
    },
});

export const bitbucketCreateIssueComment = tool({
    description: "Adds a new comment with markdown support to an existing Bitbucket issue.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        content: z.string().describe("The raw text content for the comment. This content supports markdown formatting, which Bitbucket will then render."),
        issueId: z.string().describe("The unique identifier of the issue on which the comment will be posted."),
        repoSlug: z.string().describe("The slug (URL-friendly version) of the repository name."),
        workspace: z.string().describe("The ID or slug of the workspace or user that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, issueId, content }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body = { content: { raw: content } };
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues/${enc(issueId)}/comments`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create issue comment");
        }
    },
});

export const bitbucketCheckIssueVote = tool({
    description: "Tool to check whether the authenticated user has voted for a specific issue in a Bitbucket repository. Use when you need to verify if the current user has already voted on an issue before attempting to vote or unvote.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        issueId: z.number().int().describe("The numeric ID of the issue to check vote status for."),
        repoSlug: z.string().describe("The slug (URL-friendly name) of the repository."),
        workspace: z.string().describe("The workspace ID or slug (URL-friendly name) that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, issueId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
try {
                await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/issues/${enc(issueId)}/vote`);
                return { has_voted: true };
            } catch (error) {
                if (error instanceof BitbucketApiError && error.status === 404) return { has_voted: false };
                return toBbError(error, 'Failed to check issue vote');
            }
        } catch (error) {
            return toBbError(error, "Failed to check issue vote");
        }
    },
});

export const bitbucketListVersions = tool({
    description: "Lists versions (milestones) in a Bitbucket repository's issue tracker. Use when you need to discover available versions for associating with issues, or to retrieve version IDs for use with create_issue.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter versions. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal). String values MUST be enclosed in double quotes. Common use case: filter by version name pattern using 'name~\"pattern\"'. Examples: 'name~\"1.\"' (versions starting with 1.), 'name=\"2.0\"' (exact match for version 2.0)."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        sort: z.string().optional().describe("Field for sorting version results. Prefix with '-' for descending order. Common sortable fields: 'name'. Default sorting applies natural sorting."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of versions per page (1-100). Bitbucket default is typically 10 if not specified."),
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
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/versions`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list versions");
        }
    },
});
