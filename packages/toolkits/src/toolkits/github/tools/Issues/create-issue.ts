// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const createIssue = tool({
  description:
    'Create a new issue in a GitHub repository. Use when the user wants to create an issue, open an issue, or file a bug/feature request. Provide owner, repo, title, and optional body.',
  inputSchema: z.object({
    githubToken: z.string().optional().describe('Injected by system; do not provide'),
    owner: z.string().describe('Repository owner (username or org)'),
    repo: z.string().describe('Repository name'),
    title: z.string().describe('Issue title'),
    body: z.string().optional().describe('Issue body/description'),
  }),
  execute: async ({ githubToken, owner, repo, title, body }) => {
    if (!githubToken) {
      return { error: 'GitHub token is required. Connect GitHub first.' };
    }
    const octokit = new Octokit({ auth: githubToken });
    const { data } = await octokit.rest.issues.create({
      owner,
      repo,
      title,
      body: body ?? undefined,
    });
    return {
      number: data.number,
      title: data.title,
      state: data.state,
      html_url: data.html_url ?? null,
      created_at: data.created_at,
    };
  },
});
