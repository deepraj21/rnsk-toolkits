// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pdRequest } from './client.js';

const keyField = z
  .string()
  .optional()
  .describe('Injected PagerDuty REST API token — match manifest tokenField');
const pageFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Pagination offset'),
  total: z.boolean().optional().describe('Populate the total count (slower)'),
};

export const pagerdutyListHandoffNotificationRules = tool({
  description: 'List a user on-call handoff notification rules.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/oncall_handoff_notification_rules`,
    ),
});

export const pagerdutyCreateHandoffNotificationRule = tool({
  description: 'Notify a user when an on-call handoff occurs on selected policies.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    contactMethodId: z.string().describe('Contact method ID to notify through'),
    handoffType: z
      .enum(['both', 'oncall', 'offcall'])
      .optional()
      .describe('Notify on going on-call, off-call, or both'),
    escalationPolicyIds: z
      .array(z.string())
      .optional()
      .describe('Scope to these policies (omit for all)'),
  }),
  execute: ({ pagerdutyApiKey, userId, contactMethodId, handoffType, escalationPolicyIds }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/users/${encodeURIComponent(userId)}/oncall_handoff_notification_rules`,
      {
        body: {
          oncall_handoff_notification_rule: {
            type: 'oncall_handoff_notification_rule',
            contact_method: { id: contactMethodId, type: 'contact_method_reference' },
            ...(handoffType ? { handoff_type: handoffType } : {}),
            ...(escalationPolicyIds
              ? {
                  escalation_policies: escalationPolicyIds.map((id) => ({
                    id,
                    type: 'escalation_policy_reference',
                  })),
                }
              : {}),
          },
        },
      },
    ),
});

export const pagerdutyGetHandoffNotificationRule = tool({
  description: 'Get one on-call handoff notification rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/oncall_handoff_notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyUpdateHandoffNotificationRule = tool({
  description: 'Update an on-call handoff notification rule contact method or scope.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID'),
    contactMethodId: z.string().optional().describe('New contact method ID'),
    handoffType: z.enum(['both', 'oncall', 'offcall']).optional().describe('New handoff type'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId, contactMethodId, handoffType }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/users/${encodeURIComponent(userId)}/oncall_handoff_notification_rules/${encodeURIComponent(ruleId)}`,
      {
        body: {
          oncall_handoff_notification_rule: {
            ...(contactMethodId
              ? { contact_method: { id: contactMethodId, type: 'contact_method_reference' } }
              : {}),
            ...(handoffType ? { handoff_type: handoffType } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteHandoffNotificationRule = tool({
  description: 'Delete an on-call handoff notification rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/users/${encodeURIComponent(userId)}/oncall_handoff_notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyListUserStatusUpdateRules = tool({
  description: 'List a user incident status-update notification rules.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/status_update_notification_rules`,
    ),
});

export const pagerdutyCreateUserStatusUpdateRule = tool({
  description: 'Add an incident status-update notification rule for a user.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    contactMethodId: z.string().describe('Contact method ID to notify through'),
  }),
  execute: ({ pagerdutyApiKey, userId, contactMethodId }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/users/${encodeURIComponent(userId)}/status_update_notification_rules`,
      {
        body: {
          status_update_notification_rule: {
            type: 'status_update_notification_rule',
            contact_method: { id: contactMethodId, type: 'contact_method_reference' },
          },
        },
      },
    ),
});

export const pagerdutyGetUserStatusUpdateRule = tool({
  description: 'Get one user status-update notification rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/status_update_notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyUpdateUserStatusUpdateRule = tool({
  description: 'Change the contact method of a status-update notification rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID'),
    contactMethodId: z.string().describe('New contact method ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId, contactMethodId }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/users/${encodeURIComponent(userId)}/status_update_notification_rules/${encodeURIComponent(ruleId)}`,
      {
        body: {
          status_update_notification_rule: {
            contact_method: { id: contactMethodId, type: 'contact_method_reference' },
          },
        },
      },
    ),
});

export const pagerdutyDeleteUserStatusUpdateRule = tool({
  description: 'Delete a user status-update notification rule.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Rule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/users/${encodeURIComponent(userId)}/status_update_notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyListUserSessions = tool({
  description: 'List active sessions for a user (SSO/mobile) for security review.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}/sessions`),
});

export const pagerdutyDeleteUserSession = tool({
  description: 'Revoke one user session by type and ID.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    sessionType: z.string().describe('Session type, e.g. "sso"'),
    sessionId: z.string().describe('Session ID to revoke'),
  }),
  execute: ({ pagerdutyApiKey, userId, sessionType, sessionId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/users/${encodeURIComponent(userId)}/sessions/${encodeURIComponent(sessionType)}/${encodeURIComponent(sessionId)}`,
    ),
});

export const pagerdutyListUserNotificationSubscriptions = tool({
  description: 'List what a user is subscribed to for notifications.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, userId, ...query }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/notification_subscriptions`,
      {
        query,
      },
    ),
});

export const pagerdutyCreateUserNotificationSubscription = tool({
  description: 'Subscribe a user to notifications for a service, team, or incident.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    subscribableId: z.string().describe('Service, team, or incident ID'),
    subscribableType: z.enum(['service', 'team', 'incident']).describe('Subscribed object type'),
  }),
  execute: ({ pagerdutyApiKey, userId, subscribableId, subscribableType }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/users/${encodeURIComponent(userId)}/notification_subscriptions`,
      {
        body: { subscribable: { id: subscribableId, type: `${subscribableType}_reference` } },
      },
    ),
});

export const pagerdutyUnsubscribeUserNotifications = tool({
  description: 'Unsubscribe a user from notification subscriptions.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    subscribables: z
      .array(z.object({ id: z.string(), type: z.string() }).passthrough())
      .min(1)
      .describe('Subscriptions to remove [{id, type}]'),
  }),
  execute: ({ pagerdutyApiKey, userId, subscribables }) =>
    pdRequest(
      pagerdutyApiKey,
      'POST',
      `/users/${encodeURIComponent(userId)}/notification_subscriptions/unsubscribe`,
      { body: { subscribables } },
    ),
});

export const pagerdutyGetUserAuditRecords = tool({
  description: 'Audit history of changes to a user.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    since: z.string().optional().describe('ISO-8601 start'),
    until: z.string().optional().describe('ISO-8601 end'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, userId, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}/audit/records`, {
      query,
    }),
});
