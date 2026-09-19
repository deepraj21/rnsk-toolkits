// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { slackApi, toSlackError, requireToken } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const slackAddEmoji = tool({
    description:
        'Add a custom emoji from a public image URL (PNG/GIF/JPEG) under a lowercase name. Subject to workspace emoji limits; admin scope required.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe("Emoji name, lowercase, no colons — e.g. 'partyparrot'"),
        url: z.string().describe('Public image URL for the emoji'),
    }),
    execute: async ({ slackToken, name, url }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.emoji.add', { name, url });
        } catch (error) {
            return toSlackError(error, 'Failed to add emoji');
        }
    },
});

export const slackAddEmojiAlias = tool({
    description:
        'Create an alias name pointing at an existing custom emoji (Enterprise Grid). Colons and whitespace are trimmed automatically.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('New alias name'),
        aliasFor: z.string().describe('Canonical name of the existing emoji'),
    }),
    execute: async ({ slackToken, name, aliasFor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.emoji.addAlias', { name, alias_for: aliasFor });
        } catch (error) {
            return toSlackError(error, 'Failed to add emoji alias');
        }
    },
});

export const slackRenameEmoji = tool({
    description:
        'Rename a custom emoji, updating all its instances. The new name must be unique in the workspace.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('Current emoji name (colons optional)'),
        newName: z.string().describe('New unique emoji name'),
    }),
    execute: async ({ slackToken, name, newName }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.emoji.rename', { name, new_name: newName });
        } catch (error) {
            return toSlackError(error, 'Failed to rename emoji');
        }
    },
});

export const slackRemoveEmoji = tool({
    description:
        'Remove a custom emoji across the Enterprise Grid org. Confirm with the user first.',
    inputSchema: z.object({
        slackToken: tokenField,
        name: z.string().describe('Emoji name to remove (colons optional)'),
    }),
    execute: async ({ slackToken, name }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.emoji.remove', { name });
        } catch (error) {
            return toSlackError(error, 'Failed to remove emoji');
        }
    },
});

export const slackListCustomEmojis = tool({
    description:
        'List workspace custom emojis (image URLs or alias: references). Unicode emojis, usage stats, and dates are not included. Optionally include Unicode categories.',
    inputSchema: z.object({
        slackToken: tokenField,
        includeCategories: z.boolean().optional().describe('Include Unicode emoji categories'),
    }),
    execute: async ({ slackToken, includeCategories }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'emoji.list', { include_categories: includeCategories });
        } catch (error) {
            return toSlackError(error, 'Failed to list custom emojis');
        }
    },
});

export const slackListAdminEmoji = tool({
    description:
        'List custom emoji across an Enterprise Grid org (admin token required). For a single workspace use slackListCustomEmojis. Paginate with cursor.',
    inputSchema: z.object({
        slackToken: tokenField,
        limit: z.number().min(1).max(1000).optional().describe('Emojis per page (max 1000)'),
        cursor: z.string().optional().describe('Pagination cursor from a previous response'),
    }),
    execute: async ({ slackToken, limit, cursor }) => {
        try {
            const missing = requireToken(slackToken);
            if (missing) return missing;
            return await slackApi(slackToken, 'admin.emoji.list', { limit, cursor });
        } catch (error) {
            return toSlackError(error, 'Failed to list admin emoji');
        }
    },
});
