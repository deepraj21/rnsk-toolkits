// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  engagementBody,
  flatProps,
  hubDelete,
  hubGet,
  hubMultipart,
  hubPatch,
  hubPost,
  hubPut,
  mapKeys,
  pickDefined,
  searchBody,
  stripKeys,
  unflattenDeep,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const hubspotCancelImport = tool({
  description:
    'Cancels an active HubSpot data import job using its `importId`; this action is irreversible, and any data already processed will remain.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    importId: z
      .number()
      .int()
      .describe(
        'The unique identifier for the active HubSpot import job to be cancelled; must correspond to an import job currently in progress.',
      ),
  }),
  execute: async ({ hubspotToken, importId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubPost(hubspotToken, `/crm/v3/imports/${encodeURIComponent(String(importId))}/cancel`);
  },
});

export const hubspotFetchImportErrorDetails = tool({
  description:
    'Fetches a paginated list of read-only error details for a specific HubSpot CRM import, requiring a valid `importId` for a processed import.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Pagination token from a previous response's `paging.next.after` property to fetch the next page of error details.",
      ),
    limit: z
      .number()
      .int()
      .optional()
      .describe(
        'Maximum number of error records to return per page (e.g., between 1 and a HubSpot-defined maximum of 100).',
      ),
    importId: z
      .number()
      .int()
      .describe(
        'Identifier of the import operation for which to fetch error details; must correspond to an existing import in HubSpot.',
      ),
  }),
  execute: async ({ hubspotToken, after, limit, importId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/imports/${encodeURIComponent(String(importId))}/errors`, {
      query: pickDefined({ after: after, limit: limit }),
    });
  },
});

export const hubspotGetActiveImportsList = tool({
  description:
    'Retrieves a list of currently active import jobs in HubSpot for monitoring ongoing data operations.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    after: z
      .string()
      .optional()
      .describe(
        "Cursor for the next page of results, from a previous response's `paging.next.after` property.",
      ),
    limit: z.number().int().optional().describe('Maximum number of import results per page.'),
    before: z
      .string()
      .optional()
      .describe('Cursor for the previous page of results, obtained from a previous response.'),
  }),
  execute: async ({ hubspotToken, after, limit, before }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/imports`, {
      query: pickDefined({ after: after, limit: limit, before: before }),
    });
  },
});

export const hubspotGetImportRecordInformation = tool({
  description:
    'Retrieves a comprehensive summary of a specific HubSpot CRM import record by its `importId`, including status, progress, updates, results, and errors; useful for monitoring and troubleshooting data imports.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    importId: z
      .number()
      .int()
      .describe(
        'The unique identifier for the import record to retrieve, typically obtained when an import is initiated or from a list of imports.',
      ),
  }),
  execute: async ({ hubspotToken, importId }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    return hubGet(hubspotToken, `/crm/v3/imports/${encodeURIComponent(String(importId))}`);
  },
});

export const hubspotStartImport = tool({
  description:
    'Call this action to start an asynchronous data import into HubSpot CRM using uploaded files and a detailed `importRequest` JSON configuration, ensuring this JSON correctly maps file columns to HubSpot properties and files align with these mappings. Uploads the file as multipart with the importRequest JSON; the import runs asynchronously.',
  inputSchema: z.object({
    hubspotToken: tokenField,
    files: z
      .record(z.any())
      .optional()
      .describe(
        'The binary content of the file(s) to be imported. Supported formats typically include CSV, XLSX, and XLS. Ensure the file structure aligns with the mappings defined in `importRequest`.',
      ),
    importRequest: z
      .string()
      .optional()
      .describe(
        "A JSON string specifying the configuration for the import process. This configuration dictates how data from the uploaded file(s) is mapped and imported into HubSpot. Key properties include `name` (a descriptive name for the import, e.g., \"Q3 Contact Import\"), `dateFormat` (e.g., 'MONTH_DAY_YEAR', 'DAY_MONTH_YEAR'), `importOperations` (defines if the import should create and update, only create, or only update records, e.g., 'CREATE_AND_UPDATE'), and `files` (an array detailing each file, its format, and `columnMappings`). The `columnMappings` are crucial as they map spreadsheet columns to HubSpot CRM object properties (e.g., map 'Email Address' column to 'CONTACT' object's 'email' property).",
      ),
  }),
  execute: async ({ hubspotToken, files, importRequest }) => {
    if (!hubspotToken) return { error: 'HubSpot access token is required. Connect HubSpot first.' };
    if (!files) return { error: 'A file with name and base64 content is required.' };
    if (!importRequest) return { error: 'importRequest JSON configuration is required.' };
    const list = Array.isArray(files) ? files : [files];
    const form = new FormData();
    form.append('importRequest', String(importRequest));
    for (const f of list) {
      if (!f || !f.content || !f.name)
        return { error: 'Each file needs a name and base64 content.' };
      form.append('files', new Blob([Buffer.from(String(f.content), 'base64')]), String(f.name));
    }
    return hubMultipart(hubspotToken, '/crm/v3/imports', form);
  },
});
