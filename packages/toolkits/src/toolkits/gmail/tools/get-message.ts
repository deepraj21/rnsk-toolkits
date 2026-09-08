import { tool } from 'ai';
import { z } from 'zod';

export const getMessage = tool({
    description: 'Get details of a specific Gmail message by ID.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        id: z.string().describe('The ID of the message to retrieve'),
    }),
    execute: async ({ gmailToken, id }) => {
        try {
            const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`, {
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to get message', details: error };
            }

            const data = await response.json();

            // Extract basic info
            const headers = data.payload?.headers || [];
            const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value;
            const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value;
            const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;

            let body = '';
            if (data.payload?.parts) {
                const textPart = data.payload.parts.find((p: any) => p.mimeType === 'text/plain');
                if (textPart?.body?.data) {
                    body = Buffer.from(textPart.body.data, 'base64').toString();
                }
            } else if (data.payload?.body?.data) {
                body = Buffer.from(data.payload.body.data, 'base64').toString();
            }

            return {
                id: data.id,
                threadId: data.threadId,
                snippet: data.snippet,
                subject,
                from,
                date,
                body: body.substring(0, 2000), // Limit body size
            };
        } catch (error) {
            return {
                error: 'Error getting message',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
