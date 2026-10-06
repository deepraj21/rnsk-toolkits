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

export const whatsappGetPhoneNumbers = tool({
  description:
    'List registered phone numbers with IDs, quality, and throughput. Start here for IDs.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    wabaId: z.string().optional().describe('WABA ID; defaults to the credentials wabaId'),
    limit: z.number().int().optional().describe('1-100'),
  }),
  execute: async ({ whatsappCredentials, wabaId, limit }) => {
    try {
      const wabaResolved = resolveWabaHelper(
        whatsappCredentials,
        typeof wabaId !== 'undefined' ? wabaId : undefined,
      );
      if (!wabaResolved.id) return wabaResolved.error;
      const wabaIdResolved = wabaResolved.id;
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${wabaIdResolved}/phone_numbers`,
        { method: 'GET', query: { limit } },
      );
      if (!result.ok) return failedResult('Failed to get phone numbers', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting phone numbers');
    }
  },
});

export const whatsappGetPhoneNumber = tool({
  description:
    'Get verification status, quality rating, throughput, and webhook config for a number.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string(),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, fields }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}`, {
        method: 'GET',
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get phone number', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting phone number');
    }
  },
});

export const whatsappRegisterPhone = tool({
  description: 'Register a verified number for Cloud API with a 6-digit two-step PIN.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    pin: z.string().describe('exactly 6 digits'),
    messagingProduct: z.string().optional().describe("default 'whatsapp'"),
    dataLocalizationRegion: z.string().optional().describe('country code'),
    metaStoreRetentionMinutes: z.number().int().optional().describe('60 only'),
    backup: z.record(z.any()).optional().describe('{data, password} for migration'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    pin,
    messagingProduct,
    dataLocalizationRegion,
    metaStoreRetentionMinutes,
    backup,
  }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/register`, {
        method: 'POST',
        body: { pin, messagingProduct, dataLocalizationRegion, metaStoreRetentionMinutes, backup },
      });
      if (!result.ok) return failedResult('Failed to register phone', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error registering phone');
    }
  },
});

export const whatsappDeregisterPhone = tool({
  description:
    'Deregister a number to stop messaging, migrate, or retire it. Re-register to resume.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/deregister`, {
        method: 'POST',
        body: { messaging_product: 'whatsapp' },
      });
      if (!result.ok) return failedResult('Failed to deregister phone', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error deregistering phone');
    }
  },
});

export const whatsappVerifyCode = tool({
  description: 'Submit the 6-digit SMS/voice OTP to verify a number.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    code: z.string().describe('exactly 6 digits'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, code }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/verify_code`, {
        method: 'POST',
        query: { code },
      });
      if (!result.ok) return failedResult('Failed to verify code', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error verifying code');
    }
  },
});

export const whatsappSetTwoStepPin = tool({
  description: 'Set or reset the two-step verification PIN on a registered number.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    pin: z.string().describe('exactly 6 digits'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, pin }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/pin`, {
        method: 'POST',
        body: { pin },
      });
      if (!result.ok) return failedResult('Failed to set two step pin', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error setting two step pin');
    }
  },
});

export const whatsappGetBusinessProfile = tool({
  description: 'Get about, address, email, websites, and vertical for a number.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, fields }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/whatsapp_business_profile`,
        { method: 'GET', query: { fields } },
      );
      if (!result.ok) return failedResult('Failed to get business profile', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting business profile');
    }
  },
});

export const whatsappUpdateBusinessProfile = tool({
  description: 'Update about, address, email, websites, vertical, or profile picture.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    about: z.string().optional().describe('max 139 chars'),
    address: z.string().optional().describe('max 256'),
    description: z.string().optional().describe('max 256'),
    email: z.string().optional().describe('max 128'),
    vertical: z.string().optional().describe('industry code'),
    websites: z.array(z.string()).optional().describe('max 2'),
    messagingProduct: z.string().optional().describe("must be 'whatsapp'"),
    profilePictureHandle: z.string().optional().describe('from upload API'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    about,
    address,
    description,
    email,
    vertical,
    websites,
    messagingProduct,
    profilePictureHandle,
  }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/whatsapp_business_profile`,
        {
          method: 'POST',
          body: {
            about,
            address,
            description,
            email,
            vertical,
            websites,
            messagingProduct,
            profilePictureHandle,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to update business profile', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error updating business profile');
    }
  },
});

export const whatsappBlockUsers = tool({
  description: 'Block up to 100 users who messaged you in the last 24 hours.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    blockUsers: z.array(z.object({ user: z.string() })).describe('each with user phone number'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, blockUsers }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/block_users`, {
        method: 'POST',
        body: {
          messaging_product: 'whatsapp',
          block_users: blockUsers.map((u) => ({ user: u.user.replace(/^\+/, '') })),
        },
      });
      if (!result.ok) return failedResult('Failed to block users', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error blocking users');
    }
  },
});

export const whatsappGetCommerceSettings = tool({
  description: 'Check cart and catalog visibility for a number.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/whatsapp_commerce_settings`,
        { method: 'GET' },
      );
      if (!result.ok) return failedResult('Failed to get commerce settings', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting commerce settings');
    }
  },
});

export const whatsappUpdateCommerceSettings = tool({
  description: 'Enable or disable cart and catalog visibility.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    isCartEnabled: z.boolean().optional(),
    isCatalogVisible: z.boolean().optional(),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, isCartEnabled, isCatalogVisible }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/whatsapp_commerce_settings`,
        { method: 'POST', body: { isCartEnabled, isCatalogVisible } },
      );
      if (!result.ok) return failedResult('Failed to update commerce settings', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error updating commerce settings');
    }
  },
});

export const whatsappGetComplianceInfo = tool({
  description: 'Get entity registration, grievance officer, and customer care details.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, fields }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/business_compliance_info`,
        { method: 'GET', query: { fields } },
      );
      if (!result.ok) return failedResult('Failed to get compliance info', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting compliance info');
    }
  },
});

export const whatsappGetEncryption = tool({
  description: 'Get the end-to-end encryption public key and signature status.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    fields: z
      .string()
      .optional()
      .describe("default 'business_public_key,business_public_key_signature_status'"),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, fields }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/encryption`, {
        method: 'GET',
        query: { fields },
      });
      if (!result.ok) return failedResult('Failed to get encryption', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting encryption');
    }
  },
});

export const whatsappGetSettings = tool({
  description: 'Get calling, storage, and payload encryption settings.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    includeSipCredentials: z.boolean().optional().describe('needs extra permission'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, includeSipCredentials }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/settings`, {
        method: 'GET',
        query: { includeSipCredentials },
      });
      if (!result.ok) return failedResult('Failed to get settings', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting settings');
    }
  },
});

export const whatsappUpdateSettings = tool({
  description: 'Update exactly one setting group: calling, encryption, storage, or identity check.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    calling: z
      .record(z.any())
      .optional()
      .describe('{status, call_icon_visibility, callback_permission_status}'),
    payloadEncryption: z.record(z.any()).optional().describe('{status, cloud_encryption_key}'),
    storageConfiguration: z
      .record(z.any())
      .optional()
      .describe('{status, data_localization_region}'),
    userIdentityChange: z.record(z.any()).optional().describe('{enable_identity_key_check}'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    calling,
    payloadEncryption,
    storageConfiguration,
    userIdentityChange,
  }) => {
    try {
      const provided = [
        calling,
        payloadEncryption,
        storageConfiguration,
        userIdentityChange,
      ].filter((v) => v !== undefined);
      if (provided.length !== 1)
        return {
          error:
            'Update exactly one setting group per request: calling, payloadEncryption, storageConfiguration, or userIdentityChange.',
        };
      const body: Record<string, any> = {};
      if (calling) body.calling = calling;
      if (payloadEncryption) body.payload_encryption = payloadEncryption;
      if (storageConfiguration) body.storage_configuration = storageConfiguration;
      if (userIdentityChange) body.user_identity_change = userIdentityChange;
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/settings`, {
        method: 'POST',
        body,
      });
      if (!result.ok) return failedResult('Failed to update settings', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error updating settings');
    }
  },
});

export const whatsappConfigureAutomation = tool({
  description: 'Set welcome messages, ice-breaker prompts, and bot commands.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    enableWelcomeMessage: z.boolean().optional(),
    prompts: z.array(z.string()).optional().describe('max 3, 1-80 chars each'),
    commands: z
      .array(z.object({ command_name: z.string(), command_description: z.string() }))
      .optional()
      .describe('max 30 {command_name, command_description}'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    enableWelcomeMessage,
    prompts,
    commands,
  }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/conversational_automation`,
        { method: 'POST', body: { enableWelcomeMessage, prompts, commands } },
      );
      if (!result.ok) return failedResult('Failed to configure automation', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error configuring automation');
    }
  },
});

export const whatsappGetMessageHistory = tool({
  description: 'Track delivery status events per message with pagination.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    messageId: z.string().optional().describe('filter by wamid'),
    fields: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    after: z.string().optional().describe('cursor'),
    before: z.string().optional().describe('cursor'),
  }),
  execute: async ({
    whatsappCredentials,
    phoneNumberId,
    messageId,
    fields,
    limit,
    after,
    before,
  }) => {
    try {
      const result = await whatsappRequest(
        whatsappCredentials,
        `/${phoneNumberId}/message_history`,
        { method: 'GET', query: { messageId, fields, limit, after, before } },
      );
      if (!result.ok) return failedResult('Failed to get message history', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting message history');
    }
  },
});

export const whatsappCreateQrCode = tool({
  description: 'Create a scannable QR code with a prefilled greeting, optionally as PNG/SVG.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    prefilledMessage: z.string(),
    generateQrImage: z.string().optional().describe('PNG or SVG'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, prefilledMessage, generateQrImage }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/message_qrdls`, {
        method: 'POST',
        body: { prefilledMessage, generateQrImage },
      });
      if (!result.ok) return failedResult('Failed to create qr code', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error creating qr code');
    }
  },
});

export const whatsappListQrCodes = tool({
  description: 'List message QR codes with pagination and optional code filter.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    code: z.string().optional().describe('filter by code'),
    after: z.string().optional(),
    limit: z.number().int().optional().describe('max 100'),
    before: z.string().optional(),
    fields: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, code, after, limit, before, fields }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/message_qrdls`, {
        method: 'GET',
        query: { code, after, limit, before, fields },
      });
      if (!result.ok) return failedResult('Failed to list qr codes', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error listing qr codes');
    }
  },
});

export const whatsappDeleteQrCode = tool({
  description: 'Permanently delete a QR code. Irreversible.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    qrCodeId: z.string().describe('14-char code'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, qrCodeId }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/message_qrdls`, {
        method: 'DELETE',
        query: { code: qrCodeId },
      });
      if (!result.ok) return failedResult('Failed to delete qr code', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error deleting qr code');
    }
  },
});

export const whatsappListGroups = tool({
  description: 'List groups a business number belongs to. Official Business Accounts only.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    phoneNumberId: z.string().describe('Meta phone number ID (from whatsappGetPhoneNumbers)'),
    limit: z.number().int().optional().describe('max 1024'),
    after: z.string().optional().describe('cursor'),
    before: z.string().optional().describe('cursor'),
  }),
  execute: async ({ whatsappCredentials, phoneNumberId, limit, after, before }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${phoneNumberId}/groups`, {
        method: 'GET',
        query: { limit, after, before },
      });
      if (!result.ok) return failedResult('Failed to list groups', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error listing groups');
    }
  },
});

export const whatsappGetJoinRequests = tool({
  description: 'List pending group join requests for moderation.',
  inputSchema: z.object({
    whatsappCredentials: z
      .string()
      .describe('WhatsApp credentials JSON with accessToken, optional wabaId and apiVersion'),
    groupId: z.string(),
    limit: z.number().int().optional().describe('max 100'),
    after: z.string().optional(),
    before: z.string().optional(),
  }),
  execute: async ({ whatsappCredentials, groupId, limit, after, before }) => {
    try {
      const result = await whatsappRequest(whatsappCredentials, `/${groupId}/join_requests`, {
        method: 'GET',
        query: { limit, after, before },
      });
      if (!result.ok) return failedResult('Failed to get join requests', result);
      return result.data;
    } catch (error) {
      return toWhatsAppError(error, 'Error getting join requests');
    }
  },
});
