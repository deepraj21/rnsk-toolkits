// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { discordApi, toDiscordError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const discordGetGateway = tool({
    description:
        'Get the Discord Gateway WebSocket URL (wss) for real-time event connections. Connect to the returned URL separately.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/gateway');
        } catch (error) {
            return toDiscordError(error, 'Failed to get gateway');
        }
    },
});

export const discordListStickerPacks = tool({
    description:
        'List official Discord Nitro sticker packs with their stickers. Use to browse available stickers.',
    inputSchema: z.object({
        discordToken: tokenField,
    }),
    execute: async ({ discordToken }) => {
        try {
            const missing = requireToken(discordToken);
            if (missing) return missing;
            return await discordApi(discordToken, 'GET', '/sticker-packs');
        } catch (error) {
            return toDiscordError(error, 'Failed to list sticker packs');
        }
    },
});
