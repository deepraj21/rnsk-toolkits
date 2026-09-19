// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hfApi, hfRedirect, HOSTS } from './client.js';
import { repoIdOf as _r, uiPrefix as _u } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

function repoIdOf(namespace, repo, repoId) { return _r(namespace, repo, repoId); }
function uiPrefix(repoType) { return _u(repoType); }

export const huggingFaceDeleteNotifications = tool({
    description: "Tool to delete notifications from Hugging Face. Use when you need to remove notifications either by specific discussion IDs or by applying filters to delete multiple notifications at once. Supports targeted deletion (via discussion_ids) or bulk deletion (via applyToAll with filter parameters).",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination when filtering notifications. Defaults to 0 (first page)."),
        mention: z.enum(["all", "participating", "mentions"]).optional().describe("Enum for mention filter."),
        paperId: z.string().optional().describe("Filter notifications by paper ID. Use this to delete notifications related to a specific paper. Only applies when applyToAll is true."),
        repoName: z.string().optional().describe("Filter notifications by repository name. Use this to delete notifications from a specific repository. Format should be 'namespace/repo-name'. Only applies when applyToAll is true."),
        repoType: z.enum(["dataset", "model", "space", "bucket"]).optional().describe("Enum for repository type filter."),
        articleId: z.string().optional().describe("Filter notifications by article ID. Use this to delete notifications related to a specific article. Only applies when applyToAll is true."),
        lastUpdate: z.string().optional().describe("Filter notifications by last update timestamp. Use this to delete notifications updated before or after a specific time. Only applies when applyToAll is true."),
        postAuthor: z.string().optional().describe("Filter notifications by the username of the post author. Use this to delete notifications from a specific user. Only applies when applyToAll is true."),
        readStatus: z.enum(["all", "unread"]).optional().describe("Enum for read status filter."),
        applyToAll: z.boolean().optional().describe("When true, applies the deletion to all notifications matching the filter criteria (readStatus, repoType, repoName, etc.). Use with caution as this will delete multiple notifications at once. Required when not using discussion_ids."),
        discussionIds: z.array(z.string()).optional().describe("Array of specific discussion IDs to delete. Each ID must be exactly 24 hexadecimal characters. Use this for targeted deletion of specific notifications. If provided, other filter parameters are ignored."),
    }),
    execute: async ({ huggingFaceToken, p, mention, paperId, repoName, repoType, articleId, lastUpdate, postAuthor, readStatus, applyToAll, discussionIds }) => {
        const queryParams = undefined;
        const body = { p: p, mention: mention, paper_id: paperId, repo_name: repoName, repo_type: repoType, article_id: articleId, last_update: lastUpdate, post_author: postAuthor, read_status: readStatus, apply_to_all: applyToAll, discussion_ids: discussionIds };
        return hfApi(huggingFaceToken, { method: 'DELETE', url: `${HOSTS.HUB}/api/notifications`, queryParams, body });
    },
});

export const huggingFaceGetOrganizationsAvatar = tool({
    description: "Tool to retrieve the avatar URL for a Hugging Face organization. Use when you need to get the avatar image URL for a specific organization.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        name: z.string().describe("The name of the organization. For example, 'huggingface' or 'meta-llama'."),
        redirect: z.string().optional().describe("If provided, redirect to the avatar URL instead of returning it as JSON. Set to any value to enable redirection."),
    }),
    execute: async ({ huggingFaceToken, name, redirect }) => {
        const queryParams = { redirect: redirect };
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}/api/organizations/${encodeURIComponent(name)}/avatar`, queryParams });
    },
});

export const huggingFaceGetOrganizationsMembers = tool({
    description: "Tool to retrieve a list of members for a Hugging Face organization. Use when you need to discover who belongs to an organization, with optional filtering by search terms, email, and pagination support.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        name: z.string().describe("Name of the organization to retrieve members from. This is the organization's username or slug on Hugging Face."),
        email: z.string().optional().describe("Filter members by email address. This may require admin permissions depending on the organization's settings."),
        limit: z.number().int().min(1).max(1000).optional().describe("Maximum number of members to return. Defaults to 500."),
        cursor: z.string().optional().describe("Pagination cursor for fetching the next page of results. Use the cursor from the previous response to get more members."),
        search: z.string().optional().describe("Search query to filter members by username or full name. Use this to find specific members within the organization."),
    }),
    execute: async ({ huggingFaceToken, name, email, limit, cursor, search }) => {
        const queryParams = { email: email, limit: limit, cursor: cursor, search: search };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/organizations/${encodeURIComponent(name)}/members`, queryParams });
    },
});

export const huggingFaceGetOrganizationsSocials = tool({
    description: "Tool to retrieve an organization's social media handles from Hugging Face. Use when you need to find an organization's GitHub, LinkedIn, or Twitter/X profiles. Only returns handles that the organization has publicly shared on their Hugging Face profile.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        name: z.string().describe("The name of the organization to retrieve social media handles for. This is the organization's username on Hugging Face."),
    }),
    execute: async ({ huggingFaceToken, name }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/organizations/${encodeURIComponent(name)}/socials`, queryParams });
    },
});

export const huggingFaceGetUsersAvatar = tool({
    description: "Tool to retrieve the avatar URL for a Hugging Face user. Use when you need to get the avatar image URL for a specific user.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        redirect: z.string().optional().describe("If provided, redirect to the avatar URL instead of returning it as JSON. Set to any value to enable redirection."),
        username: z.string().describe("The username of the user whose avatar URL to retrieve. For example, 'julien-c' or 'lysandre'."),
    }),
    execute: async ({ huggingFaceToken, redirect, username }) => {
        const queryParams = { redirect: redirect };
        return hfRedirect(huggingFaceToken, { url: `${HOSTS.HUB}/api/users/${encodeURIComponent(username)}/avatar`, queryParams });
    },
});

export const huggingFaceGetUsersOverview = tool({
    description: "Tool to retrieve a comprehensive overview of a Hugging Face user's profile. Use when you need to get user statistics, organizations, activity counts, and profile information.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        username: z.string().describe("Username of the Hugging Face user to retrieve overview for. This is the user's handle on Hugging Face."),
    }),
    execute: async ({ huggingFaceToken, username }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/users/${encodeURIComponent(username)}/overview`, queryParams });
    },
});

export const huggingFaceGetUsersSocials = tool({
    description: "Tool to retrieve a user's social media handles from Hugging Face. Use when you need to find a user's GitHub, LinkedIn, Twitter/X, or Bluesky profiles. Only returns handles that the user has publicly shared on their Hugging Face profile.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        username: z.string().describe("The username of the Hugging Face user to retrieve social media handles for. This is the user's username on Hugging Face."),
    }),
    execute: async ({ huggingFaceToken, username }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/users/${encodeURIComponent(username)}/socials`, queryParams });
    },
});

export const huggingFaceGetWhoami = tool({
    description: "Tool to get information about the authenticated Hugging Face user including username, email, organizations, and token details. Use when you need to identify the current user from an access token or retrieve user profile information.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
    }),
    execute: async ({ huggingFaceToken }) => {
        const queryParams = undefined;
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/whoami`, queryParams });
    },
});

export const huggingFaceListNotifications = tool({
    description: "Tool to list notifications for the authenticated Hugging Face user. Use when you need to retrieve user notifications, optionally filtered by read status, repository type, author, or other criteria.",
    inputSchema: z.object({
        huggingFaceToken: tokenField,
        p: z.number().int().min(0).optional().describe("Page number for pagination. Defaults to 0."),
        mention: z.enum(["all", "participating", "mentions"]).optional().describe("Enum for mention filter."),
        paperId: z.string().optional().describe("Filter notifications by paper ID."),
        repoName: z.string().optional().describe("Filter notifications by repository name."),
        repoType: z.enum(["dataset", "model", "space", "bucket"]).optional().describe("Enum for repository type filter."),
        articleId: z.string().optional().describe("Filter notifications by article ID."),
        lastUpdate: z.string().optional().describe("Filter notifications by last update timestamp."),
        postAuthor: z.string().optional().describe("Filter notifications by the author of the post."),
        readStatus: z.enum(["all", "unread"]).optional().describe("Enum for notification read status filter."),
    }),
    execute: async ({ huggingFaceToken, p, mention, paperId, repoName, repoType, articleId, lastUpdate, postAuthor, readStatus }) => {
        const queryParams = { p: p, mention: mention, paper_id: paperId, repo_name: repoName, repo_type: repoType, article_id: articleId, last_update: lastUpdate, post_author: postAuthor, read_status: readStatus };
        return hfApi(huggingFaceToken, { method: 'GET', url: `${HOSTS.HUB}/api/notifications`, queryParams });
    },
});
