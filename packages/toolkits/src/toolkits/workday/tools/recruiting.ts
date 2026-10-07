// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { workdayRest, failedResult, toWorkdayError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Workday credentials JSON with baseUrl, tenant, and OAuth client (clientId/clientSecret/refreshToken) or accessToken',
  );
const idField = z.string().describe('Workday ID (WID)');
const pagingFields = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.number().int().min(0).optional().describe('Results to skip'),
};
const RECRUITING = 'recruiting/v1';
const TALENT = 'talent/v1';

export const workdayListJobPostings = tool({
  description: 'List open job postings (requisitions) for recruiting.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, RECRUITING, '/jobPostings', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list job postings', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing job postings');
    }
  },
});

export const workdayGetJobPosting = tool({
  description: 'Get a single job posting by Workday ID.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, RECRUITING, `/jobPostings/${id}`);
      if (!result.ok) return failedResult('Failed to get job posting', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting job posting');
    }
  },
});

export const workdayGetProspectEducations = tool({
  description: 'Get education history of a recruiting prospect.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        RECRUITING,
        `/prospects/${id}/educations`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get prospect educations', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting prospect educations');
    }
  },
});

export const workdayGetProspectExperiences = tool({
  description: 'Get work experience records of a recruiting prospect.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        RECRUITING,
        `/prospects/${id}/experiences`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get prospect experiences', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting prospect experiences');
    }
  },
});

export const workdayCreateProspectExperience = tool({
  description: 'Add a work experience record to a recruiting prospect.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    company: z.string().describe('Employer company name'),
    title: z.string().describe('Job title'),
    startDate: z.string().describe('Start date YYYY-MM-DD'),
    endDate: z.string().optional().describe('End date YYYY-MM-DD'),
    description: z.string().optional().describe('Role description'),
  }),
  execute: async ({ workdayCredentials, id, company, title, startDate, endDate, description }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        RECRUITING,
        `/prospects/${id}/experiences`,
        {
          method: 'POST',
          body: {
            company,
            title,
            startDate,
            ...(endDate ? { endDate } : {}),
            ...(description ? { description } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create prospect experience', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error creating prospect experience');
    }
  },
});

export const workdayGetProspectResumeAttachments = tool({
  description: 'List resume attachments of a recruiting prospect.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        RECRUITING,
        `/prospects/${id}/resumeAttachments`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get prospect resume attachments', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting prospect resume attachments');
    }
  },
});

export const workdayGetProspectSkills = tool({
  description: 'Get skills recorded for a recruiting prospect.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, RECRUITING, `/prospects/${id}/skills`, {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get prospect skills', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting prospect skills');
    }
  },
});

export const workdayListTalentPools = tool({
  description: 'List talent pools for pipelining candidates.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, TALENT, '/talentPools', {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list talent pools', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing talent pools');
    }
  },
});

export const workdayGetInterviewFeedback = tool({
  description: 'Get interview feedback for an interview.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        RECRUITING,
        `/interviews/${id}/feedback`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get interview feedback', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting interview feedback');
    }
  },
});
