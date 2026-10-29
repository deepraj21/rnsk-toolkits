// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseCreateJob = tool({
  description:
    'Creates a new Greenhouse job from an existing template job. Requires templateJobId (supplies interview plan, scorecards, hiring team) and numberOfOpenings. Returns the new job with its id and status.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    templateJobId: z
      .number()
      .describe(
        'Id of the template job to copy the interview plan, scorecards, and hiring team from',
      ),
    numberOfOpenings: z
      .number()
      .int()
      .min(1)
      .describe('Number of openings (headcount slots) to create on the job (max 200 total open)'),
    jobName: z
      .string()
      .optional()
      .describe('Internal job title, e.g. "Senior Backend Engineer" (defaults to template name)'),
    jobPostName: z
      .string()
      .optional()
      .describe('External-facing title for the initial job post (defaults to job name)'),
    notes: z.string().optional().describe('Internal HTML notes shown to the hiring team'),
    departmentId: z
      .number()
      .optional()
      .describe('Department id to assign (mutually exclusive with external department id)'),
    officeIds: z
      .array(z.number())
      .optional()
      .describe('Office ids to assign (mutually exclusive with external office ids)'),
    requisitionId: z
      .string()
      .optional()
      .describe('Partner-supplied requisition identifier, e.g. an HRIS code'),
    customFields: z
      .array(
        z.object({
          name_key: z
            .string()
            .optional()
            .describe('Custom field name_key (or use custom_field_id)'),
          custom_field_id: z.number().optional().describe('Custom field id (or use name_key)'),
          value: z.any().optional().describe('Value matching the field type; null clears it'),
        }),
      )
      .optional()
      .describe(
        'Job custom field values — every required field the template leaves blank must be supplied here',
      ),
  }),
  execute: async ({
    greenhouseCredentials,
    templateJobId,
    numberOfOpenings,
    jobName,
    jobPostName,
    notes,
    departmentId,
    officeIds,
    requisitionId,
    customFields,
  }) => {
    const body = { template_job_id: templateJobId, number_of_openings: numberOfOpenings };
    if (jobName !== undefined) body.job_name = jobName;
    if (jobPostName !== undefined) body.job_post_name = jobPostName;
    if (notes !== undefined) body.notes = notes;
    if (departmentId !== undefined) body.department_id = departmentId;
    if (officeIds !== undefined) body.office_ids = officeIds;
    if (requisitionId !== undefined) body.requisition_id = requisitionId;
    if (customFields !== undefined) body.custom_fields = customFields;

    const result = await greenhouseRequest(greenhouseCredentials, '/jobs', {
      method: 'POST',
      body,
    });

    if (result.error) return result;
    return result.data;
  },
});
