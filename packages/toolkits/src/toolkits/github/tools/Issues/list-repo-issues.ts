// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listRepoIssues = tool({
  description:
    'List issues for a GitHub repository. Use when the user asks to see issues, open issues, or list issues in a repo. Provide owner and repo (e.g. owner: octocat, repo: hello-world).',
  inputSchema: z.object({
    githubToken: z.string().optional().describe('Injected by system; do not provide'),
    owner: z.string().describe('Repository owner (username or org)'),
    repo: z.string().describe('Repository name'),
    state: z.enum(['open', 'closed', 'all']).optional().default('open').describe('Filter by issue state'),
    perPage: z.number().min(1).max(100).optional().default(30).describe('Number of issues per page'),
    page: z.number().min(1).optional().default(1).describe('Page number'),
  }),
  execute: async ({ githubToken, owner, repo, state = 'open', perPage = 30, page = 1 }) => {
    if (!githubToken) {
      return { error: 'GitHub token is required. Connect GitHub first.' };
    }
    const octokit = new Octokit({ auth: githubToken });
    const { data } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: perPage,
      page,
    });
    return {
      owner,
      repo,
      issues: data.map((issue) => ({
        number: issue.number,
        title: issue.title,
        state: issue.state,
        html_url: issue.html_url ?? null,
        user: issue.user?.login ?? null,
        created_at: issue.created_at,
      })),
      total: data.length,
    };
  },
});
