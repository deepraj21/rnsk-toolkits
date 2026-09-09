import { tool } from 'ai';
import { z } from 'zod';

export const linearAddComment = tool({
  description: 'Add a comment to a Linear issue.',
  inputSchema: z.object({
    issueId: z.string().describe('Linear issue UUID'),
    body: z.string().describe('Comment body (markdown supported)'),
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ issueId, body, linearToken }) => {
    const graphqlQuery = {
      query: `
        mutation CreateComment($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            success
            comment {
              id
              body
              url
              createdAt
              user { id name }
            }
          }
        }
      `,
      variables: {
        input: {
          issueId,
          body,
        },
      },
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
      return { error: 'Failed to add Linear comment', details: error };
    }

    const data = await response.json();
    if (data.errors?.length) {
      return { error: 'Linear GraphQL error', details: data.errors };
    }
    return data.data.commentCreate;
  },
});
