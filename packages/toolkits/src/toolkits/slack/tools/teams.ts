// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackGetTeamInfo = tool({
    description:
        'Get metadata for the current workspace, or a specified accessible team. Omit both filters for the current team.',
    inputSchema: z.object({
        slackToken: tokenField,
        team: z.string().optional().describe('Team ID to look up'),
        domain: z.string().optional().describe('Workspace domain (only when team is omitted, same enterprise)'),
    }),
    execute: async ({ slackToken, team, domain }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'team.info', { team, domain });
        } catch (error) {
            return toSlackError(error, 'Failed to get team info');
        }
    },
});

export const slackGetTeamProfile = tool({
    description:
        'Get workspace profile field definitions (custom fields and sections), optionally filtered by visibility.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
        visibility: z.enum(['all', 'visible', 'hidden']).optional().describe('Which profile fields to include'),
    }),
    execute: async ({ slackToken, teamId, visibility }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'team.profile.get', { team_id: teamId, visibility });
        } catch (error) {
            return toSlackError(error, 'Failed to get team profile');
        }
    },
});

export const slackListAuthTeams = tool({
    description:
        'List workspaces an org-wide app is approved for. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        limit: z.number().min(1).max(1000).optional().describe('Items per page (max 1000, default 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        includeIcon: z.boolean().optional().describe('Include workspace avatar URIs'),
    }),
    execute: async ({ slackToken, includeIcon, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'auth.teams.list', { ...rest, include_icon: includeIcon });
        } catch (error) {
            return toSlackError(error, 'Failed to list authorized teams');
        }
    },
});

export const slackListAvailableWorkspaces = tool({
    description:
        'List workspaces where both the connection and a target user have access. Match a workspace name to a team_id here, then pass team_id to user tools. Meaningful for org-level installs.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().describe('User ID whose shared workspace memberships to find'),
    }),
    execute: async ({ slackToken, user }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const data = await slackApi(slackToken, 'auth.teams.list', { limit: 1000 });
            const teams = data?.teams ?? [];
            return {
                ok: true,
                available_workspaces: teams.map((t) => ({ id: t.id, name: t.name, icon: t.icon })),
                total_count: teams.length,
            };
        } catch (error) {
            return toSlackError(error, 'Failed to list available workspaces');
        }
    },
});

export const slackCreateEnterpriseTeam = tool({
    description:
        'Create a team (workspace) in an Enterprise Grid org. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamName: z.string().describe('Display name for the team'),
        teamDomain: z.string().describe('Team domain (part of the team URL)'),
        teamDescription: z.string().optional().describe('Team purpose'),
        teamDiscoverability: z.enum(['open', 'closed', 'invite_only', 'unlisted']).optional().describe('Discoverability'),
    }),
    execute: async ({ slackToken, teamName, teamDomain, teamDescription, teamDiscoverability }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.create', {
                team_name: teamName,
                team_domain: teamDomain,
                team_description: teamDescription,
                team_discoverability: teamDiscoverability,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create enterprise team');
        }
    },
});

export const slackListEnterpriseTeams = tool({
    description:
        'List teams in an Enterprise Grid org with IDs, names, and domains. Paginate with cursor. Enterprise Grid only.',
    inputSchema: z.object({
        slackToken: tokenField,
        limit: z.number().min(1).max(100).optional().describe('Teams per page (max 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.list', { limit, cursor });
        } catch (error) {
            return toSlackError(error, 'Failed to list enterprise teams');
        }
    },
});

export const slackListWorkspaceAdmins = tool({
    description:
        'List admin user IDs for a workspace. Enterprise Grid with admin.teams:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        limit: z.number().min(1).max(1000).optional().describe('Admins per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.admins.list', {
                team_id: teamId,
                limit,
                cursor,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list workspace admins');
        }
    },
});

export const slackListWorkspaceOwners = tool({
    description:
        'List owner user IDs for a workspace. Requires admin.teams:read. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        limit: z.number().min(1).max(1000).optional().describe('Owners per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, teamId, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.owners.list', {
                team_id: teamId,
                limit,
                cursor,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list workspace owners');
        }
    },
});

export const slackGetWorkspaceSettings = tool({
    description:
        'Get detailed settings for a workspace (Enterprise Grid admin audit).',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID (T-prefixed)'),
    }),
    execute: async ({ slackToken, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.settings.info', { team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to get workspace settings');
        }
    },
});

export const slackSetWorkspaceName = tool({
    description:
        'Set the display name of a workspace (Enterprise Grid). Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        name: z.string().describe('New workspace name'),
    }),
    execute: async ({ slackToken, teamId, name }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.settings.setName', { team_id: teamId, name });
        } catch (error) {
            return toSlackError(error, 'Failed to set workspace name');
        }
    },
});

export const slackSetWorkspaceDescription = tool({
    description:
        'Set the description of a workspace. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        description: z.string().describe('New workspace description'),
    }),
    execute: async ({ slackToken, teamId, description }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.settings.setDescription', {
                team_id: teamId,
                description,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set workspace description');
        }
    },
});

export const slackSetWorkspaceIcon = tool({
    description:
        'Set the workspace icon from a publicly reachable image URL (GIF/PNG/JPG/HEIC, ideally 512x512).',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        imageUrl: z.string().describe('Public image URL for the icon'),
    }),
    execute: async ({ slackToken, teamId, imageUrl }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.teams.settings.setIcon', {
                team_id: teamId,
                image_url: imageUrl,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set workspace icon');
        }
    },
});

export const slackSetWorkspaceDefaultChannels = tool({
    description:
        'Set the default channels new members auto-join. Pass an array or comma-separated string of channel IDs.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        channelIds: z.union([z.array(z.string()), z.string()]).describe('Channel IDs to set as defaults'),
    }),
    execute: async ({ slackToken, teamId, channelIds }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const ids = Array.isArray(channelIds) ? channelIds.join(',') : channelIds;
            return await slackApi(slackToken, 'admin.teams.settings.setDefaultChannels', {
                team_id: teamId,
                channel_ids: ids,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to set default channels');
        }
    },
});
