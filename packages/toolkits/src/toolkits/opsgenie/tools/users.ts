// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { opsgenieRequest, failedResult, toOpsgenieError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const regionField = z.enum(['us', 'eu']).optional().describe('Opsgenie region: us (default) or eu');

export const opsgenieListUsers = tool({
  description: 'List users with roles and details.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/users', { region });
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing users');
    }
  },
});

export const opsgenieGetUser = tool({
  description: 'Get one user by ID or username with role and time zone.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}`, { region });
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting user');
    }
  },
});

export const opsgenieCreateUser = tool({
  description: 'Invite/create a user (username, full name, role, timezone, tags).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    username: z.string().describe('Email username'),
    fullName: z.string().describe('Full name'),
    role: z.record(z.string(), z.any()).describe('Role {id} or {name}, e.g. User'),
    timezone: z.string().optional().describe('IANA timezone'),
    tags: z.array(z.string()).optional().describe('User tags'),
    details: z.record(z.string(), z.string()).optional().describe('Custom details'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    username,
    fullName,
    role,
    timezone,
    tags,
    details,
  }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/users', {
        method: 'POST',
        region,
        body: {
          username,
          fullName,
          role,
          ...(timezone !== undefined ? { timezone } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(details !== undefined ? { details } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating user');
    }
  },
});

export const opsgenieUpdateUser = tool({
  description: 'Partially update a user (name, role, timezone, tags).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    user: z.record(z.string(), z.any()).describe('User fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, user }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}`, {
        method: 'PATCH',
        region,
        body: user,
      });
      if (!result.ok) return failedResult('Failed to update user', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating user');
    }
  },
});

export const opsgenieDeleteUser = tool({
  description: 'Delete a user.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting user');
    }
  },
});

export const opsgenieListUserEscalations = tool({
  description: 'List escalations a user participates in.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}/escalations`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list user escalations', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing user escalations');
    }
  },
});

export const opsgenieListUserTeams = tool({
  description: 'List teams a user belongs to.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}/teams`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list user teams', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing user teams');
    }
  },
});

export const opsgenieListUserSchedules = tool({
  description: 'List schedules a user participates in.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}/schedules`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list user schedules', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing user schedules');
    }
  },
});

export const opsgenieListContacts = tool({
  description: 'List contact methods (email, SMS, voice, mobile) of a user.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}/contacts`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list contacts', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing contacts');
    }
  },
});

export const opsgenieCreateContact = tool({
  description: 'Add a contact method (email/SMS/voice) to a user.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    method: z.string().describe('Contact method: email, sms, voice, mobile'),
    to: z.string().describe('Address or phone number'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, method, to }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/users/${identifier}/contacts`, {
        method: 'POST',
        region,
        body: { method, to },
      });
      if (!result.ok) return failedResult('Failed to create contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating contact');
    }
  },
});

export const opsgenieGetContact = tool({
  description: 'Get one contact method with enabled state.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, contactId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/contacts/${contactId}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting contact');
    }
  },
});

export const opsgenieUpdateContact = tool({
  description: 'Update a contact method (address, enabled state).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    contactId: z.string().describe('Contact ID'),
    contact: z.record(z.string(), z.any()).describe('Contact fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, contactId, contact }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/contacts/${contactId}`,
        { method: 'PATCH', region, body: contact },
      );
      if (!result.ok) return failedResult('Failed to update contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating contact');
    }
  },
});

export const opsgenieDeleteContact = tool({
  description: 'Delete a contact method.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, contactId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/contacts/${contactId}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting contact');
    }
  },
});

export const opsgenieEnableContact = tool({
  description: 'Enable a contact method for notifications.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, contactId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/contacts/${contactId}/enable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to enable contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling contact');
    }
  },
});

export const opsgenieDisableContact = tool({
  description: 'Disable a contact method (stops notifications there).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    contactId: z.string().describe('Contact ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, contactId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/contacts/${contactId}/disable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to disable contact', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling contact');
    }
  },
});

export const opsgenieListNotificationRules = tool({
  description: 'List notification rules (contact routing per schedule) of a user.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to list notification rules', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing notification rules');
    }
  },
});

export const opsgenieCreateNotificationRule = tool({
  description: 'Create a notification rule (action, schedules, steps placeholder).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    rule: z
      .record(z.string(), z.any())
      .describe(
        'Rule: actionType, criteriaType, schedules [{type, id|name}], steps [{contact, sendAfter}]',
      ),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, rule }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules`,
        { method: 'POST', region, body: rule },
      );
      if (!result.ok) return failedResult('Failed to create notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating notification rule');
    }
  },
});

export const opsgenieGetNotificationRule = tool({
  description: 'Get one notification rule with steps.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting notification rule');
    }
  },
});

export const opsgenieUpdateNotificationRule = tool({
  description: 'Update a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    rule: z.record(z.string(), z.any()).describe('Rule fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, rule }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}`,
        { method: 'PATCH', region, body: rule },
      );
      if (!result.ok) return failedResult('Failed to update notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating notification rule');
    }
  },
});

export const opsgenieDeleteNotificationRule = tool({
  description: 'Delete a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting notification rule');
    }
  },
});

export const opsgenieEnableNotificationRule = tool({
  description: 'Enable a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/enable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to enable notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling notification rule');
    }
  },
});

export const opsgenieDisableNotificationRule = tool({
  description: 'Disable a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/disable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to disable notification rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling notification rule');
    }
  },
});

export const opsgenieChangeNotificationRuleOrder = tool({
  description: 'Move a notification rule to a new evaluation position.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    order: z.number().int().min(0).describe('New zero-based order'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, order }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/change-order`,
        { method: 'POST', region, body: { order } },
      );
      if (!result.ok) return failedResult('Failed to change notification rule order', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error changing notification rule order');
    }
  },
});

export const opsgenieListNotificationRuleSteps = tool({
  description: 'List steps (contact + delay) of a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to list notification rule steps', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing notification rule steps');
    }
  },
});

export const opsgenieCreateNotificationRuleStep = tool({
  description: 'Add a step (contact method + delay) to a notification rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    step: z
      .record(z.string(), z.any())
      .describe('Step: contact {method, to}, sendAfter {timeAmount, timeUnit}'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, step }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps`,
        { method: 'POST', region, body: step },
      );
      if (!result.ok) return failedResult('Failed to create notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating notification rule step');
    }
  },
});

export const opsgenieGetNotificationRuleStep = tool({
  description: 'Get one notification rule step.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    stepId: z.string().describe('Step ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, stepId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps/${stepId}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting notification rule step');
    }
  },
});

export const opsgenieUpdateNotificationRuleStep = tool({
  description: 'Update a notification rule step.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    stepId: z.string().describe('Step ID'),
    step: z.record(z.string(), z.any()).describe('Step fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, stepId, step }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps/${stepId}`,
        { method: 'PATCH', region, body: step },
      );
      if (!result.ok) return failedResult('Failed to update notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating notification rule step');
    }
  },
});

export const opsgenieDeleteNotificationRuleStep = tool({
  description: 'Delete a notification rule step.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    stepId: z.string().describe('Step ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, stepId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps/${stepId}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting notification rule step');
    }
  },
});

export const opsgenieEnableNotificationRuleStep = tool({
  description: 'Enable a notification rule step.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    stepId: z.string().describe('Step ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, stepId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps/${stepId}/enable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to enable notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error enabling notification rule step');
    }
  },
});

export const opsgenieDisableNotificationRuleStep = tool({
  description: 'Disable a notification rule step.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('User ID or username'),
    ruleId: z.string().describe('Rule ID'),
    stepId: z.string().describe('Step ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, stepId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/users/${identifier}/notification-rules/${ruleId}/steps/${stepId}/disable`,
        { method: 'POST', region },
      );
      if (!result.ok) return failedResult('Failed to disable notification rule step', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error disabling notification rule step');
    }
  },
});

export const opsgenieListCustomRoles = tool({
  description: 'List custom user roles.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/roles', { region });
      if (!result.ok) return failedResult('Failed to list custom roles', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing custom roles');
    }
  },
});

export const opsgenieCreateCustomRole = tool({
  description: 'Create a custom role with granted rights.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Role name'),
    grantedRights: z.array(z.string()).optional().describe('Granted right names'),
  }),
  execute: async ({ opsgenieApiKey, region, name, grantedRights }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/roles', {
        method: 'POST',
        region,
        body: { name, ...(grantedRights !== undefined ? { grantedRights } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create custom role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating custom role');
    }
  },
});

export const opsgenieGetCustomRole = tool({
  description: 'Get one custom role.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Role ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/roles/${identifier}`, { region });
      if (!result.ok) return failedResult('Failed to get custom role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting custom role');
    }
  },
});

export const opsgenieUpdateCustomRole = tool({
  description: 'Update a custom role (name, rights).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Role ID or name'),
    role: z.record(z.string(), z.any()).describe('Role fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, role }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/roles/${identifier}`, {
        method: 'PUT',
        region,
        body: role,
      });
      if (!result.ok) return failedResult('Failed to update custom role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating custom role');
    }
  },
});

export const opsgenieDeleteCustomRole = tool({
  description: 'Delete a custom role.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Role ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/roles/${identifier}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete custom role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting custom role');
    }
  },
});

export const opsgenieListForwardingRules = tool({
  description: 'List alert forwarding rules to other accounts.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/forwarding-rules', { region });
      if (!result.ok) return failedResult('Failed to list forwarding rules', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing forwarding rules');
    }
  },
});

export const opsgenieCreateForwardingRule = tool({
  description: 'Create a forwarding rule (from team/conditions to another account).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    rule: z
      .record(z.string(), z.any())
      .describe('Rule: fromTeam {id|name}, filter, toAccount, toTeam'),
  }),
  execute: async ({ opsgenieApiKey, region, rule }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/forwarding-rules', {
        method: 'POST',
        region,
        body: rule,
      });
      if (!result.ok) return failedResult('Failed to create forwarding rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating forwarding rule');
    }
  },
});

export const opsgenieGetForwardingRule = tool({
  description: 'Get one forwarding rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/forwarding-rules/${identifier}`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get forwarding rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting forwarding rule');
    }
  },
});

export const opsgenieUpdateForwardingRule = tool({
  description: 'Update a forwarding rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Rule ID'),
    rule: z.record(z.string(), z.any()).describe('Rule fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, rule }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/forwarding-rules/${identifier}`, {
        method: 'PUT',
        region,
        body: rule,
      });
      if (!result.ok) return failedResult('Failed to update forwarding rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating forwarding rule');
    }
  },
});

export const opsgenieDeleteForwardingRule = tool({
  description: 'Delete a forwarding rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/forwarding-rules/${identifier}`, {
        method: 'DELETE',
        region,
      });
      if (!result.ok) return failedResult('Failed to delete forwarding rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting forwarding rule');
    }
  },
});
