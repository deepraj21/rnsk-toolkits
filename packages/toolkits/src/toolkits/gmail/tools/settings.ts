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

export const getLanguageSettings = tool({
    description: "Get the Gmail display language (RFC 3066 tag like 'en-GB') for a user.",
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/language`, undefined, 'get language settings'),
});

export const updateLanguageSettings = tool({
    description: 'Set the Gmail display language. Gmail may save a close variant if the exact tag is unsupported.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        displayLanguage: z.string().describe("RFC 3066 tag, e.g. 'en', 'en-GB', 'fr', 'ja'"),
    }),
    execute: async ({ gmailToken, userId, displayLanguage }) =>
        gmailFetch(
            gmailToken,
            `/users/${userId}/settings/language`,
            { method: 'PUT', body: JSON.stringify({ displayLanguage }) },
            'update language settings',
        ),
});

export const getVacationSettings = tool({
    description: 'Get vacation responder (out-of-office) settings: enabled flag, subject, bodies, schedule, restrictions.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/vacation`, undefined, 'get vacation settings'),
});

export const updateVacationSettings = tool({
    description: 'Configure out-of-office auto-replies. Either responseSubject or responseBodyPlainText must be non-empty to activate.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        enableAutoReply: z.boolean().optional().describe('Turn auto-replies on/off'),
        responseSubject: z.string().optional().describe('Subject prefix for auto-replies'),
        responseBodyPlainText: z.string().optional().describe('Plain-text auto-reply body'),
        responseBodyHtml: z.string().optional().describe('HTML auto-reply body (takes priority, sanitized by Gmail)'),
        restrictToContacts: z.boolean().optional().describe('Reply only to contacts'),
        restrictToDomain: z.boolean().optional().describe('Reply only within Workspace domain'),
        startTime: z.string().optional().describe('Start epoch millis; must precede endTime'),
        endTime: z.string().optional().describe('End epoch millis'),
    }),
    execute: async ({ gmailToken, userId, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/settings/vacation`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update vacation settings',
        );
    },
});

export const settingsGetImap = tool({
    description: 'Get IMAP settings: enabled flag, auto-expunge, expunge behavior, folder size limit.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/imap`, undefined, 'get IMAP settings'),
});

export const updateImapSettings = tool({
    description: 'Update IMAP settings (enabled, autoExpunge, expungeBehavior, maxFolderSize of 0/1000/2000/5000/10000).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        enabled: z.boolean().optional(),
        autoExpunge: z.boolean().optional().describe('Immediately expunge IMAP-deleted messages'),
        expungeBehavior: z.enum(['expungeBehaviorUnspecified', 'archive', 'trash', 'deleteForever']).optional(),
        maxFolderSize: z.number().int().optional().describe('0 (no limit), 1000, 2000, 5000, or 10000'),
    }),
    execute: async ({ gmailToken, userId, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/settings/imap`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update IMAP settings',
        );
    },
});

export const settingsGetPop = tool({
    description: 'Get POP settings: access window and post-fetch disposition.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/pop`, undefined, 'get POP settings'),
});

export const updatePopSettings = tool({
    description: 'Update POP access window (disabled/fromNowOn/allMail) and disposition (leaveInInbox/archive/trash/markRead).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        accessWindow: z.enum(['accessWindowUnspecified', 'disabled', 'fromNowOn', 'allMail']).optional(),
        disposition: z.enum(['dispositionUnspecified', 'leaveInInbox', 'archive', 'trash', 'markRead']).optional(),
    }),
    execute: async ({ gmailToken, userId, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/settings/pop`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update POP settings',
        );
    },
});

export const listSendAs = tool({
    description: "List send-as aliases (primary + custom From addresses) with signatures and verification status. Use before composing from an alias.",
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/sendAs`, undefined, 'list send-as aliases'),
});

export const settingsSendAsGet = tool({
    description: 'Get one send-as alias config (display name, signature, SMTP relay, verification). 404 if the address is not an alias.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        sendAsEmail: z.string().describe("Alias address shown in From, e.g. 'alias@example.com'"),
    }),
    execute: async ({ gmailToken, userId, sendAsEmail }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/sendAs/${encodeURIComponent(sendAsEmail)}`, undefined, 'get send-as alias'),
});

const smtpMsaSchema = z.object({
    host: z.string().describe('SMTP hostname'),
    port: z.number().int().describe('SMTP port'),
    securityMode: z.enum(['securityModeUnspecified', 'none', 'ssl', 'starttls']),
    username: z.string().optional().describe('SMTP username (write-only)'),
    password: z.string().optional().describe('SMTP password (write-only)'),
});

export const patchSendAs = tool({
    description: 'Partially update a send-as alias (display name, signature, reply-to, default flag, SMTP relay).',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        sendAsEmail: z.string().describe('Alias address to update'),
        displayName: z.string().optional().describe('From header name'),
        replyToAddress: z.string().optional().describe('Reply-To header address'),
        signature: z.string().optional().describe('HTML signature (sanitized by Gmail)'),
        isDefault: z.boolean().optional().describe('Make default From (only true is writable)'),
        treatAsAlias: z.boolean().optional().describe('Treat as primary-address alias (custom aliases only)'),
        smtpMsa: smtpMsaSchema.optional().describe('SMTP relay config'),
    }),
    execute: async ({ gmailToken, userId, sendAsEmail, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/settings/sendAs/${encodeURIComponent(sendAsEmail)}`,
            { method: 'PATCH', body: JSON.stringify(payload) },
            'patch send-as alias',
        );
    },
});

export const updateSendAs = tool({
    description: 'Fully update a send-as alias. Same fields as patch; non-primary aliases updatable only with domain-wide delegation.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        sendAsEmail: z.string().describe('Alias address to update'),
        displayName: z.string().optional(),
        replyToAddress: z.string().optional(),
        signature: z.string().optional(),
        isDefault: z.boolean().optional(),
        treatAsAlias: z.boolean().optional(),
        smtpMsa: smtpMsaSchema.optional(),
    }),
    execute: async ({ gmailToken, userId, sendAsEmail, ...body }) => {
        const payload: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(body)) if (v !== undefined) payload[k] = v;
        return gmailFetch(
            gmailToken,
            `/users/${userId}/settings/sendAs/${encodeURIComponent(sendAsEmail)}`,
            { method: 'PUT', body: JSON.stringify(payload) },
            'update send-as alias',
        );
    },
});

export const listSmimeInfo = tool({
    description: "List S/MIME certificate configs for a send-as alias. Needs Workspace Enterprise Plus/Education/Frontline with S/MIME enabled.",
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
        sendAsEmail: z.string().describe('Alias address to list certificates for'),
    }),
    execute: async ({ gmailToken, userId, sendAsEmail }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/sendAs/${encodeURIComponent(sendAsEmail)}/smimeInfo`, undefined, 'list S/MIME configs'),
});

export const listForwardingAddresses = tool({
    description: 'List verified forwarding addresses (accepted/pending) usable as auto-forward targets.',
    inputSchema: z.object({
        gmailToken: tokenField,
        userId: userField,
    }),
    execute: async ({ gmailToken, userId }) =>
        gmailFetch(gmailToken, `/users/${userId}/settings/forwardingAddresses`, undefined, 'list forwarding addresses'),
});
