// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  whatsappRequest,
  failedResult,
  toWhatsAppError,
  resolveWabaHelper,
  parseWhatsAppCredentials,
} from './client.js';

export const whatsappCreateTemplate = tool({
  description:
    'Create a message template for approval. Needed for outbound marketing and 24h+ messages.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    name: z.string().describe('lowercase with underscores'),
    category: z.string().describe('AUTHENTICATION, MARKETING, or UTILITY'),
    language: z.string().describe("e.g. 'en_US'"),
    components: z.array(z.record(z.any())).optional().describe('HEADER/BODY/BUTTONS'),
    allowCategoryChange: z.boolean().optional().describe('let Meta recategorize'),
    libraryTemplateName: z.string().optional().describe('clone a library template'),
    libraryTemplateBodyInputs: z.record(z.any()).optional(),
    libraryTemplateButtonInputs: z.array(z.record(z.any())).optional(),
  }),
  execute: async ({
    whatsappCredentials,
    wabaId,
    name,
    category,
    language,
    components,
    allowCategoryChange,
    libraryTemplateName,
    libraryTemplateBodyInputs,
    libraryTemplateButtonInputs,
  }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/message_templates`,
        {
          method: 'POST',
          body: {
            name,
            category,
            language,
            components,
            allowCategoryChange,
            libraryTemplateName,
            libraryTemplateBodyInputs,
            libraryTemplateButtonInputs,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create template', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error creating template');
    }
  },
});

export const whatsappGetTemplates = tool({
  description: 'List message templates with status, category, and language filters.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    after: z.string().optional().describe('pagination cursor'),
    limit: z.number().int().optional().describe('max 100'),
    fields: z.string().optional().describe('fields to return'),
    status: z.string().optional().describe('APPROVED, PENDING, REJECTED, ...'),
    category: z.string().optional(),
    language: z.string().optional().describe("e.g. 'en_US'"),
    nameOrContent: z.string().optional().describe('name/content substring'),
  }),
  execute: async ({
    whatsappCredentials,
    wabaId,
    after,
    limit,
    fields,
    status,
    category,
    language,
    nameOrContent,
  }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/message_templates`,
        {
          method: 'GET',
          query: { after, limit, fields, status, category, language, nameOrContent },
        },
      );
      if (!result.ok) return failedResult('Failed to get templates', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting templates');
    }
  },
});

export const whatsappDeleteTemplate = tool({
  description: 'Delete templates by name (all languages) or one variant via hsm_id. Irreversible.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    name: z.string(),
    hsmId: z.string().optional().describe('delete only this language variant'),
  }),
  execute: async ({ whatsappCredentials, wabaId, name, hsmId }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/message_templates`,
        { method: 'DELETE', query: { name, hsmId } },
      );
      if (!result.ok) return failedResult('Failed to delete template', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error deleting template');
    }
  },
});

export const whatsappGetTemplateStatus = tool({
  description: 'Check approval status and details of one template by ID.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    templateId: z.string(),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, templateId, fields }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${templateId}`, {
        method: 'GET',
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get template status', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting template status');
    }
  },
});

export const whatsappGetTemplateLibrary = tool({
  description: 'Browse pre-built Meta template library by topic, use case, industry, or language.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    status: z.string().optional(),
    country: z.string().optional().describe("e.g. 'US'"),
    category: z.string().optional(),
    language: z.string().optional(),
    nameOrContent: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    after,
    limit,
    status,
    country,
    category,
    language,
    nameOrContent,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, '/message_template_library', {
        method: 'GET',
        query: { after, limit, status, country, category, language, nameOrContent },
      });
      if (!result.ok) return failedResult('Failed to get template library', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting template library');
    }
  },
});

export const whatsappUpsertTemplate = tool({
  description: 'Create a template or update the same-name one. Supports FOOTER and OTP buttons.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    name: z.string(),
    category: z.string(),
    language: z.string(),
    components: z.array(z.record(z.any())).describe('BODY required'),
  }),
  execute: async ({ whatsappCredentials, wabaId, name, category, language, components }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/upsert_message_templates`,
        { method: 'POST', body: { name, category, language, components } },
      );
      if (!result.ok) return failedResult('Failed to upsert template', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error upserting template');
    }
  },
});
