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

export const whatsappUploadMedia = tool({
  description: 'Upload media bytes for later sending. Returns a 30-day media ID.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    mediaContent: z.string().describe('base64 file bytes'),
    fileName: z.string().describe("e.g. 'photo.jpg'"),
    mimeType: z.string().describe("e.g. 'image/jpeg'"),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, mediaContent, fileName, mimeType }) => {
    try {
      const bytes = Buffer.from(mediaContent, 'base64');
      const form = new FormData();
      form.append('messaging_product', 'whatsapp');
      form.append('file', new Blob([bytes], { type: mimeType }), fileName);
      form.append('type', mimeType);
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/media`, {
        method: 'POST',
        form,
      });
      if (!result.ok) return failedResult('Failed to upload media', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error uploading media');
    }
  },
});

export const whatsappCreateUploadSession = tool({
  description:
    'Start a resumable upload session for large files. Upload chunks to the session next.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    fileLength: z.number().int().describe('exact byte size'),
    fileType: z.string().describe("e.g. 'video/mp4'"),
    fileName: z.string().optional(),
    appId: z.string().optional().describe('Meta App ID (defaults to app)'),
  }),
  execute: async ({ whatsappCredentials, fileLength, fileType, fileName, appId }) => {
    try {
      const sessionCreds = parseWhatsAppCredentials(whatsappCredentials);
      const appScope = appId ?? 'app';
      const result = await whatsappRequest(whatsappCredentials, `/${appScope}/uploads`, {
        method: 'POST',
        query: { file_name: fileName, file_length: fileLength, file_type: fileType },
      });
      void sessionCreds;
      if (!result.ok) return failedResult('Failed to create upload session', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error creating upload session');
    }
  },
});

export const whatsappGetMediaInfo = tool({
  description: 'Get media metadata and a 5-minute download URL by media ID.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    mediaId: z.string(),
  }),
  execute: async ({ whatsappCredentials, mediaId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${mediaId}`, { method: 'GET' });
      if (!result.ok) return failedResult('Failed to get media info', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting media info');
    }
  },
});

export const whatsappDeleteMedia = tool({
  description: 'Permanently delete uploaded media before its 30-day expiry.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    mediaId: z.string(),
  }),
  execute: async ({ whatsappCredentials, mediaId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${mediaId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete media', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error deleting media');
    }
  },
});
