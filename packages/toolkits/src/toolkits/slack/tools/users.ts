// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackListUsers = tool({
    description:
        'List workspace users with profiles, paginated. Filter is_bot/is_app_user/deleted client-side for human-only rosters. Prefer slackFindUsers for targeted lookups; cache results. Throttle to ~1-2 req/sec.',
    inputSchema: z.object({
        slackToken: tokenField,
        limit: z.number().min(1).optional().describe('Users per page (set ~100 for large workspaces)'),
        cursor: z.string().optional().describe('Pagination cursor; loop until next_cursor is empty'),
        includeLocale: z.boolean().optional().describe('Include each user locale'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, includeLocale, teamId, ...rest }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.list', {
                ...rest,
                include_locale: includeLocale,
                team_id: teamId,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to list users');
        }
    },
});

export const slackFindUsers = tool({
    description:
        'Find users by email, user ID, or name. Exact emails use the dedicated lookup; user IDs use users.info; other queries filter users.list. Verify a single user ID before passing to messaging tools.',
    inputSchema: z.object({
        slackToken: tokenField,
        searchQuery: z.string().optional().describe('User ID, email, or name to search for'),
        email: z.string().optional().describe('Email address (most efficient for exact lookup)'),
        limit: z.number().min(1).max(1000).optional().default(50).describe('Max users to return'),
        exactMatch: z.boolean().optional().describe('Only exact matches on name/email fields'),
        includeBots: z.boolean().optional().describe('Include bot accounts'),
        includeDeleted: z.boolean().optional().describe('Include deactivated users'),
        includeRestricted: z.boolean().optional().default(true).describe('Include guest accounts'),
        includeLocale: z.boolean().optional().describe('Include each user locale'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, searchQuery, email, limit = 50, exactMatch, includeBots, includeDeleted, includeRestricted = true, includeLocale, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const query = email ?? searchQuery;
            if (!query) {
                return { error: 'Provide searchQuery or email.' };
            }
            if (/^.+@.+\..+$/.test(query) && (exactMatch || email)) {
                return await slackApi(slackToken, 'users.lookupByEmail', { email: query });
            }
            if (/^[UW][A-Z0-9]+$/.test(query)) {
                return await slackApi(slackToken, 'users.info', {
                    user: query,
                    include_locale: includeLocale,
                });
            }
            const data = await slackApi(slackToken, 'users.list', {
                limit: Math.min(1000, Math.max(limit, 50)),
                include_locale: includeLocale,
                team_id: teamId,
            });
            const q = query.toLowerCase();
            const members = (data?.members ?? []).filter((u) => {
                if (!includeBots && (u.is_bot || u.is_app_user)) return false;
                if (!includeDeleted && u.deleted) return false;
                if (!includeRestricted && (u.is_restricted || u.is_ultra_restricted)) return false;
                const haystacks = [
                    u.name, u.real_name, u.profile?.display_name, u.profile?.real_name,
                    u.profile?.first_name, u.profile?.last_name, u.profile?.email, u.profile?.status_text,
                ].filter(Boolean).map((v) => String(v).toLowerCase());
                return exactMatch
                    ? haystacks.some((v) => v === q)
                    : haystacks.some((v) => v.includes(q));
            });
            return { ok: true, members: members.slice(0, limit) };
        } catch (error) {
            return toSlackError(error, 'Failed to find users');
        }
    },
});

export const slackFindUserByEmail = tool({
    description:
        'Look up an active user by registered email address (requires users:read.email). Fails with users_not_found for unknown, inactive, guest, or privacy-hidden emails.',
    inputSchema: z.object({
        slackToken: tokenField,
        email: z.string().describe('Email address of the user to look up'),
    }),
    execute: async ({ slackToken, email }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.lookupByEmail', { email });
        } catch (error) {
            return toSlackError(error, 'Failed to find user by email');
        }
    },
});

export const slackGetUserInfo = tool({
    description:
        'Get comprehensive info for a user ID (profile, status, team flags). Pass IDs only — emails and names return user_not_found. Sensitive fields may be omitted by privacy settings.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().describe('User ID (U- or W-prefixed)'),
        includeLocale: z.boolean().optional().describe('Include user locale'),
    }),
    execute: async ({ slackToken, user, includeLocale }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.info', { user, include_locale: includeLocale });
        } catch (error) {
            return toSlackError(error, 'Failed to get user info');
        }
    },
});

export const slackGetUserProfile = tool({
    description:
        'Get profile fields for a user (defaults to the caller when omitted). Email/phone may be omitted without users:read.email or by workspace privacy.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID; omit for the authenticated user'),
        includeLabels: z.boolean().optional().describe('Include human-readable custom field labels'),
    }),
    execute: async ({ slackToken, user, includeLabels }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.profile.get', {
                user,
                include_labels: includeLabels,
            });
        } catch (error) {
            return toSlackError(error, 'Failed to get user profile');
        }
    },
});

export const slackSetUserProfile = tool({
    description:
        'Update a user profile: a single field via name+value, or many via a profile JSON string (takes precedence). Defaults to the caller; admins on paid teams may target others.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID to update; omit for self'),
        name: z.string().optional().describe('Single field name, e.g. status_text (use with value)'),
        value: z.string().optional().describe('Value for the single field'),
        profile: z.string().optional().describe('JSON string of field updates, e.g. {"status_text":"Exploring"}'),
    }),
    execute: async ({ slackToken, user, name, value, profile }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            if (!profile && !(name && value !== undefined)) {
                return { error: 'Provide profile JSON, or both name and value.' };
            }
            return await slackApi(slackToken, 'users.profile.set', { user, name, value, profile });
        } catch (error) {
            return toSlackError(error, 'Failed to set user profile');
        }
    },
});

export const slackGetUserPresence = tool({
    description:
        "Get a user's real-time presence (active/away). Omit user for self. No history or status reasons.",
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID; omit for the authenticated user'),
    }),
    execute: async ({ slackToken, user }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.getPresence', { user });
        } catch (error) {
            return toSlackError(error, 'Failed to get user presence');
        }
    },
});

export const slackSetUserPresence = tool({
    description:
        "Manually set presence to 'auto' (Slack-managed) or 'away'. Persists across connections but user activity or auto-away can override it.",
    inputSchema: z.object({
        slackToken: tokenField,
        presence: z.enum(['auto', 'away']).describe('Presence state to set'),
    }),
    execute: async ({ slackToken, presence }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.setPresence', { presence });
        } catch (error) {
            return toSlackError(error, 'Failed to set user presence');
        }
    },
});

export const slackEndDnd = tool({
    description:
        'End the caller DND session, making them available. Safe no-op when DND is not active.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'dnd.endDnd', {});
        } catch (error) {
            return toSlackError(error, 'Failed to end DND');
        }
    },
});

export const slackEndSnooze = tool({
    description: 'End the caller snooze immediately, exiting do-not-disturb mode.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'dnd.endSnooze', {});
        } catch (error) {
            return toSlackError(error, 'Failed to end snooze');
        }
    },
});

export const slackSetDndDuration = tool({
    description: 'Turn on DND (snooze) for the caller for a number of minutes from now.',
    inputSchema: z.object({
        slackToken: tokenField,
        numMinutes: z.string().describe('Minutes from now to snooze, e.g. "60"'),
    }),
    execute: async ({ slackToken, numMinutes }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'dnd.setSnooze', { num_minutes: numMinutes });
        } catch (error) {
            return toSlackError(error, 'Failed to set DND duration');
        }
    },
});

export const slackGetDndStatus = tool({
    description:
        'Get DND status for the caller or one user. Check before interacting to respect availability.',
    inputSchema: z.object({
        slackToken: tokenField,
        user: z.string().optional().describe('User ID; omit for the authenticated user'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, user, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'dnd.info', { user, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to get DND status');
        }
    },
});

export const slackGetTeamDndStatus = tool({
    description: 'Get DND status for multiple users at once via comma-separated IDs.',
    inputSchema: z.object({
        slackToken: tokenField,
        users: z.string().describe("Comma-separated user IDs, e.g. 'U123,U456'"),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, users, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'dnd.teamInfo', { users, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to get team DND status');
        }
    },
});

export const slackDeleteUserPhoto = tool({
    description:
        'Delete the caller profile photo, reverting to the default avatar. Irreversible; succeeds even with no custom photo.',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.deletePhoto', {});
        } catch (error) {
            return toSlackError(error, 'Failed to delete profile photo');
        }
    },
});

export const slackSetUserPhoto = tool({
    description:
        'Set the caller profile photo from a publicly reachable image URL (GIF/PNG/JPG). The image is fetched and uploaded with optional square cropping.',
    inputSchema: z.object({
        slackToken: tokenField,
        imageUrl: z.string().describe('Public URL of the image to use as the profile photo'),
        cropX: z.number().min(0).optional().describe('X of the top-left crop corner, in pixels'),
        cropY: z.number().min(0).optional().describe('Y of the top-left crop corner, in pixels'),
        cropW: z.number().min(1).optional().describe('Width/height of the square crop box, in pixels'),
    }),
    execute: async ({ slackToken, imageUrl, cropX, cropY, cropW }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            const imageRes = await fetch(imageUrl);
            if (!imageRes.ok) {
                return { error: 'Failed to fetch profile image', details: { status: imageRes.status } };
            }
            const bytes = await imageRes.arrayBuffer();
            const form = new FormData();
            form.append('image', new Blob([bytes]), 'photo.jpg');
            if (cropX !== undefined) form.append('crop_x', String(cropX));
            if (cropY !== undefined) form.append('crop_y', String(cropY));
            if (cropW !== undefined) form.append('crop_w', String(cropW));
            const response = await fetch('https://slack.com/api/users.setPhoto', {
                method: 'POST',
                headers: { Authorization: `Bearer ${slackToken}` },
                body: form,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || data?.ok === false) {
                return { error: 'Failed to set profile photo', details: data };
            }
            return data;
        } catch (error) {
            return toSlackError(error, 'Failed to set profile photo');
        }
    },
});

export const slackGetUserIdentity = tool({
    description:
        'Get the caller identity (user + team). Returned fields depend on granted identity scopes (basic, email, avatar, team).',
    inputSchema: z.object({
        slackToken: tokenField,
    }),
    execute: async ({ slackToken }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'users.identity', {});
        } catch (error) {
            return toSlackError(error, 'Failed to get user identity');
        }
    },
});

export const slackGetBotInfo = tool({
    description:
        'Get info for a bot user by bot ID (B-prefixed). Does not work for regular users or other integration types.',
    inputSchema: z.object({
        slackToken: tokenField,
        bot: z.string().optional().describe('Bot ID, e.g. B0123456789'),
        teamId: z.string().optional().describe('Workspace ID (org-level tokens only)'),
    }),
    execute: async ({ slackToken, bot, teamId }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'bots.info', { bot, team_id: teamId });
        } catch (error) {
            return toSlackError(error, 'Failed to get bot info');
        }
    },
});
