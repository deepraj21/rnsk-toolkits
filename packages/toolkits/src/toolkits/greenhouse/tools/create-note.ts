// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseCreateNote = tool({
  description:
    'Creates a note on a Greenhouse candidate: NOTE (Notes tab, default), EMAIL (logs an email into the activity feed — requires subject and from/to/cc), or ACTIVITY (free-form activity entry). Optionally anchor to a specific application.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    candidateId: z.number().describe('Candidate the note is attached to'),
    body: z.string().describe('Note text; newline characters render as line breaks'),
    noteType: z
      .enum(['NOTE', 'EMAIL', 'ACTIVITY'])
      .optional()
      .describe(
        'NOTE (default) posts to the Notes tab; EMAIL logs an email; ACTIVITY is a feed entry',
      ),
    visibility: z
      .enum(['admin_only', 'private', 'public'])
      .optional()
      .describe('Who can see the note (default public; private/admin_only need permissions)'),
    subject: z.string().optional().describe('Subject line — required when noteType is EMAIL'),
    applicationId: z
      .number()
      .optional()
      .describe('Anchor the note to a specific application of this candidate'),
    emailFrom: z
      .array(z.string())
      .optional()
      .describe('From addresses — required (may be empty) when noteType is EMAIL'),
    emailTo: z
      .array(z.string())
      .optional()
      .describe('To addresses — required when noteType is EMAIL'),
    emailCc: z
      .array(z.string())
      .optional()
      .describe('Cc addresses — required (may be empty) when noteType is EMAIL'),
    userId: z
      .number()
      .optional()
      .describe('Greenhouse user id to record as the note author (defaults to the API user)'),
  }),
  execute: async ({
    greenhouseCredentials,
    candidateId,
    body,
    noteType,
    visibility,
    subject,
    applicationId,
    emailFrom,
    emailTo,
    emailCc,
    userId,
  }) => {
    const request = {
      candidate_id: candidateId,
      body,
      note_type: noteType ?? 'NOTE',
      visibility: visibility ?? 'public',
    };
    if (subject !== undefined) request.subject = subject;
    if (applicationId !== undefined) request.application_id = applicationId;
    if (emailFrom !== undefined) request.email_from = emailFrom;
    if (emailTo !== undefined) request.email_to = emailTo;
    if (emailCc !== undefined) request.email_cc = emailCc;
    if (userId !== undefined) request.user_id = userId;

    const result = await greenhouseRequest(greenhouseCredentials, '/notes', {
      method: 'POST',
      body: request,
    });

    if (result.error) return result;
    return result.data;
  },
});
