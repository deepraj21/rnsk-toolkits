// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackSendMessage = tool({
    description:
        'Post a message to a channel, DM, or private group. Provide exactly one of markdownText (normal Markdown) or blocks (raw Block Kit for interactive layouts). For DMs, resolve the user to a channel ID with slackOpenDm first. Not idempotent — duplicate calls post duplicates.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe("Channel ID or name (no '#' prefix). For DMs use the ID from slackOpenDm"),
        markdownText: z.string().optional().describe('Message in standard Markdown. Do not combine with blocks'),
        blocks: z.array(z.record(z.any())).optional().describe('Raw Block Kit JSON for interactive layouts'),
        fallbackText: z.string().optional().describe('Plain-text notification fallback, only with blocks'),
        threadTs: z.string().optional().describe('Parent message ts to reply in a thread'),
        replyBroadcast: z.boolean().optional().describe('Also post a thread reply to the main channel'),
        unfurlLinks: z.boolean().optional().describe('Unfurl text URLs'),
        unfurlMedia: z.boolean().optional().describe('Show media previews from URLs'),
    }),
    execute: async ({ slackToken, channel, markdownText, blocks, fallbackText, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if ((markdownText && blocks) || (!markdownText && !blocks)) {
                return { error: 'Provide exactly one of markdownText or blocks.' };
            }
            return await slackApi(slackToken, 'chat.postMessage', {
                channel: channel.startsWith('#') ? channel.slice(1) : channel,
                markdown_text: markdownText,
                blocks,
                text: fallbackText,
                thread_ts: rest.threadTs,
                reply_broadcast: rest.replyBroadcast,
                unfurl_links: rest.unfurlLinks,
                unfurl_media: rest.unfurlMedia,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to send message');
        }
    },
});

export const slackUpdateMessage = tool({
    description:
        'Update a message by channel and timestamp. Provide exactly one of markdownText or blocks (raw Block Kit). Only messages posted by the caller can be edited.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID or name containing the message'),
        ts: z.string().describe('Timestamp of the message to update'),
        markdownText: z.string().optional().describe('Updated message in standard Markdown'),
        blocks: z.array(z.record(z.any())).optional().describe('Raw Block Kit JSON for the updated message'),
        fallbackText: z.string().optional().describe('Plain-text fallback, only with blocks'),
        asUser: z.boolean().optional().describe('Update as the authenticated user'),
        fileIds: z.array(z.string()).optional().describe('File IDs to attach (must already be uploaded)'),
        replyBroadcast: z.boolean().optional().describe('Broadcast an updated thread reply to the channel'),
    }),
    execute: async ({ slackToken, channel, ts, markdownText, blocks, fallbackText, asUser, fileIds, replyBroadcast }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if ((markdownText && blocks) || (!markdownText && !blocks)) {
                return { error: 'Provide exactly one of markdownText or blocks.' };
            }
            return await slackApi(slackToken, 'chat.update', {
                channel,
                ts,
                markdown_text: markdownText,
                blocks,
                text: fallbackText,
                as_user: asUser,
                file_ids: fileIds?.join(','),
                reply_broadcast: replyBroadcast,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update message');
        }
    },
});

export const slackDeleteMessage = tool({
    description:
        'Delete a message by channel and timestamp. The authenticated user or bot must be the original poster. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel, group, or DM ID containing the message'),
        ts: z.string().optional().describe('Exact timestamp of the message to delete'),
        asUser: z.boolean().optional().describe('Legacy: delete as the authed user (classic apps only)'),
    }),
    execute: async ({ slackToken, channel, ts, asUser }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.delete', { channel, ts, as_user: asUser });
        } catch (error) {
            return toSlackError(error, 'Failed to delete message');
        }
    },
});

export const slackScheduleMessage = tool({
    description:
        'Schedule a message for a future time (Unix epoch seconds, max 120 days ahead). Provide markdownText, text, blocks (JSON string), or attachments (JSON string). Use slackListScheduledMessages to find the scheduled_message_id afterwards.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID or name to send to'),
        postAt: z.string().describe('Future send time as Unix epoch seconds'),
        markdownText: z.string().optional().describe('Message in Markdown'),
        text: z.string().optional().describe('Plain-text message content'),
        blocks: z.string().optional().describe('Block Kit layout as a JSON string'),
        attachments: z.string().optional().describe('Legacy attachments as a JSON string'),
        threadTs: z.string().optional().describe('Parent message ts for a scheduled thread reply'),
        replyBroadcast: z.boolean().optional().describe('Broadcast a scheduled thread reply to the channel'),
        parse: z.string().optional().describe("Text parsing: 'full' to auto-link mentions, 'none' otherwise"),
        linkNames: z.boolean().optional().describe('Auto-link channel and user names (deprecated, prefer parse)'),
        unfurlLinks: z.boolean().optional().describe('Unfurl text URLs (may be ignored for scheduled messages)'),
        unfurlMedia: z.boolean().optional().describe('Show media previews (may be ignored for scheduled messages)'),
    }),
    execute: async ({ slackToken, channel, postAt, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.scheduleMessage', {
                channel,
                post_at: postAt,
                markdown_text: rest.markdownText,
                text: rest.text,
                blocks: rest.blocks,
                attachments: rest.attachments,
                thread_ts: rest.threadTs,
                reply_broadcast: rest.replyBroadcast,
                parse: rest.parse,
                link_names: rest.linkNames,
                unfurl_links: rest.unfurlLinks,
                unfurl_media: rest.unfurlMedia,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to schedule message');
        }
    },
});

export const slackListScheduledMessages = tool({
    description:
        'List pending scheduled messages for a channel (or all accessible channels when omitted), optionally filtered by time range. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().optional().describe('Channel ID or name; omit for all accessible channels'),
        oldest: z.string().optional().describe('Earliest Unix timestamp (inclusive)'),
        latest: z.string().optional().describe('Latest Unix timestamp (exclusive)'),
        limit: z.number().min(1).max(1000).optional().describe('Messages per page'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.scheduledMessages.list', { ...rest, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to list scheduled messages');
        }
    },
});

export const slackDeleteScheduledMessage = tool({
    description:
        'Delete a pending scheduled message by channel and scheduled_message_id. Get the ID from slackListScheduledMessages.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel, group, or DM ID where the message is scheduled'),
        scheduledMessageId: z.string().describe('ID from the chat.scheduleMessage response'),
        asUser: z.boolean().optional().describe('Delete as the authed user (requires chat:write:user)'),
    }),
    execute: async ({ slackToken, channel, scheduledMessageId, asUser }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.deleteScheduledMessage', {
                channel,
                scheduled_message_id: scheduledMessageId,
                as_user: asUser,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to delete scheduled message');
        }
    },
});

export const slackGetMessagePermalink = tool({
    description:
        'Get a permalink URL for a message by channel ID and timestamp. Resolve channel names to IDs with slackFindChannels first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID containing the message'),
        messageTs: z.string().describe('Message ts value'),
    }),
    execute: async ({ slackToken, channel, messageTs }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.getPermalink', { channel, message_ts: messageTs });
        } catch (error) {
            return toSlackError(error, 'Failed to get message permalink');
        }
    },
});

export const slackSendMeMessage = tool({
    description:
        "Send a '/me' action message to a channel, shown in third person (e.g. '*user is preparing for a meeting*'). Plain text only.",
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID, name, or @username for a DM'),
        text: z.string().describe("Action text, e.g. 'is preparing for a meeting'"),
    }),
    execute: async ({ slackToken, channel, text }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.meMessage', { channel, text });
        } catch (error) {
            return toSlackError(error, 'Failed to send me message');
        }
    },
});

export const slackSendEphemeralMessage = tool({
    description:
        'Send an ephemeral message visible only to one user in a channel. Both the bot and the target user must be channel members. Provide markdownText, text, blocks (JSON string), or attachments (JSON string).',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID or name'),
        user: z.string().describe('User ID who will see the message'),
        markdownText: z.string().optional().describe('Message in Markdown'),
        text: z.string().optional().describe('Plain-text message (fallback for notifications)'),
        blocks: z.string().optional().describe('Block Kit layout as a JSON string'),
        attachments: z.string().optional().describe('Legacy attachments as a JSON string'),
        threadTs: z.string().optional().describe('Parent message ts for a threaded ephemeral reply'),
        parse: z.string().optional().describe("Use 'full' to auto-link mentions and channels"),
        linkNames: z.boolean().optional().describe('Auto-link @mentions and #channels'),
        asUser: z.boolean().optional().describe('Legacy: post as the authed user'),
        username: z.string().optional().describe('Custom sender name (only when not posting as user)'),
        iconUrl: z.string().optional().describe('Custom sender icon URL (only when not posting as user)'),
        iconEmoji: z.string().optional().describe('Custom sender emoji (only when not posting as user)'),
    }),
    execute: async ({ slackToken, channel, user, markdownText, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'chat.postEphemeral', {
                channel,
                user,
                markdown_text: markdownText,
                text: rest.text,
                blocks: rest.blocks,
                attachments: rest.attachments,
                thread_ts: rest.threadTs,
                parse: rest.parse,
                link_names: rest.linkNames,
                as_user: rest.asUser,
                username: rest.username,
                icon_url: rest.iconUrl,
                icon_emoji: rest.iconEmoji,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to send ephemeral message');
        }
    },
});

export const slackListUnreadChannelMessages = tool({
    description:
        'List unread messages in a channel for the authenticated user (main timeline only, not thread replies). Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        channel: z.string().describe('Channel ID to fetch unread messages from'),
        limit: z.number().min(1).max(1000).optional().default(25).describe('Max messages to return'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        includeAllMetadata: z.boolean().optional().describe('Return all message metadata'),
    }),
    execute: async ({ slackToken, channel, limit = 25, cursor, includeAllMetadata }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const info = await slackApi(slackToken, 'conversations.info', { channel });
            const lastRead = info?.channel?.last_read;
            const history = await slackApi(slackToken, 'conversations.history', {
                channel,
                oldest: lastRead,
                limit,
                cursor,
                include_all_metadata: includeAllMetadata,
            });
            return { ...history, last_read: lastRead };
        } catch (error) {
            return toSlackError(error, 'Failed to list unread channel messages');
        }
    },
});

export const slackGetUnreadMessagesFromUser = tool({
    description:
        'Get unread DMs from a specific user. Opens the DM, reads the read position, and fetches messages since then. Returns an empty messages array when nothing is unread. DMs only.',
    inputSchema: z.object({
        slackToken: tokenField,
        userId: z.string().describe('User ID to check unread DMs from'),
        limit: z.number().min(1).max(999).optional().default(25).describe('Max unread messages to return'),
    }),
    execute: async ({ slackToken, userId, limit = 25 }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const opened = await slackApi(slackToken, 'conversations.open', { users: userId });
            const channelId = opened?.channel?.id;
            if (!channelId) {
                return { error: 'Could not open DM with user', details: opened };
            }
            const info = await slackApi(slackToken, 'conversations.info', { channel: channelId });
            const lastRead = info?.channel?.last_read ?? '0';
            const history = await slackApi(slackToken, 'conversations.history', {
                channel: channelId,
                oldest: lastRead,
                limit,
            });
            const messages = (history?.messages ?? []).filter((m) => m.ts !== lastRead);
            return {
                ok: true,
                channel_id: channelId,
                user_id: userId,
                unread_count: messages.length,
                messages,
                has_more: history?.has_more ?? false,
            };
        } catch (error) {
            return toSlackError(error, 'Failed to get unread messages from user');
        }
    },
});
