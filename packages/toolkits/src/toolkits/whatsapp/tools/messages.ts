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

export const whatsappSendMessage = tool({
  description: 'Send a text message. Works inside the 24-hour window; otherwise use a template.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string().describe('recipient in international format without +'),
    text: z.string().describe('max 4096 chars'),
    previewUrl: z.boolean().optional().describe('link preview cards'),
    messageId: z.string().optional().describe('wamid to reply to'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    text,
    previewUrl,
    messageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'text',
          text: { body: text, ...(previewUrl !== undefined ? { preview_url: previewUrl } : {}) },
          ...(messageId ? { context: { message_id: messageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send message', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending message');
    }
  },
});

export const whatsappSendTemplateMessage = tool({
  description: 'Send an approved template message. Required for first contact outside 24 hours.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    templateName: z.string(),
    languageCode: z.string().optional().describe("default 'en_US'"),
    components: z.array(z.record(z.any())).optional().describe('header/body/button parameters'),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    templateName,
    languageCode,
    components,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode ?? 'en_US' },
            ...(components ? { components } : {}),
          },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send template message', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending template message');
    }
  },
});

export const whatsappSendMedia = tool({
  description: 'Send image, video, audio, document, or sticker by public URL.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    mediaType: z.string().describe('audio, document, image, sticker, or video'),
    link: z.string().describe('public HTTPS URL'),
    caption: z.string().optional().describe('image/video/document only'),
    fileName: z.string().optional().describe('document filename'),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    mediaType,
    link,
    caption,
    fileName,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: mediaType,
          [mediaType]: {
            link,
            ...(caption && mediaType !== 'audio' && mediaType !== 'sticker' ? { caption } : {}),
            ...(fileName && mediaType === 'document' ? { filename: fileName } : {}),
          },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send media', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending media');
    }
  },
});

export const whatsappSendMediaById = tool({
  description: 'Send previously uploaded media by media ID. Faster than by URL.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    mediaType: z.string(),
    mediaId: z.string().describe('from whatsappUploadMedia'),
    caption: z.string().optional(),
    fileName: z.string().optional(),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    mediaType,
    mediaId,
    caption,
    fileName,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: mediaType,
          [mediaType]: {
            id: mediaId,
            ...(caption && mediaType !== 'audio' && mediaType !== 'sticker' ? { caption } : {}),
            ...(fileName && mediaType === 'document' ? { filename: fileName } : {}),
          },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send media by id', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending media by id');
    }
  },
});

export const whatsappSendLocation = tool({
  description: 'Share coordinates with name and address. 24-hour window only.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    latitude: z.string().describe('-90 to 90'),
    longitude: z.string().describe('-180 to 180'),
    name: z.string().describe('place name'),
    address: z.string().describe('full address'),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    latitude,
    longitude,
    name,
    address,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'location',
          location: { latitude, longitude, name, address },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send location', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending location');
    }
  },
});

export const whatsappSendContacts = tool({
  description: 'Send contact cards (vCards) to a user or group.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string().describe('phone number or group ID'),
    contacts: z
      .array(z.record(z.any()))
      .describe('each with name {formatted_name, first_name, last_name}'),
    recipientType: z.string().optional().describe('individual or group'),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    contacts,
    recipientType,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          recipient_type: recipientType ?? 'individual',
          to: toNumber,
          type: 'contacts',
          contacts,
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send contacts', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending contacts');
    }
  },
});

export const whatsappSendInteractiveButtons = tool({
  description: 'Send up to 3 quick-reply buttons. 24-hour window only.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    bodyText: z.string().describe('max 1024 chars'),
    buttons: z
      .array(z.object({ id: z.string(), title: z.string() }))
      .describe('1-3, title max 20 chars'),
    headerText: z.string().optional().describe('max 60 chars'),
    footerText: z.string().optional().describe('max 60 chars'),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    bodyText,
    buttons,
    headerText,
    footerText,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'interactive',
          interactive: {
            type: 'button',
            ...(headerText ? { header: { type: 'text', text: headerText } } : {}),
            body: { text: bodyText },
            ...(footerText ? { footer: { text: footerText } } : {}),
            action: {
              buttons: buttons.map((b) => ({ type: 'reply', reply: { id: b.id, title: b.title } })),
            },
          },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send interactive buttons', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending interactive buttons');
    }
  },
});

export const whatsappSendInteractiveList = tool({
  description: 'Send a sectioned option menu (up to 10 sections, 10 rows each).',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    toNumber: z.string(),
    bodyText: z.string().describe('max 1024 chars'),
    buttonText: z.string().describe('max 20 chars'),
    sections: z.array(z.record(z.any())).describe('title + rows [{id, title, description}]'),
    headerText: z.string().optional(),
    footerText: z.string().optional(),
    replyToMessageId: z.string().optional(),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    toNumber,
    bodyText,
    buttonText,
    sections,
    headerText,
    footerText,
    replyToMessageId,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/messages`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          to: toNumber,
          type: 'interactive',
          interactive: {
            type: 'list',
            ...(headerText ? { header: { type: 'text', text: headerText } } : {}),
            body: { text: bodyText },
            ...(footerText ? { footer: { text: footerText } } : {}),
            action: { button: buttonText, sections },
          },
          ...(replyToMessageId ? { context: { message_id: replyToMessageId } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to send interactive list', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error sending interactive list');
    }
  },
});
