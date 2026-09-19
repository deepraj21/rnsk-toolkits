// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { figmaRequest, figmaTokenField } from './client.js';

export const getPayments = tool({
    description:
        'Checks a user payment status (UNPAID/PAID/TRIAL) for your plugin, widget, or Community file. You must own the resource.',
    inputSchema: z.object({
        figmaToken: figmaTokenField,
        userId: z.number().optional().describe('User ID (required unless pluginPaymentToken is set)'),
        pluginId: z.number().optional().describe('Plugin ID from manifest/Community URL'),
        widgetId: z.number().optional().describe('Widget ID from manifest/Community URL'),
        communityFileId: z.number().optional().describe('Community file ID from its URL'),
        pluginPaymentToken: z.string().optional().describe('Short-lived token from getPluginPaymentTokenAsync'),
    }),
    execute: async ({ figmaToken, userId, pluginId, widgetId, communityFileId, pluginPaymentToken }) => {
        try {
            const result = await figmaRequest(figmaToken, '/v1/payments', {
                query: {
                    user_id: userId,
                    plugin_id: pluginId,
                    widget_id: widgetId,
                    community_file_id: communityFileId,
                    plugin_payment_token: pluginPaymentToken,
                },
            });
            if (!result.ok) return { error: 'Failed to get payments', details: result.error };
            return result.data;
        } catch (error) {
            return {
                error: 'Error getting payments',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
