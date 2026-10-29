// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseUpdateCandidate = tool({
  description:
    'Updates a Greenhouse candidate profile: name, company, title, tags, canEmail, or custom fields. Only provided fields change — note that array fields (tags, emails, phones) REPLACE the existing list wholesale.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    candidateId: z.number().describe('Greenhouse candidate id'),
    firstName: z.string().optional().describe('New first name'),
    lastName: z.string().optional().describe('New last name'),
    preferredName: z.string().optional().describe('New preferred name'),
    company: z.string().optional().describe('New current company'),
    title: z.string().optional().describe('New current job title'),
    canEmail: z
      .boolean()
      .optional()
      .describe('Whether the candidate consented to email communication'),
    tags: z
      .array(z.string())
      .optional()
      .describe('REPLACES all candidate tags — send the full desired list'),
    emailAddresses: z
      .array(
        z.object({
          value: z.string(),
          type: z.enum(['personal', 'work', 'other']),
        }),
      )
      .optional()
      .describe('REPLACES all email addresses — send the full desired list'),
    phoneNumbers: z
      .array(
        z.object({
          value: z.string(),
          type: z.enum(['home', 'work', 'mobile', 'skype', 'other']),
        }),
      )
      .optional()
      .describe('REPLACES all phone numbers — send the full desired list'),
    customFields: z
      .array(
        z.object({
          name_key: z.string().optional(),
          custom_field_id: z.number().optional(),
          value: z.any().optional(),
        }),
      )
      .optional()
      .describe('REPLACES all candidate custom field values'),
  }),
  execute: async ({
    greenhouseCredentials,
    candidateId,
    firstName,
    lastName,
    preferredName,
    company,
    title,
    canEmail,
    tags,
    emailAddresses,
    phoneNumbers,
    customFields,
  }) => {
    const body = {};
    if (firstName !== undefined) body.first_name = firstName;
    if (lastName !== undefined) body.last_name = lastName;
    if (preferredName !== undefined) body.preferred_name = preferredName;
    if (company !== undefined) body.company = company;
    if (title !== undefined) body.title = title;
    if (canEmail !== undefined) body.can_email = canEmail;
    if (tags !== undefined) body.tags = tags;
    if (emailAddresses !== undefined) body.email_addresses = emailAddresses;
    if (phoneNumbers !== undefined) body.phone_numbers = phoneNumbers;
    if (customFields !== undefined) body.custom_fields = customFields;

    const result = await greenhouseRequest(greenhouseCredentials, `/candidates/${candidateId}`, {
      method: 'PATCH',
      body,
    });

    if (result.error) return result;
    return result.data;
  },
});
