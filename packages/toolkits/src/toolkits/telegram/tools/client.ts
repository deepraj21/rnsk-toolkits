// @ts-nocheck
import { z } from 'zod';

export const TELEGRAM_API_BASE = 'https://api.telegram.org';

export const telegramBotTokenField = z
    .string()
    .optional()
    .describe('Telegram bot token from @BotFather (format 123456:ABC-DEF...). Injected at runtime.');

export function missingToken() {
    return { error: 'Telegram bot token is required. Connect Telegram first.' };
}

export const chatIdField = z.union([z.number(), z.string()]).describe("Chat ID (numeric, negative for groups/channels) or @username, e.g. 123456789 or '@mychannel'");

export const parseModeField = z.enum(['Markdown', 'MarkdownV2', 'HTML']).optional().describe("Entity parse mode ('MarkdownV2'/'HTML' preferred; omit for plain text)");

export const replyMarkupField = z.union([z.string(), z.record(z.any())]).optional().describe('Inline keyboard as JSON string or object (will be serialized)');

function normalizeParams(params: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined) continue;
        if ((k === 'reply_markup' || k === 'scope') && typeof v === 'object') out[k] = JSON.stringify(v);
        else out[k] = v;
    }
    return out;
}

/** Call a Bot API method. Token goes in the URL path: POST /bot<token>/<method>. */
export async function telegramCall(botToken: string | undefined, method: string, params?: Record<string, unknown>, action = 'call Telegram Bot API') {
    if (!botToken) return missingToken();
    try {
        const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/${method}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(normalizeParams(params ?? {})),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || (data as any)?.ok === false) {
            return { error: `Failed to ${action}`, details: data };
        }
        return data;
    } catch (error) {
        return { error: `Error while trying to ${action}`, message: error instanceof Error ? error.message : 'Unknown error' };
    }
}
