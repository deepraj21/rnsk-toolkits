// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { netlifyRequest, compact } from './client.js';

export const netlifyUpdateSite = tool({
  description:
    'Updates a Netlify site (PATCH). Only provided fields change — rename the site, change the custom domain, toggle force SSL, or set a password. Repo/build changes are best done in netlify.toml or the UI.',
  inputSchema: z.object({
    netlifyToken: z.string().optional().describe('Netlify access token (injected by system)'),
    siteId: z.string().describe('Site id or site name/subdomain'),
    name: z.string().optional().describe('New site name (subdomain)'),
    customDomain: z.string().optional().describe('New custom production domain'),
    domainAliases: z
      .array(z.string())
      .optional()
      .describe('Full replacement list of domain aliases'),
    password: z
      .string()
      .optional()
      .describe('Password to protect the site (empty string removes it)'),
    forceSsl: z.boolean().optional().describe('Force HTTPS redirects'),
    notificationEmail: z.string().optional().describe('Email for deploy notifications'),
  }),
  execute: async ({
    netlifyToken,
    siteId,
    name,
    customDomain,
    domainAliases,
    password,
    forceSsl,
    notificationEmail,
  }) => {
    const body = compact({
      name,
      custom_domain: customDomain,
      domain_aliases: domainAliases,
      password,
      force_ssl: forceSsl,
      notification_email: notificationEmail,
    });

    if (Object.keys(body).length === 0) {
      return { error: 'No fields provided to update. Include at least one field to change.' };
    }

    const result = await netlifyRequest(netlifyToken, `/sites/${siteId}`, {
      method: 'PATCH',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
