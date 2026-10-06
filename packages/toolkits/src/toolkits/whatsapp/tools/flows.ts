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

export const whatsappCreateFlow = tool({
  description: 'Create an interactive Flow in DRAFT. Configure JSON next, then publish.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    name: z.string().describe('max 80 chars, unique'),
    categories: z
      .union([z.string(), z.array(z.string())])
      .describe('array or JSON string, e.g. OTHER'),
    endpointUri: z.string().optional().describe('https data endpoint'),
    cloneFlowId: z.string().optional().describe('clone an existing flow'),
  }),
  execute: async ({ whatsappCredentials, wabaId, name, categories, endpointUri, cloneFlowId }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      let parsedCategories: string[];
      try {
        parsedCategories = Array.isArray(categories) ? categories : JSON.parse(categories);
      } catch {
        return { error: 'Categories must be an array or a JSON array string.' };
      }
      const result = await whatsappRequest(whatsappCredentials, `/${wabaIdResolved}/flows`, {
        method: 'POST',
        body: {
          name,
          categories: parsedCategories,
          ...(endpointUri ? { endpoint_uri: endpointUri } : {}),
          ...(cloneFlowId ? { clone_flow_id: cloneFlowId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create flow', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error creating flow');
    }
  },
});

export const whatsappListFlows = tool({
  description: 'List flows with status and validation errors.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    after: z.string().optional().describe('cursor'),
    limit: z.number().int().optional().describe('max 100'),
  }),
  execute: async ({ whatsappCredentials, wabaId, after, limit }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(whatsappCredentials, `/${wabaIdResolved}/flows`, {
        method: 'GET',
        query: { after, limit },
      });
      if (!result.ok) return failedResult('Failed to list flows', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error listing flows');
    }
  },
});

export const whatsappUpdateFlowMeta = tool({
  description: 'Update Flow name, categories, or endpoint URI.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    flowId: z.string(),
    name: z.string().optional(),
    categories: z.array(z.string()).optional(),
    endpointUri: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, flowId, name, categories, endpointUri }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${flowId}`, {
        method: 'POST',
        body: { flowId, name, categories, endpointUri },
      });
      if (!result.ok) return failedResult('Failed to update flow meta', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error updating flow meta');
    }
  },
});

export const whatsappPublishFlow = tool({
  description: 'Publish a validated DRAFT flow. Irreversible; version to change.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    flowId: z.string(),
  }),
  execute: async ({ whatsappCredentials, flowId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${flowId}/publish`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to publish flow', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error publishing flow');
    }
  },
});

export const whatsappGetFlowAssets = tool({
  description: 'List flow assets like flow.json with short-lived download URLs.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    flowId: z.string(),
  }),
  execute: async ({ whatsappCredentials, flowId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${flowId}/assets`, {
        method: 'GET',
      });
      if (!result.ok) return failedResult('Failed to get flow assets', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting flow assets');
    }
  },
});

export const whatsappUpdateFlowJson = tool({
  description: 'Upload flow.json content to a Flow. Fails with validation errors when invalid.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    flowId: z.string(),
    rawContent: z.string().optional().describe('flow JSON string (preferred)'),
    assetType: z.string().optional().describe("must be 'FLOW_JSON'"),
  }),
  execute: async ({ whatsappCredentials, flowId, rawContent, assetType }) => {
    try {
      if (!rawContent) return { error: 'Provide rawContent with the flow JSON string to upload.' };
      void assetType;
      const form = new FormData();
      form.append('file', new Blob([rawContent], { type: 'application/json' }), 'flow.json');
      form.append('name', 'flow.json');
      form.append('asset_type', 'FLOW_JSON');
      const result = await whatsappRequest(whatsappCredentials, `/${flowId}/assets`, {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to update flow JSON', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error updating flow json');
    }
  },
});
