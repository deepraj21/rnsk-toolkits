// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, compact } from './client.js';

export const netlifyCreateDeploy = tool({
  description:
    'Creates a deploy on a Netlify site. For git-connected sites, a deploy rebuilds the connected branch (title/branch are optional). For manual (digest) deploys, pass `files` as a map of path -> SHA1 digest; the response lists any still-required files, which you upload via the deploy files endpoint. This starts a real deployment.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    title: z.string().optional().describe('Deploy title shown in the UI'),
    branch: z.string().optional().describe('Branch to deploy (git-connected sites)'),
    subdir: z.string().optional().describe('Subdirectory of the publish artifact'),
    draft: z.boolean().optional().describe('Create as an unpublished draft deploy'),
    asyncDeploy: z
      .boolean()
      .optional()
      .describe('Return immediately without waiting for required files'),
    files: z
      .record(z.string())
      .optional()
      .describe(
        'Digest deploy map of file path -> SHA1 content digest, e.g. {"/index.html":"<sha1>"}',
      ),
  }),
  execute: async ({ netlifyToken, siteId, title, branch, subdir, draft, asyncDeploy, files }) => {
    const body = compact({
      title,
      branch,
      subdir,
      draft,
      async: asyncDeploy,
      files,
    });

    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}/deploys`, {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
