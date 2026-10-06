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

export const pagerdutyListUsers = tool({
  description: 'List account users with team and role filters.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    query: z.string().optional().describe('Filter by name/email substring'),
    teamIds: z.array(z.string()).optional().describe('Only users on these teams'),
    include: z
      .array(z.string())
      .optional()
      .describe('Embed: contact_methods, notification_rules, teams, escalation_policies'),
    ...pageFields,
  }),
  execute: ({ pagerdutyApiKey, teamIds, ...query }) =>
    pdRequest(pagerdutyApiKey, 'GET', '/users', {
      query: { ...query, team_ids: teamIds },
    }),
});

export const pagerdutyGetCurrentUser = tool({
  description:
    'Get the user owning the API token — useful for resolving the From email for writes.',
  inputSchema: z.object({ pagerdutyApiKey: keyField }),
  execute: ({ pagerdutyApiKey }) => pdRequest(pagerdutyApiKey, 'GET', '/users/me'),
});

export const pagerdutyGetUser = tool({
  description: 'Get one user with contact methods, teams, and notification settings.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    include: z.array(z.string()).optional().describe('Embed related objects'),
  }),
  execute: ({ pagerdutyApiKey, userId, include }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}`, {
      query: { include },
    }),
});

export const pagerdutyCreateUser = tool({
  description: 'Invite/create a user with name, email, role, and time zone.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    name: z.string().describe('Full name'),
    email: z.string().describe('Login email (invitation sent here)'),
    role: z
      .enum([
        'admin',
        'limited_user',
        'observer',
        'owner',
        'read_only_user',
        'responder',
        'restricted_access',
        'user',
      ])
      .optional()
      .describe('Account role'),
    timeZone: z.string().optional().describe('IANA zone, e.g. "America/New_York"'),
    jobTitle: z.string().optional().describe('Job title shown in the UI'),
  }),
  execute: ({ pagerdutyApiKey, name, email, role, timeZone, jobTitle }) =>
    pdRequest(pagerdutyApiKey, 'POST', '/users', {
      body: {
        user: {
          type: 'user',
          name,
          email,
          ...(role ? { role } : {}),
          ...(timeZone ? { time_zone: timeZone } : {}),
          ...(jobTitle ? { job_title: jobTitle } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateUser = tool({
  description: 'Update a user name, role, time zone, or job title.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    name: z.string().optional().describe('New name'),
    email: z.string().optional().describe('New email'),
    role: z.string().optional().describe('New account role'),
    timeZone: z.string().optional().describe('New IANA zone'),
    jobTitle: z.string().optional().describe('New job title'),
  }),
  execute: ({ pagerdutyApiKey, userId, timeZone, jobTitle, ...patch }) =>
    pdRequest(pagerdutyApiKey, 'PUT', `/users/${encodeURIComponent(userId)}`, {
      body: {
        user: {
          type: 'user',
          ...patch,
          ...(timeZone ? { time_zone: timeZone } : {}),
          ...(jobTitle ? { job_title: jobTitle } : {}),
        },
      },
    }),
});

export const pagerdutyDeleteUser = tool({
  description: 'Delete (offboard) a user. Their incidents must be reassigned first.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(pagerdutyApiKey, 'DELETE', `/users/${encodeURIComponent(userId)}`),
});

export const pagerdutyGetUserLicense = tool({
  description: 'Show the license type and allocations for a user.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}/license`),
});

export const pagerdutyListUserContactMethods = tool({
  description: 'List a user contact methods (email, phone, SMS, push).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
  }),
  execute: ({ pagerdutyApiKey, userId }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}/contact_methods`),
});

export const pagerdutyGetUserContactMethod = tool({
  description: 'Get one contact method with its addresses and verification state.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    contactMethodId: z.string().describe('Contact method ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, contactMethodId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/contact_methods/${encodeURIComponent(contactMethodId)}`,
    ),
});

export const pagerdutyCreateUserContactMethod = tool({
  description: 'Add a contact method (email, phone, SMS, push) to a user.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    type: z
      .string()
      .describe(
        'Method type, e.g. "email_contact_method", "phone_contact_method", "sms_contact_method", "push_notification_contact_method"',
      ),
    address: z.string().describe('Email address or E.164 phone number'),
    label: z.string().optional().describe('Label, e.g. "Work", "Mobile"'),
    countryCode: z.number().int().optional().describe('Country dialing code for phone/SMS'),
  }),
  execute: ({ pagerdutyApiKey, userId, type, address, label, countryCode }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/users/${encodeURIComponent(userId)}/contact_methods`, {
      body: {
        contact_method: {
          type,
          address,
          ...(label ? { label } : {}),
          ...(countryCode !== undefined ? { country_code: countryCode } : {}),
        },
      },
    }),
});

export const pagerdutyUpdateUserContactMethod = tool({
  description: 'Update a contact method address, label, or notification flags.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    contactMethodId: z.string().describe('Contact method ID'),
    address: z.string().optional().describe('New address/number'),
    label: z.string().optional().describe('New label'),
    sendShortEmail: z.boolean().optional().describe('Send abbreviated emails here'),
  }),
  execute: ({ pagerdutyApiKey, userId, contactMethodId, address, label, sendShortEmail }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/users/${encodeURIComponent(userId)}/contact_methods/${encodeURIComponent(contactMethodId)}`,
      {
        body: {
          contact_method: {
            ...(address ? { address } : {}),
            ...(label ? { label } : {}),
            ...(sendShortEmail !== undefined ? { send_short_email: sendShortEmail } : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteUserContactMethod = tool({
  description: 'Remove a contact method from a user.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    contactMethodId: z.string().describe('Contact method ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, userId, contactMethodId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/users/${encodeURIComponent(userId)}/contact_methods/${encodeURIComponent(contactMethodId)}`,
    ),
});

export const pagerdutyListUserNotificationRules = tool({
  description: 'List how a user is notified per urgency (contact-method sequence).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    urgency: z.enum(['high', 'low']).optional().describe('Filter by urgency'),
  }),
  execute: ({ pagerdutyApiKey, userId, urgency }) =>
    pdRequest(pagerdutyApiKey, 'GET', `/users/${encodeURIComponent(userId)}/notification_rules`, {
      query: { urgency },
    }),
});

export const pagerdutyGetUserNotificationRule = tool({
  description: 'Get one user notification rule with its contact method and delay.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Notification rule ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'GET',
      `/users/${encodeURIComponent(userId)}/notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});

export const pagerdutyCreateUserNotificationRule = tool({
  description: 'Add a step to a user notification rule chain (contact method + delay).',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    urgency: z.enum(['high', 'low']).describe('Which urgency chain this rule belongs to'),
    contactMethodId: z.string().describe('Contact method ID to notify through'),
    startDelayMinutes: z
      .number()
      .int()
      .min(0)
      .describe('Minutes after incident trigger before notifying'),
  }),
  execute: ({ pagerdutyApiKey, userId, urgency, contactMethodId, startDelayMinutes }) =>
    pdRequest(pagerdutyApiKey, 'POST', `/users/${encodeURIComponent(userId)}/notification_rules`, {
      body: {
        notification_rule: {
          type: 'assignment_notification_rule',
          urgency,
          start_delay_in_minutes: startDelayMinutes,
          contact_method: { id: contactMethodId, type: 'contact_method_reference' },
        },
      },
    }),
});

export const pagerdutyUpdateUserNotificationRule = tool({
  description: 'Change a notification rule delay or contact method.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Notification rule ID'),
    startDelayMinutes: z.number().int().min(0).optional().describe('New delay minutes'),
    contactMethodId: z.string().optional().describe('New contact method ID'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId, startDelayMinutes, contactMethodId }) =>
    pdRequest(
      pagerdutyApiKey,
      'PUT',
      `/users/${encodeURIComponent(userId)}/notification_rules/${encodeURIComponent(ruleId)}`,
      {
        body: {
          notification_rule: {
            ...(startDelayMinutes !== undefined
              ? { start_delay_in_minutes: startDelayMinutes }
              : {}),
            ...(contactMethodId
              ? { contact_method: { id: contactMethodId, type: 'contact_method_reference' } }
              : {}),
          },
        },
      },
    ),
});

export const pagerdutyDeleteUserNotificationRule = tool({
  description: 'Remove a step from a user notification chain.',
  inputSchema: z.object({
    pagerdutyApiKey: keyField,
    userId: z.string().describe('User ID'),
    ruleId: z.string().describe('Notification rule ID to delete'),
  }),
  execute: ({ pagerdutyApiKey, userId, ruleId }) =>
    pdRequest(
      pagerdutyApiKey,
      'DELETE',
      `/users/${encodeURIComponent(userId)}/notification_rules/${encodeURIComponent(ruleId)}`,
    ),
});
