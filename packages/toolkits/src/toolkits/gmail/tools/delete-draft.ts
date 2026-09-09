import { tool } from 'ai';
import { z } from 'zod';

export const deleteDraft = tool({
    description: 'Permanently delete an existing Gmail draft by its draft ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the draft to delete'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/drafts/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok && response.status !== 204) {
                const error = await response.json().catch(() => ({ status: response.status }));
                return { error: 'Failed to delete draft', details: error };
            }

            return {
                success: true,
                draftId: id,
            };
        } catch (error) {
            return {
                error: 'Error deleting draft',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
