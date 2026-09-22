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

export const listFilters = tool({
    description: 'List all Gmail filters. Audit for malicious rules or check for duplicates before creating new ones.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/filters`, undefined, 'list filters'),
});

export const listHistory = tool({
    description: 'List mailbox changes since a history ID for incremental sync. Persist the newest historyId as checkpoint; empty history is valid (no changes).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        startHistoryId: z.string().describe('Numeric history ID to sync from (get via get-profile)'),
        labelId: z.string().optional().describe('Restrict to changes on this label, e.g. INBOX'),
        historyTypes: z.array(z.enum(['messageAdded', 'messageDeleted', 'labelAdded', 'labelRemoved'])).optional(),
        maxResults: z.number().int().min(1).max(500).optional().describe('Records per page (default 100, max 500)'),
        pageToken: z.string().optional().describe('Next page token; loop until absent'),
    }),
    execute: async ({ gmailToken, userId, startHistoryId, labelId, historyTypes, maxResults, pageToken }) => {
        const params = new URLSearchParams({ startHistoryId });
        if (labelId) params.append('labelId', labelId);
        if (maxResults) params.append('maxResults', String(maxResults));
        if (pageToken) params.append('pageToken', pageToken);
        for (const t of historyTypes || []) params.append('historyTypes', t);
        return gmailFetch(gmailToken, `/users/${userId}/history?${params.toString()}`, undefined, 'list history');
    },
});

export const listCseIdentities = tool({
    description: 'List client-side encryption sending identities with key-pair associations (Workspace CSE only).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        pageSize: z.number().int().min(1).optional().describe('Identities per page (default 20)'),
        pageToken: z.string().optional(),
    }),
    execute: async ({ gmailToken, userId, pageSize, pageToken }) => {
        const params = new URLSearchParams();
        if (pageSize) params.append('pageSize', String(pageSize));
        if (pageToken) params.append('pageToken', pageToken);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return gmailFetch(gmailToken, `/users/${userId}/settings/cse/identities${qs}`, undefined, 'list CSE identities');
    },
});

export const listCseKeypairs = tool({
    description: 'List client-side encryption key pairs (public certs, enablement state). Paginate with page tokens.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        pageSize: z.number().int().min(1).optional().describe('Key pairs per page (default 20)'),
        pageToken: z.string().optional().describe('Omit for the first page'),
    }),
    execute: async ({ gmailToken, userId, pageSize, pageToken }) => {
        const params = new URLSearchParams();
        if (pageSize) params.append('pageSize', String(pageSize));
        if (pageToken) params.append('pageToken', pageToken);
        const qs = params.toString() ? `?${params.toString()}` : '';
        return gmailFetch(gmailToken, `/users/${userId}/settings/cse/keypairs${qs}`, undefined, 'list CSE key pairs');
    },
});

export const importMessage = tool({
    description: 'Import an RFC 2822 base64url message with delivery scanning/classification (no SMTP, no SPF checks).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        raw: z.string().describe('Full RFC 2822 message, base64url-encoded'),
        deleted: z.boolean().optional().describe('Vault-only delete (Workspace only)'),
        neverMarkSpam: z.boolean().optional().describe('Bypass spam classifier'),
        internalDateSource: z.enum(['receivedTime', 'dateHeader']).optional(),
        processForCalendar: z.boolean().optional().describe('Extract calendar invites to Google Calendar'),
    }),
    execute: async ({ gmailToken, userId, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/messages/import`,
            { method: 'POST', body: JSON.stringify(payload) },
            'import message',
        );
    },
});

export const insertMessage = tool({
    description: 'Insert an RFC 2822 base64url message directly (IMAP APPEND equivalent), bypassing most scanning. Does not send.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        raw: z.string().describe('Full RFC 2822 message, base64url-encoded'),
        deleted: z.boolean().optional().describe('Vault-only delete (Workspace only)'),
        internalDateSource: z.enum(['receivedTime', 'dateHeader']).optional(),
    }),
    execute: async ({ gmailToken, userId, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/messages`,
            { method: 'POST', body: JSON.stringify(payload) },
            'insert message',
        );
    },
});

export const stopWatch = tool({
    description: 'Stop Gmail push notifications for the mailbox previously configured via watch.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/stop`, { method: 'POST' }, 'stop watch'),
});
