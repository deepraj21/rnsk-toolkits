// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfCommit, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCreateDatasetsBranch = tool({
    description: "Tool to create a new branch in a Hugging Face dataset repository. Use when you need to create a branch for versioning or experimentation with dataset changes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The name of the new branch to create."),
        repo: z.string().describe("The name of the dataset repository without the namespace prefix."),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset repository."),
        overwrite: z.boolean().optional().describe("Overwrite the branch if it already exists. Defaults to false."),
        emptyBranch: z.boolean().optional().describe("Create an empty branch without any files. Defaults to false."),
        startingPoint: z.string().optional().describe("The commit hash, tag, or branch name to start the new branch from. Defaults to 'main' if not specified."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace, overwrite, emptyBranch, startingPoint }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { starting_point: startingPoint, empty_branch: emptyBranch, overwrite: overwrite };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/branch/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateDatasetsCommit = tool({
    description: "Tool to create a commit in a Hugging Face dataset repository. Use when you need to add, update, or delete files in a dataset. Supports both regular files and Large File Storage (LFS) for large binary files. Can optionally create a pull request instead of directly committing.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("Revision (branch name, tag, or commit SHA) to commit to"),
        repo: z.string().describe("Name of the dataset repository"),
        files: z.array(z.record(z.any())).optional().describe("List of files to add or update in the commit. Each file requires a path and either content or oldPath."),
        summary: z.string().describe("Summary of the commit (required). This is the commit message title."),
        createPr: z.string().optional().describe("Whether to create a pull request from the commit. Set to '1' or 'true' to create a PR."),
        lfsFiles: z.array(z.record(z.any())).optional().describe("List of Large File Storage (LFS) files to include in the commit"),
        namespace: z.string().describe("Namespace (username or organization) that owns the dataset repository"),
        hotReload: z.string().optional().describe("For Spaces, whether to try to hot reload the commit (only for single Python file updates). Set to '1' or 'true' to enable."),
        description: z.string().optional().describe("Detailed description of the commit (optional). Defaults to empty string."),
        parentCommit: z.string().optional().describe("Parent commit SHA (40-character hexadecimal string). Optional, defaults to HEAD of the revision."),
        deletedEntries: z.array(z.record(z.any())).optional().describe("List of files to delete from the repository"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, summary, createPr, lfsFiles, namespace, hotReload, description, parentCommit, deletedEntries }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['datasets'];
        return hfCommit(huggingFaceToken, { repoType: typeSeg, repoId: repoIdOf(namespace, repo, undefined), rev, summary, description, parentCommit, files, lfsFiles, deletedEntries, createPr });
    },
});

export const huggingFaceCreateDatasetsPreupload = tool({
    description: "Tool to check if files should be uploaded via Large File Storage (LFS) or directly to a Hugging Face dataset repository. Use before uploading files to determine the correct upload method for each file based on size and repository settings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("Revision (branch or commit) to check preupload for. Typically 'main' for the default branch"),
        repo: z.string().describe("Name of the dataset repository"),
        files: z.array(z.record(z.any())).min(1).max(1000).describe("List of files to check for upload method. Maximum 1000 files per request"),
        gitIgnore: z.string().optional().describe("Content of .gitignore file for the revision. Optional; uses existing .gitignore if not provided"),
        namespace: z.string().describe("Namespace (username or organization) that owns the dataset repository"),
        gitAttributes: z.string().optional().describe("Content of .gitattributes file if you plan to modify it yourself. Only needed if managing LFS tracking manually; otherwise HF automatically updates .gitattributes"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, gitIgnore, namespace, gitAttributes }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { files: files, git_attributes: gitAttributes, git_ignore: gitIgnore };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/preupload/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateDatasetsTag = tool({
    description: "Tool to create a tag on a Hugging Face dataset repository. Use when you need to mark a specific revision with a named tag.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch or commit SHA) to create the tag from, typically 'main'."),
        tag: z.string().describe("The name of the tag to create (e.g., 'v1.0', 'release-2024')."),
        repo: z.string().describe("The name of the dataset repository to create a tag for."),
        message: z.string().optional().describe("Optional message describing the purpose of this tag."),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, rev, tag, repo, message, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { revision: rev, message: message };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/tag/${encodeURIComponent(tag)}`, queryParams, body });
    },
});

export const huggingFaceDeleteDatasetsBranch = tool({
    description: "Tool to delete a branch from a Hugging Face dataset repository. Use when you need to remove a branch that is no longer needed. This action permanently removes the specified branch from the dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The name of the branch to delete from the dataset repository. This should be a valid branch name (not the main/master branch in most cases)."),
        repo: z.string().describe("The name of the dataset repository from which to delete the branch. This is the repository identifier without the namespace."),
        namespace: z.string().describe("The namespace (user or organization) that owns the dataset. For example, '121tester' for a user or 'huggingface' for an organization."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/datasets/${repoId}/branch/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceDeleteDatasetsTag = tool({
    description: "Tool to delete a tag from a Hugging Face dataset. Use when you need to remove a specific tag revision from a dataset repository.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The tag revision to delete from the dataset."),
        repo: z.string().describe("The repository name of the dataset."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/datasets/${repoId}/tag/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetDatasetRepoInfo = tool({
    description: "Tool to retrieve detailed information about a Hugging Face dataset repository. Use when you need metadata, card data, tags, downloads, likes, configurations, or other information about a specific dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repoId: z.string().describe("Dataset repository ID in the format author/dataset-name (e.g., 'rajpurkar/squad', 'stanfordnlp/imdb')"),
        revision: z.string().optional().describe("Git revision (branch, tag, or commit SHA) to retrieve information for. If not specified, defaults to the main branch"),
    }),
    execute: async ({ huggingFaceToken, repoId, revision }) => {
        const queryParams = { revision: revision };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}`, queryParams });
    },
});

export const huggingFaceGetDatasetsCompare = tool({
    description: "Tool to get a comparison (diff) between two revisions of a Hugging Face dataset. Use when you need to see what changed between dataset versions or commits.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        raw: z.boolean().optional().describe("Whether to return the raw diff output. If false or not provided, returns formatted diff."),
        repo: z.string().describe("The name of the dataset repository to compare."),
        compare: z.string().describe("The comparison specification in the format 'base..head' (e.g., 'main~1..main' for comparing the previous commit to main, or 'abc123..def456' for comparing specific commits)."),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, raw, repo, compare, namespace }) => {
        const prefix = { models: '', datasets: 'datasets', spaces: 'spaces' }['datasets'];
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = { raw: raw };
        return hfText(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/compare/${compare}`, queryParams });
    },
});

export const huggingFaceGetDatasetsJwt = tool({
    description: "Tool to generate a JWT token for accessing a Hugging Face dataset repository. Use when you need authenticated access to datasets, optionally with write access for spaces in dev mode, custom expiration, or encryption.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the dataset repository."),
        write: z.string().optional().describe("Enable write access for spaces in dev mode. Set to 'true' to enable write access."),
        encrypted: z.string().optional().describe("Request an encrypted JWT token. Set to 'true' to receive encrypted token with key ID."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset repository."),
        expiration: z.string().optional().describe("Custom expiration time for the JWT token. Format depends on Hugging Face API specifications."),
        inferenceApi: z.string().optional().describe("Enable inference API access. Set to 'true' to enable."),
        includeProStatus: z.string().optional().describe("Include Pro status information in the token. Set to 'true' to include."),
    }),
    execute: async ({ huggingFaceToken, repo, write, encrypted, namespace, expiration, inferenceApi, includeProStatus }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { write: write, encrypted: encrypted, expiration: expiration, inference_api: inferenceApi, include_pro_status: includeProStatus };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/jwt`, queryParams });
    },
});

export const huggingFaceGetDatasetsLeaderboard = tool({
    description: "Tool to retrieve evaluation results ranked by score for a dataset's leaderboard. Use when you need to compare model performance on a specific dataset or task. Returns an array of leaderboard entries with model information, scores, and rankings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the dataset. For example, 'results' for the dataset 'open-llm-leaderboard/results'."),
        taskId: z.string().optional().describe("Optional task identifier to filter leaderboard results by a specific task. If not provided, returns results for all tasks."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset. For example, 'open-llm-leaderboard' for the dataset 'open-llm-leaderboard/results'."),
    }),
    execute: async ({ huggingFaceToken, repo, taskId, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { task_id: taskId };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/leaderboard`, queryParams });
    },
});

export const huggingFaceGetDatasetsNotebook = tool({
    description: "Tool to get a Jupyter notebook URL from a Hugging Face dataset repository. Use when you need to retrieve the URL for a specific .ipynb file from a dataset at a particular revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit hash) to retrieve the notebook from."),
        path: z.string().describe("The path to the notebook file within the repository, including the .ipynb extension."),
        repo: z.string().describe("The repository name of the dataset."),
        namespace: z.string().describe("The namespace (user or organization) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/notebook/${encodeURIComponent(rev)}/${encodeURIComponent(path)}`, queryParams });
    },
});

export const huggingFaceGetDatasetsResolve = tool({
    description: "Tool to resolve and download a file from a Hugging Face dataset repository. This endpoint requires following redirections to retrieve file content or returns XET file info when Accept header is set appropriately. Use when you need to access files from datasets with proper redirection handling.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (commit SHA, branch name, or tag) to resolve the file from."),
        path: z.string().describe("The path to the file within the repository (wildcard path parameter)."),
        repo: z.string().describe("The name of the dataset repository."),
        range: z.string().optional().describe("The range in bytes of the file to download (e.g., 'bytes=0-1023' for first 1KB)."),
        accept: z.string().optional().describe("Returns json information about the XET file info if the file is a XET file. Use 'application/vnd.xet-fileinfo+json' to get XET metadata, otherwise leave empty to download file content."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset repository."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const prefix = uiPrefix(repoType);
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/resolve/${encodeURIComponent(rev)}/${path}`, queryParams, headers: { ...(accept ? { Accept: accept } : {}), ...(range ? { Range: range } : {}) } });
    },
});

export const huggingFaceGetDatasetsScan = tool({
    description: "Tool to retrieve the security scan status of a Hugging Face dataset repository. Use when you need to check for malware, pickle vulnerabilities, or other security issues in a dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the dataset repository to scan"),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset repository"),
    }),
    execute: async ({ huggingFaceToken, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/scan`, queryParams });
    },
});

export const huggingFaceGetDatasetsTreesize = tool({
    description: "Tool to get the total size of a Hugging Face dataset repository at a specific revision and path. Use when you need to determine storage requirements or track repository size changes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The Git revision or branch name to query (e.g., 'main', 'dev', or a commit SHA)."),
        path: z.string().optional().describe("The path within the repository to calculate size for. Use '.' for root directory or specify a subdirectory path (e.g., 'data/train'). The size is calculated recursively for all files under this path."),
        repo: z.string().describe("The repository name of the dataset (e.g., 'gsm8k', 'wikitext')."),
        namespace: z.string().describe("The namespace or organization name that owns the dataset (e.g., 'squad', 'openai')."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { path: path };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/treesize/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetDatasetsXetReadToken = tool({
    description: "Tool to get a read short-lived access token for XET from Hugging Face datasets. Use when you need temporary read access to dataset content through XET protocol.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch, tag, or commit) to get the token for. Use 'main' for the default branch."),
        repo: z.string().describe("The repository name of the dataset. For example, 'squad' for the SQuAD dataset."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset. For example, 'rajpurkar' for the SQuAD dataset."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/xet-read-token/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetResolveCacheDatasets = tool({
    description: "Tool to resolve a file from cache in a Hugging Face dataset repository. This endpoint follows redirections (302, 307) to retrieve file content or returns XET file info when Accept header is set appropriately. Use when you need to access cached files from datasets with proper redirection handling.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (commit SHA, branch, or tag) to resolve the file from. Note: This endpoint typically requires an exact commit SHA rather than branch names."),
        path: z.string().describe("The path to the file within the repository (wildcard path parameter)."),
        repo: z.string().describe("The name of the dataset repository."),
        range: z.string().optional().describe("The range in bytes of the file to download (e.g., 'bytes=0-1023' for first 1KB)."),
        accept: z.string().optional().describe("Returns json information about the XET file info if the file is a XET file. Use 'application/vnd.xet-fileinfo+json' to get XET metadata, otherwise leave empty to download file content."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset repository."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['datasets'];
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}/api/${typeSeg}/${repoIdOf(namespace, repo, undefined)}/${encodeURIComponent(rev)}/${path}`, queryParams });
    },
});

export const huggingFaceHandleDatasetsUserAccessRequest = tool({
    description: "Tool to handle a user's access request to a gated Hugging Face dataset. Use this to accept, reject, or update the status of access requests for repositories with gated access. Either 'user' or 'userId' must be provided to identify the user.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the gated dataset. For example, 'test-gated-dataset-cancel'."),
        user: z.string().optional().describe("The username of the user whose access request is being handled. Either 'user' or 'userId' must be provided, but not both."),
        status: z.enum(["accepted", "rejected", "pending"]).describe("The decision on the access request. Use 'accepted' to grant access, 'rejected' to deny access, or 'pending' to keep the request pending."),
        userId: z.string().optional().describe("The user ID (24-character hexadecimal string) of the user whose access request is being handled. Either 'user' or 'userId' must be provided, but not both."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset. For example, '121tester' or 'huggingface'."),
        rejectionReason: z.string().max(200).optional().describe("The reason for rejecting the access request. Maximum 200 characters. Only applicable when status is 'rejected'."),
    }),
    execute: async ({ huggingFaceToken, repo, user, status, userId, namespace, rejectionReason }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { user: user, user_id: userId, rejection_reason: rejectionReason };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/user-access-request/${encodeURIComponent(status)}`, queryParams, body });
    },
});

export const huggingFaceListDatasetPathsInfo = tool({
    description: "Tool to list detailed information about specific paths in a Hugging Face dataset repository. Use when you need to get metadata about files or directories in a dataset, including size, type, commit history, and security scan status.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("Git revision (branch, tag, or commit hash) to query"),
        repo: z.string().describe("Dataset repository name"),
        paths: z.record(z.any()).describe("List of paths to get information about, or a single path string. Paths are relative to the repository root."),
        expand: z.record(z.any()).describe("Whether to expand the response with last commit and security file status information. Can be a boolean or an object with expansion options."),
        namespace: z.string().describe("Namespace (user or organization) that owns the dataset"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, paths, expand, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { paths: paths, expand: expand };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/paths-info/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceListDatasetsCommits = tool({
    description: "Tool to list commits from a Hugging Face dataset repository. Use when you need to retrieve the commit history for a specific dataset branch or revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination. Starts from 0 for the first page."),
        rev: z.string().describe("The revision (branch, tag, or commit hash) to list commits from."),
        repo: z.string().describe("The repository name of the dataset."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of commits to return per page. Default is 50."),
        namespace: z.string().describe("The namespace (username or organization) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, p, rev, repo, limit, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { p: p, limit: limit };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/commits/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceListDatasetsRefs = tool({
    description: "Tool to list all references (branches, tags, converts, pull requests) in a Hugging Face dataset repository. Use when you need to retrieve available references for a specific dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the dataset."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset."),
        includePrs: z.boolean().optional().describe("Whether to include pull requests in the response. Set to true to include pull requests."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace, includePrs }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { include_prs: includePrs };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/refs`, queryParams });
    },
});

export const huggingFaceListDatasetsUserAccessRequest = tool({
    description: "Tool to list access requests for a gated Hugging Face dataset repository. Use when you need to view pending, accepted, or rejected access requests for datasets with restricted access.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the gated dataset"),
        after: z.string().optional().describe("Cursor for pagination - returns requests after this cursor"),
        limit: z.number().int().min(1).optional().describe("Maximum number of access requests to return (default: 1000)"),
        before: z.string().optional().describe("Cursor for pagination - returns requests before this cursor"),
        status: z.enum(["pending", "accepted", "rejected"]).describe("Filter access requests by status: pending, accepted, or rejected"),
        namespace: z.string().describe("The namespace or organization name that owns the dataset"),
    }),
    execute: async ({ huggingFaceToken, repo, after, limit, before, status, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { limit: limit, after: after, before: before };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets/${repoId}/user-access-request/${encodeURIComponent(status)}`, queryParams });
    },
});

export const huggingFaceSquashDatasetCommits = tool({
    description: "Tool to squash all commits in a dataset ref into a single commit with the given message. Use when consolidating commit history into a single commit. WARNING: This operation is irreversible.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The ref (branch or revision) to squash. This operation is irreversible and will squash all commits in this ref into a single commit."),
        repo: z.string().describe("The name of the dataset repository to squash commits in."),
        message: z.string().max(500).optional().describe("The commit message for the squashed commit. Maximum length is 500 characters."),
        namespace: z.string().describe("The namespace (organization or user) that owns the dataset."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, message, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { message: message };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/datasets/${repoId}/super-squash/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceUpdateDatasetsSettings = tool({
    description: "Tool to update settings for a Hugging Face dataset repository. Use when you need to configure visibility, discussions, gating, or access control for a dataset.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the dataset repository"),
        gated: z.record(z.any()).optional().describe("Gating configuration for the dataset. Controls access restrictions and gating behavior. Can be a boolean to enable/disable gating, or an object with gating configuration"),
        isPrivate: z.boolean().optional().describe("Whether the dataset is private. Set to true to make private, false to make public"),
        namespace: z.string().describe("The namespace (organization or username) that owns the dataset"),
        discussionsSorting: z.enum(["recently-created", "trending", "reactions"]).optional().describe("Enum for discussion sorting options."),
        discussionsDisabled: z.boolean().optional().describe("Whether discussions are disabled for this dataset. Set to true to disable discussions, false to enable them"),
        gatedNotificationsMode: z.enum(["bulk", "real-time"]).optional().describe("Enum for gated notification modes."),
        gatedNotificationsEmail: z.string().optional().describe("Email address to receive notifications about gated access requests. Must be a valid email format"),
    }),
    execute: async ({ huggingFaceToken, repo, gated, isPrivate, namespace, discussionsSorting, discussionsDisabled, gatedNotificationsMode, gatedNotificationsEmail }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { gated: gated, private: isPrivate, discussions_sorting: discussionsSorting, discussions_disabled: discussionsDisabled, gated_notifications_mode: gatedNotificationsMode, gated_notifications_email: gatedNotificationsEmail };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/datasets/${repoId}/settings`, queryParams, body });
    },
});
