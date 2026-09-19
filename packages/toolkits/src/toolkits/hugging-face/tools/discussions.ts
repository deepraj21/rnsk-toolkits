// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceChangeDiscussionsStatus = tool({
    description: "Tool to change the status of a Hugging Face repository discussion. Use when you need to open or close discussions on models, datasets, or spaces.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        num: z.string().describe("The discussion number or ID to change the status of. This is the numeric identifier of the discussion thread."),
        repo: z.string().describe("The repository name where the discussion exists. For example, 'bert-base-uncased' or 'my-dataset'."),
        status: z.enum(["open", "closed"]).describe("The new status to set for the discussion. Use 'open' to reopen a closed discussion or 'closed' to close an open discussion."),
        comment: z.string().max(65536).optional().describe("Optional comment to add when changing the status. Useful for explaining why the discussion is being closed or reopened."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository. For example, 'google-bert' or 'huggingface'."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository where the discussion exists. Must be one of: models, spaces, or datasets."),
    }),
    execute: async ({ huggingFaceToken, num, repo, status, comment, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { status: status, comment: comment };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(num)}/status`, queryParams, body });
    },
});

export const huggingFaceCreateDiscussions = tool({
    description: "Tool to create a new discussion on a Hugging Face repository (model, dataset, or Space). Use when you need to start a conversation, report an issue, or create a pull request discussion.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repo: z.string().describe("The name of the repository where the discussion will be created."),
        title: z.string().min(3).max(200).describe("The title of the discussion. Must be between 3 and 200 characters."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository: models, spaces, or datasets. This determines where the discussion will be created."),
        description: z.string().max(65536).describe("The description/content of the discussion. Can contain markdown formatting. Maximum 65536 characters."),
        pullRequest: z.boolean().optional().describe("Whether this discussion should be created as a pull request. If true, creates a PR instead of a regular discussion."),
    }),
    execute: async ({ huggingFaceToken, repo, title, namespace, repoType, description, pullRequest }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { title: title, description: description, pull_request: pullRequest };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions`, queryParams, body });
    },
});

export const huggingFaceCreateDiscussionsComment = tool({
    description: "Tool to create a new comment on a Hugging Face repository discussion. Use when you need to add comments or replies to discussions on models, datasets, or spaces.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        num: z.string().describe("The discussion number or ID to comment on. This is the numeric identifier of the discussion thread."),
        repo: z.string().describe("The repository name where the discussion exists. For example, 'gpt2' or 'my-dataset'."),
        comment: z.string().min(1).max(65536).describe("The comment text to post on the discussion. Must be between 1 and 65536 characters."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository. For example, 'openai-community' or 'huggingface'."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository where the discussion exists. Must be one of: models, spaces, or datasets."),
    }),
    execute: async ({ huggingFaceToken, num, repo, comment, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { comment: comment };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(num)}/comment`, queryParams, body });
    },
});

export const huggingFaceCreateDiscussionsPin = tool({
    description: "Tool to pin or unpin a discussion on a Hugging Face repository (model, dataset, or Space). Use when you need to highlight important discussions by pinning them to the top of the list, or unpin them when they're no longer priority.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        num: z.string().describe("The discussion number/identifier to pin or unpin. This is the numeric ID shown in the discussion URL."),
        repo: z.string().describe("The name of the repository containing the discussion. For example, for 'meta-llama/Llama-2-7b', the repo is 'Llama-2-7b'."),
        pinned: z.boolean().describe("Whether to pin (true) or unpin (false) the discussion. Pinned discussions appear at the top of the discussions list."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository. For example, for 'meta-llama/Llama-2-7b', the namespace is 'meta-llama'."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository: models, spaces, or datasets. This determines which repository type contains the discussion."),
    }),
    execute: async ({ huggingFaceToken, num, repo, pinned, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { pinned: pinned };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(num)}/pin`, queryParams, body });
    },
});

export const huggingFaceDeleteDiscussions = tool({
    description: "Tool to delete a discussion from a Hugging Face repository. Use when you need to remove a discussion that is no longer needed. This action permanently removes the specified discussion from the repository.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        num: z.string().describe("The discussion number to delete. This is the unique identifier of the discussion within the repository."),
        repo: z.string().describe("The name of the repository containing the discussion to delete. This is the repository identifier without the namespace."),
        namespace: z.string().describe("The namespace (user or organization) that owns the repository. For example, '121tester' for a user or 'huggingface' for an organization."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository where the discussion exists. Must be one of: models, spaces, or datasets."),
    }),
    execute: async ({ huggingFaceToken, num, repo, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(num)}`, queryParams });
    },
});

export const huggingFaceGetDiscussion = tool({
    description: "Tool to get detailed information about a specific discussion or pull request on Hugging Face Hub. Use when you need to retrieve all comments, status changes, events, and for PRs, the diff information.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        repoId: z.string().describe("Repository ID in the format author/repo-name (e.g., 'google-bert/bert-base-uncased')."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository: models, spaces, or datasets. This determines where to look for the discussion."),
        discussionNum: z.number().int().min(1).describe("Discussion number (strictly positive integer). This is the unique identifier of the discussion within the repository."),
    }),
    execute: async ({ huggingFaceToken, repoId, repoType, discussionNum }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(discussionNum)}`, queryParams });
    },
});

export const huggingFaceListDiscussions = tool({
    description: "Tool to list discussions for a Hugging Face repository. Use when you need to retrieve discussions or pull requests for a specific model, dataset, or space.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination. Starts from 0 for the first page."),
        repo: z.string().describe("The repository name to list discussions from."),
        sort: z.enum(["recently-created", "trending", "reactions"]).optional().describe("Sort type enum."),
        type: z.enum(["all", "discussion", "pull_request"]).optional().describe("Discussion type enum."),
        author: z.string().optional().describe("Filter discussions by author username."),
        search: z.string().optional().describe("Search query to filter discussions by title or content."),
        status: z.enum(["all", "open", "closed"]).optional().describe("Discussion status enum."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("Type of repository to list discussions from: models, spaces, or datasets."),
    }),
    execute: async ({ huggingFaceToken, p, repo, sort, type, author, search, status, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = { p: p, author: author, search: search, sort: sort, status: status, type: type };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions`, queryParams });
    },
});

export const huggingFaceUpdateDiscussionsTitle = tool({
    description: "Tool to change the title of an existing discussion on a Hugging Face repository (model, dataset, or Space). Use when you need to update or correct a discussion's title.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        num: z.string().describe("The discussion number/identifier to update the title for."),
        repo: z.string().describe("The name of the repository where the discussion is located."),
        title: z.string().min(3).max(200).describe("The new title for the discussion. Must be between 3 and 200 characters."),
        namespace: z.string().describe("The namespace (username or organization) that owns the repository."),
        repoType: z.enum(["models", "spaces", "datasets"]).describe("The type of repository: models, spaces, or datasets. This determines where the discussion is located."),
    }),
    execute: async ({ huggingFaceToken, num, repo, title, namespace, repoType }) => {
        const repoId = repoIdOf(namespace, repo, undefined);
        const queryParams = undefined;
        const body = { title: title };
        return hfApi(huggingFaceToken, { method: 'POST', url: `${HOSTS.HUB}/api/${repoType}/${repoId}/discussions/${encodeURIComponent(num)}/title`, queryParams, body });
    },
});
