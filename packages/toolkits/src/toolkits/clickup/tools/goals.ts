// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { cuDelete, cuGet, cuPatch, cuPost, cuPut, cuUpload, nest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const clickupCreateGoal = tool({
  description: 'Creates a new goal in a ClickUp Team (Workspace).',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('Name for the goal.'),
    color: z.string().describe('Hex color string to associate with the goal.'),
    owners: z
      .array(z.number().int())
      .describe('List of user IDs to be assigned as owners of the goal.'),
    teamId: z
      .string()
      .describe('Numeric ID of the ClickUp Team (Workspace) where the goal will be created.'),
    dueDate: z
      .number()
      .int()
      .describe('Due date for the goal, as a Unix timestamp in milliseconds.'),
    description: z.string().describe('Detailed description for the goal.'),
    multipleOwners: z
      .boolean()
      .describe('Set to `true` if the goal will have multiple owners; `false` for a single owner.'),
  }),
  execute: async ({
    clickupToken,
    name,
    color,
    owners,
    teamId,
    dueDate,
    description,
    multipleOwners,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/team/${teamId}/goal`, {
      body: nest({
        name: name,
        color: color,
        owners: owners,
        due_date: dueDate,
        description: description,
        multiple_owners: multipleOwners,
      }),
    });
  },
});

export const clickupCreateKeyResult = tool({
  description:
    'Creates a new Key Result (Target) for a specified Goal in ClickUp to define and track measurable objectives towards achieving that Goal.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('The name for the new Key Result.'),
    type: z
      .string()
      .describe(
        "Specifies the type of the Key Result, which determines how progress is tracked. Supported types: 'number', 'currency', 'boolean', 'percentage', 'automatic'.",
      ),
    unit: z
      .string()
      .describe(
        "The unit of measurement for Key Results of type 'number', 'currency', or 'percentage' (e.g., '$', '%', 'items'). This may not be applicable for 'boolean' or 'automatic' types where progress is count-based.",
      ),
    owners: z
      .array(z.number().int())
      .describe('A list of numerical user IDs to be assigned as owners of this Key Result.'),
    goalId: z
      .string()
      .describe(
        'The unique identifier (UUID) of the parent Goal for which this Key Result is being created.',
      ),
    listIds: z
      .array(z.string())
      .describe(
        "An array of List UUIDs to link to this Key Result. Can be used with 'automatic' type Key Results to track progress based on tasks within these lists.",
      ),
    taskIds: z
      .array(z.string())
      .describe(
        "An array of task UUIDs to link to this Key Result. Often used when `type` is 'automatic' to track progress via the completion status of these linked tasks.",
      ),
    stepsEnd: z
      .number()
      .int()
      .describe(
        "The target value indicating Key Result completion. For 'boolean' type, use 1 for true/complete. For 'automatic' type, this is often the total count of items to complete (e.g., number of linked tasks).",
      ),
    stepsStart: z
      .number()
      .int()
      .describe(
        "The initial value for tracking Key Result progress. For 'boolean' type, use 0 for false/incomplete, 1 for true/complete. For 'automatic' type, this is often the initial count (e.g., 0).",
      ),
  }),
  execute: async ({
    clickupToken,
    name,
    type,
    unit,
    owners,
    goalId,
    listIds,
    taskIds,
    stepsEnd,
    stepsStart,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPost(clickupToken, V2, `/goal/${goalId}/key_result`, {
      body: nest({
        name: name,
        type: type,
        unit: unit,
        owners: owners,
        list_ids: listIds,
        task_ids: taskIds,
        steps_end: stepsEnd,
        steps_start: stepsStart,
      }),
    });
  },
});

export const clickupDeleteGoal = tool({
  description:
    'Permanently removes an existing Goal, identified by its `goal_id`, from the Workspace.',
  inputSchema: z.object({
    clickupToken: tokenField,
    goalId: z.string().describe('The unique identifier (UUID) of the Goal to be deleted.'),
  }),
  execute: async ({ clickupToken, goalId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/goal/${goalId}`);
  },
});

export const clickupDeleteKeyResult = tool({
  description:
    'Deletes an existing Key Result, also referred to as a Target within a Goal, identified by its `key_result_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    keyResultId: z
      .string()
      .describe(
        "The unique identifier (UUID) of the Key Result to be deleted. This is often referred to as a 'Target' in the context of Goals.",
      ),
  }),
  execute: async ({ clickupToken, keyResultId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuDelete(clickupToken, V2, `/key_result/${keyResultId}`);
  },
});

export const clickupGetGoal = tool({
  description:
    'Retrieves detailed information for an existing ClickUp Goal, specified by its unique `goal_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    goalId: z.string().describe('The unique identifier (UUID) of the Goal to retrieve.'),
  }),
  execute: async ({ clickupToken, goalId }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/goal/${goalId}`);
  },
});

export const clickupGetGoals = tool({
  description:
    'Retrieves goals for a specified ClickUp Workspace (Team); the `team_id` must be valid and accessible.',
  inputSchema: z.object({
    clickupToken: tokenField,
    teamId: z
      .string()
      .describe(
        'The unique numerical identifier of the Workspace (Team) for which to retrieve goals.',
      ),
    includeCompleted: z
      .boolean()
      .optional()
      .describe('If true, include completed goals in the response.'),
  }),
  execute: async ({ clickupToken, teamId, includeCompleted }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuGet(clickupToken, V2, `/team/${teamId}/goal`, {
      query: { include_completed: includeCompleted },
    });
  },
});

export const clickupUpdateGoal = tool({
  description: 'Updates attributes of an existing ClickUp goal, identified by its `goal_id`.',
  inputSchema: z.object({
    clickupToken: tokenField,
    name: z.string().describe('New name for the goal.'),
    color: z.string().describe('New color (hex code).'),
    goalId: z.string().describe('Unique identifier (UUID) of the goal to update.'),
    dueDate: z.number().int().describe('New due date (Unix timestamp in milliseconds).'),
    addOwners: z.array(z.number().int()).describe('User IDs to add as owners.'),
    remOwners: z.array(z.number().int()).describe('User IDs to remove as owners.'),
    description: z.string().describe('New description for the goal.'),
  }),
  execute: async ({
    clickupToken,
    name,
    color,
    goalId,
    dueDate,
    addOwners,
    remOwners,
    description,
  }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/goal/${goalId}`, {
      body: nest({
        name: name,
        color: color,
        due_date: dueDate,
        add_owners: addOwners,
        rem_owners: remOwners,
        description: description,
      }),
    });
  },
});

export const clickupUpdateKeyResult = tool({
  description:
    "Updates an existing key result's progress or note in ClickUp, where the key result measures progress towards a goal.",
  inputSchema: z.object({
    clickupToken: tokenField,
    note: z.string().describe('A note or comment to add or update for the key result.'),
    keyResultId: z
      .string()
      .describe('The unique identifier (UUID) of the key result to be edited.'),
    stepsCurrent: z.number().int().describe('The current progress of steps for the key result.'),
  }),
  execute: async ({ clickupToken, note, keyResultId, stepsCurrent }) => {
    if (!clickupToken) return { error: 'ClickUp token is required. Connect ClickUp first.' };
    return cuPut(clickupToken, V2, `/key_result/${keyResultId}`, {
      body: nest({ note: note, steps_current: stepsCurrent }),
    });
  },
});
