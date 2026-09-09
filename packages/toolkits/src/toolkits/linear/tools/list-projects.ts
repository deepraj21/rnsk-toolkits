import { tool } from 'ai';
import { z } from 'zod';

export const linearListProjects = tool({
  description: 'List Linear projects. Returns project IDs, names, status, and associated teams.',
  inputSchema: z.object({
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ linearToken }) => {
    const graphqlQuery = {
      query: `
        query {
          projects(first: 50) {
            nodes {
              id
              name
              description
              state
              url
              startDate
              targetDate
              teams { nodes { id name key } }
            }
          }
        }
      `,
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
      return { error: 'Failed to list Linear projects', details: error };
    }

    const data = await response.json();
    if (data.errors?.length) {
      return { error: 'Linear GraphQL error', details: data.errors };
    }
    return data.data.projects.nodes;
  },
});
