// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { buildNotebookName, getEndpoint, parseResponseError } from './utils.js';

export const shareNotebook = tool({
    description: 'Grant, change, or remove account access to a NotebookLM Enterprise notebook. Notification emails are disabled by default; notifyViaEmail=true sends email and cannot be undone.',
    inputSchema: z.object({
        notebookLmToken: z.string().describe('NotebookLM OAuth access token.'),
        notebookId: z.string().min(1).describe('Notebook UUID or full resource name.'),
        shares: z.array(z.object({
            email: z.string().email().describe('Google account email address whose access will be changed.'),
            role: z.enum(['owner', 'writer', 'reader', 'not_shared']).describe('Access to set: owner, writer, reader, or not_shared to remove access.'),
        })).min(1).describe('Accounts and exact access roles to apply.'),
        notifyViaEmail: z.boolean().optional().describe('Whether Google sends notification emails. Defaults to false. WARNING: true cannot be undone.'),
        location: z.string().optional().describe('Location override, defaults to global.'),
        endpointLocation: z.string().optional().describe('Endpoint multi-region, defaults to global.'),
        projectNumber: z.string().optional().describe('Project number, defaults to -.'),
    }),
    execute: async ({ notebookLmToken, notebookId, shares, notifyViaEmail, location, endpointLocation, projectNumber }) => {
        if (!notebookLmToken) return { error: 'NotebookLM token is required. Connect NotebookLM first.' };
        try {
            const endpoint = getEndpoint(endpointLocation || location);
            const name = buildNotebookName(notebookId, projectNumber, location);
            const url = `${endpoint}/${name}:share`;
            const roleMap: Record<string, string> = {
                owner: 'PROJECT_ROLE_OWNER',
                writer: 'PROJECT_ROLE_WRITER',
                reader: 'PROJECT_ROLE_READER',
                not_shared: 'PROJECT_ROLE_NOT_SHARED',
            };
            const accountAndRoles = shares.map((s) => ({ email: s.email, role: roleMap[s.role] || s.role }));
            const response = await fetch(url, {
                method: 'POST',
                headers: { Authorization: `Bearer ${notebookLmToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountAndRoles }),
            });
            if (!response.ok) {
                const err = await parseResponseError(response);
                return { error: 'Failed to share notebook', details: err.details };
            }
            const text = await response.text();
            let data: unknown = {};
            try { data = text ? JSON.parse(text) : {}; } catch { data = text; }
            return { notebookId, affectedAccounts: shares, notifyViaEmail: notifyViaEmail ?? false, raw: data };
        } catch (error) {
            return { error: 'Error sharing notebook', message: error instanceof Error ? error.message : 'Unknown error' };
        }
    },
});
