// @ts-nocheck
import { redditCreatePost } from './create-post.js';
import { redditDeleteComment } from './delete-comment.js';
import { redditDeletePost } from './delete-post.js';
import { redditEditCommentOrPost } from './edit-comment-or-post.js';
import { redditGetListingBySort } from './get-listing-by-sort.js';
import { redditGetControversialPosts } from './get-controversial-posts.js';
import { redditGetUserPrefs } from './get-user-prefs.js';
import { redditGetRandomPost } from './get-random-post.js';
import { redditGetUserAbout } from './get-user-about.js';
import { redditGetOauthScopes } from './get-oauth-scopes.js';
import { redditGetSubredditRules } from './get-subreddit-rules.js';
import { redditSearchSubreddits } from './search-subreddits.js';
import { redditGetUserFlair } from './get-user-flair.js';
import { redditCheckUsernameAvailable } from './check-username-available.js';
import { redditListSubredditPostFlairs } from './list-subreddit-post-flairs.js';
import { redditPostComment } from './post-comment.js';
import { redditRetrievePostComments } from './retrieve-post-comments.js';
import { redditRetrievePostsFromSubreddit } from './retrieve-posts-from-subreddit.js';
import { redditRetrieveSpecificCommentOrPost } from './retrieve-specific-comment-or-post.js';
import { redditSearchAcrossSubreddits } from './search-across-subreddits.js';
import { redditToggleInboxReplies } from './toggle-inbox-replies.js';

export {
    redditCreatePost,
    redditDeleteComment,
    redditDeletePost,
    redditEditCommentOrPost,
    redditGetListingBySort,
    redditGetControversialPosts,
    redditGetUserPrefs,
    redditGetRandomPost,
    redditGetUserAbout,
    redditGetOauthScopes,
    redditGetSubredditRules,
    redditSearchSubreddits,
    redditGetUserFlair,
    redditCheckUsernameAvailable,
    redditListSubredditPostFlairs,
    redditPostComment,
    redditRetrievePostComments,
    redditRetrievePostsFromSubreddit,
    redditRetrieveSpecificCommentOrPost,
    redditSearchAcrossSubreddits,
    redditToggleInboxReplies,
};

export const redditTools = [
    {
        name: 'redditCreatePost',
        description: redditCreatePost.description!,
        tool: redditCreatePost,
        requiredAuth: 'redditToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'redditDeleteComment',
        description: redditDeleteComment.description!,
        tool: redditDeleteComment,
        requiredAuth: 'redditToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'redditDeletePost',
        description: redditDeletePost.description!,
        tool: redditDeletePost,
        requiredAuth: 'redditToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'redditEditCommentOrPost',
        description: redditEditCommentOrPost.description!,
        tool: redditEditCommentOrPost,
        requiredAuth: 'redditToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'redditGetListingBySort',
        description: redditGetListingBySort.description!,
        tool: redditGetListingBySort,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetControversialPosts',
        description: redditGetControversialPosts.description!,
        tool: redditGetControversialPosts,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetUserPrefs',
        description: redditGetUserPrefs.description!,
        tool: redditGetUserPrefs,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetRandomPost',
        description: redditGetRandomPost.description!,
        tool: redditGetRandomPost,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetUserAbout',
        description: redditGetUserAbout.description!,
        tool: redditGetUserAbout,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetOauthScopes',
        description: redditGetOauthScopes.description!,
        tool: redditGetOauthScopes,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetSubredditRules',
        description: redditGetSubredditRules.description!,
        tool: redditGetSubredditRules,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditSearchSubreddits',
        description: redditSearchSubreddits.description!,
        tool: redditSearchSubreddits,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditGetUserFlair',
        description: redditGetUserFlair.description!,
        tool: redditGetUserFlair,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditCheckUsernameAvailable',
        description: redditCheckUsernameAvailable.description!,
        tool: redditCheckUsernameAvailable,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditListSubredditPostFlairs',
        description: redditListSubredditPostFlairs.description!,
        tool: redditListSubredditPostFlairs,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditPostComment',
        description: redditPostComment.description!,
        tool: redditPostComment,
        requiredAuth: 'redditToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'redditRetrievePostComments',
        description: redditRetrievePostComments.description!,
        tool: redditRetrievePostComments,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditRetrievePostsFromSubreddit',
        description: redditRetrievePostsFromSubreddit.description!,
        tool: redditRetrievePostsFromSubreddit,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditRetrieveSpecificCommentOrPost',
        description: redditRetrieveSpecificCommentOrPost.description!,
        tool: redditRetrieveSpecificCommentOrPost,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditSearchAcrossSubreddits',
        description: redditSearchAcrossSubreddits.description!,
        tool: redditSearchAcrossSubreddits,
        requiredAuth: 'redditToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'redditToggleInboxReplies',
        description: redditToggleInboxReplies.description!,
        tool: redditToggleInboxReplies,
        requiredAuth: 'redditToken' as const,
        scope: 'write' as const,
    },
];
