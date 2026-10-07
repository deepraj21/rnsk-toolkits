// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { opsgenieRequest, failedResult, toOpsgenieError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');
const regionField = z.enum(['us', 'eu']).optional().describe('Opsgenie region: us (default) or eu');

export const opsgenieListTeams = tool({
  description: 'List teams with members summary. Use to discover team IDs.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
  }),
  execute: async ({ opsgenieApiKey, region }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/teams', { region });
      if (!result.ok) return failedResult('Failed to list teams', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing teams');
    }
  },
});

export const opsgenieGetTeam = tool({
  description: 'Get one team with description, members, and unit info.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}`, {
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to get team', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting team');
    }
  },
});

export const opsgenieCreateTeam = tool({
  description: 'Create a team with description and members.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    name: z.string().describe('Team name'),
    description: z.string().optional().describe('Team description'),
    members: z
      .array(z.object({ user: z.record(z.string(), z.any()), role: z.string().optional() }))
      .optional()
      .describe('Members [{user: {id|username}, role}]'),
  }),
  execute: async ({ opsgenieApiKey, region, name, description, members }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, '/v2/teams', {
        method: 'POST',
        region,
        body: {
          name,
          ...(description !== undefined ? { description } : {}),
          ...(members !== undefined ? { members } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create team', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating team');
    }
  },
});

export const opsgenieUpdateTeam = tool({
  description: 'Partially update a team (name, description).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
    team: z.record(z.string(), z.any()).describe('Team fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType, team }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}`, {
        method: 'PATCH',
        region,
        query: { identifierType },
        body: team,
      });
      if (!result.ok) return failedResult('Failed to update team', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating team');
    }
  },
});

export const opsgenieDeleteTeam = tool({
  description: 'Delete a team (schedules and escalations stay orphaned — reassign first).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    identifierType: z.enum(['id', 'name']).optional().describe('Identifier type (default id)'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, identifierType }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}`, {
        method: 'DELETE',
        region,
        query: { identifierType },
      });
      if (!result.ok) return failedResult('Failed to delete team', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting team');
    }
  },
});

export const opsgenieListTeamMembers = tool({
  description: 'List members of a team with roles.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}/members`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list team members', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing team members');
    }
  },
});

export const opsgenieAddTeamMember = tool({
  description: 'Add a user to a team with an optional role.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    user: z.record(z.string(), z.any()).describe('User {id} or {username}'),
    role: z.string().optional().describe('Team role name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, user, role }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}/members`, {
        method: 'POST',
        region,
        body: { user, ...(role !== undefined ? { role } : {}) },
      });
      if (!result.ok) return failedResult('Failed to add team member', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error adding team member');
    }
  },
});

export const opsgenieRemoveTeamMember = tool({
  description: 'Remove a user from a team by member ID or username.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    memberIdentifier: z.string().describe('Member ID or username'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, memberIdentifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/members/${memberIdentifier}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to remove team member', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error removing team member');
    }
  },
});

export const opsgenieGetTeamLogs = tool({
  description: 'List team activity logs.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}/logs`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to get team logs', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting team logs');
    }
  },
});

export const opsgenieListTeamRoles = tool({
  description: 'List custom roles of a team.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}/roles`, {
        region,
      });
      if (!result.ok) return failedResult('Failed to list team roles', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing team roles');
    }
  },
});

export const opsgenieCreateTeamRole = tool({
  description: 'Create a team role with rights (grants).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    name: z.string().describe('Role name'),
    rights: z
      .array(z.record(z.string(), z.any()))
      .optional()
      .describe('Rights [{rightName, grants}]'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, name, rights }) => {
    try {
      const result = await opsgenieRequest(opsgenieApiKey, `/v2/teams/${identifier}/roles`, {
        method: 'POST',
        region,
        body: { name, ...(rights !== undefined ? { rights } : {}) },
      });
      if (!result.ok) return failedResult('Failed to create team role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating team role');
    }
  },
});

export const opsgenieGetTeamRole = tool({
  description: 'Get one team role.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    roleIdentifier: z.string().describe('Role ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, roleIdentifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/roles/${roleIdentifier}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get team role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting team role');
    }
  },
});

export const opsgenieUpdateTeamRole = tool({
  description: 'Update a team role name or rights.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    roleIdentifier: z.string().describe('Role ID or name'),
    role: z.record(z.string(), z.any()).describe('Role fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, roleIdentifier, role }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/roles/${roleIdentifier}`,
        { method: 'PATCH', region, body: role },
      );
      if (!result.ok) return failedResult('Failed to update team role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating team role');
    }
  },
});

export const opsgenieDeleteTeamRole = tool({
  description: 'Delete a team role.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    roleIdentifier: z.string().describe('Role ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, roleIdentifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/roles/${roleIdentifier}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete team role', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting team role');
    }
  },
});

export const opsgenieListRoutingRules = tool({
  description: 'List alert routing rules of a team (criteria to route alerts).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules`,
        {
          region,
        },
      );
      if (!result.ok) return failedResult('Failed to list routing rules', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error listing routing rules');
    }
  },
});

export const opsgenieCreateRoutingRule = tool({
  description: 'Create a routing rule: criteria plus notify targets (schedule/user/escalation).',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    name: z.string().describe('Rule name'),
    criteria: z.record(z.string(), z.any()).describe('Match criteria {type, conditions}'),
    notify: z
      .record(z.string(), z.any())
      .describe('Notify target {type: schedule|user|escalation, id|name}'),
    timezone: z.string().optional().describe('IANA timezone for time restrictions'),
    order: z.number().int().optional().describe('Evaluation order'),
    isDefault: z.boolean().optional().describe('Default catch-all rule'),
  }),
  execute: async ({
    opsgenieApiKey,
    region,
    identifier,
    name,
    criteria,
    notify,
    timezone,
    order,
    isDefault,
  }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules`,
        {
          method: 'POST',
          region,
          body: {
            name,
            criteria,
            notify,
            ...(timezone !== undefined ? { timezone } : {}),
            ...(order !== undefined ? { order } : {}),
            ...(isDefault !== undefined ? { isDefault } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create routing rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error creating routing rule');
    }
  },
});

export const opsgenieGetRoutingRule = tool({
  description: 'Get one routing rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules/${ruleId}`,
        { region },
      );
      if (!result.ok) return failedResult('Failed to get routing rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error getting routing rule');
    }
  },
});

export const opsgenieUpdateRoutingRule = tool({
  description: 'Update a routing rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    ruleId: z.string().describe('Rule ID'),
    rule: z.record(z.string(), z.any()).describe('Rule fields to update'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, rule }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules/${ruleId}`,
        { method: 'PATCH', region, body: rule },
      );
      if (!result.ok) return failedResult('Failed to update routing rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error updating routing rule');
    }
  },
});

export const opsgenieDeleteRoutingRule = tool({
  description: 'Delete a routing rule.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    ruleId: z.string().describe('Rule ID'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules/${ruleId}`,
        { method: 'DELETE', region },
      );
      if (!result.ok) return failedResult('Failed to delete routing rule', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error deleting routing rule');
    }
  },
});

export const opsgenieChangeRoutingRuleOrder = tool({
  description: 'Move a routing rule to a new evaluation position.',
  inputSchema: z.object({
    opsgenieApiKey: apiKeyField,
    region: regionField,
    identifier: z.string().describe('Team ID or name'),
    ruleId: z.string().describe('Rule ID'),
    order: z.number().int().min(0).describe('New zero-based order'),
  }),
  execute: async ({ opsgenieApiKey, region, identifier, ruleId, order }) => {
    try {
      const result = await opsgenieRequest(
        opsgenieApiKey,
        `/v2/teams/${identifier}/routing-rules/${ruleId}/change-order`,
        { method: 'POST', region, body: { order } },
      );
      if (!result.ok) return failedResult('Failed to change routing rule order', result);
      return result.data;
    } catch (error) {
      return toOpsgenieError(error, 'Error changing routing rule order');
    }
  },
});
