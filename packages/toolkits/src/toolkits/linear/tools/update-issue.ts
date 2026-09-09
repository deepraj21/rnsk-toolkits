import { tool } from 'ai';
import { z } from 'zod';

export const linearUpdateIssue = tool({
  description:
    'Update a Linear issue. Change title, description, status (stateId), assignee, priority, or project. Use linearListWorkflowStates to find state IDs.',
  inputSchema: z.object({
    issueId: z.string().describe('Linear issue UUID'),
    title: z.string().optional().describe('New title'),
    description: z.string().optional().describe('New description (markdown supported)'),
    stateId: z.string().optional().describe('Workflow state ID (e.g. move to Done). Use linearListWorkflowStates.'),
    assigneeId: z.string().nullable().optional().describe('User ID to assign, or null to unassign.'),
    priority: z
      .number()
      .int()
      .min(0)
      .max(4)
      .optional()
      .describe('Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low'),
    projectId: z.string().optional().describe('Project ID to associate the issue with'),
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ issueId, title, description, stateId, assigneeId, priority, projectId, linearToken }) => {
    const input: Record<string, unknown> = {};
    if (title !== undefined) input.title = title;
    if (description !== undefined) input.description = description;
    if (stateId !== undefined) input.stateId = stateId;
    if (assigneeId !== undefined) input.assigneeId = assigneeId;
    if (priority !== undefined) input.priority = priority;
    if (projectId !== undefined) input.projectId = projectId;

    if (Object.keys(input).length === 0) {
      return { error: 'Provide at least one field to update (title, description, stateId, assigneeId, priority, or projectId).' };
    }

    const graphqlQuery = {
      query: `
        mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
          issueUpdate(id: $id, input: $input) {
            success
            issue {
              id
              identifier
              title
              description
              priority
              url
              state { id name }
              assignee { id name }
              project { id name }
            }
          }
        }
      `,
      variables: { id: issueId, input },
    };

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${linearToken}`,
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: 'Failed to update Linear issue', details: error };
    }

    const data = await response.json();
    if (data.errors?.length) {
      return { error: 'Linear GraphQL error', details: data.errors };
    }
    return data.data.issueUpdate;
  },
});
