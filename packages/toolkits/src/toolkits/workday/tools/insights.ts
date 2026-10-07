// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { workdayRest, workdayReport, failedResult, toWorkdayError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Workday credentials JSON with baseUrl, tenant, and OAuth client (clientId/clientSecret/refreshToken) or accessToken (reports also accept username/password ISU Basic auth)',
  );

export const workdayRunWqlQuery = tool({
  description: 'Run a Workday Query Language (WQL) query for ad-hoc HR data access.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    query: z
      .string()
      .describe("WQL SELECT query, e.g. 'SELECT workerID, businessTitle FROM workers'"),
  }),
  execute: async ({ workdayCredentials, query }) => {
    try {
      const result = await workdayRest(workdayCredentials, 'prismAnalytics/v3', '/wql', {
        method: 'POST',
        body: { query },
      });
      if (!result.ok) return failedResult('Failed to run WQL query', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error running WQL query');
    }
  },
});

export const workdayRunCustomReport = tool({
  description:
    'Execute a Workday custom report exposed as a web service (RaaS) and fetch rows as JSON/CSV.',
  inputSchema: z.object({
    workdayCredentials: credentialsField,
    reportOwner: z.string().describe('Report owner username (ISU), e.g. ISU_Reports'),
    reportName: z
      .string()
      .describe('Report name with spaces as underscores, e.g. Organization_Headcount'),
    format: z.string().optional().describe('json (default), csv, simplexml, or gdata'),
    prompts: z.record(z.string()).optional().describe('Report prompt filters as key-value pairs'),
  }),
  execute: async ({ workdayCredentials, reportOwner, reportName, format, prompts }) => {
    try {
      const result = await workdayReport(workdayCredentials, reportOwner, reportName, {
        format,
        prompts,
      });
      if (!result.ok) return failedResult('Failed to run custom report', result);
      return result.data;
    } catch (error) {
      return toWorkdayError(error, 'Error running custom report');
    }
  },
});
