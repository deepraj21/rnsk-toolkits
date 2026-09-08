import { tool } from 'ai';
import { z } from 'zod';

export const sendMessage = tool({
    description: 'Send an email via Gmail.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body (plain text)'),
    }),
    execute: async ({ gmailToken, to, subject, body }) => {
        try {
            const message = [
                `To: ${to}`,
                `Subject: ${subject}`,
                'Content-Type: text/plain; charset="UTF-8"',
                'MIME-Version: 1.0',
                '',
                body,
            ].join('\n');

            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    raw: encodedMessage,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to send message', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.id,
                threadId: data.threadId,
            };
        } catch (error) {
            return {
                error: 'Error sending message',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
