// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseUpdateJob = tool({
  description:
    'Updates a Greenhouse job: rename it, change requisition id, notes, department, offices, or custom fields. Only provided fields change; array fields (officeIds, customFields) replace the full list.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    jobId: z.number().describe('Id of the job to update'),
    name: z.string().optional().describe('New internal job title'),
    notes: z.string().optional().describe('New internal HTML notes (replaces existing value)'),
    requisitionId: z
      .string()
      .nullable()
      .optional()
      .describe('New requisition id; pass null to clear'),
    anywhere: z
      .boolean()
      .nullable()
      .optional()
      .describe('Mark job remote-anywhere and clear offices (mutually exclusive with officeIds)'),
    departmentId: z
      .number()
      .nullable()
      .optional()
      .describe('New department id; pass null to clear'),
    officeIds: z
      .array(z.number())
      .optional()
      .describe('Replace the job office assignments with these ids (full list, not a delta)'),
    customFields: z
      .array(
        z.object({
          name_key: z.string().optional(),
          custom_field_id: z.number().optional(),
          value: z.any().optional().describe('New value; null clears the field'),
        }),
      )
      .optional()
      .describe('Replace job custom field values (full list, not a delta)'),
  }),
  execute: async ({
    greenhouseCredentials,
    jobId,
    name,
    notes,
    requisitionId,
    anywhere,
    departmentId,
    officeIds,
    customFields,
  }) => {
    const body = {};
    if (name !== undefined) body.name = name;
    if (notes !== undefined) body.notes = notes;
    if (requisitionId !== undefined) body.requisition_id = requisitionId;
    if (anywhere !== undefined) body.anywhere = anywhere;
    if (departmentId !== undefined) body.department_id = departmentId;
    if (officeIds !== undefined) body.office_ids = officeIds;
    if (customFields !== undefined) body.custom_fields = customFields;

    const result = await greenhouseRequest(greenhouseCredentials, `/jobs/${jobId}`, {
      method: 'PATCH',
      body,
    });

    if (result.error) return result;
    return result.data;
  },
});
