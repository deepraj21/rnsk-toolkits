// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zendeskRequest, failedResult, toZendeskError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Zendesk credentials JSON with subdomain, plus email+apiToken (API token) or accessToken (OAuth)',
  );

export const zendeskListViews = tool({
  description: 'List shared and personal views available to the user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    active: z.boolean().optional().describe('Only active views'),
  }),
  execute: async ({ zendeskCredentials, active }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/views.json', {
        query: { active: active === true ? true : undefined },
      });
      if (!result.ok) return failedResult('Failed to list views', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing views');
    }
  },
});

export const zendeskListActiveViews = tool({
  description: 'List active views in compact form.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/views/active.json');
      if (!result.ok) return failedResult('Failed to list active views', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing active views');
    }
  },
});

export const zendeskGetView = tool({
  description: 'Get one view with conditions and execution settings.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    viewId: z.number().int().describe('View ID'),
  }),
  execute: async ({ zendeskCredentials, viewId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/views/${viewId}.json`);
      if (!result.ok) return failedResult('Failed to get view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting view');
    }
  },
});

export const zendeskCreateView = tool({
  description: 'Create a view (title, conditions, execution columns, restriction).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    view: z
      .record(z.string(), z.any())
      .describe(
        'View: title, conditions {all[], any[]}, execution {group_by, sort_by, columns}, restriction, active',
      ),
  }),
  execute: async ({ zendeskCredentials, view }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/views.json', {
        method: 'POST',
        body: { view },
      });
      if (!result.ok) return failedResult('Failed to create view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating view');
    }
  },
});

export const zendeskUpdateView = tool({
  description: 'Update a view (conditions, columns, restriction).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    viewId: z.number().int().describe('View ID'),
    view: z.record(z.string(), z.any()).describe('View attributes to update'),
  }),
  execute: async ({ zendeskCredentials, viewId, view }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/views/${viewId}.json`, {
        method: 'PUT',
        body: { view },
      });
      if (!result.ok) return failedResult('Failed to update view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating view');
    }
  },
});

export const zendeskDeleteView = tool({
  description: 'Delete a view.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    viewId: z.number().int().describe('View ID'),
  }),
  execute: async ({ zendeskCredentials, viewId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/views/${viewId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting view');
    }
  },
});

export const zendeskExecuteView = tool({
  description: 'Run a view and return matching tickets (rate-limited per view per agent).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    viewId: z.number().int().describe('View ID'),
    perPage: z.number().int().min(1).max(100).optional().describe('Tickets per page'),
    page: z.number().int().min(1).optional().describe('Page number'),
  }),
  execute: async ({ zendeskCredentials, viewId, perPage, page }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/views/${viewId}/execute.json`, {
        query: { per_page: perPage, page },
      });
      if (!result.ok) return failedResult('Failed to execute view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error executing view');
    }
  },
});

export const zendeskPreviewView = tool({
  description: 'Preview view results from ad-hoc conditions without saving the view.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    view: z.record(z.string(), z.any()).describe('View conditions to preview'),
  }),
  execute: async ({ zendeskCredentials, view }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/views/preview.json', {
        method: 'POST',
        body: { view },
      });
      if (!result.ok) return failedResult('Failed to preview view', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error previewing view');
    }
  },
});

export const zendeskCountViews = tool({
  description: 'Count matching tickets across multiple views in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    viewIds: z.array(z.number().int()).min(1).describe('View IDs'),
  }),
  execute: async ({ zendeskCredentials, viewIds }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/views/count_many.json', {
        method: 'POST',
        body: { view_ids: viewIds },
      });
      if (!result.ok) return failedResult('Failed to count views', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error counting views');
    }
  },
});

export const zendeskListMacros = tool({
  description: 'List macros available to the user. Use to find canned responses.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    active: z.boolean().optional().describe('Only active macros'),
  }),
  execute: async ({ zendeskCredentials, active }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/macros.json', {
        query: { active: active === true ? true : undefined },
      });
      if (!result.ok) return failedResult('Failed to list macros', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing macros');
    }
  },
});

export const zendeskGetMacro = tool({
  description: 'Get one macro with actions and restrictions.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    macroId: z.number().int().describe('Macro ID'),
  }),
  execute: async ({ zendeskCredentials, macroId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/macros/${macroId}.json`);
      if (!result.ok) return failedResult('Failed to get macro', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting macro');
    }
  },
});

export const zendeskCreateMacro = tool({
  description: 'Create a macro: title, actions (field/value pairs), restriction, active flag.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    macro: z
      .record(z.string(), z.any())
      .describe('Macro: title, actions [{field, value}], description, restriction, active'),
  }),
  execute: async ({ zendeskCredentials, macro }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/macros.json', {
        method: 'POST',
        body: { macro },
      });
      if (!result.ok) return failedResult('Failed to create macro', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating macro');
    }
  },
});

export const zendeskUpdateMacro = tool({
  description: 'Update a macro (actions, title, restriction, active).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    macroId: z.number().int().describe('Macro ID'),
    macro: z.record(z.string(), z.any()).describe('Macro attributes to update'),
  }),
  execute: async ({ zendeskCredentials, macroId, macro }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/macros/${macroId}.json`, {
        method: 'PUT',
        body: { macro },
      });
      if (!result.ok) return failedResult('Failed to update macro', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating macro');
    }
  },
});

export const zendeskDeleteMacro = tool({
  description: 'Delete a macro.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    macroId: z.number().int().describe('Macro ID'),
  }),
  execute: async ({ zendeskCredentials, macroId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/macros/${macroId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete macro', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting macro');
    }
  },
});

export const zendeskApplyMacro = tool({
  description: 'Apply a macro to a ticket and preview the resulting changes.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    macroId: z.number().int().describe('Macro ID'),
    ticketId: z.number().int().describe('Ticket ID'),
  }),
  execute: async ({ zendeskCredentials, macroId, ticketId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/macros/${macroId}/apply.json`, {
        method: 'POST',
        query: { ticket_id: ticketId },
      });
      if (!result.ok) return failedResult('Failed to apply macro', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error applying macro');
    }
  },
});

export const zendeskListMacroCategories = tool({
  description: 'List macro categories for organizing macros.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/macros/categories.json');
      if (!result.ok) return failedResult('Failed to list macro categories', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing macro categories');
    }
  },
});

export const zendeskListTriggers = tool({
  description: 'List triggers with optional active/category filters.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    active: z.boolean().optional().describe('Only active triggers'),
    categoryId: z.number().int().optional().describe('Filter by category'),
  }),
  execute: async ({ zendeskCredentials, active, categoryId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/triggers.json', {
        query: { active: active === true ? true : undefined, category_id: categoryId },
      });
      if (!result.ok) return failedResult('Failed to list triggers', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing triggers');
    }
  },
});

export const zendeskGetTrigger = tool({
  description: 'Get one trigger with conditions and actions.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    triggerId: z.number().int().describe('Trigger ID'),
  }),
  execute: async ({ zendeskCredentials, triggerId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/triggers/${triggerId}.json`);
      if (!result.ok) return failedResult('Failed to get trigger', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting trigger');
    }
  },
});

export const zendeskCreateTrigger = tool({
  description: 'Create a trigger: title, conditions (all/any), actions, position, active.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    trigger: z
      .record(z.string(), z.any())
      .describe(
        'Trigger: title, conditions {all[], any[]}, actions [{field, value}], position, active, category_id',
      ),
  }),
  execute: async ({ zendeskCredentials, trigger }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/triggers.json', {
        method: 'POST',
        body: { trigger },
      });
      if (!result.ok) return failedResult('Failed to create trigger', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating trigger');
    }
  },
});

export const zendeskUpdateTrigger = tool({
  description: 'Update a trigger (conditions, actions, active).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    triggerId: z.number().int().describe('Trigger ID'),
    trigger: z.record(z.string(), z.any()).describe('Trigger attributes to update'),
  }),
  execute: async ({ zendeskCredentials, triggerId, trigger }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/triggers/${triggerId}.json`, {
        method: 'PUT',
        body: { trigger },
      });
      if (!result.ok) return failedResult('Failed to update trigger', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating trigger');
    }
  },
});

export const zendeskDeleteTrigger = tool({
  description: 'Delete a trigger.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    triggerId: z.number().int().describe('Trigger ID'),
  }),
  execute: async ({ zendeskCredentials, triggerId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/triggers/${triggerId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete trigger', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting trigger');
    }
  },
});

export const zendeskReorderTriggers = tool({
  description: 'Reorder triggers by ID list (evaluation order matters).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    triggerIds: z.array(z.number().int()).min(1).describe('Trigger IDs in desired order'),
  }),
  execute: async ({ zendeskCredentials, triggerIds }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/triggers/reorder.json', {
        method: 'PUT',
        body: { trigger_ids: triggerIds },
      });
      if (!result.ok) return failedResult('Failed to reorder triggers', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error reordering triggers');
    }
  },
});

export const zendeskGetTriggerDefinitions = tool({
  description: 'Get trigger condition/action field definitions. Use to build valid triggers.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/triggers/definitions.json');
      if (!result.ok) return failedResult('Failed to get trigger definitions', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting trigger definitions');
    }
  },
});

export const zendeskListAutomations = tool({
  description: 'List time-based automations with optional active filter.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    active: z.boolean().optional().describe('Only active automations'),
  }),
  execute: async ({ zendeskCredentials, active }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/automations.json', {
        query: { active: active === true ? true : undefined },
      });
      if (!result.ok) return failedResult('Failed to list automations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing automations');
    }
  },
});

export const zendeskGetAutomation = tool({
  description: 'Get one automation with conditions and actions.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    automationId: z.number().int().describe('Automation ID'),
  }),
  execute: async ({ zendeskCredentials, automationId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/automations/${automationId}.json`);
      if (!result.ok) return failedResult('Failed to get automation', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting automation');
    }
  },
});

export const zendeskCreateAutomation = tool({
  description: 'Create a time-based automation (conditions, actions, position, active).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    automation: z
      .record(z.string(), z.any())
      .describe(
        'Automation: title, conditions {all[], any[]}, actions [{field, value}], position, active',
      ),
  }),
  execute: async ({ zendeskCredentials, automation }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/automations.json', {
        method: 'POST',
        body: { automation },
      });
      if (!result.ok) return failedResult('Failed to create automation', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating automation');
    }
  },
});

export const zendeskUpdateAutomation = tool({
  description: 'Update an automation (conditions, actions, active).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    automationId: z.number().int().describe('Automation ID'),
    automation: z.record(z.string(), z.any()).describe('Automation attributes to update'),
  }),
  execute: async ({ zendeskCredentials, automationId, automation }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/automations/${automationId}.json`, {
        method: 'PUT',
        body: { automation },
      });
      if (!result.ok) return failedResult('Failed to update automation', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating automation');
    }
  },
});

export const zendeskDeleteAutomation = tool({
  description: 'Delete an automation.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    automationId: z.number().int().describe('Automation ID'),
  }),
  execute: async ({ zendeskCredentials, automationId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/automations/${automationId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete automation', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting automation');
    }
  },
});

export const zendeskReorderAutomations = tool({
  description: 'Reorder automations by ID list.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    automationIds: z.array(z.number().int()).min(1).describe('Automation IDs in desired order'),
  }),
  execute: async ({ zendeskCredentials, automationIds }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/automations/reorder.json', {
        method: 'PUT',
        body: { automation_ids: automationIds },
      });
      if (!result.ok) return failedResult('Failed to reorder automations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error reordering automations');
    }
  },
});

export const zendeskGetAutomationDefinitions = tool({
  description: 'Get automation condition/action field definitions. Use to build valid automations.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/automations/definitions.json');
      if (!result.ok) return failedResult('Failed to get automation definitions', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting automation definitions');
    }
  },
});
