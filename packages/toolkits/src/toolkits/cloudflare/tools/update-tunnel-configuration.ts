// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cfRequest, toCfError } from './client.js';

export const cloudflareUpdateTunnelConfiguration = tool({
    description:
        'Replace the remotely-managed configuration (ingress rules and routing) of a Cloudflare Tunnel. This REPLACES the entire config — include all existing rules you want to keep plus a catch-all (service http_status:404) last. Incorrect config can break routing; confirm with the user first.',
    inputSchema: z.object({
        cloudflareApiKey: z.string().optional().describe('Injected by system; do not provide'),
        accountId: z.string().describe('Account identifier where the tunnel resides'),
        tunnelId: z.string().describe('Tunnel UUID to configure'),
        config: z.record(z.any()).describe('Full tunnel config object with an ingress array mapping hostnames to origin services'),
    }),
    execute: async ({ cloudflareApiKey, accountId, tunnelId, config }) => {
        try {
            if (!cloudflareApiKey) {
                return { error: 'Cloudflare API key is required. Connect Cloudflare first.' };
            }
            if (!Array.isArray((config as any)?.ingress) || (config as any).ingress.length === 0) {
                return { error: 'Config must include a non-empty ingress array of hostname-to-service rules.' };
            }
            return await cfRequest(
                cloudflareApiKey,
                'PUT',
                `/accounts/${accountId}/cfd_tunnel/${tunnelId}/configurations`,
                { body: { config } },
            );
        } catch (error) {
            return toCfError(error, 'Failed to update tunnel configuration');
        }
    },
});
