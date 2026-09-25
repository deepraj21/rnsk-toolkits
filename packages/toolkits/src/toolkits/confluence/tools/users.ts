// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { ATLASSIAN_API, conf } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const cloudField = z.string().optional().describe('Optional Confluence Cloud site ID. If omitted, your first accessible site is used automatically.');

export const confluenceGetCurrentUser = tool({
    description: 'Get the authenticated user: accountId, displayName and email for downstream logic. For other users use user search.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId }) => {
        return conf(confluenceToken, { cloudId: confluenceCloudId, path: '/rest/api/user/current' });
    },
});

export const confluenceGetAnonymousUser = tool({
    description: 'Get guest (anonymous) user details for unauthenticated interaction contexts.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId }) => {
        return conf(confluenceToken, { cloudId: confluenceCloudId, path: '/rest/api/user/anonymous' });
    },
});

export const confluenceValidateCredential = tool({
    description: 'Verify the connection by loading the current user. Returns valid flag plus account details before running other operations.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId }) => {
        if (!confluenceToken) return { error: 'Confluence token is required. Connect Confluence first.' };
        const data = await conf(confluenceToken, { cloudId: confluenceCloudId, path: '/rest/api/user/current' });
        if (data?.error) {
            return { valid: false, accountId: null, email: null, displayName: null, message: data.error };
        }
        return {
            valid: true,
            accountId: data?.accountId ?? null,
            email: data?.email ?? null,
            displayName: data?.displayName ?? data?.publicName ?? null,
            message: 'Confluence credentials are valid.',
        };
    },
});

export const confluenceWhoAmI = tool({
    description: 'Show Atlassian sites (workspaces) this connection can access, plus the connected account identity.',
    inputSchema: z.object({
        confluenceToken: tokenField,
        confluenceCloudId: cloudField,
    }),
    execute: async ({ confluenceToken, confluenceCloudId }) => {
        if (!confluenceToken) return { error: 'Confluence token is required. Connect Confluence first.' };
        let sites = [];
        try {
            const response = await fetch(`${ATLASSIAN_API}/oauth/token/accessible-resources`, {
                headers: { Authorization: `Bearer ${confluenceToken}`, Accept: 'application/json' },
            });
            if (response.ok) {
                const list = await response.json().catch(() => []);
                sites = (Array.isArray(list) ? list : []).map((s) => ({ id: s?.id, url: s?.url, name: s?.name }));
            }
        } catch {
            // Fall through with empty sites — user endpoint below still identifies the account.
        }
        const me = await conf(confluenceToken, { cloudId: confluenceCloudId, path: '/rest/api/user/current' });
        if (me?.error && sites.length === 0) return me;
        return {
            sites,
            account_id: me?.accountId ?? null,
            display_name: me?.displayName ?? me?.publicName ?? null,
        };
    },
});
