// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { discordApi, toDiscordError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const discordGetMyUser = tool({
    description:
        'Get the authenticated user profile (id, username, avatar, locale, premium). Email is included only with the email scope.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/users/@me');
        } catch (error) {
            return toDiscordError(error, 'Failed to get current user');
        }
    },
});

export const discordGetUser = tool({
    description:
        "Get a user by ID. With an OAuth Bearer token only '@me' (the caller) is supported; any user ID needs a bot token. Start with '@me' when unsure.",
    inputSchema: z.object({
        discordToken: tokenField,
        userId: z.string().describe("User ID snowflake, or '@me' for the caller"),
    }),
    execute: async ({ discordToken, userId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/users/${userId}`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get user');
        }
    },
});

export const discordGetOpenIdUserinfo = tool({
    description:
        'Get OIDC-standard claims (sub, email, nickname, picture, locale) for the caller. Needs the openid scope; email needs the email scope, profile fields need identify.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/oauth2/userinfo');
        } catch (error) {
            return toDiscordError(error, 'Failed to get userinfo');
        }
    },
});

export const discordGetMyOAuth2Authorization = tool({
    description:
        'Get the current authorization: application info, granted scopes, token expiry, and user (with identify scope). Use to verify token capabilities before scoped calls.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/oauth2/@me');
        } catch (error) {
            return toDiscordError(error, 'Failed to get OAuth2 authorization');
        }
    },
});

export const discordGetPublicKeys = tool({
    description:
        'Get Discord JWKS public keys for verifying OAuth2/OIDC tokens. No scopes required.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/oauth2/keys');
        } catch (error) {
            return toDiscordError(error, 'Failed to get public keys');
        }
    },
});

export const discordListMyConnections = tool({
    description:
        'List the caller third-party linked accounts (GitHub, Spotify, Twitch, etc.). Needs the connections scope.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const connections = await discordApi(discordToken, 'GET', '/users/@me/connections');
            return { connections };
        } catch (error) {
            return toDiscordError(error, 'Failed to list connections');
        }
    },
});

export const discordGetMyGuildMember = tool({
    description:
        'Get the caller guild member object (roles, nickname, join date, permissions) for one guild. Needs guilds.members.read.',
    inputSchema: z.object({
        discordToken: tokenField,
        guildId: z.string().describe('Guild (server) snowflake ID'),
    }),
    execute: async ({ discordToken, guildId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/users/@me/guilds/${guildId}/member`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get guild member');
        }
    },
});
