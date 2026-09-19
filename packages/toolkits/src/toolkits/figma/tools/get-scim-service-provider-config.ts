// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { FIGMA_SCIM_BASE, figmaRequest, figmaTokenField } from './client.js';

export const getScimServiceProviderConfig = tool({
    description:
        'Returns SCIM capabilities (patch, bulk, filter, sort, auth schemes) for account provisioning. No parameters needed.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
    }),
    execute: async ({ figmaToken }) => {
        try {
            const result = await figmaRequest(figmaToken, '/ServiceProviderConfig', {
                base: FIGMA_SCIM_BASE,
            });
            if (!result.ok) return { error: 'Failed to get SCIM config', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting SCIM config',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
