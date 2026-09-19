// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfCommit, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCheckModelsUploadMethod = tool({
    description: "Tool to check if files should be uploaded through the Large File mechanism or directly. Use when preparing to upload files to a Hugging Face model repository to determine the appropriate upload method for each file.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit hash) to upload to."),
        repo: z.string().describe("The name of the model repository."),
        files: z.array(z.record(z.any())).max(1000).describe("List of files to check for upload method. Maximum 1000 files."),
        gitIgnore: z.string().optional().describe("Content of the .gitignore file for the revision. Optional, otherwise uses existing .gitignore content."),
        namespace: z.string().describe("The namespace (user or organization) that owns the model repository."),
        gitAttributes: z.string().optional().describe("Content of the .gitattributes file. Provide this if you plan to modify .gitattributes yourself when uploading LFS files. Not needed if relying on automatic LFS detection."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, gitIgnore, namespace, gitAttributes }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { files: files, git_attributes: gitAttributes, git_ignore: gitIgnore };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/models/${repoId}/preupload/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateModelsBranch = tool({
    description: "Tool to create a new branch in a Hugging Face model repository. Use when you need to create a branch for experimenting with model changes, versioning, or creating isolated development environments.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The name for the new branch to be created (e.g., 'feature-branch', 'experiment-v2'). This will be the branch name in the repository."),
        repo: z.string().describe("The name of the model repository where the branch will be created. For example, for model 'meta-llama/Llama-2-7b', the repo is 'Llama-2-7b'."),
        namespace: z.string().describe("The namespace (username or organization) that owns the model repository. For example, for model 'meta-llama/Llama-2-7b', the namespace is 'meta-llama'."),
        overwrite: z.boolean().optional().describe("Overwrite the branch if it already exists. If False (default), creating a branch that already exists will result in an error."),
        emptyBranch: z.boolean().optional().describe("Create an empty branch without any files. If True, startingPoint is not required. If False (default), startingPoint should be provided."),
        startingPoint: z.string().optional().describe("The commit hash or branch name to start the new branch from (e.g., 'main', 'dev', or a commit hash). Required unless creating an empty branch. Defaults to 'main' if not specified and emptyBranch is False."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace, overwrite, emptyBranch, startingPoint }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { starting_point: startingPoint, empty_branch: emptyBranch, overwrite: overwrite };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/models/${repoId}/branch/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateModelsCommit = tool({
    description: "Tool to create a commit to a Hugging Face model repository. Use when you need to add, update, or delete files in a model repository. Supports both standard JSON and JSON-lines (NDJSON) formats. JSON-lines format is recommended for better performance.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit SHA) to commit to"),
        repo: z.string().describe("The name of the model repository to commit to"),
        files: z.array(z.record(z.any())).optional().describe("List of files to add or update in the commit"),
        summary: z.string().describe("Summary message for the commit. This is a required field that describes the commit"),
        createPr: z.string().optional().describe("Whether to create a pull request from the commit. Typically '1' or 'true' to create a PR"),
        lfsFiles: z.array(z.record(z.any())).optional().describe("List of LFS (Large File Storage) files to add or update"),
        namespace: z.string().describe("The namespace (user or organization) that owns the model repository"),
        hotReload: z.string().optional().describe("For Spaces, whether to try to hot reload the commit (only for single python files updates). Typically '1' or 'true' to enable hot reload"),
        description: z.string().optional().describe("Optional detailed description for the commit. Defaults to empty string if not provided"),
        contentType: z.enum(["application/json", "application/x-ndjson"]).optional().describe("Content type for the request. Use application/x-ndjson (recommended) for JSON-lines format or application/json for standard JSON"),
        parentCommit: z.string().optional().describe("Optional parent commit SHA (40-character hex string). If provided, the commit will be based on this specific commit"),
        deletedEntries: z.array(z.record(z.any())).optional().describe("List of files to delete from the repository"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, summary, createPr, lfsFiles, namespace, hotReload, description, contentType, parentCommit, deletedEntries }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['models'];
        return hfCommit(huggingFaceToken, { repoType: typeSeg, repoId: repoIdOf(namespace, repo, undefined), rev, summary, description, parentCommit, files, lfsFiles, deletedEntries, createPr });
    },
});

export const huggingFaceCreateModelsTag = tool({
    description: "Tool to create a tag on a Hugging Face model repository. Use when you need to mark a specific revision with a named tag.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch or commit SHA) to create the tag from, typically 'main'."),
        tag: z.string().describe("The name of the tag to create (e.g., 'v1.0', 'release-2024')."),
        repo: z.string().describe("The name of the model repository to create a tag for."),
        message: z.string().optional().describe("Optional message describing the purpose of this tag."),
        namespace: z.string().describe("The namespace (username or organization) that owns the model."),
    }),
    execute: async ({ huggingFaceToken, rev, tag, repo, message, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { revision: rev, message: message };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/models/${repoId}/tag/${encodeURIComponent(tag)}`, queryParams, body });
    },
});

export const huggingFaceGetModelInfo = tool({
    description: "Tool to retrieve detailed information about a Hugging Face model repository. Use when you need comprehensive metadata including downloads, likes, tags, configuration, files, and more.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the model. For example, 'bert-base-uncased' in 'google-bert/bert-base-uncased'."),
        namespace: z.string().describe("The namespace (organization or user) that owns the model repository. For example, 'google-bert' in 'google-bert/bert-base-uncased'."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${encodeURIComponent(namespace)}/${encodeURIComponent(repo)}`, queryParams });
    },
});

export const huggingFaceGetModelsCompare = tool({
    description: "Tool to compare two revisions of a Hugging Face model repository. Returns a git diff showing file changes between commits. Use when you need to see what changed between model versions.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        raw: z.boolean().optional().describe("If true, returns raw diff output. If false or omitted, returns formatted diff."),
        repo: z.string().describe("The repository name of the model (e.g., 'bert-base-uncased', 'llama-2-7b')."),
        compare: z.string().describe("Comparison specification in the format 'commit1..commit2' (two dots). Each commit is a full Git commit hash. For example: '5546055f03398095e385d7dc625e636cc8910bf2..86b5e0934494bd15c9632b12f734a8a67f723594'. Do NOT use three dots (...) as this format is not supported by the API."),
        namespace: z.string().describe("The namespace or organization name that owns the model (e.g., 'google-bert', 'meta-llama', 'openai')."),
    }),
    execute: async ({ huggingFaceToken, raw, repo, compare, namespace }) => {
        const prefix = { models: '', datasets: 'datasets', spaces: 'spaces' }['models'];
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = { raw: raw };
        return hfText(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/compare/${compare}`, queryParams });
    },
});

export const huggingFaceGetModelsJwt = tool({
    description: "Tool to generate a JWT token for accessing a Hugging Face model repository. Use when you need authenticated access to models, with optional write access for spaces in dev mode, custom expiration, and encryption support.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name within the namespace."),
        write: z.string().optional().describe("Enable write access for spaces in dev mode. Set to 'true' to enable write access."),
        encrypted: z.string().optional().describe("Request an encrypted token. Set to 'true' to receive an encrypted JWT token and key ID."),
        namespace: z.string().describe("The namespace (organization or user) that owns the model repository."),
        expiration: z.string().optional().describe("Custom expiration time for the JWT token. Specify the duration or timestamp for token validity."),
        inferenceApi: z.string().optional().describe("Enable inference API access with the token. Set to 'true' to enable."),
        includeProStatus: z.string().optional().describe("Include PRO subscription status in the token. Set to 'true' to include PRO status information."),
    }),
    execute: async ({ huggingFaceToken, repo, write, encrypted, namespace, expiration, inferenceApi, includeProStatus }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { write: write, encrypted: encrypted, expiration: expiration, inference_api: inferenceApi, include_pro_status: includeProStatus };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/jwt`, queryParams });
    },
});

export const huggingFaceGetModelsNotebook = tool({
    description: "Tool to retrieve a Jupyter notebook URL from a Hugging Face model repository. Use when you need to access or display a notebook file stored in a model repository.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision, branch name, tag, or commit hash to retrieve the notebook from (e.g., 'main', 'dev', or a commit SHA)."),
        path: z.string().describe("The path to the Jupyter notebook file within the repository, including the .ipynb extension (e.g., 'Untitled.ipynb' or 'notebooks/demo.ipynb')."),
        repo: z.string().describe("The repository name of the model (e.g., 'example-huggingface-model')."),
        namespace: z.string().describe("The namespace or organization name that owns the model repository (e.g., 'akshat-shethia')."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/notebook/${encodeURIComponent(rev)}/${encodeURIComponent(path)}`, queryParams });
    },
});

export const huggingFaceGetModelsScan = tool({
    description: "Tool to retrieve the security scan status of a Hugging Face model repository. Use when you need to check if a model has been scanned for security issues and view any detected problems.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the model. For example, 'opt-125m' in 'facebook/opt-125m'."),
        namespace: z.string().describe("The namespace (organization or user) that owns the model repository. For example, 'facebook' in 'facebook/opt-125m'."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/scan`, queryParams });
    },
});

export const huggingFaceGetModelsTreesize = tool({
    description: "Tool to get the total size of a Hugging Face model repository at a specific revision and path. Use when you need to determine storage requirements or track repository size changes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The Git revision or branch name to query (e.g., 'main', 'dev', or a commit SHA)."),
        path: z.string().optional().describe("The path within the repository to calculate size for. Use '.' for root directory or specify a subdirectory path (e.g., 'weights', 'config'). The size is calculated recursively for all files under this path."),
        repo: z.string().describe("The repository name of the model (e.g., 'bert-base-uncased', 'llama-2-7b')."),
        namespace: z.string().describe("The namespace or organization name that owns the model (e.g., 'google-bert', 'facebook', 'openai')."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { path: path };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/treesize/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetModelsXetReadToken = tool({
    description: "Tool to retrieve a short-lived XET read access token for a Hugging Face model repository. Use when you need to access XET (eXtensible Tensor) data for a specific model revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch, tag, or commit hash) to get the XET read token for. Common values include 'main', 'master', or specific commit hashes."),
        repo: z.string().describe("The repository name of the model. For example, 'bert-base-uncased' in 'google-bert/bert-base-uncased'."),
        namespace: z.string().describe("The namespace (organization or user) that owns the model repository. For example, 'google-bert' in 'google-bert/bert-base-uncased'."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/xet-read-token/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetResolveCacheModels = tool({
    description: "Tool to resolve and retrieve files from the Hugging Face model cache. Use when you need to access model configuration files, tokenizer files, or other JSON metadata files from a specific model repository. This endpoint returns the actual file content as JSON for JSON files (e.g., config.json, tokenizer.json, tokenizer_config.json).",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision to resolve. Must be a full Git commit SHA (40 characters). Branch names like 'main' or tags are not supported by this endpoint."),
        path: z.string().describe("The file path within the repository to resolve. For example, 'config.json', 'pytorch_model.bin', or 'tokenizer.json'."),
        repo: z.string().describe("The repository name of the model. For example, 'bert-base-uncased' in 'google-bert/bert-base-uncased'."),
        range: z.string().optional().describe("The range in bytes of the file to download. Use HTTP Range header format like 'bytes=0-1023'."),
        accept: z.string().optional().describe("Optional Accept header to specify the desired response format. Common values include 'application/json', 'application/vnd.xet-fileinfo+json', or '*/*'."),
        namespace: z.string().describe("The namespace (organization or user) that owns the model repository. For example, 'google-bert' in 'google-bert/bert-base-uncased'."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['models'];
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}/api/${typeSeg}/${repoIdOf(namespace, repo, undefined)}/${encodeURIComponent(rev)}/${path}`, queryParams });
    },
});

export const huggingFaceListModelsCommits = tool({
    description: "Tool to list commits from a Hugging Face model repository. Use when you need to retrieve the commit history for a specific model branch or revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination. Starts from 0 for the first page."),
        rev: z.string().describe("The revision (branch, tag, or commit hash) to list commits from."),
        repo: z.string().describe("The repository name of the model."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of commits to return per page. Default is 50."),
        expand: z.array(z.string()).optional().describe("List of fields to expand in the response. Use 'formatted' to include formatted commit messages."),
        namespace: z.string().describe("The namespace (username or organization) that owns the model."),
    }),
    execute: async ({ huggingFaceToken, p, rev, repo, limit, expand, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { p: p, limit: limit, expand: expand };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/commits/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceListModelsPathsInfo = tool({
    description: "Tool to list detailed information about specific paths in a Hugging Face model repository. Use when you need to get metadata about files or directories in a model, including size, type, commit history, and security scan status.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("Git revision (branch, tag, or commit hash) to query"),
        repo: z.string().describe("Model repository name"),
        paths: z.record(z.any()).describe("List of paths to get information about, or a single path string. Paths are relative to the repository root."),
        expand: z.record(z.any()).describe("Whether to expand the response with last commit and security file status information. Can be a boolean or an object with expansion options."),
        namespace: z.string().describe("Namespace (user or organization) that owns the model"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, paths, expand, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { paths: paths, expand: expand };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/models/${repoId}/paths-info/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceListModelsRefs = tool({
    description: "Tool to list all references (branches, tags, converts, and optionally pull requests) in a Hugging Face model repository. Use when you need to retrieve version control information for a specific model.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("Repository name within the namespace (e.g., 'bert-base-uncased')"),
        namespace: z.string().describe("Namespace or organization name (e.g., 'google-bert', 'facebook')"),
        includePrs: z.boolean().optional().describe("Whether to include pull requests in the response. Defaults to false."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace, includePrs }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { include_prs: includePrs };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models/${repoId}/refs`, queryParams });
    },
});

export const huggingFaceUpdateModelsSettings = tool({
    description: "Tool to update settings for a Hugging Face model repository. Use when you need to modify repository configuration such as privacy, discussions, or gated access settings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the model repository to update settings for."),
        isPrivate: z.boolean().optional().describe("Whether the model repository should be private (requires authentication to access) or public."),
        namespace: z.string().describe("The namespace (username or organization) that owns the model repository."),
        discussionsSorting: z.enum(["recently-created", "trending", "reactions"]).optional().describe("Sorting order for discussions."),
        discussionsDisabled: z.boolean().optional().describe("Whether to disable discussions for this model repository. Set to true to disable, false to enable."),
        gatedNotificationsMode: z.enum(["bulk", "real-time"]).optional().describe("Notification mode for gated access requests."),
        gatedNotificationsEmail: z.string().optional().describe("Email address to receive notifications about gated access requests. Must be a valid email format."),
    }),
    execute: async ({ huggingFaceToken, repo, isPrivate, namespace, discussionsSorting, discussionsDisabled, gatedNotificationsMode, gatedNotificationsEmail }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { private: isPrivate, discussions_sorting: discussionsSorting, discussions_disabled: discussionsDisabled, gated_notifications_mode: gatedNotificationsMode, gated_notifications_email: gatedNotificationsEmail };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/models/${repoId}/settings`, queryParams, body });
    },
});
