// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { notionRequest, toNotionError } from './client.js';

const tokenField = z.string().optional().describe('Token provided by the system; do not provide');

export const notionListUsers = tool({
    description: 'List users in the Notion workspace (bots and members; guests excluded) with pagination.',
    inputSchema: z.object({
        pageSize: z.number().min(1).max(100).optional().describe('Users per page (max 100)'),
        startCursor: z.string().optional().describe('next_cursor from a previous response'),
        notionToken: tokenField,
    }),
    execute: async ({ pageSize, startCursor, notionToken }) => {
        try {
            return await notionRequest(notionToken, '/users', {
                query: { page_size: pageSize, start_cursor: startCursor },
            });
        } catch (error) {
            return toNotionError(error, 'Notion list users failed');
        }
    },
});

export const notionGetAboutUser = tool({
    description: 'Retrieve details (name, type, avatar, person/bot info) for a specific Notion user by ID.',
    inputSchema: z.object({
        userId: z.string().describe('UUID of the user'),
        notionToken: tokenField,
    }),
    execute: async ({ userId, notionToken }) => {
        try {
            return await notionRequest(notionToken, `/users/${userId}`);
        } catch (error) {
            return toNotionError(error, 'Notion get about user failed');
        }
    },
});

export const notionWhoAmI = tool({
    description: 'Return the identity of the connected integration (bot user, workspace owner). Takes no parameters.',
    inputSchema: z.object({
        notionToken: tokenField,
    }),
    execute: async ({ notionToken }) => {
        try {
            return await notionRequest(notionToken, '/users/me');
        } catch (error) {
            return toNotionError(error, 'Notion who am I failed');
        }
    },
});
