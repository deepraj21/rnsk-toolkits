import { tool } from 'ai';
import { z } from 'zod';

export const linearCreateIssue = tool({
    description: 'Create a new issue in Linear.',
    inputSchema: z.object({
        title: z.string().describe('Title of the issue'),
        description: z.string().optional().describe('Detailed description of the issue'),
        teamId: z.string().describe('The ID of the team where the issue will be created. Use linearListTeams if unknown.'),
        linearToken: z.string().optional().describe('Linear API token (injected by system)'),
    }),
    execute: async ({ title, description, teamId, linearToken }) => {
        const graphqlQuery = {
            query: `
        mutation CreateIssue($input: IssueCreateInput!) {
          issueCreate(input: $input) {
            success
            issue {
              id
              identifier
              title
              url
            }
          }
        }
      `,
            variables: {
                input: {
                    title,
                    description,
                    teamId,
                },
            },
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
            return { error: 'Failed to create Linear issue', details: error };
        }

        const data = await response.json();
        return data.data.issueCreate;
    },
});
