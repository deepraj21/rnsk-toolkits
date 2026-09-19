// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hostingerListVirtualMachines = tool({
    description:
        'List all VPS virtual machines with CPU, memory, disk, IP addresses, and state. Use when the user asks to see their servers or VPS instances.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/vps/v1/virtual-machines');
    },
});

export const hostingerListTemplates = tool({
    description:
        'List available VPS OS templates. Use to view operating system options before creating or recreating a VPS.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/vps/v1/templates');
    },
});

export const hostingerGetTemplateDetails = tool({
    description:
        'Get details of a specific VPS OS template, including OS version and documentation link. Use to review a template before deployment.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        templateId: z.number().int().describe('Template ID'),
    }),
    execute: async ({ hostingerApiKey, templateId }) => {
        return hostingerRequest(hostingerApiKey, `/api/vps/v1/templates/${templateId}`);
    },
});

export const hostingerListDataCenters = tool({
    description:
        'List available VPS data centers with city, continent, and country. Use to choose a deployment location for a VPS.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
    }),
    execute: async ({ hostingerApiKey }) => {
        return hostingerRequest(hostingerApiKey, '/api/vps/v1/data-centers');
    },
});

export const hostingerCreatePublicKey = tool({
    description:
        'Add an SSH public key to the account for VPS authentication. The key can then be assigned to VPS instances.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        name: z.string().describe('Name for the public key, e.g. "My SSH Key"'),
        key: z.string().describe('SSH public key content, e.g. "ssh-rsa AAAA... user@host"'),
    }),
    execute: async ({ hostingerApiKey, name, key }) => {
        return hostingerRequest(hostingerApiKey, '/api/vps/v1/public-keys', {
            method: 'POST',
            body: { name, key },
        });
    },
});

export const hostingerListPublicKeys = tool({
    description:
        'List SSH public keys on the account. Use to view available keys for VPS authentication.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        page: z.number().int().min(1).optional().describe('Page number for pagination'),
    }),
    execute: async ({ hostingerApiKey, page }) => {
        return hostingerRequest(hostingerApiKey, '/api/vps/v1/public-keys', { query: { page } });
    },
});

export const hostingerDeletePublicKey = tool({
    description:
        'Delete an unused SSH public key from the account. Note: this does not remove the key from existing virtual machines.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        publicKeyId: z.number().int().describe('Public key ID to delete'),
    }),
    execute: async ({ hostingerApiKey, publicKeyId }) => {
        return hostingerRequest(hostingerApiKey, `/api/vps/v1/public-keys/${publicKeyId}`, { method: 'DELETE' });
    },
});
