import { tool } from 'ai';
import { z } from 'zod';
import { encodeBase64Url, encodeMultipartMessage, extractMessageDetails } from './utils.js';

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

export const fetchEmails = tool({
    description: 'Search/list emails with optional hydration: ids_only (fastest), metadata, or full payload. Sort by internalDate client-side; loop page tokens for full coverage.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        query: z.string().optional().describe("Search query, e.g. 'from:x is:unread' (use 'is:' for states, 'label:' only for custom labels)"),
        labelIds: z.array(z.string()).optional().describe('AND filter by label IDs (custom labels need Label_XXX IDs from list-labels)'),
        maxResults: z.number().int().min(1).max(500).optional().describe('Messages per page (default 10)'),
        pageToken: z.string().optional().describe('Next page token; loop until absent'),
        includeSpamTrash: z.boolean().optional().describe('Include SPAM and TRASH'),
        idsOnly: z.boolean().optional().describe('Return only IDs/thread IDs (fastest)'),
        includePayload: z.boolean().optional().describe('Hydrate full payload per message (default true unless idsOnly)'),
    }),
    execute: async ({ gmailToken, userId, query, labelIds, maxResults, pageToken, includeSpamTrash, idsOnly, includePayload }) => {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (maxResults) params.append('maxResults', String(maxResults));
        if (pageToken) params.append('pageToken', pageToken);
        if (includeSpamTrash) params.append('includeSpamTrash', 'true');
        for (const id of labelIds || []) params.append('labelIds', id);
        const list = await gmailFetch(gmailToken, `/users/${userId}/messages?${params.toString()}`, undefined, 'list emails');
        if ((list as any)?.error || idsOnly) return list;
        const hydrate = includePayload !== false;
        const messages = await Promise.all(
            ((list as any)?.messages || []).map(async (m: any) => {
                const full = await gmailFetch(
                    gmailToken,
                    `/users/${userId}/messages/${m.id}?format=${hydrate ? 'full' : 'metadata'}`,
                    undefined,
                    'hydrate email',
                );
                if ((full as any)?.error) return { messageId: m.id, threadId: m.threadId, error: (full as any).error };
                return hydrate ? extractMessageDetails(full) : full;
            }),
        );
        return { ...(list as any), messages };
    },
});

export const getProfile = tool({
    description: 'Get mailbox profile (primary email, message/thread totals, historyId). historyId seeds incremental sync via list-history.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/profile`, undefined, 'get profile'),
});

export const whoAmI = tool({
    description: 'Return the connected account identity (sub, name, email, hosted domain) via userinfo + Gmail profile.',
    inputSchema: z.object({
        gmailToken: tokenField,
    }),
    execute: async ({ gmailToken }) => {
        try {
            const [userinfo, profile] = await Promise.all([
                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${gmailToken}` },
                }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
                gmailFetch(gmailToken, '/users/me/profile', undefined, 'get profile'),
            ]);
            if (!userinfo && (profile as any)?.error) return profile;
            return {
                sub: (userinfo as any)?.sub ?? null,
                name: (userinfo as any)?.name ?? null,
                email: (userinfo as any)?.email ?? (profile as any)?.emailAddress ?? null,
                hosted_domain: (userinfo as any)?.hd ?? null,
            };
        } catch (error) {
            return {
                error: 'Error getting identity',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});

function buildMime(input: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body?: string;
    isHtml?: boolean;
    threadId?: string;
}): string {
    const lines = [
        `To: ${input.to.join(', ')}`,
        input.cc?.length ? `Cc: ${input.cc.join(', ')}` : null,
        input.bcc?.length ? `Bcc: ${input.bcc.join(', ')}` : null,
        `Subject: ${input.subject ?? ''}`,
        'MIME-Version: 1.0',
        `Content-Type: ${input.isHtml ? 'text/html' : 'text/plain'}; charset="UTF-8"`,
        'Content-Transfer-Encoding: 8bit',
    ].filter(Boolean) as string[];
    let body = input.body ?? '';
    if (!input.isHtml) body = body.replace(/\n/g, '<br/>');
    return encodeBase64Url(`${lines.join('\n')}\n\n${body}`);
}

async function fetchPublicUrlBytes(url: string): Promise<{ data: string; mimeType: string } | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = Buffer.from(await response.arrayBuffer());
        return {
            data: buffer.toString('base64'),
            mimeType: response.headers.get('content-type') || 'application/octet-stream',
        };
    } catch {
        return null;
    }
}

export const updateDraft = tool({
    description: 'Replace a draft entirely by ID (full replace, not patch). Provide complete content; attachments via public URL only.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        draftId: z.string().describe('Draft ID from list-drafts or create-draft'),
        recipientEmail: z.string().optional().describe('Primary To recipient'),
        extraRecipients: z.array(z.string()).optional().describe('Additional To recipients'),
        cc: z.array(z.string()).optional(),
        bcc: z.array(z.string()).optional(),
        subject: z.string().optional(),
        body: z.string().optional().describe('Plain text or HTML (set isHtml for HTML)'),
        isHtml: z.boolean().optional(),
        threadId: z.string().optional().describe('Keep the draft in this thread'),
        attachmentUrl: z.string().optional().describe('Public file URL to attach (Drive links for >25 MB total)'),
        attachmentName: z.string().optional().describe('Filename for the attached URL'),
    }),
    execute: async ({ gmailToken, userId, draftId, recipientEmail, extraRecipients, cc, bcc, subject, body, isHtml, threadId, attachmentUrl, attachmentName }) => {
        const to = [recipientEmail, ...(extraRecipients || [])].filter(Boolean) as string[];
        let raw = buildMime({ to, cc, bcc, subject, body, isHtml, threadId });
        if (attachmentUrl) {
            const fetched = await fetchPublicUrlBytes(attachmentUrl);
            if (!fetched) return { error: 'Failed to update draft', details: 'Attachment URL could not be fetched (must be public)' };
            raw = encodeMultipartMessage({
                to: to.join(', '),
                subject: subject ?? '',
                body: body ?? '',
                cc: cc?.join(', '),
                bcc: bcc?.join(', '),
                attachments: [{ filename: attachmentName || 'attachment', mimeType: fetched.mimeType, data: fetched.data }],
            });
        }
        const payload: Record<string, unknown> = { message: { raw } };
        if (threadId) (payload.message as any).threadId = threadId;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/drafts/${draftId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update draft',
        );
    },
});
