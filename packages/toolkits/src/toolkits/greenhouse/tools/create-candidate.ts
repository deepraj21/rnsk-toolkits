// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseCreateCandidate = tool({
  description:
    'Creates a Greenhouse candidate. firstName and lastName are required; pass jobId to also apply them to a job, or prospectPoolId to add them as a prospect. Without either they are created as a prospect.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    firstName: z.string().describe('Candidate first name'),
    lastName: z.string().describe('Candidate last name'),
    email: z.string().optional().describe('Primary email address (added as type "work")'),
    phoneNumber: z.string().optional().describe('Phone number (added as type "mobile")'),
    company: z.string().optional().describe('Current company'),
    title: z.string().optional().describe('Current job title'),
    preferredName: z.string().optional().describe('Preferred / chosen name'),
    tags: z
      .array(z.string())
      .optional()
      .describe('Candidate tags (new tag names are created on the fly)'),
    jobId: z
      .number()
      .optional()
      .describe('Job id to create an application on (omit to create a prospect)'),
    prospectPoolId: z
      .number()
      .optional()
      .describe('Prospect pool id when creating a prospect (ignored when jobId is set)'),
    customFields: z
      .array(
        z.object({
          name_key: z.string().optional(),
          custom_field_id: z.number().optional(),
          value: z.any().optional(),
        }),
      )
      .optional()
      .describe('Candidate custom field values'),
  }),
  execute: async ({
    greenhouseCredentials,
    firstName,
    lastName,
    email,
    phoneNumber,
    company,
    title,
    preferredName,
    tags,
    jobId,
    prospectPoolId,
    customFields,
  }) => {
    const body = { first_name: firstName, last_name: lastName };
    if (email !== undefined) body.email_addresses = [{ value: email, type: 'work' }];
    if (phoneNumber !== undefined) body.phone_numbers = [{ value: phoneNumber, type: 'mobile' }];
    if (company !== undefined) body.company = company;
    if (title !== undefined) body.title = title;
    if (preferredName !== undefined) body.preferred_name = preferredName;
    if (tags !== undefined) body.tags = tags;
    if (customFields !== undefined) body.custom_fields = customFields;
    if (jobId !== undefined) body.application = { job_id: jobId };
    else if (prospectPoolId !== undefined) body.application = { prospect_pool_id: prospectPoolId };

    const result = await greenhouseRequest(greenhouseCredentials, '/candidates', {
      method: 'POST',
      body,
    });

    if (result.error) return result;
    return result.data;
  },
});
