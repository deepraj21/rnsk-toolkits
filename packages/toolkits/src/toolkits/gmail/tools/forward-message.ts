import { tool } from 'ai';
import { z } from 'zod';
import {
    collectAttachments,
    encodeMultipartMessage,
    encodeRFC822Message,
    extractBodyFromPayload,
    getHeaderValue,
} from './utils.js';

export const forwardMessage = tool({
    description: 'Forward an existing Gmail message to one or more recipients, optionally preserving attachments.',
    inputSchema: z.object({
        gmailToken: z.string().optional().describe('Injected by system; do not provide'),
        messageId: z.string().describe('The message ID to forward'),
        recipients: z.string().describe('Recipient email address(es), comma-separated'),
        cc: z.string().optional().describe('Optional CC recipient email address(es), comma-separated'),
        bcc: z.string().optional().describe('Optional BCC recipient email address(es), comma-separated'),
        additionalText: z.string().optional().describe('Optional text to add above the forwarded message'),
        includeAttachments: z.boolean().optional().default(true).describe('Whether to copy original attachments into the forwarded message'),
    }),
    execute: async ({ gmailToken, messageId, recipients, cc, bcc, additionalText, includeAttachments }) => {
        try {
            const messageResponse = await fetch(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        Authorization: `Bearer ${gmailToken}`,
                    },
                },
            );

            if (!messageResponse.ok) {
                const error = await messageResponse.json();
                return { error: 'Failed to fetch message to forward', details: error };
            }

            const originalMessage = await messageResponse.json();
            const headers = originalMessage.payload?.headers || [];
            const originalSubject = getHeaderValue(headers, 'subject') || '(no subject)';
            const originalFrom = getHeaderValue(headers, 'from') || '';
            const originalTo = getHeaderValue(headers, 'to') || '';
            const originalDate = getHeaderValue(headers, 'date') || '';
            const originalBody = extractBodyFromPayload(originalMessage.payload);
            const subject = originalSubject.toLowerCase().startsWith('fwd:')
                ? originalSubject
                : `Fwd: ${originalSubject}`;
            const body = [
                additionalText || '',
                additionalText ? '' : null,
                '---------- Forwarded message ---------',
                originalFrom ? `From: ${originalFrom}` : null,
                originalDate ? `Date: ${originalDate}` : null,
                originalSubject ? `Subject: ${originalSubject}` : null,
                originalTo ? `To: ${originalTo}` : null,
                '',
                originalBody,
            ].filter((line) => line !== null).join('\n');

            const attachments = [];
            if (includeAttachments) {
                for (const attachment of collectAttachments(originalMessage.payload)) {
                    const attachmentResponse = await fetch(
                        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachment.attachmentId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${gmailToken}`,
                            },
                        },
                    );

                    if (!attachmentResponse.ok) {
                        const error = await attachmentResponse.json();
                        return { error: `Failed to fetch attachment ${attachment.filename}`, details: error };
                    }

                    const attachmentData = await attachmentResponse.json();
                    attachments.push({
                        filename: attachment.filename,
                        mimeType: attachment.mimeType,
                        data: attachmentData.data,
                    });
                }
            }

            const raw = attachments.length > 0
                ? encodeMultipartMessage({
                    to: recipients,
                    subject,
                    body,
                    cc,
                    bcc,
                    attachments,
                })
                : encodeRFC822Message({
                    to: recipients,
                    subject,
                    body,
                    cc,
                    bcc,
                });

            const sendResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${gmailToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ raw }),
            });

            if (!sendResponse.ok) {
                const error = await sendResponse.json();
                return { error: 'Failed to forward message', details: error };
            }

            const data = await sendResponse.json();
            return {
                success: true,
                messageId: data.id,
                threadId: data.threadId,
                forwardedMessageId: messageId,
                attachmentCount: attachments.length,
            };
        } catch (error) {
            return {
                error: 'Error forwarding message',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
