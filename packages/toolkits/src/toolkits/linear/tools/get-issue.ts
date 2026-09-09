import { tool } from 'ai';
import { z } from 'zod';

export const linearGetIssue = tool({
  description:
    'Get a single Linear issue by UUID or identifier (e.g. ENG-123). Returns title, description, status, assignee, priority, and URL.',
  inputSchema: z.object({
    issueId: z
      .string()
      .optional()
      .describe('Linear issue UUID. Use linearSearchIssues if you only have a title or keyword.'),
    identifier: z
      .string()
      .optional()
      .describe('Human-readable issue identifier, e.g. ENG-123 (team key + number).'),
    linearToken: z.string().optional().describe('Linear API token (injected by system)'),
  }),
  execute: async ({ issueId, identifier, linearToken }) => {
    if (!issueId && !identifier) {
      return { error: 'Provide either issueId (UUID) or identifier (e.g. ENG-123).' };
    }

    if (issueId) {
      const graphqlQuery = {
        query: `
          query GetIssue($id: String!) {
            issue(id: $id) {
              id
              identifier
              title
              description
              priority
              url
              createdAt
              updatedAt
              state { id name type }
              assignee { id name email }
              team { id name key }
              project { id name }
              labels { nodes { id name color } }
            }
          }
        `,
        variables: { id: issueId },
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
        return { error: 'Failed to get Linear issue', details: error };
      }

      const data = await response.json();
      if (data.errors?.length) {
        return { error: 'Linear GraphQL error', details: data.errors };
      }
      return data.data.issue;
    }

    const match = identifier!.match(/^([A-Za-z]+)-(\d+)$/);
    if (!match) {
      return { error: 'identifier must look like TEAM-123 (team key and issue number).' };
    }

    const [, teamKey, numberStr] = match;
    const number = Number(numberStr);
    const graphqlQuery = {
      query: `
        query IssueByIdentifier($teamKey: String!, $number: Float!) {
          issues(filter: {
            team: { key: { eq: $teamKey } }
            number: { eq: $number }
          }, first: 1) {
            nodes {
              id
              identifier
              title
              description
              priority
              url
              createdAt
              updatedAt
              state { id name type }
              assignee { id name email }
              team { id name key }
              project { id name }
              labels { nodes { id name color } }
            }
          }
        }
      `,
      variables: { teamKey, number },
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
      return { error: 'Failed to get Linear issue', details: error };
    }

    const data = await response.json();
    if (data.errors?.length) {
      return { error: 'Linear GraphQL error', details: data.errors };
    }

    const issue = data.data.issues.nodes[0];
    if (!issue) {
      return { error: `No issue found for identifier ${identifier}` };
    }
    return issue;
  },
});
