// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackAddReaction = tool({
    description:
        'Add an emoji reaction to a message by channel and exact timestamp. The emoji must exist; use slackListCustomEmojis to verify. Skin tones append ::skin-tone-2..6.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID containing the message'),
        timestamp: z.string().describe('Exact message ts, e.g. 1234567890.123456'),
        name: z.string().describe("Emoji name without colons, e.g. 'thumbsup'"),
    }),
    execute: async ({ slackToken, channel, timestamp, name }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reactions.add', { channel, timestamp, name });
        } catch (error) {
            return toSlackError(error, 'Failed to add reaction');
        }
    },
});

export const slackRemoveReaction = tool({
    description:
        'Remove an emoji reaction from a message, file, or file comment. Provide exactly one target: channel+timestamp, file, or fileComment.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe("Emoji name without colons, e.g. 'thumbsup'"),
        channel: z.string().optional().describe('Channel ID (requires timestamp)'),
        timestamp: z.string().optional().describe('Message ts (requires channel)'),
        file: z.string().optional().describe('File ID'),
        fileComment: z.string().optional().describe('File comment ID'),
    }),
    execute: async ({ slackToken, name, channel, timestamp, file, fileComment }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reactions.remove', {
                name,
                channel,
                timestamp,
                file,
                file_comment: fileComment,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to remove reaction');
        }
    },
});

export const slackGetReactions = tool({
    description:
        'Get reactions for a message, file, or file comment. Provide exactly one target: channel+timestamp, file, or fileComment. A missing reactions field means zero reactions.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID (requires timestamp)'),
        timestamp: z.string().optional().describe('Message ts (requires channel)'),
        file: z.string().optional().describe('File ID'),
        fileComment: z.string().optional().describe('File comment ID'),
        full: z.boolean().optional().describe('Return the full user list per reaction'),
    }),
    execute: async ({ slackToken, channel, timestamp, file, fileComment, full }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reactions.get', {
                channel,
                timestamp,
                file,
                file_comment: fileComment,
                full,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get reactions');
        }
    },
});

export const slackListUserReactions = tool({
    description:
        'List reactions added by a user (defaults to caller). Paginate with cursor; page/count offer legacy pagination. Items repeat per reaction.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID; omit for the caller'),
        full: z.boolean().optional().describe('Include reactions on deleted items (larger payload)'),
        limit: z.number().optional().describe('Max items (cursor pagination)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        count: z.number().optional().describe('Items per page (legacy pagination)'),
        page: z.number().optional().describe('Page number (legacy pagination)'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'reactions.list', { ...rest, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to list user reactions');
        }
    },
});

export const slackAddStar = tool({
    description:
        'Star (save) a channel, file, file comment, or message. For messages provide channel+timestamp; otherwise file, fileComment, or channel alone.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID (alone, or with timestamp for a message)'),
        timestamp: z.string().optional().describe('Message ts (requires channel)'),
        file: z.string().optional().describe('File ID'),
        fileComment: z.string().optional().describe('File comment ID, e.g. Fc1234567890'),
    }),
    execute: async ({ slackToken, channel, timestamp, file, fileComment }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'stars.add', {
                channel,
                timestamp,
                file,
                file_comment: fileComment,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to add star');
        }
    },
});

export const slackRemoveStar = tool({
    description:
        'Remove a star from a channel, file, file comment, or message. Same targeting rules as slackAddStar.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID (alone, or with timestamp for a message)'),
        timestamp: z.string().optional().describe('Message ts (requires channel)'),
        file: z.string().optional().describe('File ID'),
        fileComment: z.string().optional().describe('File comment ID'),
    }),
    execute: async ({ slackToken, channel, timestamp, file, fileComment }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'stars.remove', {
                channel,
                timestamp,
                file,
                file_comment: fileComment,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to remove star');
        }
    },
});

export const slackListStarredItems = tool({
    description:
        'List items the caller starred (classic stars, not saved-for-later). Paginate with cursor (preferred) or page/count.',
    inputSchema: z.object({
        slackToken: tokenField,
        count: z.number().optional().describe('Items per page'),
        page: z.number().optional().describe('Page number'),
        limit: z.number().optional().describe('Max items to return'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'stars.list', { ...rest, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to list starred items');
        }
    },
});

export const slackPinItem = tool({
    description:
        'Pin a message to a channel by channel ID and exact timestamp. The message must not already be pinned.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID to pin in'),
        timestamp: z.string().describe('Message ts, e.g. 1624464000.000200'),
    }),
    execute: async ({ slackToken, channel, timestamp }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'pins.add', { channel, timestamp });
        } catch (error) {
            return toSlackError(error, 'Failed to pin item');
        }
    },
});

export const slackUnpinItem = tool({
    description:
        'Unpin a message from a channel by channel ID and timestamp. Destructive — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID holding the pin'),
        timestamp: z.string().describe('Pinned message ts'),
    }),
    execute: async ({ slackToken, channel, timestamp }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'pins.remove', { channel, timestamp });
        } catch (error) {
            return toSlackError(error, 'Failed to unpin item');
        }
    },
});

export const slackListPinnedItems = tool({
    description:
        'List messages and files pinned to a channel. The caller must have channel access.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel, group, or DM ID'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'pins.list', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to list pinned items');
        }
    },
});
