// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { chatIdField, parseModeField, replyMarkupField, telegramBotTokenField, telegramCall } from './client.js';

const silentField = z.boolean().optional().describe('Silent send (no sound)');
const replyToField = z.number().int().optional().describe('Reply to this message ID');

export const sendMessage = tool({
    description:
        'Sends a text message (1-4096 chars; split longer text). Bot must be a member with post rights; cannot DM users who never messaged first. ~1 msg/sec per chat, ~30/sec globally — honor 429 retry_after.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        text: z.string().min(1).max(4096).describe('Message text, 1-4096 chars after parsing'),
        parseMode: parseModeField,
        replyMarkup: replyMarkupField,
        replyToMessageId: replyToField,
        disableNotification: silentField,
        disableWebPagePreview: z.boolean().optional().describe('Disable link previews'),
    }),
    execute: async ({ telegramBotToken, chatId, ...rest }) =>
        telegramCall(telegramBotToken, 'sendMessage', { chat_id: chatId, ...rest }, 'send message'),
});

export const forwardMessage = tool({
    description: "Forwards any message kind to another chat. Service messages can't be forwarded.",
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField.describe('Target chat'),
        fromChatId: z.union([z.number(), z.string()]).describe('Source chat (ID or @channelusername)'),
        messageId: z.number().int().describe('Message ID in the source chat'),
        disableNotification: silentField,
    }),
    execute: async ({ telegramBotToken, chatId, fromChatId, messageId, disableNotification }) =>
        telegramCall(telegramBotToken, 'forwardMessage', { chat_id: chatId, from_chat_id: fromChatId, message_id: messageId, disable_notification: disableNotification }, 'forward message'),
});

export const editMessage = tool({
    description:
        'Edits a bot-authored text message (1-4096 chars). Provide chat_id + message_id, or inline_message_id for inline messages.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        text: z.string().min(1).max(4096).describe('New message text'),
        chatId: chatIdField.optional().describe('Required unless inline_message_id is given'),
        messageId: z.number().int().optional().describe('Required unless inline_message_id is given'),
        inlineMessageId: z.string().optional().describe('Inline message ID (alternative to chat+message IDs)'),
        parseMode: parseModeField,
        replyMarkup: replyMarkupField,
        disableWebPagePreview: z.boolean().optional(),
    }),
    execute: async ({ telegramBotToken, chatId, messageId, inlineMessageId, ...rest }) => {
        if (!inlineMessageId && (chatId === undefined || messageId === undefined)) {
            return { error: 'Provide chatId + messageId, or inlineMessageId' };
        }
        return telegramCall(telegramBotToken, 'editMessageText', { chat_id: chatId, message_id: messageId, inline_message_id: inlineMessageId, ...rest }, 'edit message');
    },
});

export const deleteMessage = tool({
    description:
        "Deletes a message (bot must have delete rights; groups: only bot-authored, <48h). Linked channel/discussion pairs need separate calls per chat. Honor 429 retry_after.",
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        messageId: z.number().int().describe('Message ID to delete'),
    }),
    execute: async ({ telegramBotToken, chatId, messageId }) =>
        telegramCall(telegramBotToken, 'deleteMessage', { chat_id: chatId, message_id: messageId }, 'delete message'),
});

export const sendPhoto = tool({
    description:
        'Sends a photo by file_id (preferred) or public HTTPS URL (Telegram-compressed; use sendDocument to preserve quality). No album support — one post per call.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        photo: z.string().describe('file_id or public HTTPS URL (no auth/signed links, no base64)'),
        caption: z.string().max(1024).optional().describe('Caption, 0-1024 chars'),
        parseMode: parseModeField.describe('Caption parse mode'),
        replyMarkup: replyMarkupField,
        replyToMessageId: replyToField,
        disableNotification: silentField,
    }),
    execute: async ({ telegramBotToken, chatId, ...rest }) =>
        telegramCall(telegramBotToken, 'sendPhoto', { chat_id: chatId, ...rest }, 'send photo'),
});

export const sendDocument = tool({
    description:
        'Sends a file by file_id (preferred) or public URL. Preserves original format/resolution unlike sendPhoto. ~1 msg/sec per chat; honor 429 retry_after.',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        document: z.string().describe('file_id or HTTP URL for Telegram to fetch'),
        caption: z.string().max(1024).optional().describe('Caption, 0-1024 chars'),
        parseMode: parseModeField.describe('Caption parse mode'),
        thumbnail: z.string().optional().describe('Thumbnail file_id/URL (skipped if server-side generation works)'),
        replyMarkup: replyMarkupField,
        replyToMessageId: replyToField,
        disableNotification: silentField,
        disableContentTypeDetection: z.boolean().optional().describe('Disable server-side content-type detection'),
    }),
    execute: async ({ telegramBotToken, chatId, ...rest }) =>
        telegramCall(telegramBotToken, 'sendDocument', { chat_id: chatId, ...rest }, 'send document'),
});

export const sendLocation = tool({
    description: 'Sends a map point (static or live location with update period and proximity alerts).',
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        livePeriod: z.number().int().min(60).max(86400).optional().describe('Live-update seconds (60-86400)'),
        heading: z.number().int().min(1).max(360).optional().describe('Live-location movement direction degrees'),
        horizontalAccuracy: z.number().min(0).max(1500).optional().describe('Uncertainty radius meters (0-1500)'),
        proximityAlertRadius: z.number().int().min(1).max(100000).optional().describe('Live-location proximity alert meters'),
        replyMarkup: replyMarkupField,
        replyToMessageId: replyToField,
        disableNotification: silentField,
    }),
    execute: async ({ telegramBotToken, chatId, livePeriod, proximityAlertRadius, horizontalAccuracy, ...rest }) =>
        telegramCall(telegramBotToken, 'sendLocation', { chat_id: chatId, live_period: livePeriod, proximity_alert_radius: proximityAlertRadius, horizontal_accuracy: horizontalAccuracy, ...rest }, 'send location'),
});

export const sendPoll = tool({
    description: "Sends a native poll (regular or quiz). 2-10 options of 1-100 chars; question 1-300 chars. Quiz mode needs correct_option_id. open_period and close_date are mutually exclusive.",
    inputSchema: z.object({
        telegramBotToken: telegramBotTokenField,
        chatId: chatIdField,
        question: z.string().min(1).max(300).describe('Poll question'),
        options: z.array(z.string().min(1).max(100)).min(2).max(10).describe('2-10 answer options'),
        type: z.enum(['regular', 'quiz']).optional().describe("Poll type (default 'regular')"),
        isAnonymous: z.boolean().optional().describe('Anonymous voting (default true)'),
        allowsMultipleAnswers: z.boolean().optional().describe('Multi-select (regular polls only)'),
        correctOptionId: z.number().int().min(0).optional().describe('0-based correct option (quiz mode required)'),
        explanation: z.string().max(200).optional().describe('Quiz explanation shown on wrong answers (max 2 line feeds)'),
        explanationParseMode: z.enum(['Markdown', 'MarkdownV2', 'HTML']).optional(),
        openPeriod: z.number().int().min(5).max(600).optional().describe('Auto-close seconds after creation (5-600)'),
        closeDate: z.number().int().optional().describe('Auto-close Unix timestamp (5-600s in future)'),
        isClosed: z.boolean().optional().describe('Close immediately (preview)'),
        replyMarkup: replyMarkupField,
        replyToMessageId: replyToField,
        disableNotification: silentField,
    }),
    execute: async ({ telegramBotToken, chatId, isAnonymous, allowsMultipleAnswers, correctOptionId, explanationParseMode, openPeriod, closeDate, isClosed, ...rest }) => {
        if (openPeriod !== undefined && closeDate !== undefined) {
            return { error: 'openPeriod and closeDate are mutually exclusive' };
        }
        return telegramCall(telegramBotToken, 'sendPoll', { chat_id: chatId, is_anonymous: isAnonymous, allows_multiple_answers: allowsMultipleAnswers, correct_option_id: correctOptionId, explanation_parse_mode: explanationParseMode, open_period: openPeriod, close_date: closeDate, is_closed: isClosed, ...rest }, 'send poll');
    },
});
