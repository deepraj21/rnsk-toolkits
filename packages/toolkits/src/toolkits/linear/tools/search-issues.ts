import { tool } from 'ai';
import { z } from 'zod';

export const linearSearchIssues = tool({
  description: 'Search for issues in Linear. Matches against title and description.',
  inputSchema: z.object({
    query: z.string().describe('The search query (title or description)'),
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ query, linearToken }) => {
    const graphqlQuery = {
      query: `
        query SearchIssues($term: String!) {
          searchIssues(term: $term) {
            nodes {
              id
              identifier
              title
              description
              status {
                name
              }
              assignee {
                name
              }
              url
            }
          }
        }
      `,
      variables: { term: query },
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
      return { error: 'Linear search failed', details: error };
    }

    const data = await response.json();
    return data.data.searchIssues.nodes;
  },
});
