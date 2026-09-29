// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { fbRequest, getProjectId } from './client.js';

const BASE = 'https://fcm.googleapis.com/v1';
const cred = () => z.string().describe('Firebase credentials JSON (projectId, serviceAccountKey)');

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

export const firebaseSendMessage = tool({
  description:
    'Send an FCM push notification or data message to a device token, topic, or condition.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    token: z
      .string()
      .optional()
      .describe('Device registration token (one of token, topic, condition required)'),
    topic: z.string().optional().describe('Topic name without /topics/ prefix'),
    condition: z
      .string()
      .optional()
      .describe("Topic condition, e.g. \"'sports' in topics || 'news' in topics\""),
    title: z.string().optional().describe('Notification title'),
    body: z.string().optional().describe('Notification body'),
    image: z.string().optional().describe('Notification image URL'),
    data: z
      .record(z.string())
      .optional()
      .describe('String key-value data payload (max 4096 bytes total)'),
    android: z
      .record(z.any())
      .optional()
      .describe('Android-specific overrides (priority, ttl, notification.*)'),
    apns: z.record(z.any()).optional().describe('APNs-specific overrides (headers, payload)'),
    webpush: z
      .record(z.any())
      .optional()
      .describe('Webpush-specific overrides (headers, notification)'),
    validateOnly: z.boolean().optional().describe('Validate without delivering'),
  }),
  execute: async ({
    firebaseCredentials,
    token,
    topic,
    condition,
    title,
    body,
    image,
    data,
    android,
    apns,
    webpush,
    validateOnly,
  }) => {
    try {
      if (!token && !topic && !condition) {
        return { error: 'Provide one of token, topic, or condition' };
      }
      const message: Record<string, any> = {};
      if (token) message.token = token;
      if (topic) message.topic = topic.replace(/^\/topics\//, '');
      if (condition) message.condition = condition;
      if (title || body || image) {
        message.notification = {};
        if (title) message.notification.title = title;
        if (body) message.notification.body = body;
        if (image) message.notification.image = image;
      }
      if (data) message.data = data;
      if (android) message.android = android;
      if (apns) message.apns = apns;
      if (webpush) message.webpush = webpush;
      const pid = getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/messages:send`, {
        method: 'POST',
        body: { message, validateOnly },
      });
    } catch (error) {
      return err('Failed to send FCM message', error);
    }
  },
});
