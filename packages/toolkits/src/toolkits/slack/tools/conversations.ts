// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackListAllChannels = tool({
    description:
        'List conversations visible to the caller, with type and archive filters. Always use the returned channel IDs (not names) in downstream tools. Loop on response_metadata.next_cursor until empty for full coverage.',
    inputSchema: z.object({
        slackToken: tokenField,
        types: z.string().optional().describe('Comma-separated: public_channel,private_channel,im,mpim'),
        limit: z.number().min(1).max(1000).optional().describe('Channels per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        excludeArchived: z.boolean().optional().describe('Hide archived channels'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId, excludeArchived, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.list', {
                ...rest,
                team_id: teamId,
                exclude_archived: excludeArchived,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list channels');
        }
    },
});

export const slackFindChannels = tool({
    description:
        'Find channels by name, topic, purpose, or description (case-insensitive partial match). Always resolve names to IDs here before passing to other tools. Empty results may mean no match or no access — retry with exactMatch=false and excludeArchived=false.',
    inputSchema: z.object({
        slackToken: tokenField,
        query: z.string().describe('Search text; a leading # is stripped automatically'),
        types: z.string().optional().default('public_channel,private_channel').describe('Channel types to search'),
        limit: z.number().min(1).max(999).optional().default(50).describe('Max channels to return'),
        exactMatch: z.boolean().optional().describe('Only return exact name matches'),
        memberOnly: z.boolean().optional().describe('Only channels the caller is a member of'),
        excludeArchived: z.boolean().optional().default(true).describe('Hide archived channels'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({
        slackToken,
        query,
        types = 'public_channel,private_channel',
        limit = 50,
        exactMatch,
        memberOnly,
        excludeArchived = true,
        teamId,
    }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const normalized = query.startsWith('#') ? query.slice(1) : query;
            const data = await slackApi(slackToken, 'conversations.list', {
                types,
                limit: Math.min(1000, Math.max(limit, 50)),
                exclude_archived: excludeArchived,
                team_id: teamId,
            });
            const all = data?.channels ?? [];
            const q = normalized.toLowerCase();
            const matches = all.filter((c) => {
                if (memberOnly && !c.is_member) return false;
                if (exactMatch) {
                    return (c.name ?? '').toLowerCase() === q;
                }
                return [c.name, c.topic?.value, c.purpose?.value]
                    .filter(Boolean)
                    .some((v) => String(v).toLowerCase().includes(q));
            });
            return { ok: true, channels: matches.slice(0, limit), total_channels_searched: all.length };
        } catch (error) {
            return toSlackError(error, 'Failed to find channels');
        }
    },
});

export const slackListConversations = tool({
    description:
        'List conversations accessible to a user (defaults to the caller). Returns IDs, not names. Private channels and DMs appear only with shared membership and proper scopes. Paginate on next_cursor until empty.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID; omit for the authenticated user'),
        types: z.string().optional().describe('Comma-separated: public_channel,private_channel,im,mpim'),
        limit: z.number().min(1).max(1000).optional().describe('Items per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        excludeArchived: z.boolean().optional().describe('Hide archived channels'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId, excludeArchived, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.conversations', {
                ...rest,
                team_id: teamId,
                exclude_archived: excludeArchived,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list conversations');
        }
    },
});

export const slackGetConversationInfo = tool({
    description:
        'Get metadata for a conversation by ID (name, purpose, dates, member count). No message content. Check is_archived and is_member to diagnose access issues.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        includeNumMembers: z.boolean().optional().describe('Include member count'),
        includeLocale: z.boolean().optional().describe('Include locale setting'),
    }),
    execute: async ({ slackToken, channel, includeNumMembers, includeLocale }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.info', {
                channel,
                include_num_members: includeNumMembers,
                include_locale: includeLocale,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get conversation info');
        }
    },
});

export const slackGetConversationMembers = tool({
    description:
        'List active member user IDs for a channel, DM, or group DM. Returns IDs only — enrich with user lookup tools. Paginate on next_cursor until empty for large channels.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID (names not accepted)'),
        limit: z.number().min(1).optional().describe('Members per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, channel, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.members', { channel, limit, cursor });
        } catch (error) {
            return toSlackError(error, 'Failed to get conversation members');
        }
    },
});

export const slackGetConversationHistory = tool({
    description:
        'Fetch one page of main-timeline messages from a conversation, with time-range filters. Threaded replies are NOT included — use slackGetConversationReplies with a parent ts for those. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        oldest: z.string().optional().describe('Start of time range (Slack ts)'),
        latest: z.string().optional().describe('End of time range (Slack ts)'),
        limit: z.number().min(1).max(1000).optional().default(100).describe('Messages per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        inclusive: z.boolean().optional().describe('Include boundary messages'),
        includeAllMetadata: z.boolean().optional().describe('Return all message metadata'),
    }),
    execute: async ({ slackToken, channel, limit = 100, includeAllMetadata, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.history', {
                channel,
                limit,
                include_all_metadata: includeAllMetadata,
                ...rest,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to fetch conversation history');
        }
    },
});

export const slackGetConversationReplies = tool({
    description:
        'Fetch replies in a thread by channel ID and parent message ts. The first returned message is the parent; use has_more/cursor for large threads.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        ts: z.string().describe('Parent message ts (exact, not a reply ts or permalink)'),
        oldest: z.string().optional().describe('Earliest reply ts to include'),
        latest: z.string().optional().describe('Latest reply ts to include'),
        limit: z.number().min(1).optional().describe('Max messages to return'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        inclusive: z.boolean().optional().describe('Include boundary messages'),
        includeAllMetadata: z.boolean().optional().describe('Return all message metadata'),
    }),
    execute: async ({ slackToken, channel, ts, includeAllMetadata, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.replies', {
                channel,
                ts,
                include_all_metadata: includeAllMetadata,
                ...rest,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to fetch conversation replies');
        }
    },
});

export const slackCreateChannel = tool({
    description:
        'Create a public or private channel. Names must be lowercase, unique, 80 chars max, no spaces or periods. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('Channel name, e.g. mychannel'),
        isPrivate: z.boolean().optional().describe('Create a private invite-only channel'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, name, isPrivate, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.create', {
                name,
                is_private: isPrivate,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create channel');
        }
    },
});

export const slackArchiveChannel = tool({
    description:
        'Archive a conversation, making it read-only while keeping history. Some channels (#general, DMs) cannot be archived. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID to archive'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.archive', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to archive conversation');
        }
    },
});

export const slackUnarchiveChannel = tool({
    description: 'Unarchive a conversation, making it active again.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID to unarchive'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.unarchive', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to unarchive conversation');
        }
    },
});

export const slackCloseDm = tool({
    description:
        'Close a DM or group DM, removing it from the caller sidebar without deleting history. Affects only the calling user view.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('DM (D...) or group DM (G...) ID to close'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.close', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to close conversation');
        }
    },
});

export const slackJoinConversation = tool({
    description:
        'Join a conversation by ID. Joining an already-joined channel is a non-fatal no-op. Private channel joins may fail without permission.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID to join'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.join', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to join conversation');
        }
    },
});

export const slackLeaveConversation = tool({
    description:
        'Leave a conversation by ID. Fails as the last member of a private channel or on #general / Slack Connect channels.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID to leave'),
    }),
    execute: async ({ slackToken, channel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.leave', { channel });
        } catch (error) {
            return toSlackError(error, 'Failed to leave conversation');
        }
    },
});

export const slackRenameConversation = tool({
    description:
        'Rename a channel (Slack normalizes to lowercase conventions). May affect integrations using the old name.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID to rename'),
        name: z.string().describe('New name: lowercase, max 80 chars, no spaces'),
    }),
    execute: async ({ slackToken, channel, name }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.rename', { channel, name });
        } catch (error) {
            return toSlackError(error, 'Failed to rename conversation');
        }
    },
});

export const slackSetConversationTopic = tool({
    description:
        'Set the topic header for a conversation by ID (max 250 chars, no formatting). The caller must be a member.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID (C/G/D prefix, not a name)'),
        topic: z.string().describe('New topic text'),
    }),
    execute: async ({ slackToken, channel, topic }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.setTopic', { channel, topic });
        } catch (error) {
            return toSlackError(error, 'Failed to set conversation topic');
        }
    },
});

export const slackSetConversationPurpose = tool({
    description:
        'Set the purpose (short goal description) for a conversation by ID (max 250 chars). The caller must be a member.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        purpose: z.string().describe('New purpose text'),
    }),
    execute: async ({ slackToken, channel, purpose }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.setPurpose', { channel, purpose });
        } catch (error) {
            return toSlackError(error, 'Failed to set conversation purpose');
        }
    },
});

export const slackMarkConversationRead = tool({
    description:
        'Mark a message as the most recently read for the caller in a channel. The caller must be a member and the message must exist.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        ts: z.string().describe('Message ts to mark as last read'),
    }),
    execute: async ({ slackToken, channel, ts }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.mark', { channel, ts });
        } catch (error) {
            return toSlackError(error, 'Failed to set conversation read cursor');
        }
    },
});

export const slackInviteUsersToChannel = tool({
    description:
        'Invite users to a channel by comma-separated user IDs (up to 1000). The bot must be a member of private channels. Inspect ok/error/errors — HTTP is always 200.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID to invite users to'),
        users: z.string().describe("Comma-separated user IDs, e.g. 'U123,U456'"),
        force: z.boolean().optional().describe('Invite valid users even when some IDs are invalid'),
    }),
    execute: async ({ slackToken, channel, users, force }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.invite', { channel, users, force });
        } catch (error) {
            return toSlackError(error, 'Failed to invite users to channel');
        }
    },
});

export const slackRemoveUserFromConversation = tool({
    description:
        'Remove (kick) a user from a conversation. The caller needs permission and cannot remove themselves with this tool.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Conversation ID'),
        user: z.string().describe('User ID to remove'),
    }),
    execute: async ({ slackToken, channel, user }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'conversations.kick', { channel, user });
        } catch (error) {
            return toSlackError(error, 'Failed to remove user from conversation');
        }
    },
});

export const slackOpenDm = tool({
    description:
        'Open or resume a DM (1 user) or group DM (2-8 users) by user IDs, or reopen an existing channel. Reuse the returned channel.id for messaging — never pass user IDs or emails directly to slackSendMessage.',
    inputSchema: z.object({
        slackToken: tokenField,
        users: z.string().optional().describe("Comma-separated user IDs, e.g. 'U123' or 'U123,U456'"),
        channel: z.string().optional().describe('Existing DM/MPIM channel to reopen'),
        returnIm: z.boolean().optional().describe('Return the full DM object (single-user opens only)'),
        preventCreation: z.boolean().optional().describe('Only check for an existing DM without creating one'),
    }),
    execute: async ({ slackToken, users, channel, returnIm, preventCreation }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if ((users && channel) || (!users && !channel)) {
                return { error: 'Provide exactly one of users or channel.' };
            }
            return await slackApi(slackToken, 'conversations.open', {
                users,
                channel,
                return_im: returnIm,
                prevent_creation: preventCreation,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to open DM');
        }
    },
});
