// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { telegramBotTokenField, telegramCall } from './client.js';

export const getMe = tool({
    description:
        'Returns bot identity (id, username, capabilities) and validates the token — ok=false means invalid/revoked token, fix before other calls. Name/bio are BotFather-only.',
    inputSchema: z.object({ telegramBotToken: telegramBotTokenField }),
    execute: async ({ telegramBotToken }) =>
        telegramCall(telegramBotToken, 'getMe', undefined, 'get bot info'),
});

export const setMyCommands = tool({
    description:
        "Replaces the bot command menu (max 100; names 1-32 lowercase/digits/underscores, descriptions 1-256 chars). Scoped commands override globals for matching users; omit scope for the global list.",
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        commands: z.array(z.object({
            command: z.string().min(1).max(32).describe("Name, e.g. 'start' (lowercase, digits, underscores)"),
            description: z.string().min(1).max(256).describe("Description, e.g. 'Start the bot'"),
        })).max(100).describe('Command list (max 100)'),
        scope: z.union([z.string(), z.record(z.any())]).optional().describe('JSON scope object (default: all users); serialized automatically'),
        languageCode: z.string().optional().describe("ISO 639-1 code, e.g. 'en' (omit for all languages)"),
    }),
    execute: async ({ telegramBotToken, languageCode, ...rest }) =>
        telegramCall(telegramBotToken, 'setMyCommands', { language_code: languageCode, ...rest }, 'set bot commands'),
});
