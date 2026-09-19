// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackCreateUserGroup = tool({
    description:
        'Create a User Group (subteam) with a unique name, @handle, description, and default channels.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('Unique display name, e.g. Customer Support'),
        handle: z.string().optional().describe('Mention handle, e.g. support-team (max 21 chars, lowercase)'),
        description: z.string().optional().describe('Group purpose'),
        channels: z.string().optional().describe('Comma-separated default channel IDs'),
        additionalChannels: z.string().optional().describe('Comma-separated extra channel IDs members may join'),
        includeCount: z.boolean().optional().describe('Include member count in the response'),
        enableSection: z.boolean().optional().describe('Show the group as a sidebar section for members'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, additionalChannels, includeCount, enableSection, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.create', {
                ...rest,
                additional_channels: additionalChannels,
                include_count: includeCount,
                enable_section: enableSection,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to create user group');
        }
    },
});

export const slackUpdateUserGroup = tool({
    description:
        'Update a User Group name, handle, description, or default channels by its ID.',
    inputSchema: z.object({
        slackToken: tokenField,
        usergroup: z.string().describe('User Group ID, e.g. S0615G0KT'),
        name: z.string().optional().describe('New unique display name'),
        handle: z.string().optional().describe('New unique @handle'),
        description: z.string().optional().describe('New purpose text'),
        channels: z.string().optional().describe('Comma-separated default channel IDs'),
        additionalChannels: z.string().optional().describe('Comma-separated extra channel IDs'),
        includeCount: z.boolean().optional().describe('Include member count in the response'),
        enableSection: z.boolean().optional().describe('Show the group as a sidebar section'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, usergroup, additionalChannels, includeCount, enableSection, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.update', {
                usergroup,
                ...rest,
                additional_channels: additionalChannels,
                include_count: includeCount,
                enable_section: enableSection,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update user group');
        }
    },
});

export const slackUpdateUserGroupMembers = tool({
    description:
        'Replace ALL members of a User Group with a new comma-separated user ID list. This overwrites existing membership — confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        usergroup: z.string().describe('User Group ID, e.g. S012AB34CD'),
        users: z.string().describe("Complete new member list, e.g. 'U012AB34CD,W567EF89GH'"),
        includeCount: z.boolean().optional().describe('Include updated counts in the response'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, usergroup, users, includeCount, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.users.update', {
                usergroup,
                users,
                include_count: includeCount,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to update user group members');
        }
    },
});

export const slackListUserGroups = tool({
    description:
        'List workspace User Groups, optionally with member IDs, counts, and disabled groups.',
    inputSchema: z.object({
        slackToken: tokenField,
        includeUsers: z.boolean().optional().describe('Include member user IDs per group'),
        includeCount: z.boolean().optional().describe('Include member counts'),
        includeDisabled: z.boolean().optional().describe('Include disabled/archived groups'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, includeUsers, includeCount, includeDisabled, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.list', {
                include_users: includeUsers,
                include_count: includeCount,
                include_disabled: includeDisabled,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list user groups');
        }
    },
});

export const slackListUserGroupMembers = tool({
    description:
        'List user IDs in a User Group, optionally including disabled groups.',
    inputSchema: z.object({
        slackToken: tokenField,
        usergroup: z.string().describe('User Group ID, e.g. S0604QSJC'),
        includeDisabled: z.boolean().optional().describe('Include users from disabled groups'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, usergroup, includeDisabled, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.users.list', {
                usergroup,
                include_disabled: includeDisabled,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list user group members');
        }
    },
});

export const slackEnableUserGroup = tool({
    description:
        'Re-enable a disabled User Group for mentions and permissions. Status-only change.',
    inputSchema: z.object({
        slackToken: tokenField,
        usergroup: z.string().describe('User Group ID to enable, e.g. S0604QSJC'),
        includeCount: z.boolean().optional().describe('Include member count in the response'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, usergroup, includeCount, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.enable', {
                usergroup,
                include_count: includeCount,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to enable user group');
        }
    },
});

export const slackDisableUserGroup = tool({
    description:
        'Disable (archive) an enabled User Group by ID. The group is not deleted and can be re-enabled.',
    inputSchema: z.object({
        slackToken: tokenField,
        usergroup: z.string().describe('User Group ID to disable'),
        includeCount: z.boolean().optional().describe('Include member count in the response'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, usergroup, includeCount, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'usergroups.disable', {
                usergroup,
                include_count: includeCount,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to disable user group');
        }
    },
});
