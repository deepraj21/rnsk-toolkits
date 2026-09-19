// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { discordApi, toDiscordError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const discordListMyGuilds = tool({
    description:
        'List guilds the caller is in (partial objects with permissions and features). Use for server lists or membership checks. Needs the guilds scope.',
    inputSchema: z.object({
        discordToken: tokenField,
        limit: z.number().min(1).max(200).optional().describe('Max guilds (1-200, default 200)'),
        before: z.string().optional().describe('Guilds before this guild ID'),
        after: z.string().optional().describe('Guilds after this guild ID'),
        withCounts: z.boolean().optional().describe('Include approximate member/presence counts'),
    }),
    execute: async ({ discordToken, withCounts, ...rest }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const guilds = await discordApi(discordToken, 'GET', '/users/@me/guilds', {
                query: { ...rest, with_counts: withCounts },
            });
            return { guilds };
        } catch (error) {
            return toDiscordError(error, 'Failed to list guilds');
        }
    },
});

export const discordGetGuildTemplate = tool({
    description:
        'Get a guild template by code, including the serialized source guild (channels, roles). Use for server-creation blueprints.',
    inputSchema: z.object({
        discordToken: tokenField,
        code: z.string().describe('Template code, e.g. asFz8FjydMJa'),
    }),
    execute: async ({ discordToken, code }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/guilds/templates/${code}`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get guild template');
        }
    },
});

export const discordGetGuildWidget = tool({
    description:
        'Get the public guild widget JSON (online members, voice channels, invite). The widget must be enabled in server settings.',
    inputSchema: z.object({
        discordToken: tokenField,
        guildId: z.string().describe('Guild snowflake ID'),
    }),
    execute: async ({ discordToken, guildId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', `/guilds/${guildId}/widget.json`);
        } catch (error) {
            return toDiscordError(error, 'Failed to get guild widget');
        }
    },
});

export const discordGetGuildWidgetPng = tool({
    description:
        'Get a guild widget banner image URL (shield or banner1-4 style) for embedding on external sites. The widget must be enabled in server settings. Returns the public image URL (no auth needed to view).',
    inputSchema: z.object({
        discordToken: tokenField,
        guildId: z.string().describe('Guild snowflake ID'),
        style: z.enum(['shield', 'banner1', 'banner2', 'banner3', 'banner4']).optional().describe('Widget visual style'),
    }),
    execute: async ({ discordToken, guildId, style }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const url = `https://discord.com/api/v10/guilds/${guildId}/widget.png${style ? `?style=${style}` : ''}`;
            const response = await fetch(url);
            if (!response.ok) {
                return { error: 'Failed to get guild widget image', details: { status: response.status } };
            }
            return {
                name: `widget-${guildId}.png`,
                mimetype: response.headers.get('content-type') ?? 'image/png',
                url,
                style: style ?? 'shield',
            };
        } catch (error) {
            return toDiscordError(error, 'Failed to get guild widget image');
        }
    },
});

export const discordResolveInvite = tool({
    description:
        'Resolve an invite code (bare code, vanity URL, or full discord.gg URL) to guild/channel/event details. Null or partial responses mean expired, revoked, or inaccessible invites — do not infer membership from them.',
    inputSchema: z.object({
        discordToken: tokenField,
        code: z.string().describe('Invite code or URL, e.g. discord-api or https://discord.gg/abc123xyz'),
        withCounts: z.boolean().optional().describe('Include approximate member/presence counts'),
        withExpiration: z.boolean().optional().describe('Include expires_at (usually returned anyway)'),
        guildScheduledEventId: z.string().optional().describe('Include this scheduled event in the response'),
    }),
    execute: async ({ discordToken, code, withCounts, withExpiration, guildScheduledEventId }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            const clean = code.split('?')[0].split('/').filter(Boolean).pop() ?? code;
            return await discordApi(discordToken, 'GET', `/invites/${clean}`, {
                query: {
                    with_counts: withCounts,
                    with_expiration: withExpiration,
                    guild_scheduled_event_id: guildScheduledEventId,
                },
            });
        } catch (error) {
            return toDiscordError(error, 'Failed to resolve invite');
        }
    },
});
