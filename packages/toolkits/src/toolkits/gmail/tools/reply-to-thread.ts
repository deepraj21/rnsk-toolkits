import { tool } from 'ai';
import { z } from 'zod';
import { encodeRFC822Message } from './utils.js';

export const replyToThread = tool({
    description: 'Reply to an existing Gmail conversation thread, ensuring the message stays grouped in the same thread.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        threadId: z.string().describe('The ID of the thread to reply to'),
        to: z.string().describe('Recipient email address'),
        subject: z.string().describe('Email subject (typically prefixed with "Re: ")'),
        body: z.string().describe('Reply body (plain text)'),
        cc: z.string().optional().describe('Optional CC recipient email address(es), comma-separated'),
        bcc: z.string().optional().describe('Optional BCC recipient email address(es), comma-separated'),
        inReplyTo: z.string().optional().describe('Optional Message-ID header of the email being replied to'),
        references: z.string().optional().describe('Optional References header string for email threading continuity'),
    }),
    execute: async ({ gmailToken, threadId, to, subject, body, cc, bcc, inReplyTo, references }) => {
        try {
            const encodedMessage = encodeRFC822Message({
                to,
                subject,
                body,
                cc,
                bcc,
                inReplyTo,
                references: references || inReplyTo,
            });

            const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    raw: encodedMessage,
                    threadId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                return { error: 'Failed to reply to thread', details: error };
            }

            const data = await response.json();
            return {
                success: true,
                messageId: data.id,
                threadId: data.threadId,
            };
        } catch (error) {
            return {
                error: 'Error replying to thread',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
