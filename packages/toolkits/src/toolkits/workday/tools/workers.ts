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
const CORE = 'v1';

export const workdayListWorkers = tool({
  description: 'List workers (employees and contingent workers) with search and pagination.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    search: z.string().optional().describe('Search string to filter workers'),
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, search, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, '/workers', {
        query: { search, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list workers', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error listing workers');
    }
  },
});

export const workdayGetWorker = tool({
  description: 'Get detailed profile of a worker by Workday ID.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
  }),
  execute: async ({ workdayCredentials, id }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}`);
      if (!result.ok) return failedResult('Failed to get worker', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker');
    }
  },
});

export const workdayGetWorkerOrganizations = tool({
  description: 'Get organizations a worker belongs to.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}/organizations`, {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get worker organizations', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker organizations');
    }
  },
});

export const workdayGetWorkerSupervisoryOrgs = tool({
  description: 'Get supervisory organizations a worker belongs to.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        CORE,
        `/workers/${id}/supervisoryOrganizations`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get worker supervisory organizations', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker supervisory organizations');
    }
  },
});

export const workdayGetWorkerReports = tool({
  description: 'Get direct reports of a manager worker.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}/reports`, {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get worker reports', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker reports');
    }
  },
});

export const workdayGetWorkerHistory = tool({
  description: 'Get worker history events such as hires, transfers, and job changes.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}/history`, {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get worker history', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker history');
    }
  },
});

const resourceRef = z
  .object({
    id: z.string().optional().describe('Referenced Workday ID'),
    descriptor: z.string().optional().describe('Display name'),
    href: z.string().optional().describe('Resource URL'),
  })
  .describe('Workday resource reference');

export const workdayGetBusinessTitleChanges = tool({
  description: 'List business title changes for a worker.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        CORE,
        `/workers/${id}/businessTitleChanges`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get business title changes', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting business title changes');
    }
  },
});

export const workdayCreateBusinessTitleChange = tool({
  description: 'Propose a new business title for a worker effective on a date.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    proposedBusinessTitle: z.string().describe('New business title'),
    effectiveDate: z.string().describe('Effective date YYYY-MM-DD'),
  }),
  execute: async ({ workdayCredentials, id, proposedBusinessTitle, effectiveDate }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        CORE,
        `/workers/${id}/businessTitleChanges`,
        {
          method: 'POST',
          body: { proposedBusinessTitle, effectiveDate },
        },
      );
      if (!result.ok) return failedResult('Failed to create business title change', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error creating business title change');
    }
  },
});

export const workdayCreateJobChange = tool({
  description: 'Initiate a job change (transfer, promotion, or position move) for a worker.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    effectiveDate: z.string().describe('Effective date YYYY-MM-DD'),
    reason: resourceRef
      .optional()
      .describe('Reason reference, e.g. {id} of Promotion/Transfer reason'),
    proposedPosition: resourceRef.optional().describe('Target position reference {id}'),
  }),
  execute: async ({ workdayCredentials, id, effectiveDate, reason, proposedPosition }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}/jobChanges`, {
        method: 'POST',
        body: {
          effectiveDate,
          ...(reason ? { reason } : {}),
          ...(proposedPosition ? { proposedPosition } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create job change', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error creating job change');
    }
  },
});

export const workdayGetPaySlips = tool({
  description: 'Get payslips for a worker with gross and net pay per period.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(workdayCredentials, CORE, `/workers/${id}/paySlips`, {
        query: { limit, offset },
      });
      if (!result.ok) return failedResult('Failed to get payslips', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting payslips');
    }
  },
});
