import { tool } from 'ai';
import { z } from 'zod';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const userField = z.string().optional().default('me').describe("User's email address or 'me' for the authenticated user");

async function gmailFetch(token: string | undefined, path: string, init?: RequestInit, label: string = 'Gmail request') {
    try {
        const response = await fetch(`https://gmail.googleapis.com/gmail/v1${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(init?.headers || {}),
            },
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            return { error: `Failed to ${label}`, details: error };
        }
        if (response.status === 204) return { success: true };
        return await response.json();
    } catch (error) {
        return {
            error: `Error in ${label}`,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

export const getLabel = tool({
    description: 'Get label details (name, type, visibility, message/thread counts, color) by label ID.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        id: z.string().describe("Label ID: system (INBOX, SENT, ...) or custom ('Label_1')"),
    }),
    execute: async ({ gmailToken, userId, id }) =>
        gmailFetch(gmailToken, `/users/${userId}/labels/${id}`, undefined, 'get label'),
});

const colorSchema = z.object({
    textColor: z.string().describe('Hex from Gmail palette, e.g. #000000'),
    backgroundColor: z.string().describe('Hex from Gmail palette, e.g. #ffffff'),
});

export const patchLabel = tool({
    description: 'Partially update a user label (name, visibility, color with both subfields). System labels are rejected.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        id: z.string().describe('User label ID to update'),
        name: z.string().optional().describe('New display name (non-empty, unique, no commas)'),
        messageListVisibility: z.enum(['show', 'hide']).optional(),
        labelListVisibility: z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional(),
        color: colorSchema.optional().describe('Both subfields required, Gmail palette only'),
    }),
    execute: async ({ gmailToken, userId, id, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/labels/${id}`,
            { method: 'PATCH', body: JSON.stringify(payload) },
            'patch label',
        );
    },
});

export const updateLabel = tool({
    description: 'Fully update a user label (PUT). Same fields as patch; provide the complete desired state.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        id: z.string().describe('User label ID to update'),
        name: z.string().optional(),
        messageListVisibility: z.enum(['show', 'hide']).optional(),
        labelListVisibility: z.enum(['labelShow', 'labelShowIfUnread', 'labelHide']).optional(),
        color: colorSchema.optional(),
    }),
    execute: async ({ gmailToken, userId, id, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/labels/${id}`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update label',
        );
    },
});

export const modifyThreadLabels = tool({
    description: 'Add/remove label IDs on a whole thread (all messages). For single messages use modify-message-labels instead.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        threadId: z.string().describe('Thread ID to modify'),
        addLabelIds: z.array(z.string()).optional().describe("Label IDs to add (add wins on overlap)"),
        removeLabelIds: z.array(z.string()).optional().describe('Label IDs to remove'),
    }),
    execute: async ({ gmailToken, userId, threadId, addLabelIds, removeLabelIds }) =>
        gmailFetch(
            gmailToken,
            `/users/${userId}/threads/${threadId}/modify`,
            { method: 'POST', body: JSON.stringify({ addLabelIds, removeLabelIds }) },
            'modify thread labels',
        ),
});

export const moveThreadToTrash = tool({
    description: 'Move a thread and all its messages to trash (recoverable via untrash-thread).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        threadId: z.string().describe('Thread ID to trash'),
    }),
    execute: async ({ gmailToken, userId, threadId }) =>
        gmailFetch(gmailToken, `/users/${userId}/threads/${threadId}/trash`, { method: 'POST' }, 'trash thread'),
});

export const untrashThread = tool({
    description: 'Restore a trashed thread and its messages.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        threadId: z.string().describe('Thread ID to restore'),
    }),
    execute: async ({ gmailToken, userId, threadId }) =>
        gmailFetch(gmailToken, `/users/${userId}/threads/${threadId}/untrash`, { method: 'POST' }, 'untrash thread'),
});
