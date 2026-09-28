// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceCloseOrAbortJob = tool({
  description:
    'Tool to close or abort a Salesforce Bulk API v2 ingest job. Use when you need to finalize job processing by closing (state: UploadComplete) or cancel a job by aborting (state: Aborted). This is required for every ingest job - closing queues data for processing, while aborting cancels the job and deletes uploaded data.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    state: z
      .enum(['UploadComplete', 'Aborted'])
      .describe(
        "The state to update the job to. 'UploadComplete' closes the job and queues uploaded data for processing. 'Aborted' cancels the job and deletes any uploaded data. This field is required.",
      ),
    jobId: z
      .string()
      .describe('The unique identifier of the Bulk API v2 ingest job to close or abort.'),
  }),
  execute: async ({ salesforceCredentials, state, jobId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPatch(salesforceCredentials, `/jobs/ingest/${jobId}`, { body: { state: state } });
  },
});

export const salesforceCreateBulkIngestJob = tool({
  description:
    "Create a Bulk API 2.0 ingest job (POST /jobs/ingest). Returns a job in the 'Open' state with an id and contentUrl. This is the first step of a bulk load: create the job here, upload CSV data to it (upload_job_data), then close it (close_or_abort_a_job with state=UploadComplete) to queue processing. Without this action the rest of the ingest-job family has no obtainable job_id.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    operation: z
      .enum(['insert', 'delete', 'hardDelete', 'update', 'upsert'])
      .describe(
        "The processing operation for the job. 'upsert' requires external_id_field_name. 'hardDelete' permanently deletes records (bypassing the Recycle Bin) and requires the 'Bulk API Hard Delete' user permission.",
      ),
    lineEnding: z
      .enum(['LF', 'CRLF'])
      .optional()
      .describe('Line ending used in the CSV data you will upload. Defaults to LF if omitted.'),
    objectType: z
      .string()
      .describe(
        "The API name of the Salesforce object the job operates on (e.g., 'Account', 'Contact', 'MyObject__c'). Sent to the API as the 'object' field.",
      ),
    contentType: z
      .string()
      .optional()
      .describe("Format of the data to be uploaded. Bulk API 2.0 ingest only supports 'CSV'."),
    columnDelimiter: z
      .enum(['BACKQUOTE', 'CARET', 'COMMA', 'PIPE', 'SEMICOLON', 'TAB'])
      .optional()
      .describe(
        'Column delimiter used in the CSV data you will upload. Defaults to COMMA if omitted.',
      ),
    assignmentRuleId: z
      .string()
      .optional()
      .describe('The ID of a specific assignment rule to run for Case or Lead records. Optional.'),
    externalIdFieldName: z
      .string()
      .optional()
      .describe(
        "The external ID field API name used to match records. REQUIRED when operation is 'upsert'; ignored otherwise.",
      ),
  }),
  execute: async ({
    salesforceCredentials,
    operation,
    lineEnding,
    objectType,
    contentType,
    columnDelimiter,
    assignmentRuleId,
    externalIdFieldName,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/jobs/ingest`, {
      body: {
        operation: operation,
        lineEnding: lineEnding,
        object: objectType,
        contentType: contentType,
        columnDelimiter: columnDelimiter,
        assignmentRuleId: assignmentRuleId,
        externalIdFieldName: externalIdFieldName,
      },
    });
  },
});

export const salesforceCreateBulkQueryJob = tool({
  description:
    "Create a Bulk API 2.0 query job (POST /jobs/query) for a SOQL query over a large result set. Returns a job with an id; poll get_job_info_query until state is 'JobComplete', then retrieve CSV results with get_job_query_result. Without this action the Bulk query family has no obtainable job_id.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    query: z
      .string()
      .describe(
        'The SOQL query the job will run. For very large result sets, Bulk API 2.0 query jobs stream results as CSV pages.',
      ),
    operation: z
      .enum(['query', 'queryAll'])
      .optional()
      .describe("'query' returns current rows; 'queryAll' also returns deleted and archived rows."),
    lineEnding: z
      .enum(['LF', 'CRLF'])
      .optional()
      .describe('Line ending for the CSV results. Defaults to LF if omitted.'),
    contentType: z
      .string()
      .optional()
      .describe("Format of the query results. Bulk API 2.0 query only supports 'CSV'."),
    columnDelimiter: z
      .enum(['BACKQUOTE', 'CARET', 'COMMA', 'PIPE', 'SEMICOLON', 'TAB'])
      .optional()
      .describe('Column delimiter for the CSV results. Defaults to COMMA if omitted.'),
  }),
  execute: async ({
    salesforceCredentials,
    query,
    operation,
    lineEnding,
    contentType,
    columnDelimiter,
  }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfPost(salesforceCredentials, `/jobs/query`, {
      body: {
        query: query,
        operation: operation,
        lineEnding: lineEnding,
        contentType: contentType,
        columnDelimiter: columnDelimiter,
      },
    });
  },
});

export const salesforceDeleteJobQuery = tool({
  description:
    'Tool to delete a Salesforce Bulk API v2 query job. Use when you need to permanently remove a job and its associated data. Only the user who created the job can delete it, and the job must be in a completed state.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z
      .string()
      .describe(
        'The unique identifier of the Bulk API v2 query job to delete. Job must be in one of these states: JobComplete, Aborted, Failed, or UploadComplete.',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfDelete(salesforceCredentials, `/jobs/query/${jobId}`);
  },
});

export const salesforceGetJobFailedRecordResults = tool({
  description:
    'Tool to retrieve failed records from a Salesforce Bulk API 2.0 ingest job. Use when you need to get records that failed during a bulk operation, including error messages and original data.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z.string().describe('The unique identifier of the bulk ingest job.'),
    locator: z
      .string()
      .optional()
      .describe(
        'Pagination token from the Sforce-Locator response header of a previous request, used to retrieve the next set of results.',
      ),
    maxRecords: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of records to retrieve per page. If omitted, the API returns the maximum number of records it can send in a single page.',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId, locator, maxRecords }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfCsv(salesforceCredentials, `/jobs/ingest/${jobId}/failedResults`, {
      locator: locator,
      maxRecords: max_records,
    });
  },
});

export const salesforceGetJobSuccessfulRecordResults = tool({
  description:
    'Tool to retrieve successfully processed records from a Salesforce Bulk API 2.0 ingest job. Use when you need to get records that were successfully created or updated during a bulk operation.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z.string().describe('The unique identifier of the bulk ingest job.'),
    locator: z
      .string()
      .optional()
      .describe(
        'Pagination token from the Sforce-Locator response header of a previous request, used to retrieve the next set of results.',
      ),
    maxRecords: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of records to retrieve per page. If omitted, the API returns the maximum number of records it can send in a single page.',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId, locator, maxRecords }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfCsv(salesforceCredentials, `/jobs/ingest/${jobId}/successfulResults`, {
      locator: locator,
      maxRecords: max_records,
    });
  },
});

export const salesforceGetJobUnprocessedRecordResults = tool({
  description:
    'Tool to retrieve unprocessed records from a Salesforce Bulk API 2.0 ingest job. Use when you need to get records that were not processed during a bulk operation, typically due to job abortion or interruption.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z.string().describe('The unique identifier of the bulk ingest job.'),
    locator: z
      .string()
      .optional()
      .describe(
        'Pagination token from the Sforce-Locator response header of a previous request, used to retrieve the next set of results.',
      ),
    maxRecords: z
      .number()
      .int()
      .optional()
      .describe(
        'The maximum number of records to retrieve per page. If omitted, the API returns the maximum number of records it can send in a single page.',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId, locator, maxRecords }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfCsv(salesforceCredentials, `/jobs/ingest/${jobId}/unprocessedrecords`, {
      locator: locator,
      maxRecords: max_records,
    });
  },
});

export const salesforceGetQueryJobInfo = tool({
  description:
    'Tool to retrieve information about a Salesforce Bulk API v2 query job. Use when you need to check the status and details of a query job.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z.string().describe('The unique identifier of the Bulk API v2 query job.'),
  }),
  execute: async ({ salesforceCredentials, jobId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/jobs/query/${jobId}`);
  },
});

export const salesforceGetQueryJobResults = tool({
  description:
    'Retrieves results for a completed Bulk API v2 query job in CSV format. Supports pagination for large datasets via maxRecords and locator parameters.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z
      .string()
      .describe(
        'The unique 18-character identifier for the query job whose results you want to retrieve.',
      ),
    locator: z
      .string()
      .optional()
      .describe(
        'A Base64-encoded string used for pagination to retrieve the next set of records. This value is obtained from the Sforce-Locator response header of the previous request. Use this to traverse through subsequent pages of results.',
      ),
    maxRecords: z
      .number()
      .int()
      .optional()
      .describe(
        'Defines the number of records to be downloaded per page. If omitted, the API returns the maximum number of records it can send in a single page. Used to control page size for pagination.',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId, locator, maxRecords }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfCsv(salesforceCredentials, `/jobs/query/${jobId}/results`, {
      locator: locator,
      maxRecords: max_records,
    });
  },
});

export const salesforceUploadJobData = tool({
  description:
    "Tool to upload CSV data to a Salesforce Bulk API v2 ingest job. Use after creating a job and before closing it. Only ONE upload is allowed per job - multiple uploads will fail. After upload, close the job with state 'UploadComplete' to begin processing.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    jobId: z
      .string()
      .describe(
        'The unique identifier of the Bulk API v2 ingest job to upload data to. This is the job ID returned from job creation.',
      ),
    csvData: z
      .string()
      .describe(
        'The CSV-formatted data to upload. First row must contain column headers matching Salesforce object field names. Subsequent rows contain the data records. Line endings must match the lineEnding parameter specified during job creation (LF or ',
      ),
  }),
  execute: async ({ salesforceCredentials, jobId, csvData }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfRaw(
      salesforceCredentials,
      'PUT',
      `/jobs/ingest/${jobId}/batches`,
      csvData,
      'text/csv',
    );
  },
});
