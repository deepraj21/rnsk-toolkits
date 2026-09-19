// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackAdminSearchConversations = tool({
    description:
        'Search public or private channels across an Enterprise Grid org by name and type. Enterprise Grid only.',
    inputSchema: z.object({
        slackToken: tokenField,
        query: z.string().optional().describe('Channel name to search for'),
        teamIds: z.string().optional().describe('Comma-separated workspace IDs to search'),
        connectedTeamIds: z.string().optional().describe('Comma-separated external org team IDs to search'),
        searchChannelTypes: z
            .enum(['public', 'private', 'private_exclude', 'im', 'mpim', 'ext_shared', 'org_shared', 'archived', 'exclude_archived', 'multi_workspace', 'org_wide', 'external_shared'])
            .optional()
            .describe('Channel type to include or exclude'),
        sort: z.enum(['relevant', 'name', 'member_count', 'created']).optional().describe('Sort method'),
        sortDir: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        limit: z.number().min(1).max(20).optional().describe('Max results (1-20, default 10)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        totalCountOnly: z.boolean().optional().describe('Return only the total count, no channel data'),
    }),
    execute: async ({ slackToken, teamIds, connectedTeamIds, searchChannelTypes, sortDir, totalCountOnly, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.search', {
                ...rest,
                team_ids: teamIds,
                connected_team_ids: connectedTeamIds,
                search_channel_types: searchChannelTypes,
                sort_dir: sortDir,
                total_count_only: totalCountOnly,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to search conversations');
        }
    },
});

export const slackAdminCreateConversation = tool({
    description:
        'Create a channel via the Admin API (Enterprise Grid). Set orgWide=true for an org-wide channel, otherwise teamId is required. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('Channel name: unique, lowercase, max 80 chars, no spaces'),
        isPrivate: z.boolean().describe('True for private, false for public'),
        teamId: z.string().optional().describe('Workspace ID (required unless orgWide is true)'),
        orgWide: z.boolean().optional().describe('Make the channel available org-wide'),
        description: z.string().optional().describe('Channel description'),
    }),
    execute: async ({ slackToken, name, isPrivate, teamId, orgWide, description }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.create', {
                name,
                is_private: isPrivate,
                team_id: teamId,
                org_wide: orgWide,
                description,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create conversation');
        }
    },
});

export const slackDeleteChannel = tool({
    description:
        'Permanently delete a public or private channel and all its messages and files (Enterprise Grid admin). Irreversible — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to delete'),
    }),
    execute: async ({ slackToken, channelId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.delete', { channel_id: channelId });
        } catch (error) {
            return toSlackError(error, 'Failed to delete channel');
        }
    },
});

export const slackConvertChannelToPrivate = tool({
    description:
        'Convert a public channel to private via the Admin API. Enterprise Grid only, irreversible via API. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Public channel ID to convert'),
        name: z.string().optional().describe('Only used when converting an MPIM'),
    }),
    execute: async ({ slackToken, channelId, name }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.convertToPrivate', {
                channel_id: channelId,
                name,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to convert channel to private');
        }
    },
});

export const slackInviteUserToChannelAdmin = tool({
    description:
        'Invite users to a channel via the Admin API (Enterprise Grid). The caller must be a channel member. For regular workspaces use slackInviteUsersToChannel.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to invite users to'),
        userIds: z.string().describe("Comma-separated user IDs, e.g. 'U123,U456' (max 1000)"),
    }),
    execute: async ({ slackToken, channelId, userIds }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.invite', {
                channel_id: channelId,
                user_ids: userIds,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to invite users to channel');
        }
    },
});

export const slackGetConversationPrefs = tool({
    description:
        'Get posting/thread/mention/huddle preferences for a channel. Enterprise Grid oriented.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to get preferences for'),
    }),
    execute: async ({ slackToken, channelId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.getConversationPrefs', {
                channel_id: channelId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get conversation preferences');
        }
    },
});

export const slackSetConversationPrefs = tool({
    description:
        'Set posting permissions for a channel (who can post/thread, @channel/@here, huddles). Pass prefs as a JSON string, e.g. {"who_can_post":"type:admin"}. Enterprise Grid oriented.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to set preferences for'),
        prefs: z.record(z.any()).describe('Preferences object (who_can_post, can_thread, can_huddle, enable_at_channel, enable_at_here)'),
    }),
    execute: async ({ slackToken, channelId, prefs }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.setConversationPrefs', {
                channel_id: channelId,
                prefs: JSON.stringify(prefs),
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set conversation preferences');
        }
    },
});

export const slackGetChannelWorkspaces = tool({
    description:
        'List workspaces a channel is connected to within an Enterprise Grid org. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to inspect'),
        limit: z.number().min(1).max(1000).optional().describe('Items per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, channelId, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.getTeams', {
                channel_id: channelId,
                limit,
                cursor,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get channel workspaces');
        }
    },
});

export const slackSetChannelWorkspaces = tool({
    description:
        'Set which Enterprise Grid workspaces connect to a channel (share a channel with workspaces, or convert to an org channel). Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Channel ID to share'),
        teamId: z.string().optional().describe('Owning workspace; omit for cross-workspace shared channels'),
        targetTeamIds: z.string().optional().describe('Comma-separated workspace IDs to share with'),
        orgChannel: z.boolean().optional().describe('Convert the channel to an org channel'),
    }),
    execute: async ({ slackToken, channelId, teamId, targetTeamIds, orgChannel }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.setTeams', {
                channel_id: channelId,
                team_id: teamId,
                target_team_ids: targetTeamIds,
                org_channel: orgChannel,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set channel workspaces');
        }
    },
});

export const slackListChannelIdpGroups = tool({
    description:
        'List IDP groups allowlisted on a private channel (only members of these groups may access it). Enterprise Grid with IDP groups enabled.',
    inputSchema: z.object({
        slackToken: tokenField,
        channelId: z.string().describe('Private channel ID'),
        teamId: z.string().optional().describe('Workspace ID for workspace-specific channels'),
    }),
    execute: async ({ slackToken, channelId, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.conversations.restrictAccess.listGroups', {
                channel_id: channelId,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list channel IDP groups');
        }
    },
});
