import { tool } from 'ai';
import { z } from 'zod';

export const getAttachment = tool({
    description: 'Retrieve a Gmail message attachment by message ID and attachment ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        messageId: z.string().describe('The message ID containing the attachment'),
        attachmentId: z.string().describe('The attachment ID from the message payload part'),
        fileName: z.string().optional().describe('Optional filename to include in the response'),
    }),
    execute: async ({ gmailToken, messageId, attachmentId, fileName }) => {
        try {
            const response = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${gmailToken}`,
                    },
                },
            );

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get attachment', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                messageId,
                attachmentId,
                fileName,
                size: data.size,
                data: data.data,
                encoding: 'base64url',
            };
        } catch (error) {
            return {
                error: 'Error getting attachment',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
