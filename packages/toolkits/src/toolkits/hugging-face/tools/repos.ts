// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfRedirect, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceCreateAskAccess = tool({
    description: "Tool to request access to a gated repository on Hugging Face Hub. Use when you need to submit an access request for models, datasets, or Spaces that require approval. The fields required vary by repository.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The repository name of the gated model, dataset, or Space."),
        namespace: z.string().describe("The namespace (organization or user) that owns the gated repository."),
        repoType: z.enum(["models", "datasets", "spaces"]).optional().describe("The type of repository (models, datasets, or spaces). Defaults to models."),
        accessRequestFields: z.record(z.any()).describe("A dictionary of field names and values required by the repository's access form. Common fields include \"First Name\", \"Last Name\", \"Date of birth\" (YYYY-MM-DD format), \"Country\" (country code), \"Affiliation\", \"Job title\", and terms acceptance fields. The exact fields vary by repository and are specified in the repository's gated access configuration."),
    }),
    execute: async ({ huggingFaceToken, repo, namespace, repoType, accessRequestFields }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/user-access-request`, body: accessRequestFields });
    },
});

export const huggingFaceCreateCollection = tool({
    description: "Tool to create a new collection on Hugging Face. Use when you need to organize and curate models, datasets, spaces, papers, or other collections into a named collection.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        item: z.record(z.any()).optional().describe("Item to be added to the collection upon creation."),
        title: z.string().min(1).max(60).describe("The title of the collection. Must be between 1 and 60 characters."),
        isPrivate: z.boolean().optional().describe("If not provided, the collection will be public. This field will respect the organization's visibility setting."),
        namespace: z.string().describe("The namespace (username or organization) under which to create the collection"),
        description: z.string().max(150).optional().describe("Optional description for the collection. Maximum 150 characters."),
    }),
    execute: async ({ huggingFaceToken, item, title, isPrivate, namespace, description }) => {
        const queryParams = undefined;
        const body = { item: item, title: title, private: isPrivate, namespace: namespace, description: description };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/collections`, queryParams, body });
    },
});

export const huggingFaceCreateRepo = tool({
    description: "Tool to create a new repository (model, dataset, or Space) on Hugging Face Hub. Use when you need to initialize a new repository for uploading models, datasets, or deploying Spaces applications.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        sdk: z.enum(["gradio", "streamlit", "docker", "static"]).optional().describe("SDK options for Spaces."),
        name: z.string().describe("The name of the repository to create. This will be the repository identifier within the namespace."),
        type: z.enum(["model", "dataset", "space"]).optional().describe("The type of repository to create: model, dataset, or space. Defaults to 'model' if not specified."),
        isPrivate: z.boolean().optional().describe("Whether the repository should be private. If not specified, follows the default visibility setting for your account or organization."),
        organization: z.string().optional().describe("The organization namespace to create the repository under. If not provided, the repository will be created under your personal namespace."),
    }),
    execute: async ({ huggingFaceToken, sdk, name, type, isPrivate, organization }) => {
        const queryParams = undefined;
        const body = { sdk: sdk, name: name, type: type, private: isPrivate, organization: organization };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/repos/create`, queryParams, body });
    },
});

export const huggingFaceGetDatasetsTagsByType = tool({
    description: "Tool to retrieve all possible tags used for datasets on Hugging Face, grouped by tag type. Use when you need to discover available dataset classification tags, filter options, or metadata categories. Optionally restrict results to a single tag type.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        type: z.enum(["benchmark", "task_categories", "size_categories", "modality", "format", "library", "language", "license", "arxiv", "doi", "region", "other", "task_ids", "annotations_creators", "language_creators", "multilinguality", "source_datasets"]).optional().describe("Valid tag type values for filtering dataset tags."),
    }),
    execute: async ({ huggingFaceToken, type }) => {
        const queryParams = { type: type };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets-tags-by-type`, queryParams });
    },
});

export const huggingFaceGetModelTagsByType = tool({
    description: "Tool to retrieve all possible tags used for Hugging Face models, grouped by tag type. Use when you need to discover available model tags for filtering or categorization. Optionally restrict results to a specific tag type.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        type: z.enum(["pipeline_tag", "library", "dataset", "language", "license", "arxiv", "doi", "region", "other"]).optional().describe("Enum for model tag types on Hugging Face."),
    }),
    execute: async ({ huggingFaceToken, type }) => {
        const queryParams = { type: type };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/models-tags-by-type`, queryParams });
    },
});

export const huggingFaceGetResolve = tool({
    description: "Tool to resolve a file in a Hugging Face repository. Use when you need to access files from model, dataset, or space repositories. This endpoint follows redirections (302, 307) to retrieve the actual file. When Accept header is set to 'application/vnd.xet-fileinfo+json', returns JSON file metadata instead of redirecting to file content.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        rev: z.string().describe("The revision (branch, tag, or commit hash) to resolve. Common values include 'main' or specific Git commit SHAs."),
        path: z.string().describe("The file path within the repository to resolve. For example, 'config.json', 'pytorch_model.bin', or 'tokenizer.json'."),
        repo: z.string().describe("The repository name within the namespace. For example, 'bart-large' in 'facebook/bart-large'."),
        range: z.string().optional().describe("The range in bytes of the file to download. Use HTTP Range header format like 'bytes=0-1023' to download only specific byte ranges."),
        accept: z.string().optional().describe("Returns JSON information about the XET file info if the file is a XET file. Set to 'application/vnd.xet-fileinfo+json' to receive JSON file metadata instead of following redirect to file content."),
        namespace: z.string().describe("The namespace (organization or user) that owns the repository. For example, 'facebook' in 'facebook/bart-large'."),
    }),
    execute: async ({ huggingFaceToken, rev, path, repo, range, accept, namespace }) => {
        const prefix = uiPrefix(repoType);
        const basePath = prefix ? `/${prefix}/${repoIdOf(namespace, repo, undefined)}` : `/${repoIdOf(namespace, repo, undefined)}`;
        const queryParams = undefined;
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}${basePath}/resolve/${encodeURIComponent(rev)}/${path}`, queryParams, headers: { ...(accept ? { Accept: accept } : {}), ...(range ? { Range: range } : {}) } });
    },
});

export const huggingFaceGetTrending = tool({
    description: "Tool to retrieve trending repositories from Hugging Face. Use when you need to discover popular models, datasets, or spaces that are currently trending on the platform.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        type: z.enum(["all", "dataset", "model", "space"]).optional().describe("Repository type filter for trending repositories."),
        limit: z.number().int().min(1).optional().describe("Maximum number of trending repositories to return. Defaults to 10."),
    }),
    execute: async ({ huggingFaceToken, type, limit }) => {
        const queryParams = { repoType: type, limit: limit };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/trending`, queryParams });
    },
});

export const huggingFaceListCollections = tool({
    description: "Tool to list collections on the Hugging Face Hub. Use when you need to discover collections of models, datasets, spaces, or papers. Collections are curated groups of repositories organized by users.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        q: z.string().optional().describe("Search query to filter collections by title or description. Use keywords to find relevant collections."),
        item: z.string().optional().describe("Filter collections by item ID (repo_id, paper id, or collection slug). Use this to find collections containing a specific item."),
        sort: z.enum(["upvotes", "lastModified", "trending"]).optional().describe("Enum for sorting options for collections."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of collections to return per page. Defaults to 10."),
        owner: z.string().optional().describe("Filter collections by owner username. Use this to get collections created by a specific user or organization."),
        cursor: z.string().optional().describe("Pagination cursor for fetching the next page of results. Use the cursor from the previous response to get more collections."),
        expand: z.string().optional().describe("Comma-separated list of fields to expand in the response. Use this to get additional details about collections."),
    }),
    execute: async ({ huggingFaceToken, q, item, sort, limit, owner, cursor, expand }) => {
        const queryParams = { q: q, item: item, sort: sort, limit: limit, owner: owner, cursor: cursor, expand: expand };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/collections`, queryParams });
    },
});

export const huggingFaceListDatasets = tool({
    description: "Tool to list datasets on the Hugging Face Hub. Use when you need to discover or search for datasets. Supports filtering by author, search query, tags, and sorting by various properties.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        sort: z.enum(["lastModified", "trending", "likes", "downloads"]).optional().describe("Enum for sorting properties."),
        limit: z.number().int().min(1).max(500).optional().describe("Limit the number of datasets returned. Defaults to 100 if not specified."),
        author: z.string().optional().describe("Filter datasets by an author or organization. Use this to get datasets from a specific user or org."),
        cursor: z.string().optional().describe("Pagination cursor for fetching the next page of results. Use the next_cursor value from a previous response."),
        filter: z.string().optional().describe("Filter based on tags. Use this to find datasets with specific tags like task types, languages, or licenses."),
        search: z.string().optional().describe("Filter based on substrings for dataset names and their usernames. Use this to search for datasets by keyword."),
        direction: z.enum(["asc", "desc"]).optional().describe("Enum for sort direction."),
    }),
    execute: async ({ huggingFaceToken, sort, limit, author, cursor, filter, search, direction }) => {
        const queryParams = { search: search, author: author, filter: filter, sort: sort, direction: direction, limit: limit, cursor: cursor };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/datasets`, queryParams });
    },
});

export const huggingFaceListDocs = tool({
    description: "Tool to retrieve the list of available documentation from Hugging Face. Use when you need to discover available documentation resources.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/docs`, queryParams });
    },
});

export const huggingFaceListRepoFiles = tool({
    description: "Tool to get the file tree of a Hugging Face repository with pagination support. Use when you need to browse files and folders in any repository type (model, dataset, or space), explore repository structure, or discover available files.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        path: z.string().optional().describe("Path within the repository to list. Use empty string or '.' for root directory. Supports nested paths."),
        limit: z.number().int().min(1).optional().describe("Maximum number of items to return. Defaults to 1000, or 100 when expand=true. Use with cursor for pagination."),
        cursor: z.string().optional().describe("Pagination cursor from a previous response to fetch the next page of results. Omit for the first page."),
        expand: z.boolean().optional().describe("If true, returns associated commit data for each entry and security scanner metadata. Defaults to false if not specified."),
        repoId: z.string().describe("Repository ID in the format author/repo-name. Example: 'google-bert/bert-base-uncased' for a model."),
        revision: z.string().optional().describe("Git revision (branch, tag, or commit SHA) to list. Use 'main' for default branch."),
        recursive: z.boolean().optional().describe("If true, returns the tree recursively including all subdirectories. Defaults to false if not specified."),
        repoType: z.enum(["model", "dataset", "space"]).describe("Repository type: model, dataset, or space."),
    }),
    execute: async ({ huggingFaceToken, path, limit, cursor, expand, repoId, revision, recursive, repoType }) => {
        const seg = repoType + 's';
        const queryParams = { path: path, recursive: recursive, expand: expand, limit: limit, cursor: cursor };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/${seg}/${repoId}/tree/${encodeURIComponent(revision ?? 'main' )}`, queryParams });
    },
});

export const huggingFaceListSpaces = tool({
    description: "Tool to list Spaces on the Hugging Face Hub with filtering options. Use when you need to discover or search for ML demo applications hosted on Hugging Face.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        sort: z.string().optional().describe("Property to use when sorting results. Common values include 'lastModified', 'likes', 'trending', or 'created'."),
        limit: z.number().int().min(1).max(500).optional().describe("Maximum number of spaces to return in the response. Must be between 1 and 500."),
        author: z.string().optional().describe("Filter spaces by a specific author or organization name."),
        filter: z.string().optional().describe("Filter based on tags. You can specify tags to find spaces by SDK type (e.g., 'gradio', 'streamlit'), task type, or other characteristics."),
        search: z.string().optional().describe("Filter based on substrings for repos and their usernames. Use to search for specific space names or authors."),
        direction: z.string().optional().describe("Direction in which to sort results. Use '1' for ascending order or '-1' for descending order. Must be used together with the sort parameter."),
    }),
    execute: async ({ huggingFaceToken, sort, limit, author, filter, search, direction }) => {
        const queryParams = { search: search, author: author, filter: filter, sort: sort, direction: direction, limit: limit };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/spaces`, queryParams });
    },
});

export const huggingFaceSearchDocs = tool({
    description: "Tool to search Hugging Face documentation across all products and libraries. Use when you need to find information about HF tools, models, datasets, or API usage.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        q: z.string().describe("Search query string to find relevant documentation pages. Use keywords related to the topic you want to learn about."),
        limit: z.number().int().min(1).max(100).optional().describe("Maximum number of search results to return. Defaults to 10."),
        offset: z.number().int().min(0).optional().describe("Number of results to skip for pagination. Use with limit to page through results. For example, offset=10 with limit=10 returns results 11-20."),
        product: z.enum(["hub", "transformers", "diffusers", "datasets", "gradio", "trackio", "smolagents", "huggingface_hub", "huggingface.js", "transformers.js", "inference-providers", "inference-endpoints", "peft", "accelerate", "optimum", "optimum-habana", "optimum-neuron", "optimum-intel", "optimum-executorch", "optimum-tpu", "tokenizers", "llm-course", "robotics-course", "mcp-course", "smol-course", "agents-course", "deep-rl-course", "computer-vision-course", "evaluate", "tasks", "dataset-viewer", "trl", "simulate", "sagemaker", "timm", "safetensors", "tgi", "setfit", "audio-course", "lerobot", "reachy_mini", "autotrain", "tei", "bitsandbytes", "cookbook", "sentence_transformers", "ml-games-course", "diffusion-course", "ml-for-3d-course", "chat-ui", "leaderboards", "lighteval", "argilla", "distilabel", "microsoft-azure", "kernels", "google-cloud"]).optional().describe("Enum for Hugging Face product types to search documentation."),
    }),
    execute: async ({ huggingFaceToken, q, limit, offset, product }) => {
        const queryParams = { q: q, limit: limit, offset: offset, product: product };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/docs/search`, queryParams });
    },
});
