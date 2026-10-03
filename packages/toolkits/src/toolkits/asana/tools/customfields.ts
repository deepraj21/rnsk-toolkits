// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { asanaDelete, asanaGet, asanaPost, asanaPut, optQuery, pageQuery } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const gid = (label: string) => z.string().describe(label);
const optFields = z.array(z.string()).optional().describe('Extra fields to include');
const optPretty = z.boolean().optional().describe('Pretty-print response (debugging only)');
const paging = {
  limit: z.number().int().min(1).max(100).optional().describe('Results per page'),
  offset: z.string().optional().describe('Pagination offset token'),
};

export const asanaGetCustomFieldsForWorkspace = tool({
  description: 'List custom fields defined in a workspace.',
  inputSchema: z.object({
    asanaToken: tokenField,
    workspaceGid: z.string().describe('Workspace GID'),
    ...paging,
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, workspaceGid, limit, offset, optFields, optPretty }) =>
    asanaGet(asanaToken, `/workspaces/${workspaceGid}/custom_fields`, {
      query: { ...pageQuery(limit, offset), ...optQuery(optFields, optPretty) },
    }),
});

export const asanaGetCustomField = tool({
  description: 'Get a custom field definition by GID (type, options, enabled projects).',
  inputSchema: z.object({
    asanaToken: tokenField,
    customFieldGid: gid('Custom field GID'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, customFieldGid, optFields, optPretty }) =>
    asanaGet(asanaToken, `/custom_fields/${customFieldGid}`, {
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaCreateCustomField = tool({
  description:
    'Create an organization-wide custom field (text, number, enum, date, multi-enum, people).',
  inputSchema: z.object({
    asanaToken: tokenField,
    data: z
      .record(z.any())
      .describe(
        'Field definition, e.g. {"name":"Priority","resource_subtype":"enum","workspace":"123","enum_options":[{"name":"High","color":"red"}]}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, data, optFields, optPretty }) =>
    asanaPost(asanaToken, '/custom_fields', { body: data, query: optQuery(optFields, optPretty) }),
});

export const asanaUpdateCustomField = tool({
  description: 'Update a custom field name, description, or display value.',
  inputSchema: z.object({
    asanaToken: tokenField,
    customFieldGid: gid('Custom field GID to update'),
    data: z
      .record(z.any())
      .describe('Fields to update, e.g. {"name":"Urgency","description":"..."}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, customFieldGid, data, optFields, optPretty }) =>
    asanaPut(asanaToken, `/custom_fields/${customFieldGid}`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaDeleteCustomField = tool({
  description: 'Delete a custom field everywhere it is used.',
  inputSchema: z.object({
    asanaToken: tokenField,
    customFieldGid: gid('Custom field GID to delete'),
  }),
  execute: ({ asanaToken, customFieldGid }) =>
    asanaDelete(asanaToken, `/custom_fields/${customFieldGid}`),
});

export const asanaCreateEnumOptionForCustomField = tool({
  description: 'Append an enum option to the end of an enum custom field.',
  inputSchema: z.object({
    asanaToken: tokenField,
    customFieldGid: gid('Enum custom field GID'),
    data: z
      .record(z.any())
      .describe('Option, e.g. {"name":"Critical","color":"red","enabled":true}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, customFieldGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, `/custom_fields/${customFieldGid}/enum_options`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaInsertEnumOptionForCustomField = tool({
  description: 'Insert an enum option at a specific position in an enum custom field.',
  inputSchema: z.object({
    asanaToken: tokenField,
    customFieldGid: gid('Enum custom field GID'),
    data: z
      .record(z.any())
      .describe(
        'Insert payload, e.g. {"name":"Blocker","color":"red","insert_after":"111"} or {"name":"Triage","insert_before":"222"}',
      ),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, customFieldGid, data, optFields, optPretty }) =>
    asanaPost(asanaToken, `/custom_fields/${customFieldGid}/enum_options/insert`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});

export const asanaUpdateEnumOption = tool({
  description: 'Update an enum option name, color, or enabled state.',
  inputSchema: z.object({
    asanaToken: tokenField,
    enumOptionGid: gid('Enum option GID to update'),
    data: z
      .record(z.any())
      .describe('Fields to update, e.g. {"name":"P0","color":"red","enabled":true}'),
    optFields,
    optPretty,
  }),
  execute: ({ asanaToken, enumOptionGid, data, optFields, optPretty }) =>
    asanaPut(asanaToken, `/enum_options/${enumOptionGid}`, {
      body: data,
      query: optQuery(optFields, optPretty),
    }),
});
