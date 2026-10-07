// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { graphRequest, failedResult, toTeamsError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const teamIdField = z.string().describe('Team (group) ID');
const channelIdField = z.string().describe('Channel ID');

export const teamsListJoinedTeams = tool({
  description: 'List teams the signed-in user is a member of. Use to discover team IDs.',
  inputSchema: z.object({
    teamsToken: tokenField,
  }),
  execute: async ({ teamsToken }) => {
    try {
      const result = await graphRequest(teamsToken, '/me/joinedTeams');
      if (!result.ok) return failedResult('Failed to list joined teams', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing joined teams');
    }
  },
});

export const teamsListAllTeams = tool({
  description: 'List all teams in the organization with optional OData filter.',
  inputSchema: z.object({
    teamsToken: tokenField,
    filter: z.string().optional().describe("OData filter, e.g. startswith(displayName,'Eng')"),
    top: z.number().int().min(1).optional().describe('Teams per page'),
  }),
  execute: async ({ teamsToken, filter, top }) => {
    try {
      const result = await graphRequest(teamsToken, '/teams', {
        query: { $filter: filter, $top: top },
      });
      if (!result.ok) return failedResult('Failed to list teams', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing teams');
    }
  },
});

export const teamsGetTeam = tool({
  description: 'Get one team with display name, description, visibility, and settings.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}`);
      if (!result.ok) return failedResult('Failed to get team', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting team');
    }
  },
});

export const teamsCreateTeam = tool({
  description:
    'Create a team from a template (standard/education) or with members. Owners become team owners.',
  inputSchema: z.object({
    teamsToken: tokenField,
    displayName: z.string().describe('Team display name'),
    description: z.string().optional().describe('Team description'),
    visibility: z.enum(['private', 'public']).optional().describe('Team visibility'),
    template: z
      .string()
      .optional()
      .describe(
        'Template OData bind, e.g. standard (default) or educationClass; omit for standard',
      ),
    owners: z.array(z.string()).optional().describe('Owner user IDs or UPNs'),
    members: z.array(z.string()).optional().describe('Member user IDs or UPNs'),
  }),
  execute: async ({
    teamsToken,
    displayName,
    description,
    visibility,
    template,
    owners,
    members,
  }) => {
    try {
      const toMember = (id: string, roles: string[]) => ({
        '@odata.type': '#microsoft.graph.aadUserConversationMember',
        roles,
        'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${id}')`,
      });
      const allMembers = [
        ...(owners ?? []).map((id) => toMember(id, ['owner'])),
        ...(members ?? []).map((id) => toMember(id, [])),
      ];
      const result = await graphRequest(teamsToken, '/teams', {
        method: 'POST',
        body: {
          'template@odata.bind':
            template !== undefined && template !== 'standard'
              ? `https://graph.microsoft.com/v1.0/teamsTemplates('${template}')`
              : "https://graph.microsoft.com/v1.0/teamsTemplates('standard')",
          displayName,
          ...(description !== undefined ? { description } : {}),
          ...(visibility !== undefined ? { visibility } : {}),
          ...(allMembers.length ? { members: allMembers } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create team', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error creating team');
    }
  },
});

export const teamsUpdateTeam = tool({
  description: 'Update a team display name, description, or visibility.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    team: z.record(z.string(), z.any()).describe('Team fields to update'),
  }),
  execute: async ({ teamsToken, teamId, team }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}`, {
        method: 'PATCH',
        body: team,
      });
      if (!result.ok) return failedResult('Failed to update team', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating team');
    }
  },
});

export const teamsDeleteTeam = tool({
  description: 'Delete a team and its underlying group. Channels and messages are removed.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}`, { method: 'DELETE' });
      if (!result.ok) return failedResult('Failed to delete team', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting team');
    }
  },
});

export const teamsArchiveTeam = tool({
  description: 'Archive a team (read-only) with optional SharePoint site freeze.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    shouldSetSpoSiteReadOnlyForMembers: z
      .boolean()
      .optional()
      .describe('Freeze the SharePoint site too'),
  }),
  execute: async ({ teamsToken, teamId, shouldSetSpoSiteReadOnlyForMembers }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/archive`, {
        method: 'POST',
        body:
          shouldSetSpoSiteReadOnlyForMembers !== undefined
            ? { shouldSetSpoSiteReadOnlyForMembers }
            : {},
      });
      if (!result.ok) return failedResult('Failed to archive team', result);
      return result.data ?? { archived: true };
    } catch (error) {
      return toTeamsError(error, 'Error archiving team');
    }
  },
});

export const teamsUnarchiveTeam = tool({
  description: 'Restore an archived team to active.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/unarchive`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to unarchive team', result);
      return result.data ?? { unarchived: true };
    } catch (error) {
      return toTeamsError(error, 'Error unarchiving team');
    }
  },
});

export const teamsCloneTeam = tool({
  description:
    'Clone a team with selective parts (apps, tabs, settings, channels, members). Returns the new team.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    displayName: z.string().describe('New team display name'),
    description: z.string().optional().describe('New team description'),
    visibility: z.enum(['private', 'public']).optional().describe('New team visibility'),
    partsToClone: z
      .string()
      .optional()
      .describe('Comma-separated parts: apps,tabs,settings,channels,members'),
  }),
  execute: async ({ teamsToken, teamId, displayName, description, visibility, partsToClone }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/clone`, {
        method: 'POST',
        body: {
          displayName,
          ...(description !== undefined ? { description } : {}),
          ...(visibility !== undefined ? { visibility } : {}),
          ...(partsToClone !== undefined ? { partsToClone } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to clone team', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error cloning team');
    }
  },
});

export const teamsListChannels = tool({
  description: 'List channels in a team. Use to discover channel IDs.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels`);
      if (!result.ok) return failedResult('Failed to list channels', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing channels');
    }
  },
});

export const teamsGetChannel = tool({
  description: 'Get one channel with description, membership type, and email.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
  }),
  execute: async ({ teamsToken, teamId, channelId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels/${channelId}`);
      if (!result.ok) return failedResult('Failed to get channel', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error getting channel');
    }
  },
});

export const teamsCreateChannel = tool({
  description: 'Create a standard, private, or shared channel in a team.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    displayName: z.string().max(50).describe('Channel name (max 50 chars)'),
    description: z.string().optional().describe('Channel description'),
    membershipType: z
      .enum(['standard', 'private', 'shared'])
      .optional()
      .describe('Channel membership type'),
  }),
  execute: async ({ teamsToken, teamId, displayName, description, membershipType }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels`, {
        method: 'POST',
        body: {
          displayName,
          ...(description !== undefined ? { description } : {}),
          ...(membershipType !== undefined ? { membershipType } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create channel', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error creating channel');
    }
  },
});

export const teamsUpdateChannel = tool({
  description: 'Update a channel display name or description.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    channel: z.record(z.string(), z.any()).describe('Channel fields to update'),
  }),
  execute: async ({ teamsToken, teamId, channelId, channel }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels/${channelId}`, {
        method: 'PATCH',
        body: channel,
      });
      if (!result.ok) return failedResult('Failed to update channel', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating channel');
    }
  },
});

export const teamsDeleteChannel = tool({
  description: 'Delete a channel and its messages.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
  }),
  execute: async ({ teamsToken, teamId, channelId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels/${channelId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete channel', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting channel');
    }
  },
});

export const teamsListTeamMembers = tool({
  description: 'List team members with roles (owner/member) and user details.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/members`);
      if (!result.ok) return failedResult('Failed to list team members', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing team members');
    }
  },
});

export const teamsAddTeamMember = tool({
  description: 'Add a member or owner to a team by user ID or UPN.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    userId: z.string().describe('User ID or UPN to add'),
    roles: z.array(z.string()).optional().describe('Roles: owner for owners, empty for members'),
  }),
  execute: async ({ teamsToken, teamId, userId, roles }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/members`, {
        method: 'POST',
        body: {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: roles ?? [],
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`,
        },
      });
      if (!result.ok) return failedResult('Failed to add team member', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error adding team member');
    }
  },
});

export const teamsRemoveTeamMember = tool({
  description: 'Remove a member from a team by membership ID (from List Team Members).',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    membershipId: z.string().describe('Membership ID'),
  }),
  execute: async ({ teamsToken, teamId, membershipId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/members/${membershipId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to remove team member', result);
      return result.data ?? { removed: true };
    } catch (error) {
      return toTeamsError(error, 'Error removing team member');
    }
  },
});

export const teamsUpdateTeamMember = tool({
  description: 'Promote a member to owner or demote to member by updating roles.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    membershipId: z.string().describe('Membership ID'),
    roles: z.array(z.string()).describe('Roles: ["owner"] or []'),
  }),
  execute: async ({ teamsToken, teamId, membershipId, roles }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/members/${membershipId}`, {
        method: 'PATCH',
        body: { roles },
      });
      if (!result.ok) return failedResult('Failed to update team member', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating team member');
    }
  },
});

export const teamsListChannelMembers = tool({
  description: 'List members with access to a channel (team + direct members for private/shared).',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
  }),
  execute: async ({ teamsToken, teamId, channelId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/members`,
      );
      if (!result.ok) return failedResult('Failed to list channel members', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing channel members');
    }
  },
});

export const teamsAddChannelMember = tool({
  description: 'Add a member to a private or shared channel.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    userId: z.string().describe('User ID or UPN to add'),
    roles: z.array(z.string()).optional().describe('Roles: owner for channel owners'),
  }),
  execute: async ({ teamsToken, teamId, channelId, userId, roles }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/members`,
        {
          method: 'POST',
          body: {
            '@odata.type': '#microsoft.graph.aadUserConversationMember',
            roles: roles ?? [],
            'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to add channel member', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error adding channel member');
    }
  },
});

export const teamsRemoveChannelMember = tool({
  description: 'Remove a member from a private or shared channel by membership ID.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    membershipId: z.string().describe('Membership ID'),
  }),
  execute: async ({ teamsToken, teamId, channelId, membershipId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/members/${membershipId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to remove channel member', result);
      return result.data ?? { removed: true };
    } catch (error) {
      return toTeamsError(error, 'Error removing channel member');
    }
  },
});

export const teamsListTags = tool({
  description: 'List teamwork tags (user groups like "Designers") in a team.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/tags`);
      if (!result.ok) return failedResult('Failed to list tags', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing tags');
    }
  },
});

export const teamsCreateTag = tool({
  description: 'Create a tag with member user IDs for @mentions of a group.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    displayName: z.string().describe('Tag display name'),
    memberIds: z.array(z.string()).min(1).describe('Tagged user IDs (max 100)'),
  }),
  execute: async ({ teamsToken, teamId, displayName, memberIds }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/tags`, {
        method: 'POST',
        body: {
          displayName,
          members: memberIds.map((id) => ({
            userId: id,
            '@odata.type': '#microsoft.graph.teamworkTagMember',
          })),
        },
      });
      if (!result.ok) return failedResult('Failed to create tag', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error creating tag');
    }
  },
});

export const teamsDeleteTag = tool({
  description: 'Delete a teamwork tag.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    tagId: z.string().describe('Tag ID'),
  }),
  execute: async ({ teamsToken, teamId, tagId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/tags/${tagId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete tag', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting tag');
    }
  },
});

export const teamsListTabs = tool({
  description: 'List tabs pinned to a channel.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
  }),
  execute: async ({ teamsToken, teamId, channelId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels/${channelId}/tabs`);
      if (!result.ok) return failedResult('Failed to list tabs', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing tabs');
    }
  },
});

export const teamsAddTab = tool({
  description: 'Pin a tab (app content) to a channel with configuration.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    displayName: z.string().describe('Tab display name'),
    teamsAppId: z.string().describe('Teams app ID backing the tab'),
    configuration: z
      .record(z.string(), z.any())
      .optional()
      .describe('Tab configuration (entityId, contentUrl, websiteUrl, removeUrl)'),
  }),
  execute: async ({ teamsToken, teamId, channelId, displayName, teamsAppId, configuration }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/channels/${channelId}/tabs`, {
        method: 'POST',
        body: {
          displayName,
          'teamsApp@odata.bind': `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${teamsAppId}`,
          ...(configuration !== undefined ? { configuration } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to add tab', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error adding tab');
    }
  },
});

export const teamsUpdateTab = tool({
  description: 'Update a channel tab display name or configuration.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    tabId: z.string().describe('Tab ID'),
    tab: z.record(z.string(), z.any()).describe('Tab fields to update'),
  }),
  execute: async ({ teamsToken, teamId, channelId, tabId, tab }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/tabs/${tabId}`,
        { method: 'PATCH', body: tab },
      );
      if (!result.ok) return failedResult('Failed to update tab', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error updating tab');
    }
  },
});

export const teamsDeleteTab = tool({
  description: 'Remove a tab from a channel.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    channelId: channelIdField,
    tabId: z.string().describe('Tab ID'),
  }),
  execute: async ({ teamsToken, teamId, channelId, tabId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/channels/${channelId}/tabs/${tabId}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete tab', result);
      return result.data ?? { deleted: true };
    } catch (error) {
      return toTeamsError(error, 'Error deleting tab');
    }
  },
});

export const teamsListInstalledApps = tool({
  description: 'List apps installed in a team.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
  }),
  execute: async ({ teamsToken, teamId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/installedApps`, {
        query: { $expand: 'teamsApp' },
      });
      if (!result.ok) return failedResult('Failed to list installed apps', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error listing installed apps');
    }
  },
});

export const teamsInstallApp = tool({
  description: 'Install an app from the catalog into a team.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    teamsAppId: z.string().describe('Catalog app ID'),
  }),
  execute: async ({ teamsToken, teamId, teamsAppId }) => {
    try {
      const result = await graphRequest(teamsToken, `/teams/${teamId}/installedApps`, {
        method: 'POST',
        body: {
          'teamsApp@odata.bind': `https://graph.microsoft.com/v1.0/appCatalogs/teamsApps/${teamsAppId}`,
        },
      });
      if (!result.ok) return failedResult('Failed to install app', result);
      return result.data;
    } catch (error) {
      return toTeamsError(error, 'Error installing app');
    }
  },
});

export const teamsUninstallApp = tool({
  description: 'Remove an installed app from a team by installation ID.',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    installationId: z.string().describe('App installation ID'),
  }),
  execute: async ({ teamsToken, teamId, installationId }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/installedApps/${installationId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to uninstall app', result);
      return result.data ?? { uninstalled: true };
    } catch (error) {
      return toTeamsError(error, 'Error uninstalling app');
    }
  },
});

export const teamsSendActivityNotification = tool({
  description:
    'Send an activity feed notification to team members about something needing attention (approvals, mentions, updates).',
  inputSchema: z.object({
    teamsToken: tokenField,
    teamId: teamIdField,
    topicText: z.string().describe('Notification topic text'),
    previewText: z.string().optional().describe('Preview text shown in feed'),
    recipientUserIds: z
      .array(z.string())
      .optional()
      .describe('Notify specific user IDs (omit for team owners/all per template)'),
    templateParameters: z
      .array(z.object({ name: z.string(), value: z.string() }))
      .optional()
      .describe('Template parameters for the activity type'),
  }),
  execute: async ({
    teamsToken,
    teamId,
    topicText,
    previewText,
    recipientUserIds,
    templateParameters,
  }) => {
    try {
      const result = await graphRequest(
        teamsToken,
        `/teams/${teamId}/sendActivityNotificationToRecipients`,
        {
          method: 'POST',
          body: {
            topic: { source: 'text', value: topicText },
            activityType: 'systemDefault',
            ...(previewText !== undefined ? { previewText: { content: previewText } } : {}),
            ...(recipientUserIds !== undefined
              ? {
                  recipients: recipientUserIds.map((id) => ({
                    '@odata.type': 'microsoft.graph.aadUserNotificationRecipient',
                    userId: id,
                  })),
                }
              : {}),
            ...(templateParameters !== undefined ? { templateParameters } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to send activity notification', result);
      return result.data ?? { sent: true };
    } catch (error) {
      return toTeamsError(error, 'Error sending activity notification');
    }
  },
});
