import { tool } from 'ai';
import { z } from 'zod';
import { encodeRFC822Message } from './utils.js';

export const createDraft = tool({
    description: 'Create a draft email in Gmail without sending it immediately. Highly recommended for human-in-the-loop review.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Email subject'),
        body: z.string().describe('Email body (plain text)'),
        cc: z.string().optional().describe('Optional CC recipient email address(es), comma-separated'),
        bcc: z.string().optional().describe('Optional BCC recipient email address(es), comma-separated'),
        threadId: z.string().optional().describe('Optional thread ID to associate the draft with an existing conversation thread'),
    }),
    execute: async ({ gmailToken, to, subject, body, cc, bcc, threadId }) => {
        try {
            const encodedMessage = encodeRFC822Message({
                to,
                subject,
                body,
                cc,
                bcc,
            });

            const messagePayload: { raw: string; threadId?: string } = {
                raw: encodedMessage,
            };
            if (threadId) {
                messagePayload.threadId = threadId;
            }

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messagePayload,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to create draft', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                draftId: data.id,
                messageId: data.message?.id,
                threadId: data.message?.threadId,
            };
        } catch (error) {
            return {
                error: 'Error creating draft',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
