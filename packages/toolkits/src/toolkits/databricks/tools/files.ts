// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );
const wsPathField = z.string().describe('Workspace path, e.g. /Users/me@example.com/notebook');

export const databricksListWorkspace = tool({
  description: 'List objects (notebooks, folders, files) under a workspace path. Use to browse.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('Workspace directory path, e.g. /Users/me@example.com'),
  }),
  execute: async ({ databricksCredentials, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/list', {
        query: { path },
      });
      if (!result.ok) return failedResult('Failed to list workspace', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing workspace');
    }
  },
});

export const databricksGetWorkspaceStatus = tool({
  description: 'Get object type, language, and resource type of one workspace path.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: wsPathField,
  }),
  execute: async ({ databricksCredentials, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/get-status', {
        query: { path },
      });
      if (!result.ok) return failedResult('Failed to get workspace status', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting workspace status');
    }
  },
});

export const databricksMakeWorkspaceDirectory = tool({
  description: 'Create a workspace directory (parents created as needed).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('Directory path to create'),
  }),
  execute: async ({ databricksCredentials, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/mkdirs', {
        method: 'POST',
        body: { path },
      });
      if (!result.ok) return failedResult('Failed to create workspace directory', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating workspace directory');
    }
  },
});

export const databricksDeleteWorkspaceObject = tool({
  description: 'Delete a notebook, file, or directory (recursive for non-empty folders).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: wsPathField,
    recursive: z.boolean().optional().describe('Delete non-empty directories recursively'),
  }),
  execute: async ({ databricksCredentials, path, recursive }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/delete', {
        method: 'POST',
        body: { path, ...(recursive !== undefined ? { recursive } : {}) },
      });
      if (!result.ok) return failedResult('Failed to delete workspace object', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting workspace object');
    }
  },
});

export const databricksExportWorkspaceFile = tool({
  description:
    'Export a notebook or file as base64 content (SOURCE, HTML, JUPYTER, or DBC format for notebooks).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: wsPathField,
    format: z
      .enum(['SOURCE', 'HTML', 'JUPYTER', 'DBC', 'AUTO'])
      .optional()
      .describe('Export format (default AUTO)'),
  }),
  execute: async ({ databricksCredentials, path, format }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/export', {
        query: { path, format, direct_download: false },
      });
      if (!result.ok) return failedResult('Failed to export workspace file', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error exporting workspace file');
    }
  },
});

export const databricksImportWorkspaceFile = tool({
  description:
    'Import a notebook or file from base64 content. Specify language for notebooks (PYTHON, SQL, SCALA, R) or format AUTO.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: wsPathField,
    contentBase64: z.string().describe('File content base64-encoded'),
    language: z
      .enum(['PYTHON', 'SQL', 'SCALA', 'R'])
      .optional()
      .describe('Notebook language (omit for non-notebook files)'),
    format: z
      .enum(['SOURCE', 'HTML', 'JUPYTER', 'DBC', 'AUTO'])
      .optional()
      .describe('Import format (default SOURCE for notebooks)'),
    overwrite: z.boolean().optional().describe('Overwrite an existing object at the path'),
  }),
  execute: async ({ databricksCredentials, path, contentBase64, language, format, overwrite }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/workspace/import', {
        method: 'POST',
        body: {
          path,
          content: contentBase64,
          ...(language !== undefined ? { language } : {}),
          ...(format !== undefined ? { format } : {}),
          ...(overwrite !== undefined ? { overwrite } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to import workspace file', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error importing workspace file');
    }
  },
});

export const databricksGetDbfsStatus = tool({
  description: 'Get DBFS status: total/used space and block/file counts. Use for storage checks.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
  }),
  execute: async ({ databricksCredentials }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/get-status');
      if (!result.ok) return failedResult('Failed to get DBFS status', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting DBFS status');
    }
  },
});

export const databricksListDbfs = tool({
  description: 'List files in a DBFS directory (dbfs:/...). Use to browse distributed storage.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('DBFS path, e.g. dbfs:/mnt/data'),
  }),
  execute: async ({ databricksCredentials, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/list', {
        query: { path },
      });
      if (!result.ok) return failedResult('Failed to list DBFS', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing DBFS');
    }
  },
});

export const databricksMakeDbfsDirectory = tool({
  description: 'Create a DBFS directory.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('DBFS path to create'),
  }),
  execute: async ({ databricksCredentials, path }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/mkdirs', {
        method: 'POST',
        body: { path },
      });
      if (!result.ok) return failedResult('Failed to create DBFS directory', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating DBFS directory');
    }
  },
});

export const databricksReadDbfsFile = tool({
  description:
    'Read a slice of a DBFS file as base64 (1MB max per call). Use offset/length to page through large files.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('DBFS file path'),
    offset: z.number().int().min(0).optional().describe('Byte offset to start from'),
    length: z.number().int().min(1).optional().describe('Bytes to read (max ~1MB)'),
  }),
  execute: async ({ databricksCredentials, path, offset, length }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/read', {
        query: { path, offset, length },
      });
      if (!result.ok) return failedResult('Failed to read DBFS file', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error reading DBFS file');
    }
  },
});

export const databricksWriteDbfsFile = tool({
  description:
    'Write a small text file to DBFS (base64 content, ~1MB limit). For larger files use chunked upload tooling.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('DBFS file path'),
    contentBase64: z.string().describe('File content base64-encoded'),
    overwrite: z.boolean().optional().describe('Overwrite an existing file'),
  }),
  execute: async ({ databricksCredentials, path, contentBase64, overwrite }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/put', {
        method: 'POST',
        body: {
          path,
          contents: contentBase64,
          ...(overwrite !== undefined ? { overwrite } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to write DBFS file', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error writing DBFS file');
    }
  },
});

export const databricksMoveDbfsObject = tool({
  description: 'Move (rename) a DBFS file or directory.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    sourcePath: z.string().describe('Source DBFS path'),
    destinationPath: z.string().describe('Destination DBFS path'),
  }),
  execute: async ({ databricksCredentials, sourcePath, destinationPath }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/move', {
        method: 'POST',
        body: { source_path: sourcePath, destination_path: destinationPath },
      });
      if (!result.ok) return failedResult('Failed to move DBFS object', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error moving DBFS object');
    }
  },
});

export const databricksDeleteDbfsObject = tool({
  description: 'Delete a DBFS file or directory (recursive for non-empty folders).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    path: z.string().describe('DBFS path to delete'),
    recursive: z.boolean().optional().describe('Delete non-empty directories recursively'),
  }),
  execute: async ({ databricksCredentials, path, recursive }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.0/dbfs/delete', {
        method: 'POST',
        body: { path, ...(recursive !== undefined ? { recursive } : {}) },
      });
      if (!result.ok) return failedResult('Failed to delete DBFS object', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting DBFS object');
    }
  },
});
