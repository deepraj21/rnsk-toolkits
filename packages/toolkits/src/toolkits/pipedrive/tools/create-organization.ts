// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pipedriveRequest, compact } from './client.js';

export const pipedriveCreateOrganization = tool({
  description:
    'Creates a Pipedrive organization. Requires a name; optionally set owner, website, industry, employee count, address, and custom fields. Returns the new organization with its ID.',
  inputSchema: z.object({
    pipedriveApiToken: z.string().optional().describe('Pipedrive API token (injected by system)'),
    name: z.string().describe('Organization name, e.g. "Acme Corp"'),
    ownerId: z.number().optional().describe('User ID that will own the organization'),
    website: z.string().optional().describe('Website URL, e.g. "https://acme.example"'),
    industry: z
      .number()
      .optional()
      .describe('Industry ID (see GET /v1/organizationFields for values)'),
    employeeCount: z.number().optional().describe('Number of employees'),
    annualRevenue: z.number().optional().describe('Annual revenue'),
    address: z.string().optional().describe('Full address (sent as address.value)'),
    visibleTo: z
      .number()
      .optional()
      .describe('Visibility: 1 = owner & followers, 3 = entire company'),
    labelIds: z.array(z.number()).optional().describe('Label IDs to assign'),
    customFields: z
      .record(z.any())
      .optional()
      .describe('Custom fields object keyed by 40-char hash — null clears a value'),
  }),
  execute: async ({
    pipedriveApiToken,
    name,
    ownerId,
    website,
    industry,
    employeeCount,
    annualRevenue,
    address,
    visibleTo,
    labelIds,
    customFields,
  }) => {
    const body = compact({
      name,
      owner_id: ownerId,
      website,
      industry,
      employee_count: employeeCount,
      annual_revenue: annualRevenue,
      address: address !== undefined ? { value: address } : undefined,
      visible_to: visibleTo,
      label_ids: labelIds,
      custom_fields: customFields,
    });

    const result = await pipedriveRequest(pipedriveApiToken, '/api/v2/organizations', {
      method: 'POST',
      body,
    });
    if (result.error) return result;
    return result.data;
  },
});
