// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketGetCommit = tool({
    description: "Tool to retrieve detailed information about a specific commit in a Bitbucket repository. Use when you need to get complete commit details including author, message, date, parents, and related links.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash (SHA) to retrieve."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}`);
        } catch (error) {
            return toBbError(error, "Failed to get commit");
        }
    },
});

export const bitbucketListCommits = tool({
    description: "Tool to retrieve a page of commits from a Bitbucket repository. Returns commits in reverse chronological order (newest first), similar to git log. Use when you need to browse commit history, filter commits by branch/tag, or restrict to commits affecting a specific path.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        path: z.string().optional().describe("Filter commits to only those that affect the specified file or directory path."),
        exclude: z.string().optional().describe("Branch or tag name, or commit SHA to exclude from the commit history. Commits reachable from this ref will be excluded. Multiple values can be separated by commas."),
        include: z.string().optional().describe("Branch or tag name, or commit SHA to include in the commit history. If not specified, the repository's default branch is used. Multiple values can be separated by commas (e.g., 'main,develop')."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100). Bitbucket default is typically 30 if not specified."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, path, exclude, include, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (include !== undefined) query["include"] = include;
            if (exclude !== undefined) query["exclude"] = exclude;
            if (path !== undefined) query["path"] = path;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commits`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list commits");
        }
    },
});

export const bitbucketListCommitsFromRevision = tool({
    description: "Tool to list commits starting from a specific revision in a Bitbucket repository. Commits are paginated and returned in reverse chronological order. Use when you need to retrieve commit history from a specific commit, branch, or tag.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        path: z.string().optional().describe("Optional file path to filter commits. Only commits that modified this file or directory will be returned."),
        exclude: z.string().optional().describe("Optional commit hash or branch to exclude from the results. Can be used to create a range with the 'include' parameter."),
        include: z.string().optional().describe("Optional commit hash or branch to include in the results. Can be used to create a range with the 'exclude' parameter."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100). Bitbucket default is typically 30 if not specified."),
        revision: z.string().describe("The commit hash, branch name, tag, or other revision identifier to start listing commits from. Commits are returned in reverse chronological order starting from this revision."),
        repoSlug: z.string().describe("The slug of the repository. This is the repository's name, usually in lowercase and with hyphens instead of spaces."),
        workspace: z.string().describe("The workspace ID (slug) or UUID of the Bitbucket workspace that owns the repository. This can be the workspace name or its universally unique identifier."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, revision, page, path, exclude, include, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (include !== undefined) query["include"] = include;
            if (exclude !== undefined) query["exclude"] = exclude;
            if (path !== undefined) query["path"] = path;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commits/${enc(revision)}`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list commits from revision");
        }
    },
});

export const bitbucketListCommitsOnMaster = tool({
    description: "Lists commits on the master branch of a Bitbucket repository. Use when you need to retrieve the commit history for the master branch, including commit messages, authors, dates, and parent relationships.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100). Bitbucket default is typically 30 if not specified."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commits/master`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list commits on master");
        }
    },
});

export const bitbucketListCommitsFromRevisionPost = tool({
    description: "Tool to list commits from a revision using POST method. Identical to GET endpoint but allows sending include/exclude parameters in request body to avoid URL length limits. Use when include/exclude parameters are too long for query strings.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        path: z.string().optional().describe("Optional file path to filter commits. Only commits that modified this file or directory will be returned."),
        exclude: z.string().optional().describe("Optional commit hash or branch to exclude from the results. Can be used to create a range with the 'include' parameter. Use POST method when this value is very long."),
        include: z.string().optional().describe("Optional commit hash or branch to include in the results. Can be used to create a range with the 'exclude' parameter. Use POST method when this value is very long."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100). Bitbucket default is typically 30 if not specified."),
        revision: z.string().describe("The commit hash, branch name, tag, or other revision identifier to start listing commits from. Commits are returned in reverse chronological order starting from this revision."),
        repoSlug: z.string().describe("The slug of the repository. This is the repository's name, usually in lowercase and with hyphens instead of spaces."),
        workspace: z.string().describe("The workspace ID (slug) or UUID of the Bitbucket workspace that owns the repository. This can be the workspace name or its universally unique identifier."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, revision, page, path, exclude, include, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = {};
            if (include !== undefined) body.include = include;
            if (exclude !== undefined) body.exclude = exclude;
                        const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (path !== undefined) query["path"] = path;
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commits/${enc(revision)}`, { query, body });
        } catch (error) {
            return toBbError(error, "Failed to list commits from revision post");
        }
    },
});

export const bitbucketListCommitComments = tool({
    description: "Retrieves all comments on a specific commit in a Bitbucket repository. Returns both global and inline code comments. Use when you need to view feedback, discussions, or notes left on a specific commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for pagination. Defaults to 1 if not specified."),
        commit: z.string().describe("The commit hash/SHA to retrieve comments for."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of items per page for pagination. Defaults to 10 if not specified."),
        repoSlug: z.string().describe("The slug (URL-friendly version) of the repository name."),
        workspace: z.string().describe("The ID or slug of the workspace that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/comments`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list commit comments");
        }
    },
});

export const bitbucketGetCommitComment = tool({
    description: "Retrieves a specific comment from a commit by its ID. Use when you need to fetch details of a particular commit comment including content, author, timestamps, and inline location.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to retrieve the comment from."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
        commentId: z.number().int().positive().describe("The unique identifier for the comment."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, commentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/comments/${enc(commentId)}`);
        } catch (error) {
            return toBbError(error, "Failed to get commit comment");
        }
    },
});

export const bitbucketUpdateCommitComment = tool({
    description: "Updates the contents of a comment on a commit. Use when you need to modify an existing comment's text on a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash to update the comment on."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
        commentId: z.string().describe("The unique identifier for the comment to update."),
        contentRaw: z.string().describe("The updated raw text content for the comment. Supports markdown formatting."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, commentId, contentRaw }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body = { content: { raw: contentRaw } };
            return await bbRequest(bitbucketToken, 'PUT', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/comments/${enc(commentId)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to update commit comment");
        }
    },
});

export const bitbucketDeleteCommitComment = tool({
    description: "Permanently deletes a specific comment on a commit. Use when removing outdated, incorrect, or unwanted feedback on a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash (SHA) or commit reference. This identifies the commit that has the comment to be deleted."),
        repoSlug: z.string().describe("The slug of the repository. This is the repository's name, usually in lowercase and with hyphens instead of spaces."),
        workspace: z.string().describe("The workspace ID (slug) or UUID of the Bitbucket workspace that owns the repository. This can be the workspace name or its universally unique identifier."),
        commentId: z.string().describe("The unique identifier of the comment to be deleted from the specified commit."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, commentId }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/comments/${enc(commentId)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete commit comment");
        }
    },
});

export const bitbucketGetCommitDiff = tool({
    description: "Tool to retrieve the unified diff between two provided revisions or for a single commit in a Bitbucket repository. Use when you need to see the actual code changes in a commit or between two commits. Supports filtering by file path and various diff options.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        path: z.string().optional().describe("Optional file path to filter the diff to a specific file or directory. If omitted, returns diff for all changes."),
        spec: z.string().describe("A commit SHA, branch name, tag, or revspec (e.g. '3a8b42..9ff173' for range). For a single commit, provide the commit hash. For comparing two commits, use 'commit1..commit2' format."),
        merge: z.boolean().optional().describe("Whether to generate merge diff. Set to true for merge commit diffs."),
        topic: z.boolean().optional().describe("Whether to generate a 2-way three-dot diff when spec contains two commits. Set to true to use three-dot diff notation."),
        binary: z.boolean().optional().describe("Whether to include binary file diffs. Set to true to include binary diffs in the output."),
        context: z.number().int().min(0).optional().describe("Number of context lines to include around changes. If not specified, uses the default context lines."),
        renames: z.boolean().optional().describe("Whether to detect file renames. Set to true to show rename detection in the diff."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name)."),
        workspace: z.string().describe("The workspace ID or username that owns the repository."),
        ignoreWhitespace: z.boolean().optional().describe("Whether to ignore whitespace changes in the diff. Set to true to exclude whitespace-only changes."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, spec, path, merge, topic, binary, context, renames, ignoreWhitespace }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (path !== undefined) query["path"] = path;
            if (merge !== undefined) query["merge"] = merge;
            if (topic !== undefined) query["topic"] = topic;
            if (binary !== undefined) query["binary"] = binary;
            if (context !== undefined) query["context"] = context;
            if (renames !== undefined) query["renames"] = renames;
            if (ignoreWhitespace !== undefined) query["ignore_whitespace"] = ignoreWhitespace;
            const data: string = await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/diff/${encPath(spec)}`, { query, accept: 'text/plain' });
            return { diff: data };
        } catch (error) {
            return toBbError(error, "Failed to get commit diff");
        }
    },
});

export const bitbucketGetCommitChanges = tool({
    description: "Tool to retrieve a page of changes made in a specified commit, showing all changed files with their change statistics (lines added/removed, status). Use when you need to enumerate files modified in a specific commit or commit range.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        spec: z.string().describe("Commit SHA or range (e.g., '3a8b42' for single commit or '3a8b42..9ff173' for range)."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of changes per page (1-100). Bitbucket default is 500 if not specified."),
        repoSlug: z.string().describe("Repository slug (URL-friendly name)."),
        workspace: z.string().describe("Workspace ID or slug (URL-friendly name)."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, spec, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/diffstat/${encPath(spec)}`, { query });
        } catch (error) {
            return toBbError(error, "Failed to get commit changes");
        }
    },
});

export const bitbucketGetCommitBuildStatus = tool({
    description: "Get a specific build status for a commit in Bitbucket. Use when you need to check the status of a particular build/CI run for a commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        key: z.string().describe("The unique key identifying the specific build status."),
        commit: z.string().describe("The commit hash to get the build status for."),
        repoSlug: z.string().describe("The slug or UUID of the repository."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, key }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/statuses/build/${enc(key)}`);
        } catch (error) {
            return toBbError(error, "Failed to get commit build status");
        }
    },
});

export const bitbucketListCommitStatuses = tool({
    description: "Returns all build statuses (e.g., CI/CD pipeline results) for a specific commit. Use when you need to check build status, verify test results, or monitor deployment pipelines for a particular commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        commit: z.string().describe("The commit hash (SHA) to retrieve statuses for. Can be full or abbreviated hash."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/commit/${encPath(commit)}/statuses`);
        } catch (error) {
            return toBbError(error, "Failed to list commit statuses");
        }
    },
});

export const bitbucketGetFileHistory = tool({
    description: "Returns a paginated list of commits that modified the specified file. Use when you need to track file changes over time, find who modified a file, or determine when a file was created or last changed.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string for filtering commits in the file history. Common use: filter by commit date using 'commit.date<=YYYY-MM-DD' or 'commit.date>=YYYY-MM-DD'. Example: 'commit.date<=2024-12-31' returns only commits before that date."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        path: z.string().describe("Full path to the file within the repository (e.g., 'README.md', 'src/main.py')."),
        commit: z.string().describe("Commit hash, branch name, or tag from which to retrieve file history. The API returns commits reachable from this reference that modified the file."),
        fields: z.string().optional().describe("Comma-separated list of fields to include or exclude from the response. Prefix with '+' to add fields or '-' to remove them. Example: '+values.commit.message' adds commit messages to the response."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of commits per page (1-100). Default is typically 30 if not specified."),
        renames: z.boolean().optional().describe("Whether to follow file renames through history. If true (default), returns commits that modified the file even if it had a different name. If false, only returns commits where the file had the current path."),
        repoSlug: z.string().describe("The repository slug (URL-friendly name) or UUID."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, path, q, page, fields, pagelen, renames }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (fields !== undefined) query["fields"] = fields;
            if (renames !== undefined) query["renames"] = renames;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/filehistory/${encPath(commit)}/${encPath(path)}`, { query });
        } catch (error) {
            return toBbError(error, "Failed to get file history");
        }
    },
});

export const bitbucketGetMergeBase = tool({
    description: "Get the merge base (best common ancestor) between two commits in a Bitbucket repository. Use when you need to find the common ancestor commit between two branches or commits for comparison or merge operations.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        revspec: z.string().describe("Two commit hashes separated by '..' (e.g., '3a8b42..9ff173' or 'abc123..def456'). This specifies the two commits to find the best common ancestor between."),
        repoSlug: z.string().describe("The slug or UUID of the repository."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, revspec }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/merge-base/${encPath(revspec)}`);
        } catch (error) {
            return toBbError(error, "Failed to get merge base");
        }
    },
});

export const bitbucketGetRepositoryPatch = tool({
    description: "Tool to retrieve the git patch content for a Bitbucket repository at a specified revision or commit range. Use when you need to review code changes, generate diffs, or analyze modifications between commits. Returns raw patch in unified diff format.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        spec: z.string().describe("A commit hash, branch name, tag, or commit range (e.g., '3a8b42..9ff173'). If a single commit is provided, the diff is against its first parent. For ranges, shows diff between the two commits."),
        maxChars: z.number().int().positive().optional().describe("Maximum number of characters to return in the patch. If the patch exceeds this limit, it will be truncated. If None, no truncation is applied. Use this to protect against very large patches."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, spec, maxChars }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const data: string = await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/patch/${encPath(spec)}`, { accept: 'text/plain' });
            if (typeof maxChars === 'number' && data.length > maxChars) {
                return { diff: data.slice(0, maxChars), truncated: true, original_size: data.length };
            }
            return { diff: data, truncated: false };
        } catch (error) {
            return toBbError(error, "Failed to get repository patch");
        }
    },
});
