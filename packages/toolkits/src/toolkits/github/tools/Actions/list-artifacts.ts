// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { Octokit } from 'octokit';

export const listArtifacts = tool({
  description: 'List artifacts for a GitHub repository. Returns workflow run artifacts with their names, sizes, and download URLs.',
  inputSchema: z.object({
    githubToken: z.string().optional().describe('Injected by system; do not provide'),
    owner: z.string().describe('Repository owner (username or org)'),
    repo: z.string().describe('Repository name'),
    per_page: z.number().optional().describe('Number of results per page (max 100)'),
    page: z.number().optional().describe('Page number of results to fetch'),
  }),
  execute: async ({ githubToken, owner, repo, per_page, page }) => {
    if (!githubToken) {
      return { error: 'GitHub token is required. Connect GitHub first.' };
    }
    const octokit = new Octokit({ auth: githubToken });
    try {
      const { data } = await octokit.rest.actions.listArtifactsForRepo({
        owner,
        repo,
        per_page: per_page ?? 30,
        page: page ?? 1,
      });
      return {
        total_count: data.total_count,
        artifacts: data.artifacts.map(artifact => ({
          id: artifact.id,
          name: artifact.name,
          size_in_bytes: artifact.size_in_bytes,
          created_at: artifact.created_at,
          expired: artifact.expired,
          expires_at: artifact.expires_at,
        })),
      };
    } catch (error: any) {
      return { error: `Failed to list artifacts: ${error.message}` };
    }
  },
});
