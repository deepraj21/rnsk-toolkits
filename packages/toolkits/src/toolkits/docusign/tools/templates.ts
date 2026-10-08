// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { docusignRequest, failedResult, toDocusignError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const docusignListTemplates = tool({
  description: 'List envelope templates in the account.',
  inputSchema: z.object({
    docusignCredentials: credField,
    count: z.number().int().optional(),
    startPosition: z.number().int().optional(),
    searchText: z.string().optional(),
    folderTypes: z.string().optional().describe('e.g. templates'),
  }),
  execute: async ({ docusignCredentials, count, startPosition, searchText, folderTypes }) => {
    try {
      const result = await docusignRequest(docusignCredentials, '/templates', {
        query: {
          count,
          start_position: startPosition,
          search_text: searchText,
          folder_types: folderTypes,
        },
      });
      if (!result.ok) return failedResult('Failed to list templates', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error listing templates');
    }
  },
});

export const docusignGetTemplate = tool({
  description: 'Get a template by ID.',
  inputSchema: z.object({
    docusignCredentials: credField,
    templateId: z.string().describe('Template ID'),
    include: z.string().optional(),
  }),
  execute: async ({ docusignCredentials, templateId, include }) => {
    try {
      const result = await docusignRequest(
        docusignCredentials,
        `/templates/${encodeURIComponent(templateId)}`,
        { query: include ? { include } : undefined },
      );
      if (!result.ok) return failedResult('Failed to get template', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error getting template');
    }
  },
});

export const docusignCreateEnvelopeFromTemplate = tool({
  description:
    'Create an envelope from a template (POST /envelopes with templateId and templateRoles or compositeTemplates).',
  inputSchema: z.object({
    docusignCredentials: credField,
    envelopeDefinition: z
      .record(z.string(), z.any())
      .describe('Envelope definition referencing templateId/templateRoles'),
  }),
  execute: async ({ docusignCredentials, envelopeDefinition }) => {
    try {
      const result = await docusignRequest(docusignCredentials, '/envelopes', {
        method: 'POST',
        body: envelopeDefinition,
      });
      if (!result.ok) return failedResult('Failed to create envelope from template', result);
      return result.data;
    } catch (error) {
      return toDocusignError(error, 'Error creating envelope from template');
    }
  },
});
