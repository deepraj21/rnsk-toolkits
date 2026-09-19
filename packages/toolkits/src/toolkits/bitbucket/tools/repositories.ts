// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { bbRequest, toBbError, requireToken, enc, encPath, nameOrIdRef, BitbucketApiError } from './client.js';

export const bitbucketCreateRepository = tool({
    description: "Creates a new Bitbucket 'git' repository in a specified workspace, defaulting to the workspace's oldest project if `project_key` is not provided.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        hasWiki: z.boolean().optional().describe("Enable the wiki (`True`), or disable it (`False`)."),
        language: z.string().optional().describe("Primary programming language (e.g., 'python', 'java') for categorization."),
        repoSlug: z.string().describe("URL-friendly slug for the new repository."),
        workspace: z.string().describe("Workspace identifier. Can be a slug (e.g., 'my-workspace') or UUID with curly braces (e.g., '{uuid}'). Bare UUIDs without braces are automatically normalized to the required format."),
        hasIssues: z.boolean().optional().describe("Enable the issue tracker (`True`), or disable it (`False`)."),
        isPrivate: z.boolean().optional().describe("Repository visibility: `True` for private, `False` for public."),
        description: z.string().optional().describe("Description for the new repository."),
        forkPolicy: z.enum(["allow_forks", "no_public_forks", "no_forks"]).optional().describe("Forking policy for the repository, determining who can create forks."),
        projectKey: z.string().optional().describe("Key of the Bitbucket project for the repository; if omitted, it's placed in the workspace's oldest project."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, hasWiki, language, hasIssues, isPrivate, description, forkPolicy, projectKey }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body: Record<string, unknown> = { scm: 'git' };
            if (isPrivate !== undefined) body.is_private = isPrivate;
            if (description !== undefined) body.description = description;
            if (hasWiki !== undefined) body.has_wiki = hasWiki;
            if (hasIssues !== undefined) body.has_issues = hasIssues;
            if (language !== undefined) body.language = language;
            if (forkPolicy !== undefined) body.fork_policy = forkPolicy;
            if (projectKey !== undefined) body.project = { key: projectKey };
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create repository");
        }
    },
});

export const bitbucketDeleteRepository = tool({
    description: "Permanently deletes a specified Bitbucket repository; this action is irreversible and does not affect forks.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The slug (URL-friendly name) of the repository to be deleted. This identifies the repository within the workspace."),
        workspace: z.string().describe("The ID or slug of the Bitbucket workspace that owns the repository. This can be a user's username or a team's slug."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'DELETE', `/repositories/${enc(workspace)}/${enc(repoSlug)}`);
        } catch (error) {
            return toBbError(error, "Failed to delete repository");
        }
    },
});

export const bitbucketGetRepository = tool({
    description: "Retrieves detailed information about a specific repository in a Bitbucket workspace. Use when you need to get repository metadata, settings, or details.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier) for the repository to retrieve."),
        workspace: z.string().describe("The workspace slug or UUID. This identifies the Bitbucket workspace that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}`);
        } catch (error) {
            return toBbError(error, "Failed to get repository");
        }
    },
});

export const bitbucketListWorkspaceRepositories = tool({
    description: "Lists repositories in a specified Bitbucket workspace, accessible to the authenticated user, with options to filter by role or query string, and sort results. Responses are paginated; iterate using the `next` field in each response until it is absent to retrieve all repositories.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter repositories. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal), '>' '>=' '<' '<=' (comparison for dates/numbers). String values MUST be enclosed in double quotes. Valid repository fields: 'name', 'full_name', 'project.key', 'is_private', 'created_on', 'updated_on', 'language'. Combine multiple conditions with AND/OR (e.g., 'name~\"api\" AND is_private=true'). Note: 'repository' is NOT a valid field name - use 'name' instead. Invalid or malformed expressions return empty results silently rather than an error."),
        page: z.number().int().min(1).optional().describe("Page number of the results to retrieve. Defaults to 1 if not specified."),
        role: z.string().optional().describe("Filters repositories by the authenticated user's role within each repository."),
        sort: z.string().optional().describe("Field for sorting repository results. Prefix with '-' for descending order. Common sortable fields: 'name', 'updated_on', 'created_on'."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of results per page (1-100). Defaults to 10 if not specified."),
        workspace: z.string().describe("The identifier of the Bitbucket workspace. This can be the workspace slug (e.g., 'my-workspace') or its UUID enclosed in curly braces (e.g., '{workspace-uuid}'). Empty results may indicate insufficient permissions rather than an invalid identifier."),
    }),
    execute: async ({ bitbucketToken, workspace, q, page, role, sort, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (role !== undefined) query["role"] = role;
            if (q !== undefined) query["q"] = q;
            if (sort !== undefined) query["sort"] = sort;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list workspace repositories");
        }
    },
});

export const bitbucketListRepositories = tool({
    description: "Retrieves a paginated list of all public repositories on Bitbucket. Use when you need to discover or search across public repositories, optionally filtered by role, query string, creation date, or sorted by various fields.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter repositories. Note: This parameter requires the 'role' parameter to be specified. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal), '>' '>=' '<' '<=' (comparison for dates/numbers). String values MUST be enclosed in double quotes. Valid repository fields: 'name', 'full_name', 'is_private', 'created_on', 'updated_on', 'language'. Combine multiple conditions with AND/OR (e.g., 'name~\"api\" AND is_private=false')."),
        page: z.number().int().optional().describe("The page number to retrieve in the paginated list of results. Page numbering starts at 1. Use together with 'pagelen' to control pagination."),
        role: z.enum(["member", "contributor", "admin", "owner"]).optional().describe("Enum for repository role filter values."),
        sort: z.string().optional().describe("Field to sort returned repositories by. Prefix with a hyphen (-) for descending order. Common sortable fields: 'name', 'created_on', 'updated_on'."),
        after: z.string().optional().describe("ISO-8601 timestamp to filter results created after this date/time. Format: YYYY-MM-DDTHH:mm:ss.sssZ (e.g., '2024-01-01T00:00:00.000Z'). Only repositories created after this timestamp will be returned."),
        pagelen: z.number().int().optional().describe("The number of items to return per page. Accepts values between 1 and 100 (inclusive). Defaults to 10 if not specified."),
    }),
    execute: async ({ bitbucketToken, q, page, role, sort, after, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (role !== undefined) query["role"] = role;
            if (q !== undefined) query["q"] = q;
            if (sort !== undefined) query["sort"] = sort;
            if (after !== undefined) query["after"] = after;
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list repositories");
        }
    },
});

export const bitbucketListRepositoryForks = tool({
    description: "Retrieves a paginated list of all forks for a specific repository in a Bitbucket workspace. Returns repository objects for each fork with metadata like owner, creation date, and size. Use this action when you need to discover who has forked a repository or analyze fork relationships.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        page: z.number().int().optional().describe("The page number to retrieve in the paginated list of results. Page numbering starts at 1. Use together with 'pagelen' to control pagination."),
        pagelen: z.number().int().min(1).max(100).optional().describe("The number of items to return per page. Accepts values between 1 and 100 (inclusive)."),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier) for the repository whose forks to list."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, page, pagelen }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (page !== undefined) query["page"] = page;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/forks`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list repository forks");
        }
    },
});

export const bitbucketListRepositoryWatchers = tool({
    description: "Retrieves a paginated list of all the watchers on the specified repository. Use when you need to see who is watching a particular repository.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug (URL-friendly identifier) for the repository."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This is the user-friendly identifier or UUID for the workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/watchers`);
        } catch (error) {
            return toBbError(error, "Failed to list repository watchers");
        }
    },
});

export const bitbucketGetRepositorySrc = tool({
    description: "Lists the contents of the root directory on the repository's main branch without needing to specify a commit or branch. This endpoint redirects to the main branch automatically.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        format: z.string().optional().describe("Optional format parameter. Use 'meta' to get metadata instead of raw contents when accessing files."),
        repoSlug: z.string().describe("The repository slug (URL-friendly repository name)."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, format }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const query: Record<string, unknown> = {};
            if (format !== undefined) query["format"] = format;
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/src`, { query });
        } catch (error) {
            return toBbError(error, "Failed to get repository src");
        }
    },
});

export const bitbucketBrowseRepositoryPath = tool({
    description: "Tool to retrieve content for a file path or browse directory contents at a specified revision in a Bitbucket repository. Use when you need flexible access to repository content - returns raw file data for files or paginated directory listings for directories.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Filter query string using Bitbucket's REST API filtering syntax to narrow results. Only applicable when browsing directories."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1). Only applicable when browsing directories."),
        path: z.string().optional().describe("File or directory path within the repository to browse. Use empty string for root directory."),
        sort: z.string().optional().describe("Field name for sorting results. Prefix with '-' for descending order. Only applicable when browsing directories."),
        commit: z.string().optional().describe("Commit hash, branch name, or tag to browse from. Defaults to 'master' if not specified."),
        format: z.string().optional().describe("Response format. Use 'meta' to return metadata as JSON instead of raw file contents when browsing a file."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of entries per page (1-100). Only applicable when browsing directories. Controls pagination size."),
        maxDepth: z.number().int().min(0).optional().describe("Maximum depth for breadth-first recursive directory traversal. Only applicable when path is a directory. Large values may cause timeouts."),
        repoSlug: z.string().describe("Repository slug or UUID (typically URL-formatted name)."),
        workspace: z.string().describe("Workspace ID or UUID (often username or team name) containing the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, q, page, path, sort, commit, format, pagelen, maxDepth }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
const commitSeg = commit ? `/src/${encPath(commit)}` : '/src';
            const basePath = `/repositories/${enc(workspace)}/${enc(repoSlug)}${commitSeg}`;
            const fullPath = path ? `${basePath}/${encPath(path)}` : basePath;
            const query: Record<string, unknown> = {};
            if (format !== undefined) query["format"] = format;
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (maxDepth !== undefined) query["max_depth"] = maxDepth;
            const data = await bbRequest(bitbucketToken, 'GET', fullPath, { query });
            if (typeof data === 'string') return { content_type: 'file', data };
            return data;
        } catch (error) {
            return toBbError(error, "Failed to browse repository path");
        }
    },
});

export const bitbucketListRepositoryPaths = tool({
    description: "Lists file and directory entries under a repository path at a given revision, with optional breadth-first recursion via max_depth for repository traversal and scanning. Fails if the path points to a file rather than a directory.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Filter query string using Bitbucket's REST API filtering syntax to narrow results."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        path: z.string().optional().describe("Directory path within the repository to list. Use empty string for root. Must be a directory, not a file."),
        sort: z.string().optional().describe("Field name for sorting results. Prefix with '-' for descending order."),
        commit: z.string().describe("Commit hash, branch name, or tag to list paths from. Determines the revision to traverse."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of entries per page (1-100). Controls pagination size."),
        maxDepth: z.number().int().min(0).optional().describe("Maximum depth for breadth-first recursive directory traversal. If specified, includes nested subdirectories up to this depth."),
        repoSlug: z.string().describe("Repository slug or UUID (typically URL-formatted name)."),
        workspace: z.string().describe("Workspace ID or UUID (often username or team name) containing the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, q, page, path, sort, pagelen, maxDepth }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
const commitSeg = commit ? `/src/${encPath(commit)}` : '/src';
            const basePath = `/repositories/${enc(workspace)}/${enc(repoSlug)}${commitSeg}`;
            const fullPath = path ? `${basePath}/${encPath(path)}` : basePath;
            const query: Record<string, unknown> = {};
            if (format !== undefined) query["format"] = format;
            if (q !== undefined) query["q"] = q;
            if (page !== undefined) query["page"] = page;
            if (sort !== undefined) query["sort"] = sort;
            if (pagelen !== undefined) query["pagelen"] = pagelen;
            if (maxDepth !== undefined) query["max_depth"] = maxDepth;
            const data = await bbRequest(bitbucketToken, 'GET', fullPath, { query });
            if (typeof data === 'string') return { content_type: 'file', data };
            return data;
        } catch (error) {
            return toBbError(error, "Failed to list repository paths");
        }
    },
});

export const bitbucketGetFileFromRepository = tool({
    description: "Retrieves a specific file's content from a Bitbucket repository at a given commit (hash, branch, or tag), failing if the file path is invalid for that commit.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        path: z.string().describe("Full path to the file within the repository (e.g., 'src/main.py')."),
        commit: z.string().describe("Commit hash, branch name (fetches latest), or tag for the file version."),
        repoSlug: z.string().describe("Repository slug or UUID (typically URL-formatted name)."),
        workspace: z.string().describe("Workspace ID or UUID (often username or team name) containing the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, commit, path }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
const data: string = await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/src/${encPath(commit)}/${encPath(path)}`, { accept: 'text/plain' });
            return { workspace, repo_slug: repoSlug, commit, path, size: data.length, data };
        } catch (error) {
            return toBbError(error, "Failed to get file from repository");
        }
    },
});

export const bitbucketListBranches = tool({
    description: "Lists branches in a Bitbucket repository with optional server-side filtering by name pattern (BBQL) and sorting. Use when you need to discover available branches, search for specific branch patterns, or navigate repository branch structure.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter branches. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal). String values MUST be enclosed in double quotes. Common use case: filter by branch name pattern using 'name~\"pattern\"'. Examples: 'name~\"feature/\"' (branches starting with feature/), 'name=\"main\"' (exact match for main branch). Combine multiple conditions with AND/OR (e.g., 'name~\"feature/\" OR name~\"bugfix/\"')."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        sort: z.string().optional().describe("Field for sorting branch results. Prefix with '-' for descending order. Common sortable fields: 'name', 'target.date' (commit date). Default sorting applies natural sorting for branch names with numeric values."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of branches per page (1-100). Bitbucket default is typically 10 if not specified."),
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
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs/branches`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list branches");
        }
    },
});

export const bitbucketGetBranch = tool({
    description: "Retrieves detailed information about a specific branch in a Bitbucket repository. Use when you need to get branch metadata, the commit it points to, or verify a branch exists.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        name: z.string().describe("The name of the branch to retrieve (e.g., 'master', 'main', 'feature/my-feature'). Do not include the 'refs/heads/' prefix."),
        repoSlug: z.string().describe("The slug or UUID of the repository. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, name }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs/branches/${encPath(name)}`);
        } catch (error) {
            return toBbError(error, "Failed to get branch");
        }
    },
});

export const bitbucketCreateBranch = tool({
    description: "Creates a new branch in a Bitbucket repository from a target commit hash; the branch name must be unique, adhere to Bitbucket's naming conventions, and not include the 'refs/heads/' prefix.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        name: z.string().describe("The name for the new branch (e.g., 'feature/new-login', 'bugfix/issue-123'). Important: Do not include the 'refs/heads/' prefix."),
        repoSlug: z.string().describe("The slug or UUID of the repository where the branch will be created. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace ID or UUID that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
        targetHash: z.string().describe("The full commit hash (SHA1) from which the new branch will be created. This commit must exist in the repository."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, name, targetHash }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
            const body = { name, target: { hash: targetHash } };
            return await bbRequest(bitbucketToken, 'POST', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs/branches`, { body });
        } catch (error) {
            return toBbError(error, "Failed to create branch");
        }
    },
});

export const bitbucketListTags = tool({
    description: "Lists tags in a Bitbucket repository with optional server-side filtering by name pattern or commit hash (BBQL) and sorting. Use when you need to discover available tags, search for specific tag patterns, or find tags pointing to specific commits.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter tags. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal). String values MUST be enclosed in double quotes. Common use case: filter by tag name pattern using 'name~\"pattern\"' or by commit hash using 'target.hash=\"hash\"'. Examples: 'name~\"v1.\"' (tags starting with v1.), 'name=\"v1.0.0\"' (exact match for v1.0.0 tag), 'target.hash=\"a1b2c3d4\"' (tags pointing to specific commit). Combine multiple conditions with AND/OR (e.g., 'name~\"v1.\" OR name~\"v2.\"')."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        sort: z.string().optional().describe("Field for sorting tag results. Prefix with '-' for descending order. Common sortable fields: 'name', 'target.date' (commit date). Default sorting applies natural sorting for tag names with numeric values."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of tags per page (1-100). Bitbucket default is typically 10 if not specified."),
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
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs/tags`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list tags");
        }
    },
});

export const bitbucketGetTag = tool({
    description: "Retrieves detailed information about a specific tag in a Bitbucket repository. Use when you need to get tag metadata, target commit details, or verify a tag exists.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        name: z.string().describe("The name of the tag to retrieve (without refs/tags/ prefix). For example, 'v1.0.0' or 'fedex17'."),
        repoSlug: z.string().describe("The slug (URL-friendly name) of the repository. This identifies the repository within the workspace."),
        workspace: z.string().describe("The workspace ID or slug that owns the repository. This can be a user's username or a team's slug."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug, name }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs/tags/${encPath(name)}`);
        } catch (error) {
            return toBbError(error, "Failed to get tag");
        }
    },
});

export const bitbucketListRefs = tool({
    description: "Returns the branches and tags in the repository. Use when you need to list all refs (both branches and tags) in a single API call with optional filtering by type, name pattern, or commit hash.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        q: z.string().optional().describe("Query string using Bitbucket Query Language (BBQL) to filter refs. Syntax: 'field operator value'. Operators: '=' (exact match), '~' (contains substring), '!=' (not equal). String values MUST be enclosed in double quotes. Filter by name pattern using 'name~\"pattern\"', by type using 'type=\"branch\"' or 'type=\"tag\"', or by commit hash using 'target.hash=\"hash\"'. Examples: 'name~\"feature/\"' (refs starting with feature/), 'type=\"branch\"' (only branches), 'type=\"tag\"' (only tags), 'target.hash=\"a1b2c3d4\"' (refs pointing to specific commit). Combine multiple conditions with AND/OR (e.g., 'type=\"branch\" AND name~\"feature/\"')."),
        page: z.number().int().min(1).optional().describe("Page number for paginated results (starts from 1)."),
        sort: z.string().optional().describe("Field for sorting ref results. Prefix with '-' for descending order. Common sortable fields: 'name', 'target.date' (commit date). Default sorting applies natural sorting for ref names with numeric values."),
        pagelen: z.number().int().min(1).max(100).optional().describe("Number of refs per page (1-100). Bitbucket default is typically 10 if not specified."),
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
            return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/refs`, { query });
        } catch (error) {
            return toBbError(error, "Failed to list refs");
        }
    },
});

export const bitbucketGetBranchingModel = tool({
    description: "Return the branching model as applied to the repository. Use when you need to understand the repository's branch workflow configuration, including development/production branches and branch type prefixes.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug."),
        workspace: z.string().describe("This can either be the workspace ID (slug) or the workspace UUID surrounded by curly-braces."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/branching-model`);
        } catch (error) {
            return toBbError(error, "Failed to get branching model");
        }
    },
});

export const bitbucketGetEffectiveBranchingModel = tool({
    description: "Retrieves the effective branching model for a Bitbucket repository, showing which branching model is currently applied (including any inheritance from project-level settings). Use when you need to understand the repository's branch workflow configuration, including development and production branches and branch type prefixes.",
    inputSchema: z.object({
        bitbucketToken: z.string().optional().describe("Injected by system; do not provide"),
        repoSlug: z.string().describe("The repository slug. This is usually the repository's name in URL-friendly format."),
        workspace: z.string().describe("The workspace slug or UUID that owns the repository. This can typically be found in the URL of your Bitbucket workspace."),
    }),
    execute: async ({ bitbucketToken, workspace, repoSlug }) => {
        const missing = requireToken(bitbucketToken);
        if (missing) return missing;
        try {
return await bbRequest(bitbucketToken, 'GET', `/repositories/${enc(workspace)}/${enc(repoSlug)}/effective-branching-model`);
        } catch (error) {
            return toBbError(error, "Failed to get effective branching model");
        }
    },
});
