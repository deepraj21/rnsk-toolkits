// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { chatIdField, telegramBotTokenField, telegramCall } from './client.js';

export const getUpdates = tool({
    description:
        'Long-polls incoming updates (messages, edits, callbacks). Mutually exclusive with webhooks — 409 means delete the webhook first. Empty result is valid (no new updates). Poll ~1/sec; honor 429 retry_after.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        offset: z.number().int().optional().describe('First update ID (last seen + 1) to avoid duplicates'),
        limit: z.number().int().min(1).max(100).optional().describe('Max updates (1-100, default 100)'),
        timeout: z.number().int().min(0).optional().describe('Long-poll seconds (0 = short poll)'),
        allowedUpdates: z.array(z.string()).optional().describe("Types to receive, e.g. ['message','callback_query'] (empty = all except chat_member)"),
    }),
    execute: async ({ telegramBotToken, ...rest }) =>
        telegramCall(telegramBotToken, 'getUpdates', rest, 'get updates'),
});

function updateChatId(update: any): string | number | undefined {
    const msg = update?.message ?? update?.edited_message ?? update?.channel_post ?? update?.edited_channel_post ?? update?.callback_query?.message;
    return msg?.chat?.id;
}

export const getChatHistory = tool({
    description:
        'Reads recent chat messages via the getUpdates queue filtered to one chat. Only unacknowledged updates from the last ~24h are visible (nothing before the bot joined); empty result means no accessible messages, not failure. No webhook may be active (409 otherwise).',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        limit: z.number().int().min(1).max(100).optional().describe('Max messages (1-100, default 100)'),
        offset: z.number().int().optional().describe('Skip this many filtered messages (pagination)'),
        messageId: z.number().int().optional().describe('Start from this message ID in the chat'),
    }),
    execute: async ({ telegramBotToken, chatId, limit, offset, messageId }) => {
        const fetched = await telegramCall(telegramBotToken, 'getUpdates', { limit: 100 }, 'get updates');
        if ((fetched as any)?.error) return fetched;
        const updates = ((fetched as any)?.result ?? []).filter((u: any) => String(updateChatId(u)) === String(chatId));
        const messages = updates
            .map((u: any) => u.message ?? u.edited_message ?? u.channel_post ?? u.edited_channel_post ?? u.callback_query?.message)
            .filter((m: any) => m && (messageId === undefined || m.message_id >= messageId));
        const start = offset && offset > 0 ? offset : 0;
        const sliced = messages.slice(start, start + (limit ?? 100));
        return { ok: true, result: sliced };
    },
});

export const answerCallbackQuery = tool({
    description:
        'Answers an inline-keyboard callback query (notification toast or alert popup). Answer promptly — IDs expire quickly and delays leave stuck spinners.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        callbackQueryId: z.string().describe('Callback query ID from the update'),
        text: z.string().max(200).optional().describe('Notification text, 0-200 chars (omit for silent ack)'),
        showAlert: z.boolean().optional().describe('Alert dialog instead of top toast (default false)'),
        url: z.string().optional().describe('Game URL (callback_game buttons from @BotFather games only)'),
        cacheTime: z.number().int().min(0).optional().describe('Client-side cache seconds (default 0)'),
    }),
    execute: async ({ telegramBotToken, callbackQueryId, showAlert, cacheTime, ...rest }) =>
        telegramCall(telegramBotToken, 'answerCallbackQuery', { callback_query_id: callbackQueryId, show_alert: showAlert, cache_time: cacheTime, ...rest }, 'answer callback query'),
});
