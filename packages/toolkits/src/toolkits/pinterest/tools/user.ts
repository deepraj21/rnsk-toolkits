// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, pinterestRequest, toPinterestError } from './client.js';

const tokenField = z
    .string()
    .optional()
    .describe('Injected Pinterest OAuth access token — match manifest tokenField');

export const getProfile = tool({
    description: "Get the connected account profile: username, type, follower counts, and content counts.",
    inputSchema: z.object({
        pinterestToken: tokenField,
    }),
    execute: async ({ pinterestToken }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/user_account');
            if (!result.ok) return failedResult('Failed to get Pinterest profile', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest profile');
        }
    },
});

export const listProfileResources = tool({
    description:
        'List followers, followed users/boards/interests, claimed websites, or linked businesses for the connected profile.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        resourceType: z
            .enum(['followers', 'following_users', 'following_boards', 'followed_interests', 'websites', 'linked_businesses'])
            .describe('Resource to list'),
        username: z
            .string()
            .optional()
            .describe('Profile username, required for followed_interests (get it from getProfile)'),
        feedType: z
            .enum(['ALL', 'RANKED', 'CREATOR_ONLY', 'RANKED_CREATOR_ONLY'])
            .optional()
            .describe('Following-users feed filter (default ALL)'),
        explicitFollowing: z
            .boolean()
            .optional()
            .describe('Only explicitly followed users/boards when true'),
        bookmark: z.string().optional().describe('Opaque bookmark from the previous page'),
        pageSize: z.number().int().min(1).max(250).optional().describe('Max items, 1-250 (default 25)'),
    }),
    execute: async ({ pinterestToken, resourceType, username, feedType, explicitFollowing, bookmark, pageSize }) => {
        try {
            let path: string;
            let query: Record<string, string | number | boolean | undefined> = {
                bookmark,
                page_size: pageSize,
            };
            switch (resourceType) {
                case 'followers':
                    path = '/user_account/followers';
                    break;
                case 'following_users':
                    path = '/user_account/following';
                    query = { ...query, feed_type: feedType, explicit_following: explicitFollowing };
                    break;
                case 'following_boards':
                    path = '/user_account/following/boards';
                    query = { ...query, explicit_following: explicitFollowing };
                    break;
                case 'followed_interests':
                    if (!username) {
                        return { error: 'username is required for followed_interests. Get it from getProfile first.' };
                    }
                    path = `/users/${encodeURIComponent(username)}/interests/follow`;
                    break;
                case 'websites':
                    path = '/user_account/websites';
                    break;
                case 'linked_businesses':
                    path = '/user_account/businesses';
                    break;
            }
            const result = await pinterestRequest(pinterestToken, path!, { query });
            if (!result.ok) return failedResult(`Failed to list Pinterest profile ${resourceType}`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error listing Pinterest profile ${resourceType}`);
        }
    },
});

export const followUser = tool({
    description: 'Follow a Pinterest user by username. Needs user_accounts:write scope.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        username: z.string().describe('Pinterest username to follow'),
    }),
    execute: async ({ pinterestToken, username }) => {
        try {
            const result = await pinterestRequest(
                pinterestToken,
                `/user_account/following/${encodeURIComponent(username)}`,
                { method: 'POST', body: {} },
            );
            if (!result.ok) return failedResult(`Failed to follow Pinterest user "${username}"`, result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, `Error following Pinterest user "${username}"`);
        }
    },
});

export const getWebsiteVerification = tool({
    description:
        'Get website-claim verification material (metatag, filename, DNS TXT record, code). Response contains sensitive values; include file content only when needed.',
    inputSchema: z.object({
        pinterestToken: tokenField,
        includeFileContent: z
            .boolean()
            .optional()
            .describe('Include the large HTML verification file content (default false)'),
    }),
    execute: async ({ pinterestToken, includeFileContent }) => {
        try {
            const result = await pinterestRequest(pinterestToken, '/user_account/websites/verification', {
                query: { include_file_content: includeFileContent },
            });
            if (!result.ok) return failedResult('Failed to get Pinterest website verification', result);
            return result.data;
        } catch (error) {
            return toPinterestError(error, 'Error getting Pinterest website verification');
        }
    },
});
