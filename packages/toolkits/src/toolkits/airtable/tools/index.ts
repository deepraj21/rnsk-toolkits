// @ts-nocheck
import {
  createComment,
  createRecords,
  deleteComment,
  deleteRecords,
  getRecord,
  listComments,
  listRecords,
  updateComment,
  updateRecords,
  upsertRecords,
} from './records.js';
import {
  createField,
  createTable,
  getBaseSchema,
  listBases,
  updateField,
  updateTable,
} from './schema.js';
import {
  createWebhook,
  deleteWebhook,
  listWebhookPayloads,
  listWebhooks,
  refreshWebhook,
} from './webhooks.js';

export {
  listRecords,
  getRecord,
  createRecords,
  updateRecords,
  upsertRecords,
  deleteRecords,
  listComments,
  createComment,
  updateComment,
  deleteComment,
  listBases,
  getBaseSchema,
  createTable,
  updateTable,
  createField,
  updateField,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  listWebhookPayloads,
  refreshWebhook,
};

const auth = 'airtableAccessToken' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(
  name: string,
  description: string,
  toolRef: any,
  scope: Scope,
  keywords: string[] = [],
): {
  name: string;
  description: string;
  tool: any;
  requiredAuth: typeof auth;
  scope: Scope;
  keywords: string[];
} {
  return { name, description, tool: toolRef, requiredAuth: auth, scope, keywords };
}

export const airtableTools = [
  entry(
    'airtableListRecords',
    'List records in a table with formula filters, sorting, views and pagination.',
    listRecords,
    'read',
    ['record', 'row', 'rows', 'query'],
  ),
  entry('airtableGetRecord', 'Get a single record by ID.', getRecord, 'read', ['row']),
  entry('airtableCreateRecords', 'Create up to 10 records in a table.', createRecords, 'write', [
    'record',
    'row',
    'rows',
    'add',
  ]),
  entry(
    'airtableUpdateRecords',
    'Update up to 10 records (only given fields change).',
    updateRecords,
    'write',
    ['record', 'row', 'edit'],
  ),
  entry(
    'airtableUpsertRecords',
    'Create or update up to 10 records matched on key fields.',
    upsertRecords,
    'write',
    ['record', 'sync'],
  ),
  entry('airtableDeleteRecords', 'Delete up to 10 records from a table.', deleteRecords, 'delete', [
    'record',
    'row',
    'remove',
  ]),
  entry('airtableListComments', 'List comments on a record.', listComments, 'read', ['comment']),
  entry(
    'airtableCreateComment',
    'Add a comment to a record (supports @[userId] mentions).',
    createComment,
    'write',
    ['comment'],
  ),
  entry('airtableUpdateComment', 'Update the text of a record comment.', updateComment, 'write', [
    'comment',
    'edit',
  ]),
  entry('airtableDeleteComment', 'Delete a comment from a record.', deleteComment, 'delete', [
    'comment',
    'remove',
  ]),
  entry(
    'airtableListBases',
    'List accessible bases with IDs and permission levels. Start here.',
    listBases,
    'read',
    ['base', 'database'],
  ),
  entry(
    'airtableGetBaseSchema',
    'Get a base schema: tables, fields, types and views.',
    getBaseSchema,
    'read',
    ['base', 'database', 'structure'],
  ),
  entry('airtableCreateTable', 'Create a table in a base with fields.', createTable, 'write', [
    'sheet',
  ]),
  entry('airtableUpdateTable', 'Rename a table or change its description.', updateTable, 'write', [
    'rename',
    'sheet',
  ]),
  entry('airtableCreateField', 'Add a field (column) to a table.', createField, 'write', [
    'column',
  ]),
  entry(
    'airtableUpdateField',
    'Update a field name, description or options.',
    updateField,
    'write',
    ['column', 'edit'],
  ),
  entry('airtableListWebhooks', 'List webhooks registered on a base.', listWebhooks, 'read', [
    'webhook',
  ]),
  entry(
    'airtableCreateWebhook',
    'Register a webhook for base change notifications.',
    createWebhook,
    'write',
    ['webhook', 'subscribe'],
  ),
  entry('airtableDeleteWebhook', 'Delete a webhook from a base.', deleteWebhook, 'delete', [
    'webhook',
    'unsubscribe',
  ]),
  entry(
    'airtableListWebhookPayloads',
    'Consume webhook payloads (record changes) with cursor pagination.',
    listWebhookPayloads,
    'read',
    ['webhook', 'events'],
  ),
  entry(
    'airtableRefreshWebhook',
    'Extend an active webhook expiry by 7 days.',
    refreshWebhook,
    'write',
    ['webhook', 'renew'],
  ),
];
