import { tool } from 'ai';
import { z } from 'zod';
import { encodeRFC822Message } from './utils.js';

export const sendMessage = tool({
  description: 'Send an email via Gmail.',
  inputSchema: z.object({
    gmailToken: z.string().optional().describe('Injected by system; do not provide'),
    to: z.string().describe('Recipient email address'),
    subject: z.string().describe('Email subject'),
    body: z.string().describe('Email body (plain text)'),
    cc: z.string().optional().describe('Optional CC recipient email address(es), comma-separated'),
    bcc: z
      .string()
      .optional()
      .describe('Optional BCC recipient email address(es), comma-separated'),
    threadId: z
      .string()
      .optional()
      .describe(
        'Optional thread ID to reply or append this message to an existing conversation thread',
      ),
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

      const payload: { raw: string; threadId?: string } = {
        raw: encodedMessage,
      };
      if (threadId) {
        payload.threadId = threadId;
      }

      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${gmailToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
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
