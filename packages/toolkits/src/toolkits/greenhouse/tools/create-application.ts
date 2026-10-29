// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { greenhouseRequest } from './client.js';

export const greenhouseCreateApplication = tool({
  description:
    'Creates a Greenhouse application — attaches an existing candidate to a job (candidateId + jobId), or adds them as a prospect (candidateId + prospect=true). One application per candidate per job.',
  inputSchema: z.object({
    greenhouseCredentials: z
      .string()
      .optional()
      .describe('Greenhouse Harvest API credentials "clientId:clientSecret" (injected by system)'),
    candidateId: z.number().describe('Existing candidate id to create the application for'),
    jobId: z
      .number()
      .optional()
      .describe('Job id to apply the candidate to (omit when creating a prospect)'),
    prospect: z
      .boolean()
      .optional()
      .describe('Set true to create a prospect application instead of a job application'),
    initialStageId: z
      .number()
      .optional()
      .describe('Application stage id to start in (defaults to the job’s first stage)'),
    sourceId: z.number().optional().describe('Source id to attribute the application to'),
    recruiterId: z.number().optional().describe('Greenhouse user id to assign as recruiter'),
    coordinatorId: z.number().optional().describe('Greenhouse user id to assign as coordinator'),
    referrerId: z.number().optional().describe('Referrer id credited for this application'),
    customFields: z
      .array(
        z.object({
          name_key: z.string().optional(),
          custom_field_id: z.number().optional(),
          value: z.any().optional(),
        }),
      )
      .optional()
      .describe('Application custom field values'),
  }),
  execute: async ({
    greenhouseCredentials,
    candidateId,
    jobId,
    prospect,
    initialStageId,
    sourceId,
    recruiterId,
    coordinatorId,
    referrerId,
    customFields,
  }) => {
    const body = { candidate_id: candidateId };

    if (jobId !== undefined) {
      body.job_id = jobId;
      if (initialStageId !== undefined) body.initial_stage_id = initialStageId;
    } else {
      body.prospect = prospect ?? true;
    }

    if (sourceId !== undefined) body.source_id = sourceId;
    if (recruiterId !== undefined) body.recruiter_id = recruiterId;
    if (coordinatorId !== undefined) body.coordinator_id = coordinatorId;
    if (referrerId !== undefined) body.referrer_id = referrerId;
    if (customFields !== undefined) body.custom_fields = customFields;

    const result = await greenhouseRequest(greenhouseCredentials, '/applications', {
      method: 'POST',
      body,
    });

    if (result.error) return result;
    return result.data;
  },
});
