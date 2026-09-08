import { tool } from 'ai';
import { z } from 'zod';

export const linearListTeams = tool({
  description: 'List all teams accessible in Linear. Useful for finding team IDs to create issues.',
  inputSchema: z.object({
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ linearToken }) => {
    const graphqlQuery = {
      query: `
        query {
          teams {
            nodes {
              id
              name
              key
              description
            }
          }
        }
      `,
    };

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${linearToken}`,
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const error = await response.json();
      return { error: 'Failed to list Linear teams', details: error };
    }

    const data = await response.json();
    return data.data.teams.nodes;
  },
});
