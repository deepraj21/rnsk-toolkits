import { tool } from 'ai';
import { z } from 'zod';

export const linearListWorkflowStates = tool({
  description:
    'List workflow states (statuses) for a Linear team. Use state IDs with linearUpdateIssue to move issues (e.g. Todo → In Progress → Done).',
  inputSchema: z.object({
    teamId: z.string().describe('Team UUID. Use linearListTeams to find team IDs.'),
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ teamId, linearToken }) => {
    const graphqlQuery = {
      query: `
        query TeamWorkflowStates($teamId: String!) {
          team(id: $teamId) {
            id
            name
            key
            states {
              nodes {
                id
                name
                type
                color
                position
              }
            }
          }
        }
      `,
      variables: { teamId },
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
      return { error: 'Failed to list Linear workflow states', details: error };
    }

    const data = await response.json();
    if (data.errors?.length) {
      return { error: 'Linear GraphQL error', details: data.errors };
    }

    const team = data.data.team;
    if (!team) {
      return { error: `Team not found: ${teamId}` };
    }

    return {
      teamId: team.id,
      teamName: team.name,
      teamKey: team.key,
      states: team.states.nodes,
    };
  },
});
