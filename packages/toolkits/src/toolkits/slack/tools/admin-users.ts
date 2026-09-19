// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackAddEnterpriseUserToWorkspace = tool({
    description:
        'Add an existing Enterprise Grid user to a workspace, with optional channels and guest restrictions. Enterprise Grid only.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID to add the user to'),
        userId: z.string().describe('Enterprise user ID to add'),
        channelIds: z.string().optional().describe('Comma-separated channel IDs for the user to join'),
        isRestricted: z.boolean().optional().describe('Add as a multi-channel guest'),
        isUltraRestricted: z.boolean().optional().describe('Add as a single-channel guest'),
    }),
    execute: async ({ slackToken, teamId, userId, channelIds, isRestricted, isUltraRestricted }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.assign', {
                team_id: teamId,
                user_id: userId,
                channel_ids: channelIds,
                is_restricted: isRestricted,
                is_ultra_restricted: isUltraRestricted,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to add user to workspace');
        }
    },
});

export const slackInviteUserToWorkspace = tool({
    description:
        'Invite a person to a workspace by email with channels, a welcome message, and guest options (Enterprise Grid admin). Use resend=true to re-process a pending invite.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID to invite to'),
        email: z.string().describe('Email address of the invitee'),
        channelIds: z.string().describe('Comma-separated channel IDs (IDs only, names fail)'),
        realName: z.string().optional().describe('Full name of the invitee'),
        customMessage: z.string().optional().describe('Welcome note in the invite email'),
        resend: z.boolean().optional().describe('Resend a pending invite'),
        isRestricted: z.boolean().optional().describe('Invite as a multi-channel guest'),
        isUltraRestricted: z.boolean().optional().describe('Invite as a single-channel guest'),
        guestExpirationTs: z.string().optional().describe("Guest expiry as 'XXXXXXXXXX.XXXXXX'"),
        emailPasswordPolicyEnabled: z.boolean().optional().describe('Allow email+password sign-in (Enterprise Grid)'),
    }),
    execute: async ({ slackToken, teamId, email, channelIds, realName, customMessage, resend, isRestricted, isUltraRestricted, guestExpirationTs, emailPasswordPolicyEnabled }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.invite', {
                team_id: teamId,
                email,
                channel_ids: channelIds,
                real_name: realName,
                custom_message: customMessage,
                resend,
                is_restricted: isRestricted,
                is_ultra_restricted: isUltraRestricted,
                guest_expiration_ts: guestExpirationTs,
                email_password_policy_enabled: emailPasswordPolicyEnabled,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to invite user to workspace');
        }
    },
});

export const slackRemoveUserFromWorkspace = tool({
    description:
        'Remove a user from a workspace, revoking access. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID to remove the user from'),
        userId: z.string().describe('User ID to remove'),
    }),
    execute: async ({ slackToken, teamId, userId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.remove', { team_id: teamId, user_id: userId });
        } catch (error) {
            return toSlackError(error, 'Failed to remove user from workspace');
        }
    },
});

export const slackSetAdminUser = tool({
    description:
        'Promote an existing workspace member (guest, user, or owner) to admin. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        userId: z.string().describe('Member ID to promote'),
    }),
    execute: async ({ slackToken, teamId, userId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.setAdmin', { team_id: teamId, user_id: userId });
        } catch (error) {
            return toSlackError(error, 'Failed to set admin user');
        }
    },
});

export const slackSetWorkspaceOwner = tool({
    description:
        'Promote a member, guest, or admin to workspace owner. Enterprise Grid only. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().describe('Workspace ID'),
        userId: z.string().describe('Member ID to promote'),
    }),
    execute: async ({ slackToken, teamId, userId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.setOwner', { team_id: teamId, user_id: userId });
        } catch (error) {
            return toSlackError(error, 'Failed to set workspace owner');
        }
    },
});

export const slackResetUserSessions = tool({
    description:
        'Wipe all sessions on all devices for a user, forcing re-authentication. Use for security concerns. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        userId: z.string().describe('User ID to wipe sessions for'),
        webOnly: z.boolean().optional().describe('Expire web sessions only'),
        mobileOnly: z.boolean().optional().describe('Expire mobile sessions only'),
    }),
    execute: async ({ slackToken, userId, webOnly, mobileOnly }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.session.reset', {
                user_id: userId,
                web_only: webOnly,
                mobile_only: mobileOnly,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to reset user sessions');
        }
    },
});

export const slackListWorkspaceUsers = tool({
    description:
        'List admin users of a workspace (admin.users.list), paginated. Omit teamId with org-level tokens for org-wide results.',
    inputSchema: z.object({
        slackToken: tokenField,
        teamId: z.string().optional().describe('Workspace ID to list users for'),
        limit: z.number().min(1).optional().describe('Users per page (default 100)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
        isActive: z.boolean().optional().describe('True for active users, false for deactivated'),
        onlyGuests: z.boolean().optional().describe('Return guest accounts with expirations only'),
        includeDeactivatedUserWorkspaces: z.boolean().optional().describe('Include deactivated workspaces (org-level tokens)'),
    }),
    execute: async ({ slackToken, teamId, isActive, onlyGuests, includeDeactivatedUserWorkspaces, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.users.list', {
                ...rest,
                team_id: teamId,
                is_active: isActive,
                only_guests: onlyGuests,
                include_deactivated_user_workspaces: includeDeactivatedUserWorkspaces,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list workspace users');
        }
    },
});
