// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfCommit, hfStream, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCheckSpacesUploadMethod = tool({
    description: "Tool to check if files should be uploaded through the Large File mechanism or directly to Hugging Face Spaces. Use when preparing to upload files to a Hugging Face Space repository to determine the appropriate upload method for each file.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit hash) to upload to."),
        repo: z.string().describe("The name of the Space repository."),
        files: z.array(z.record(z.any())).max(1000).describe("List of files to check for upload method. Maximum 1000 files."),
        gitIgnore: z.string().optional().describe("Content of the .gitignore file for the revision. Optional, otherwise uses existing .gitignore content."),
        namespace: z.string().describe("The namespace (user or organization) that owns the Space repository."),
        gitAttributes: z.string().optional().describe("Content of the .gitattributes file. Provide this if you plan to modify .gitattributes yourself when uploading LFS files. Not needed if relying on automatic LFS detection."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, gitIgnore, namespace, gitAttributes }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { files: files, git_attributes: gitAttributes, git_ignore: gitIgnore };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/preupload/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateSpacesBranch = tool({
    description: "Tool to create a new branch in a Hugging Face space repository. Use when you need to create a branch for experimenting with space changes, versioning, or creating isolated development environments.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The name for the new branch to be created (e.g., 'feature-branch', 'experiment-v2'). This will be the branch name in the repository."),
        repo: z.string().describe("The name of the space repository where the branch will be created. For example, for space 'huggingface/my-space', the repo is 'my-space'."),
        namespace: z.string().describe("The namespace (username or organization) that owns the space repository. For example, for space 'huggingface/my-space', the namespace is 'huggingface'."),
        overwrite: z.boolean().optional().describe("Overwrite the branch if it already exists. If False (default), creating a branch that already exists will result in an error."),
        emptyBranch: z.boolean().optional().describe("Create an empty branch without any files. If True, startingPoint is not required. If False (default), startingPoint should be provided."),
        startingPoint: z.string().optional().describe("The commit hash or branch name to start the new branch from (e.g., 'main', 'dev', or a commit hash). Required unless creating an empty branch. Defaults to 'main' if not specified and emptyBranch is False."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace, overwrite, emptyBranch, startingPoint }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { starting_point: startingPoint, empty_branch: emptyBranch, overwrite: overwrite };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/branch/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceCreateSpacesCommit = tool({
    description: "Tool to create a commit in a Hugging Face Space repository. Use when you need to add, update, or delete files in a Space. Supports both JSON and NDJSON (recommended) payload formats for commits.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch or commit) to commit to. Typically 'main' for the default branch"),
        repo: z.string().describe("The name of the Space repository where the commit will be created. For example, for Space 'user/my-space', the repo is 'my-space'"),
        files: z.array(z.record(z.any())).min(1).optional().describe("List of files to add or update in the commit. For JSON payload format only"),
        summary: z.string().describe("Summary of the commit (required). This is the commit message title"),
        createPr: z.string().optional().describe("Whether to create a pull request from the commit instead of committing directly. Set to 'true' to create a PR, 'false' or omit to commit directly"),
        lfsFiles: z.array(z.record(z.any())).min(1).optional().describe("List of Large File Storage (LFS) files to add or update. For JSON payload format only"),
        hotReload: z.string().optional().describe("For Spaces, whether to try to hot reload the commit (only works for single Python file updates). Set to 'true' to enable hot reload"),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space. For example, for Space 'user/my-space', the namespace is 'user'"),
        contentType: z.enum(["application/json", "application/x-ndjson"]).optional().describe("Content type for the commit request."),
        description: z.string().optional().describe("Detailed description of the commit (optional, defaults to empty string). This is the commit message body"),
        parentCommit: z.string().optional().describe("The parent commit SHA (40-character hexadecimal). Optional, defaults to current HEAD of the branch"),
        deletedEntries: z.array(z.record(z.any())).min(1).optional().describe("List of file paths to delete in the commit. For JSON payload format only"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, files, summary, createPr, lfsFiles, hotReload, namespace, contentType, description, parentCommit, deletedEntries }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['spaces'];
        return hfCommit(huggingFaceToken, { repoType: typeSeg, repoId: repoIdOf(namespace, repo, undefined), rev, summary, description, parentCommit, files, lfsFiles, deletedEntries, createPr });
    },
});

export const huggingFaceCreateSpacesSecrets = tool({
    description: "Tool to create or update a secret in a Hugging Face Space. Use when you need to add or update environment variables or sensitive configuration values for a Space. This action upserts the secret, meaning it will create a new secret if it doesn't exist or update it if it already exists.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        key: z.string().describe("The name of the secret key. Must start with a letter and contain only letters, digits, and underscores (pattern: ^[a-zA-Z][_a-zA-Z0-9]*$). For example: 'API_KEY', 'DATABASE_URL', 'TEST_SECRET_KEY'."),
        repo: z.string().describe("The name of the Space repository where the secret will be created or updated. For example, for Space 'huggingface/my-space', the repo is 'my-space'."),
        value: z.string().optional().describe("The value of the secret. This will be stored securely and not visible after creation. Defaults to empty string if not provided."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space. For example, for Space 'huggingface/my-space', the namespace is 'huggingface'."),
        description: z.string().optional().describe("Optional description of the secret to help identify its purpose. For example: 'API key for external service', 'Database connection string'."),
    }),
    execute: async ({ huggingFaceToken, key, repo, value, namespace, description }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { key: key, value: value, description: description };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/secrets`, queryParams, body });
    },
});

export const huggingFaceCreateSpacesTag = tool({
    description: "Tool to create a tag on a Hugging Face space repository. Use when you need to mark a specific revision with a named tag.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch or commit SHA) to create the tag from, typically 'main'."),
        tag: z.string().describe("The name of the tag to create (e.g., 'v1.0', 'release-2024')."),
        repo: z.string().describe("The name of the space repository to create a tag for."),
        message: z.string().optional().describe("Optional message describing the purpose of this tag."),
        namespace: z.string().describe("The namespace (username or organization) that owns the space."),
    }),
    execute: async ({ huggingFaceToken, rev, tag, repo, message, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { revision: rev, message: message };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/tag/${encodeURIComponent(tag)}`, queryParams, body });
    },
});

export const huggingFaceCreateSpacesVariables = tool({
    description: "Tool to create or update a variable in a Hugging Face Space. Use when you need to add or update environment variables or configuration values for a Space. This action upserts the variable, meaning it will create a new variable if it doesn't exist or update it if it already exists.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        key: z.string().describe("The name of the variable key. Must start with a letter and contain only letters, digits, and underscores (pattern: ^[a-zA-Z][_a-zA-Z0-9]*$). For example: 'APP_MODE', 'DEBUG_ENABLED', 'TEST_VAR_123'."),
        repo: z.string().describe("The name of the Space repository where the variable will be created or updated. For example, for Space 'huggingface/my-space', the repo is 'my-space'."),
        value: z.string().optional().describe("The value of the variable. This will be stored and can be accessed by the Space. Defaults to empty string if not provided."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space. For example, for Space 'huggingface/my-space', the namespace is 'huggingface'."),
        description: z.string().optional().describe("Optional description of the variable to help identify its purpose. For example: 'Environment mode setting', 'Debug flag for development'."),
    }),
    execute: async ({ huggingFaceToken, key, repo, value, namespace, description }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { key: key, value: value, description: description };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/variables`, queryParams, body });
    },
});

export const huggingFaceDeleteSpacesBranch = tool({
    description: "Tool to delete a branch from a Hugging Face space repository. Use when you need to remove a branch that is no longer needed. This action permanently removes the specified branch from the space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The name of the branch to delete from the space repository. This should be a valid branch name (not the main branch in most cases)."),
        repo: z.string().describe("The name of the space repository from which to delete the branch. This is the repository identifier without the namespace."),
        namespace: z.string().describe("The namespace (user or organization) that owns the space. For example, '121tester' for a user or 'huggingface' for an organization."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/spaces/${repoId}/branch/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceDeleteSpacesSecrets = tool({
    description: "Tool to delete a secret from a Hugging Face space. Use when you need to remove sensitive credentials or configuration values that are no longer needed. This action permanently removes the specified secret from the space's environment variables.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        key: z.string().describe("The key name of the secret to delete from the space. This should be the exact name of the secret as it appears in the space's settings."),
        repo: z.string().describe("The name of the space repository from which to delete the secret. This is the repository identifier without the namespace."),
        namespace: z.string().describe("The namespace (user or organization) that owns the space. For example, '121tester' for a user or 'huggingface' for an organization."),
    }),
    execute: async ({ huggingFaceToken, key, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/spaces/${repoId}/secrets/${encodeURIComponent(key)}`, queryParams });
    },
});

export const huggingFaceDeleteSpacesTag = tool({
    description: "Tool to delete a tag from a Hugging Face space. Use when you need to remove a specific tag revision from a space repository.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The tag revision to delete from the space."),
        repo: z.string().describe("The repository name of the space."),
        namespace: z.string().describe("The namespace (organization or user) that owns the space."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/spaces/${repoId}/tag/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceDeleteSpacesVariables = tool({
    description: "Tool to delete a variable from a Hugging Face space. Use when you need to remove configuration values or environment variables that are no longer needed. This action permanently removes the specified variable from the space's environment.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        key: z.string().describe("The key name of the variable to delete from the space. This should be the exact name of the variable as it appears in the space's settings."),
        repo: z.string().describe("The name of the space repository from which to delete the variable. This is the repository identifier without the namespace."),
        namespace: z.string().describe("The namespace (user or organization) that owns the space. For example, '121tester' for a user or 'huggingface' for an organization."),
    }),
    execute: async ({ huggingFaceToken, key, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/spaces/${repoId}/variables/${encodeURIComponent(key)}`, queryParams });
    },
});

export const huggingFaceGetResolveCacheSpaces = tool({
    description: "Tool to resolve and retrieve a file from Hugging Face Spaces cache. Use when you need to download a file from a Space repository or get XET file information. This endpoint follows redirections (HTTP 302/307) to resolve the final file location.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit hash) to retrieve the file from. Use a full commit SHA for exact version, or 'main' for the default branch."),
        path: z.string().describe("The path to the file within the repository. This is a wildcard path parameter that can include subdirectories and filename."),
        repo: z.string().describe("The repository name of the Space. For example, 'gradio-user-history' for the Wauplin/gradio-user-history Space."),
        range: z.string().optional().describe("The range in bytes of the file to download. Format: 'bytes=start-end'. If not provided, the entire file will be retrieved."),
        accept: z.string().optional().describe("Accept header to specify the response format. Use 'application/vnd.xet-fileinfo+json' to get JSON information about XET file info instead of the file content."),
        namespace: z.string().describe("The namespace (user or organization) that owns the Space. For example, 'Wauplin' for the Wauplin/gradio-user-history Space."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const typeSeg = { model: 'models', dataset: 'datasets', space: 'spaces' }['spaces'];
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}/api/${typeSeg}/${repoIdOf(namespace, repo, undefined)}/${encodeURIComponent(rev)}/${path}`, queryParams });
    },
});

export const huggingFaceGetSpaceInfo = tool({
    description: "Tool to retrieve detailed information about a Hugging Face Space repository. Use when you need metadata, SDK type, hardware configuration, runtime status, or other information about a specific Space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repoId: z.string().describe("Space repository ID in the format author/space-name (e.g., 'Qwen/Qwen3-TTS', 'stabilityai/stable-diffusion')"),
        revision: z.string().optional().describe("Git revision (branch, tag, or commit SHA) to retrieve information for. If not specified, defaults to the main branch"),
    }),
    execute: async ({ huggingFaceToken, repoId, revision }) => {
        const queryParams = { revision: revision };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}`, queryParams });
    },
});

export const huggingFaceGetSpacesCompare = tool({
    description: "Tool to compare two revisions of a Hugging Face Space repository. Returns a git diff showing file changes between commits. Use when you need to see what changed between Space versions.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        raw: z.boolean().optional().describe("If true, returns raw diff output. If false or omitted, returns formatted diff."),
        repo: z.string().describe("The repository name of the Space (e.g., 'Qwen3-TTS', 'chatgpt-demo')."),
        compare: z.string().describe("Comparison specification in the format 'commit1..commit2' (two dots). Each commit is a full Git commit hash. For example: 'bb80b9adea7bc1d818bc635e839db60b7d4aa8f1..8a132844625e28e09f36427c30070276dfd9b2ed'. Do NOT use three dots (...) as this format is not supported by the API."),
        namespace: z.string().describe("The namespace or organization name that owns the Space (e.g., 'Qwen', 'openai', 'gradio')."),
    }),
    execute: async ({ huggingFaceToken, raw, repo, compare, namespace }) => {
        const prefix = { models: '', datasets: 'datasets', spaces: 'spaces' }['spaces'];
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = { raw: raw };
        return hfText(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/compare/${compare}`, queryParams });
    },
});

export const huggingFaceGetSpacesEvents = tool({
    description: "Tool to stream status updates for a Hugging Face Space using SSE protocol. Use when you need to monitor Space build stages, runtime status, or receive real-time updates about Space state changes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the Space."),
        timeout: z.number().int().min(1).max(30).optional().describe("Maximum time in seconds to wait for status updates. Defaults to 5 seconds."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space."),
        sessionUuid: z.string().optional().describe("Optional session UUID to filter events for a specific session."),
    }),
    execute: async ({ huggingFaceToken, repo, timeout, namespace, sessionUuid }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { timeout: timeout, session_uuid: sessionUuid };
        return hfStream(huggingFaceToken, { url: `${HOSTS.HUB}/api/spaces/${repoId}/events`, queryParams, timeoutMs: ((timeout ?? 5) * 1000) });
    },
});

export const huggingFaceGetSpacesJwt = tool({
    description: "Tool to generate a JWT token for accessing a Hugging Face space repository. Use when you need authenticated access to spaces, with optional write access for spaces in dev mode, custom expiration, and encryption support.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the space repository."),
        write: z.string().optional().describe("Enable write access for spaces in dev mode. Set to 'true' to enable write access."),
        encrypted: z.string().optional().describe("Request an encrypted token. Set to 'true' to receive an encrypted JWT token and key ID."),
        namespace: z.string().describe("The namespace (organization or user) that owns the space repository."),
        expiration: z.string().optional().describe("Custom expiration time for the JWT token. Specify the duration or timestamp for token validity."),
        inferenceApi: z.string().optional().describe("Enable inference API access with the token. Set to 'true' to enable."),
        includeProStatus: z.string().optional().describe("Include PRO subscription status in the token. Set to 'true' to include PRO status information."),
    }),
    execute: async ({ huggingFaceToken, repo, write, encrypted, namespace, expiration, inferenceApi, includeProStatus }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { write: write, encrypted: encrypted, expiration: expiration, inference_api: inferenceApi, include_pro_status: includeProStatus };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/jwt`, queryParams });
    },
});

export const huggingFaceGetSpacesMetrics = tool({
    description: "Tool to get live metrics for a specific Space in a streaming fashion, with SSE protocol, such as current Zero-GPU usage. Use when you need real-time monitoring of Space resource utilization.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the Space."),
        timeout: z.number().int().min(1).max(30).optional().describe("Maximum time in seconds to wait for metrics updates. Defaults to 5 seconds."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space."),
    }),
    execute: async ({ huggingFaceToken, repo, timeout, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { timeout: timeout };
        return hfStream(huggingFaceToken, { url: `${HOSTS.HUB}/api/spaces/${repoId}/metrics`, queryParams, timeoutMs: ((timeout ?? 5) * 1000) });
    },
});

export const huggingFaceGetSpacesNotebook = tool({
    description: "Tool to retrieve a Jupyter notebook URL from a Hugging Face space repository. Use when you need to access or display a notebook file stored in a space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision, branch name, tag, or commit hash to retrieve the notebook from (e.g., 'main', 'dev', or a commit SHA)."),
        path: z.string().describe("The path to the Jupyter notebook file within the repository, including the .ipynb extension (e.g., 'notebooks/automatic_mask_generator_example.ipynb')."),
        repo: z.string().describe("The repository name of the space (e.g., 'SAM2-Video-Predictor')."),
        namespace: z.string().describe("The namespace or organization name that owns the space repository (e.g., 'fffiloni')."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/notebook/${encodeURIComponent(rev)}/${encodeURIComponent(path)}`, queryParams });
    },
});

export const huggingFaceGetSpacesResolve = tool({
    description: "Tool to resolve and retrieve a file from a Hugging Face Space repository. Use when you need to download a file from a Space or get XET file information. This endpoint follows redirections (HTTP 302/307) to resolve the final file location.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The git revision (branch, tag, or commit hash) to retrieve the file from. Use 'main' for the default branch or a specific commit SHA for exact version."),
        path: z.string().describe("The file path within the repository to resolve. This wildcard path parameter can include subdirectories and filename."),
        repo: z.string().describe("The repository name of the Space. For example, 'stable-diffusion-3-medium' for the stabilityai/stable-diffusion-3-medium Space."),
        range: z.string().optional().describe("The range in bytes of the file to download. Format: 'bytes=start-end'. If not provided, the entire file will be retrieved."),
        accept: z.string().optional().describe("Accept header to specify the response format. Use 'application/vnd.xet-fileinfo+json' to get JSON information about XET file info instead of the file content."),
        namespace: z.string().describe("The namespace (user or organization) that owns the Space. For example, 'stabilityai' for the stabilityai/stable-diffusion-3-medium Space."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const prefix = uiPrefix(repoType);
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/resolve/${encodeURIComponent(rev)}/${path}`, queryParams, headers: { ...(accept ? { Accept: accept } : {}), ...(range ? { Range: range } : {}) } });
    },
});

export const huggingFaceGetSpacesScan = tool({
    description: "Tool to retrieve the security scan status of a Hugging Face space repository. Use when you need to check for malware, pickle vulnerabilities, or other security issues in a space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the space repository to check security status for"),
        namespace: z.string().describe("The namespace (organization or user) that owns the space repository"),
    }),
    execute: async ({ huggingFaceToken, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/scan`, queryParams });
    },
});

export const huggingFaceGetSpacesTreesize = tool({
    description: "Tool to get the total size of a Hugging Face space repository at a specific revision and path. Use when you need to determine storage requirements or track repository size changes.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The Git revision or branch name to query (e.g., 'main', 'dev', or a commit SHA)."),
        path: z.string().optional().describe("The path within the repository to calculate size for. Use '.' for root directory or specify a subdirectory path (e.g., 'static/images'). The size is calculated recursively for all files under this path."),
        repo: z.string().describe("The repository name of the space (e.g., 'hello_world', 'chatbot')."),
        namespace: z.string().describe("The namespace or organization name that owns the space (e.g., 'gradio', 'huggingface')."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { path: path };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/treesize/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetSpacesXetReadToken = tool({
    description: "Tool to retrieve a short-lived XET read access token for a Hugging Face Space repository. Use when you need to access XET (eXtensible Tensor) data for a specific Space revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch, tag, or commit hash) to get the XET read token for. Common values include 'main', 'master', or specific commit hashes."),
        repo: z.string().describe("The repository name of the Space. For example, 'Ace-Step-v1.5' in 'ACE-Step/Ace-Step-v1.5'."),
        namespace: z.string().describe("The namespace (organization or user) that owns the Space repository. For example, 'ACE-Step' in 'ACE-Step/Ace-Step-v1.5'."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/xet-read-token/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceGetSpacesXetWriteToken = tool({
    description: "Tool to retrieve a short-lived XET write access token for a Hugging Face space repository. Use when you need to upload or write XET data to a specific space revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch, tag, or commit hash) to get the XET write token for. Common values include 'main', 'master', or specific commit hashes."),
        repo: z.string().describe("The repository name of the space. For example, 'ComfyUI' in 'SpacesExamples/ComfyUI'."),
        createPr: z.number().int().optional().describe("Pass 1 to enable PR creation mode for users without direct write access to the repository. When set, changes will be submitted as a pull request instead of direct commits."),
        namespace: z.string().describe("The namespace (organization or user) that owns the space repository. For example, 'SpacesExamples' in 'SpacesExamples/ComfyUI'."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, createPr, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { create_pr: createPr };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/xet-write-token/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceListSpacesCommits = tool({
    description: "Tool to list commits from a Hugging Face Space repository. Use when you need to retrieve the commit history for a specific Space branch or revision.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination. Starts from 0 for the first page."),
        rev: z.string().describe("The revision (branch, tag, or commit hash) to list commits from."),
        repo: z.string().describe("The repository name of the Space."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of commits to return per page. Default is 50."),
        expand: z.array(z.string()).optional().describe("List of fields to expand in the response. Use 'formatted' to include formatted commit messages."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space."),
    }),
    execute: async ({ huggingFaceToken, p, rev, repo, limit, expand, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { p: p, limit: limit, expand: expand };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/commits/${encodeURIComponent(rev)}`, queryParams });
    },
});

export const huggingFaceListSpacesHardware = tool({
    description: "Tool to retrieve available hardware configurations for Hugging Face Spaces with their specifications and pricing. Use when you need to discover compute options for running spaces.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/hardware`, queryParams });
    },
});

export const huggingFaceListSpacesLfsFiles = tool({
    description: "Tool to list LFS (Large File Storage) files from a Hugging Face Space repository. Use when you need to retrieve large files stored in a Space using Git LFS.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        xet: z.string().optional().describe("Filter for Xet-specific files. Used for Xet-enabled repositories."),
        repo: z.string().describe("The repository name of the Space."),
        limit: z.number().int().min(1).max(10000).optional().describe("Maximum number of LFS files to return. Default is 1000."),
        cursor: z.string().optional().describe("Cursor for pagination. Use the cursor returned from a previous request to fetch the next page of results."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Space."),
    }),
    execute: async ({ huggingFaceToken, xet, repo, limit, cursor, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { limit: limit, cursor: cursor, xet: xet };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/lfs-files`, queryParams });
    },
});

export const huggingFaceListSpacesPathsInfo = tool({
    description: "Tool to list detailed information about specific paths in a Hugging Face space repository. Use when you need to get metadata about files or directories in a space, including size, type, commit history, and security scan status.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("Git revision (branch, tag, or commit hash) to query"),
        repo: z.string().describe("Space repository name"),
        paths: z.record(z.any()).describe("List of paths to get information about, or a single path string. Paths are relative to the repository root."),
        expand: z.record(z.any()).describe("Whether to expand the response with last commit and security file status information. Can be a boolean or an object with expansion options."),
        namespace: z.string().describe("Namespace (user or organization) that owns the space"),
    }),
    execute: async ({ huggingFaceToken, rev, repo, paths, expand, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { paths: paths, expand: expand };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/paths-info/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceListSpacesRefs = tool({
    description: "Tool to list all references (branches, tags, converts, pull requests) in a Hugging Face space repository. Use when you need to retrieve available references for a specific space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the space."),
        namespace: z.string().describe("The namespace (organization or user) that owns the space."),
        includePrs: z.boolean().optional().describe("Whether to include pull requests in the response. Set to true to include pull requests."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace, includePrs }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { include_prs: includePrs };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces/${repoId}/refs`, queryParams });
    },
});

export const huggingFaceSquashSpacesCommits = tool({
    description: "Tool to squash all commits in a space ref into a single commit with the given message. Use when consolidating commit history into a single commit. WARNING: This operation is irreversible.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The ref (branch or revision) to squash. This operation is irreversible and will squash all commits in this ref into a single commit. Typically 'main' or a branch name."),
        repo: z.string().describe("The name of the space repository where commits will be squashed. For example, for space '121tester/test-curl-space', the repo is 'test-curl-space'."),
        message: z.string().max(500).optional().describe("The commit message for the squashed commit. Maximum length is 500 characters. If not provided, a default message will be used."),
        namespace: z.string().describe("The namespace (username or organization) that owns the space repository. For example, for space '121tester/test-curl-space', the namespace is '121tester'."),
    }),
    execute: async ({ huggingFaceToken, rev, repo, message, namespace }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { message: message };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/spaces/${repoId}/super-squash/${encodeURIComponent(rev)}`, queryParams, body });
    },
});

export const huggingFaceUpdateSpacesSettings = tool({
    description: "Tool to update settings for a Hugging Face Spaces repository. Use when you need to modify repository configuration such as privacy, discussions, or gated access settings.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the Spaces repository to update settings for."),
        gated: z.record(z.any()).optional().describe("Gating configuration for the Spaces repository. Controls access restrictions and gating behavior. Can be a boolean to enable/disable gating, or an object with gating configuration."),
        isPrivate: z.boolean().optional().describe("Whether the Spaces repository should be private (requires authentication to access) or public."),
        namespace: z.string().describe("The namespace (username or organization) that owns the Spaces repository."),
        discussionsSorting: z.enum(["recently-created", "trending", "reactions"]).optional().describe("Sorting order for discussions."),
        discussionsDisabled: z.boolean().optional().describe("Whether to disable discussions for this Spaces repository. Set to true to disable, false to enable."),
        gatedNotificationsMode: z.enum(["bulk", "real-time"]).optional().describe("Notification mode for gated access requests."),
        gatedNotificationsEmail: z.string().optional().describe("Email address to receive notifications about gated access requests. Must be a valid email format."),
    }),
    execute: async ({ huggingFaceToken, repo, gated, isPrivate, namespace, discussionsSorting, discussionsDisabled, gatedNotificationsMode, gatedNotificationsEmail }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { gated: gated, private: isPrivate, discussions_sorting: discussionsSorting, discussions_disabled: discussionsDisabled, gated_notifications_mode: gatedNotificationsMode, gated_notifications_email: gatedNotificationsEmail };
        return hfApi(huggingFaceToken, { method: 'PUT', url: `${HOSTS.HUB}/api/spaces/${repoId}/settings`, queryParams, body });
    },
});
