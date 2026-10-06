// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { xRequest, failedResult, toXError, fieldQuery } from './client.js';

const tokenField = z.string().optional().describe('X OAuth 2.0 access token (injected by system)');
const expansionsField = z
  .array(z.string())
  .optional()
  .describe(
    'Expansions to include, e.g. author_id, attachments.media_keys, referenced_tweets.id, geo.place_id',
  );
const tweetFieldsField = z
  .array(z.string())
  .optional()
  .describe(
    'Tweet fields, e.g. created_at, author_id, public_metrics, entities, geo, conversation_id, lang',
  );
const userFieldsField = z
  .array(z.string())
  .optional()
  .describe(
    'User fields, e.g. created_at, description, public_metrics, verified, profile_image_url',
  );
const mediaFieldsField = z
  .array(z.string())
  .optional()
  .describe('Media fields, e.g. url, preview_image_url, type, duration_ms, public_metrics');
const pollFieldsField = z
  .array(z.string())
  .optional()
  .describe('Poll fields, e.g. id, options, voting_status, end_datetime, duration_minutes');
const placeFieldsField = z
  .array(z.string())
  .optional()
  .describe('Place fields, e.g. full_name, country_code, geo, place_type, name');
const paginationField = z
  .string()
  .optional()
  .describe('Pagination token from a previous response meta.next_token; omit for the first page');

export const xCreatePost = tool({
  description:
    'Create a new post (tweet) on X for the authenticated user. Supports text, polls, media attachments, quote posts, replies, geo, and reply settings.',
  inputSchema: z.object({
    xToken: tokenField,
    text: z.string().max(280).optional().describe('Post text (up to 280 characters)'),
    mediaIds: z
      .array(z.string())
      .optional()
      .describe('Media IDs from a completed media upload to attach'),
    mediaTaggedUserIds: z
      .array(z.string())
      .optional()
      .describe('User IDs to tag in attached media'),
    pollOptions: z
      .array(z.string())
      .min(2)
      .max(4)
      .optional()
      .describe('Poll options (2-4); turns the post into a poll'),
    pollDurationMinutes: z
      .number()
      .int()
      .min(5)
      .max(10080)
      .optional()
      .describe('Poll duration in minutes (5-10080)'),
    pollReplySettings: z
      .string()
      .optional()
      .describe('Who can reply to the poll post: mentioned_users or following'),
    quoteTweetId: z.string().optional().describe('ID of the post to quote'),
    replyInReplyToTweetId: z.string().optional().describe('ID of the post this is a reply to'),
    replyExcludeReplyUserIds: z
      .array(z.string())
      .optional()
      .describe('User IDs to exclude from the reply thread'),
    replySettings: z
      .string()
      .optional()
      .describe('Who can reply: mentioned_users, following, or verified'),
    geoPlaceId: z.string().optional().describe('Place ID to tag the post with'),
    cardUri: z.string().optional().describe('Card URI for website or app cards'),
    nullcast: z
      .boolean()
      .optional()
      .describe('Set true to post without distributing to followers (nullcast)'),
    forSuperFollowersOnly: z
      .boolean()
      .optional()
      .describe('Restrict visibility to super followers'),
    directMessageDeepLink: z.string().optional().describe('Direct message deep link to attach'),
  }),
  execute: async ({
    xToken,
    mediaIds,
    mediaTaggedUserIds,
    pollOptions,
    pollDurationMinutes,
    pollReplySettings,
    quoteTweetId,
    replyInReplyToTweetId,
    replyExcludeReplyUserIds,
    replySettings,
    geoPlaceId,
    cardUri,
    forSuperFollowersOnly,
    directMessageDeepLink,
    ...rest
  }) => {
    try {
      const body: Record<string, unknown> = { ...rest };
      if (quoteTweetId) body.quote_tweet_id = quoteTweetId;
      if (replySettings) body.reply_settings = replySettings;
      if (cardUri) body.card_uri = cardUri;
      if (forSuperFollowersOnly !== undefined)
        body.for_super_followers_only = forSuperFollowersOnly;
      if (directMessageDeepLink) body.direct_message_deep_link = directMessageDeepLink;
      const media: Record<string, unknown> = {};
      if (mediaIds) media.media_ids = mediaIds;
      if (mediaTaggedUserIds) media.tagged_user_ids = mediaTaggedUserIds;
      if (Object.keys(media).length > 0) body.media = media;
      if (pollOptions) {
        body.poll = {
          options: pollOptions,
          ...(pollDurationMinutes !== undefined ? { duration_minutes: pollDurationMinutes } : {}),
          ...(pollReplySettings ? { reply_settings: pollReplySettings } : {}),
        };
      }
      if (replyInReplyToTweetId || replyExcludeReplyUserIds) {
        body.reply = {
          ...(replyInReplyToTweetId ? { in_reply_to_tweet_id: replyInReplyToTweetId } : {}),
          ...(replyExcludeReplyUserIds ? { exclude_reply_user_ids: replyExcludeReplyUserIds } : {}),
        };
      }
      if (geoPlaceId) body.geo = { place_id: geoPlaceId };
      const result = await xRequest(xToken, '/tweets', { method: 'POST', body });
      if (!result.ok) return failedResult('Failed to create post', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error creating post');
    }
  },
});

export const xDeletePost = tool({
  description: 'Delete a post owned by the authenticated user by post ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('ID of the post to delete'),
  }),
  execute: async ({ xToken, id }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete post', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error deleting post');
    }
  },
});

export const xLookupPost = tool({
  description: 'Look up a single post by ID with optional expansions and field selections.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Post ID to look up'),
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    pollFields: pollFieldsField,
    placeFields: placeFieldsField,
  }),
  execute: async ({ xToken, id, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}`, { query: fieldQuery(fields) });
      if (!result.ok) return failedResult('Failed to look up post', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error looking up post');
    }
  },
});

export const xLookupPosts = tool({
  description: 'Look up up to 100 posts by their IDs in a single request.',
  inputSchema: z.object({
    xToken: tokenField,
    ids: z.array(z.string()).min(1).max(100).describe('Post IDs to look up (max 100)'),
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    pollFields: pollFieldsField,
    placeFields: placeFieldsField,
  }),
  execute: async ({ xToken, ids, ...fields }) => {
    try {
      const result = await xRequest(xToken, '/tweets', { query: { ids, ...fieldQuery(fields) } });
      if (!result.ok) return failedResult('Failed to look up posts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error looking up posts');
    }
  },
});

const searchSchema = {
  xToken: tokenField,
  query: z.string().describe('Search query (X search operators supported)'),
  startTime: z.string().optional().describe('Oldest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
  endTime: z.string().optional().describe('Newest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
  sinceId: z.string().optional().describe('Return posts after this post ID'),
  untilId: z.string().optional().describe('Return posts before this post ID'),
  maxResults: z.number().int().min(10).max(100).optional().describe('Results per page (10-100)'),
  nextToken: paginationField,
  sortOrder: z.string().optional().describe('recency or relevancy'),
  expansions: expansionsField,
  tweetFields: tweetFieldsField,
  userFields: userFieldsField,
  mediaFields: mediaFieldsField,
  pollFields: pollFieldsField,
  placeFields: placeFieldsField,
};

function searchQuery({
  startTime,
  endTime,
  sinceId,
  untilId,
  maxResults,
  nextToken,
  sortOrder,
  ...fields
}: Record<string, any>) {
  return {
    start_time: startTime,
    end_time: endTime,
    since_id: sinceId,
    until_id: untilId,
    max_results: maxResults,
    next_token: nextToken,
    sort_order: sortOrder,
    ...fieldQuery(fields),
  };
}

export const xRecentSearch = tool({
  description:
    'Search posts from the last 7 days matching a query. Use for recent conversations, mentions, and hashtags.',
  inputSchema: z.object(searchSchema),
  execute: async ({ xToken, query, ...rest }) => {
    try {
      const result = await xRequest(xToken, '/tweets/search/recent', {
        query: { query, ...searchQuery(rest) },
      });
      if (!result.ok) return failedResult('Failed to search recent posts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error searching recent posts');
    }
  },
});

export const xFullArchiveSearch = tool({
  description:
    'Search the full archive of public posts matching a query. RequiresPro/Enterprise-level API access.',
  inputSchema: z.object(searchSchema),
  execute: async ({ xToken, query, ...rest }) => {
    try {
      const result = await xRequest(xToken, '/tweets/search/all', {
        query: { query, ...searchQuery(rest) },
      });
      if (!result.ok) return failedResult('Failed to search the full archive', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error searching the full archive');
    }
  },
});

const countsSchema = {
  xToken: tokenField,
  query: z.string().describe('Search query to count matching posts for'),
  startTime: z.string().optional().describe('Oldest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
  endTime: z.string().optional().describe('Newest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
  sinceId: z.string().optional().describe('Count posts after this post ID'),
  untilId: z.string().optional().describe('Count posts before this post ID'),
  granularity: z.string().optional().describe('minute, hour, or day'),
  nextToken: paginationField,
  searchCountFields: z.array(z.string()).optional().describe('Fields: start, end, tweet_count'),
};

export const xRecentCounts = tool({
  description:
    'Get counts of posts from the last 7 days matching a query, bucketed by minute, hour, or day.',
  inputSchema: z.object(countsSchema),
  execute: async ({
    xToken,
    query,
    startTime,
    endTime,
    sinceId,
    untilId,
    granularity,
    nextToken,
    searchCountFields,
  }) => {
    try {
      const result = await xRequest(xToken, '/tweets/counts/recent', {
        query: {
          query,
          start_time: startTime,
          end_time: endTime,
          since_id: sinceId,
          until_id: untilId,
          granularity,
          next_token: nextToken,
          'search_count.fields': searchCountFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get recent post counts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting recent post counts');
    }
  },
});

export const xFullArchiveCounts = tool({
  description:
    'Get counts of posts across the full archive matching a query, bucketed by minute, hour, or day.',
  inputSchema: z.object(countsSchema),
  execute: async ({
    xToken,
    query,
    startTime,
    endTime,
    sinceId,
    untilId,
    granularity,
    nextToken,
    searchCountFields,
  }) => {
    try {
      const result = await xRequest(xToken, '/tweets/counts/all', {
        query: {
          query,
          start_time: startTime,
          end_time: endTime,
          since_id: sinceId,
          until_id: untilId,
          granularity,
          next_token: nextToken,
          'search_count.fields': searchCountFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get full-archive post counts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting full-archive post counts');
    }
  },
});

export const xPostAnalytics = tool({
  description:
    'Get engagement analytics for up to 100 posts over a time range with hourly, daily, weekly, or total granularity.',
  inputSchema: z.object({
    xToken: tokenField,
    ids: z.array(z.string()).min(1).max(100).describe('Post IDs (max 100)'),
    startTime: z.string().describe('Start of range (YYYY-MM-DDTHH:mm:ssZ)'),
    endTime: z.string().describe('End of range (YYYY-MM-DDTHH:mm:ssZ)'),
    granularity: z.string().optional().describe('hourly, daily, weekly, or total (default total)'),
    analyticsFields: z
      .array(z.string())
      .optional()
      .describe(
        'Metrics, e.g. impressions, engagements, likes, replies, retweets, bookmarks, follows, url_clicks',
      ),
  }),
  execute: async ({ xToken, ids, startTime, endTime, granularity, analyticsFields }) => {
    try {
      const result = await xRequest(xToken, '/tweets/analytics', {
        query: {
          ids,
          start_time: startTime,
          end_time: endTime,
          granularity,
          'analytics.fields': analyticsFields,
        },
      });
      if (!result.ok) return failedResult('Failed to get post analytics', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting post analytics');
    }
  },
});

export const xPostUsage = tool({
  description:
    'Get X API tweet usage statistics for the project (consumption, caps, daily breakdowns) for 1 to 90 days.',
  inputSchema: z.object({
    xToken: tokenField,
    days: z
      .number()
      .int()
      .min(1)
      .max(90)
      .optional()
      .describe('Days of usage to retrieve (1-90, default 7)'),
    usageFields: z
      .array(z.string())
      .optional()
      .describe(
        'Fields: cap_reset_day, daily_client_app_usage, daily_project_usage, project_cap, project_id, project_usage',
      ),
  }),
  execute: async ({ xToken, days, usageFields }) => {
    try {
      const result = await xRequest(xToken, '/usage/tweets', {
        query: { days, 'usage.fields': usageFields },
      });
      if (!result.ok) return failedResult('Failed to get post usage', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting post usage');
    }
  },
});

export const xHideReply = tool({
  description:
    'Hide or unhide a reply to a conversation owned by the authenticated user. Requires the tweet.moderate.write scope.',
  inputSchema: z.object({
    xToken: tokenField,
    tweetId: z.string().describe('ID of the reply post to hide or unhide'),
    hidden: z.boolean().describe('True to hide the reply, false to unhide it'),
  }),
  execute: async ({ xToken, tweetId, hidden }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${tweetId}/hidden`, {
        method: 'PUT',
        body: { hidden },
      });
      if (!result.ok) return failedResult('Failed to hide reply', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error hiding reply');
    }
  },
});

export const xQuotePosts = tool({
  description: 'Get posts that quote a specific post by ID.',
  inputSchema: z.object({
    xToken: tokenField,
    id: z.string().describe('Post ID to find quotes of'),
    exclude: z.array(z.string()).optional().describe('Exclude retweets or replies'),
    maxResults: z.number().int().min(10).max(100).optional().describe('Results per page (10-100)'),
    paginationToken: paginationField,
    expansions: expansionsField,
    tweetFields: tweetFieldsField,
    userFields: userFieldsField,
    mediaFields: mediaFieldsField,
    pollFields: pollFieldsField,
    placeFields: placeFieldsField,
  }),
  execute: async ({ xToken, id, exclude, maxResults, paginationToken, ...fields }) => {
    try {
      const result = await xRequest(xToken, `/tweets/${id}/quote_tweets`, {
        query: {
          exclude,
          max_results: maxResults,
          pagination_token: paginationToken,
          ...fieldQuery(fields),
        },
      });
      if (!result.ok) return failedResult('Failed to get quoting posts', result);
      return result.data;
    } catch (error) {
      return toXError(error, 'Error getting quoting posts');
    }
  },
});

export const xStreamLabels = tool({
  description:
    'Stream labeling events applied to posts (compliance stream). Returns the current batch of label events as text.',
  inputSchema: z.object({
    xToken: tokenField,
    backfillMinutes: z
      .number()
      .int()
      .min(0)
      .max(5)
      .optional()
      .describe('Minutes of backfill (0-5)'),
    startTime: z.string().optional().describe('Earliest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
    endTime: z.string().optional().describe('Latest UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)'),
  }),
  execute: async ({ xToken, backfillMinutes, startTime, endTime }) => {
    try {
      const result = await xRequest(xToken, '/tweets/label/stream', {
        query: { backfill_minutes: backfillMinutes, start_time: startTime, end_time: endTime },
        rawText: true,
      });
      if (!result.ok) return failedResult('Failed to stream post labels', result);
      const text = typeof result.data === 'string' ? result.data : JSON.stringify(result.data);
      return { labels: text.length > 20000 ? `${text.slice(0, 20000)}... (truncated)` : text };
    } catch (error) {
      return toXError(error, 'Error streaming post labels');
    }
  },
});
