// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { docusignRequest, failedResult, toDocusignError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const docusignListEnvelopes = tool({
  description:
    'List envelopes in the account with optional date range, status, and folder filters.',
  inputSchema: z.object({
    docusignCredentials: credField,
    fromDate: z.string().optional().describe('ISO date-time lower bound'),
    toDate: z.string().optional().describe('ISO date-time upper bound'),
    status: z
      .enum([
        'created',
        'sent',
        'delivered',
        'signed',
        'completed',
        'declined',
        'voided',
        'timedout',
      ])
      .optional(),
    folderId: z.string().optional(),
    count: z.number().int().optional().describe('Max rows (default 100)'),
    startPosition: z.number().int().optional(),
    include: z.string().optional().describe('e.g. recipients, folders, custom_fields'),
  }),
  execute: async ({
    docusignCredentials,
    fromDate,
    toDate,
    status,
    folderId,
    count,
    startPosition,
    include,
  }) => {
    try {
      const result = await docusignRequest(docusignCredentials, '/envelopes', {
        query: {
          from_date: fromDate,
          to_date: toDate,
          status,
          folder_id: folderId,
          count,
          start_position: startPosition,
          include,
        },
      });
      if (!result.ok) return failedResult('Failed to list envelopes', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error listing envelopes');
    }
  },
});

export const docusignGetEnvelope = tool({
  description: 'Get envelope details by ID (GET /envelopes/{envelopeId}).',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeId: z.string().describe('Envelope ID'),
    include: z.string().optional().describe('Optional include parameter'),
  }),
  execute: async ({ docusignCredentials, envelopeId, include }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/envelopes/${encodeURIComponent(envelopeId)}`,
        { query: include ? { include } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get envelope', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error getting envelope');
    }
  },
});

export const docusignCreateEnvelope = tool({
  description:
    'Create and optionally send an envelope (POST /envelopes). Pass the full envelopeDefinition object (status sent|created, recipients, documents, emailSubject, etc.).',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeDefinition: z
      .record(z.string(), z.any())
      .describe('DocuSign envelopeDefinition JSON body'),
  }),
  execute: async ({ docusignCredentials, envelopeDefinition }) => {
    try {
      const result = await docusignRequest(docusignCredentials, '/envelopes', {
        method: 'POST',
        body: envelopeDefinition,
      });
      if (!result.ok) return failedResult('Failed to create envelope', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error creating envelope');
    }
  },
});

export const docusignUpdateEnvelope = tool({
  description:
    'Update envelope fields such as status voided or recipients (PUT /envelopes/{envelopeId}).',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeId: z.string().describe('Envelope ID'),
    envelope: z
      .record(z.string(), z.any())
      .describe('Fields to update, e.g. { status: "voided", voidedReason: "..." }'),
  }),
  execute: async ({ docusignCredentials, envelopeId, envelope }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/envelopes/${encodeURIComponent(envelopeId)}`,
        { method: 'PUT', body: envelope },
      );
      if (!result.ok) return failedResult('Failed to update envelope', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error updating envelope');
    }
  },
});

export const docusignListEnvelopeDocuments = tool({
  description: 'List documents in an envelope.',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeId: z.string().describe('Envelope ID'),
  }),
  execute: async ({ docusignCredentials, envelopeId }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/envelopes/${encodeURIComponent(envelopeId)}/documents`,
      );
      if (!result.ok) return failedResult('Failed to list envelope documents', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error listing envelope documents');
    }
  },
});

export const docusignGetEnvelopeRecipients = tool({
  description: 'Get recipients (signers, carbon copies) on an envelope.',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeId: z.string().describe('Envelope ID'),
  }),
  execute: async ({ docusignCredentials, envelopeId }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/envelopes/${encodeURIComponent(envelopeId)}/recipients`,
      );
      if (!result.ok) return failedResult('Failed to get envelope recipients', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error getting envelope recipients');
    }
  },
});
