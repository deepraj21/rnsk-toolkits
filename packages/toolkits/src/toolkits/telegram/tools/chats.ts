// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { chatIdField, telegramBotTokenField, telegramCall } from './client.js';

export const getChat = tool({
    description:
        "Reads current chat info (name, username, type, permissions). Bot must be a member; fails if never added/removed/blocked. Use getUpdates to discover reliable chat IDs.",
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField.describe("Chat ID (groups/channels are negative) or '@username' (plain names/URLs won't resolve)"),
    }),
    execute: async ({ telegramBotToken, chatId }) =>
        telegramCall(telegramBotToken, 'getChat', { chat_id: chatId }, 'get chat'),
});

export const getChatAdministrators = tool({
    description:
        'Lists chat admins (except other bots) with privilege flags. Meaningful for supergroups/channels. Includes the bot itself when admin — use to verify rights before moderation.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
    }),
    execute: async ({ telegramBotToken, chatId }) =>
        telegramCall(telegramBotToken, 'getChatAdministrators', { chat_id: chatId }, 'get chat administrators'),
});

export const getChatMember = tool({
    description:
        'Reads one member status/role (creator/administrator/member/restricted/left/kicked). Query the bot itself to preflight membership and troubleshoot 403s.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        userId: z.number().int().describe('Target user ID'),
    }),
    execute: async ({ telegramBotToken, chatId, userId }) =>
        telegramCall(telegramBotToken, 'getChatMember', { chat_id: chatId, user_id: userId }, 'get chat member'),
});

export const getChatMembersCount = tool({
    description: 'Returns the member count. Bot must be an admin — permission failures surface as auth errors, not zero.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField.describe("Chat ID or '@username' (must start with '@')"),
    }),
    execute: async ({ telegramBotToken, chatId }) =>
        telegramCall(telegramBotToken, 'getChatMemberCount', { chat_id: chatId }, 'get chat members count'),
});

export const createChatInviteLink = tool({
    description:
        'Generates a new primary invite link (revokes the previous primary link). Bot must be admin with invite rights.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField.describe('Target chat or @supergroup/@channel username'),
    }),
    execute: async ({ telegramBotToken, chatId }) =>
        telegramCall(telegramBotToken, 'exportChatInviteLink', { chat_id: chatId }, 'export chat invite link'),
});
