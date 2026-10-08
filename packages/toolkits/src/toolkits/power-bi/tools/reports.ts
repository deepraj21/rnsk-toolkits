// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { powerBiRequest, failedResult, toPowerBiError } from './client.js';

const credField = z.string().optional().describe('Injected by system; do not provide');

export const powerBiListReports = tool({
  description: 'List reports in My Workspace (GET /reports).',
  inputSchema: z.object({
    powerBiCredentials: credField,
  }),
  execute: async ({ powerBiCredentials }) => {
    try {
      const result = await powerBiRequest(powerBiCredentials, '/reports');
      if (!result.ok) return failedResult('Failed to list reports', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing reports');
    }
  },
});

export const powerBiListReportsInGroup = tool({
  description: 'List reports in a workspace (GET /groups/{groupId}/reports).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/reports`,
      );
      if (!result.ok) return failedResult('Failed to list reports in workspace', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error listing reports in workspace');
    }
  },
});

export const powerBiGetReportInGroup = tool({
  description: 'Get report metadata in a workspace (GET /groups/{groupId}/reports/{reportId}).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    reportId: z.string().uuid(),
  }),
  execute: async ({ powerBiCredentials, groupId, reportId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/reports/${encodeURIComponent(reportId)}`,
      );
      if (!result.ok) return failedResult('Failed to get report', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error getting report');
    }
  },
});

export const powerBiExportReport = tool({
  description:
    'Start exporting a report to PDF or PPTX (POST /groups/{groupId}/reports/{reportId}/Export). Returns export job id when async.',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    reportId: z.string().uuid(),
    format: z.enum(['PDF', 'PPTX', 'PNG', 'IMAGE']).describe('Export file format'),
    powerBIReportConfiguration: z
      .record(z.any())
      .optional()
      .describe('Optional report pages, filters, and settings'),
  }),
  execute: async ({
    powerBiCredentials,
    groupId,
    reportId,
    format,
    powerBIReportConfiguration,
  }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/reports/${encodeURIComponent(reportId)}/Export`,
        {
          method: 'POST',
          body: {
            format,
            powerBIReportConfiguration,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to export report', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error exporting report');
    }
  },
});

export const powerBiGetReportExportStatus = tool({
  description:
    'Poll export job status (GET /groups/{groupId}/reports/{reportId}/exports/{exportId}).',
  inputSchema: z.object({
    powerBiCredentials: credField,
    groupId: z.string().uuid(),
    reportId: z.string().uuid(),
    exportId: z.string().describe('Export job ID from ExportReport'),
  }),
  execute: async ({ powerBiCredentials, groupId, reportId, exportId }) => {
    try {
      const result = await powerBiRequest(
        powerBiCredentials,
        `/groups/${encodeURIComponent(groupId)}/reports/${encodeURIComponent(reportId)}/exports/${encodeURIComponent(exportId)}`,
      );
      if (!result.ok) return failedResult('Failed to get export status', result);
      return result.data;
    } catch (error) {
      return toPowerBiError(error, 'Error getting export status');
    }
  },
});
