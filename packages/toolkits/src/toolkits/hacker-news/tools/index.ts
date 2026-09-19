// @ts-nocheck
import {
    hackerNewsGetAskStories,
    hackerNewsGetBestStories,
    hackerNewsGetJobStories,
    hackerNewsGetNewStories,
    hackerNewsGetShowStories,
    hackerNewsGetTopStories,
    hackerNewsGetMaxItemId,
    hackerNewsGetUpdates,
} from './stories.js';
import {
    hackerNewsGetItem,
    hackerNewsGetItemWithId,
    hackerNewsGetUser,
    hackerNewsGetUserByUsername,
} from './items.js';
import { hackerNewsGetLatestPosts, hackerNewsSearchPosts } from './search.js';

export {
    hackerNewsGetAskStories,
    hackerNewsGetBestStories,
    hackerNewsGetJobStories,
    hackerNewsGetNewStories,
    hackerNewsGetShowStories,
    hackerNewsGetTopStories,
    hackerNewsGetMaxItemId,
    hackerNewsGetUpdates,
    hackerNewsGetItem,
    hackerNewsGetItemWithId,
    hackerNewsGetUser,
    hackerNewsGetUserByUsername,
    hackerNewsGetLatestPosts,
    hackerNewsSearchPosts,
};

export const hackerNewsTools = [
    { name: 'HackerNewsGetAskStories', description: hackerNewsGetAskStories.description!, tool: hackerNewsGetAskStories, scope: 'read' as const },
    { name: 'HackerNewsGetBestStories', description: hackerNewsGetBestStories.description!, tool: hackerNewsGetBestStories, scope: 'read' as const },
    { name: 'HackerNewsGetJobStories', description: hackerNewsGetJobStories.description!, tool: hackerNewsGetJobStories, scope: 'read' as const },
    { name: 'HackerNewsGetNewStories', description: hackerNewsGetNewStories.description!, tool: hackerNewsGetNewStories, scope: 'read' as const },
    { name: 'HackerNewsGetShowStories', description: hackerNewsGetShowStories.description!, tool: hackerNewsGetShowStories, scope: 'read' as const },
    { name: 'HackerNewsGetTopStories', description: hackerNewsGetTopStories.description!, tool: hackerNewsGetTopStories, scope: 'read' as const },
    { name: 'HackerNewsGetMaxItemId', description: hackerNewsGetMaxItemId.description!, tool: hackerNewsGetMaxItemId, scope: 'read' as const },
    { name: 'HackerNewsGetUpdates', description: hackerNewsGetUpdates.description!, tool: hackerNewsGetUpdates, scope: 'read' as const },
    { name: 'HackerNewsGetItem', description: hackerNewsGetItem.description!, tool: hackerNewsGetItem, scope: 'read' as const },
    { name: 'HackerNewsGetItemWithId', description: hackerNewsGetItemWithId.description!, tool: hackerNewsGetItemWithId, scope: 'read' as const },
    { name: 'HackerNewsGetUser', description: hackerNewsGetUser.description!, tool: hackerNewsGetUser, scope: 'read' as const },
    { name: 'HackerNewsGetUserByUsername', description: hackerNewsGetUserByUsername.description!, tool: hackerNewsGetUserByUsername, scope: 'read' as const },
    { name: 'HackerNewsGetLatestPosts', description: hackerNewsGetLatestPosts.description!, tool: hackerNewsGetLatestPosts, scope: 'read' as const },
    { name: 'HackerNewsSearchPosts', description: hackerNewsSearchPosts.description!, tool: hackerNewsSearchPosts, scope: 'read' as const },
];
