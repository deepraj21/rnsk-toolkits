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
const ABSENCE = 'absenceManagement/v1';

export const workdayRequestTimeOff = tool({
  description: 'Submit a time-off request for a worker with absence type and dated quantities.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    absenceTypeId: z.string().describe('Absence type Workday ID, e.g. vacation or sick leave'),
    days: z
      .array(
        z.object({
          date: z.string().describe('Date YYYY-MM-DD'),
          quantity: z.number().describe('Units of time off'),
          comment: z.string().optional().describe('Optional comment'),
        }),
      )
      .min(1)
      .describe('One entry per requested day'),
  }),
  execute: async ({ workdayCredentials, id, absenceTypeId, days }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        ABSENCE,
        `/workers/${id}/requestTimeOff`,
        {
          method: 'POST',
          body: { absenceType: { id: absenceTypeId }, days },
        },
      );
      if (!result.ok) return failedResult('Failed to request time off', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error requesting time off');
    }
  },
});

export const workdayGetValidTimeOffDates = tool({
  description: 'Get valid time-off dates for a worker in a date range.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    startDate: z.string().optional().describe('Range start YYYY-MM-DD'),
    endDate: z.string().optional().describe('Range end YYYY-MM-DD'),
  }),
  execute: async ({ workdayCredentials, id, startDate, endDate }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        ABSENCE,
        `/workers/${id}/validTimeOffDates`,
        {
          query: { startDate, endDate },
        },
      );
      if (!result.ok) return failedResult('Failed to get valid time off dates', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting valid time off dates');
    }
  },
});

export const workdayGetWorkerLeaves = tool({
  description: 'List leaves of absence for a worker.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    ...pagingFields,
  }),
  execute: async ({ workdayCredentials, id, limit, offset }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        ABSENCE,
        `/workers/${id}/leavesOfAbsence`,
        {
          query: { limit, offset },
        },
      );
      if (!result.ok) return failedResult('Failed to get worker leaves', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker leaves');
    }
  },
});

export const workdayGetWorkerLeave = tool({
  description: 'Get a single leave of absence by worker and leave IDs.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    id: idField,
    leaveId: z.string().describe('Leave of absence Workday ID'),
  }),
  execute: async ({ workdayCredentials, id, leaveId }) => {
    try {
      const result = await workdayRest(
        workdayCredentials,
        ABSENCE,
        `/workers/${id}/leavesOfAbsence/${leaveId}`,
      );
      if (!result.ok) return failedResult('Failed to get worker leave', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error getting worker leave');
    }
  },
});
