import { tool } from 'ai';
import { z } from 'zod';

export const getAutoForwarding = tool({
    description: 'Get Gmail auto-forwarding settings for the authenticated mailbox.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
    }),
    execute: async ({ gmailToken }) => {
        try {
            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/settings/autoForwarding', {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get auto-forwarding settings', details: error };
            }

            const data = await response.json();
            return { success: true, autoForwarding: data };
        } catch (error) {
            return {
                error: 'Error getting auto-forwarding settings',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
