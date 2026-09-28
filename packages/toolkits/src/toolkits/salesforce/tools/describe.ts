// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { sfDelete, sfGet, sfHead, sfPatch, sfPost, sfPut, sfRaw, sfCsv } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const salesforceGetListViewResults = tool({
  description:
    'Retrieves the results of a list view for a specified sObject. Returns column definitions and record data with a 2,000 record limit per response.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobject: z
      .string()
      .describe(
        "The API name of the Salesforce object (e.g., 'Account', 'Contact', 'Opportunity').",
      ),
    listViewId: z
      .string()
      .describe('The unique 18-character ID of the list view to retrieve results from.'),
  }),
  execute: async ({ salesforceCredentials, sobject, listViewId }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobject}/listviews/${listViewId}/results`);
  },
});

export const salesforceGetSobjectListView = tool({
  description:
    'Tool to retrieve basic information about a specific list view for an sObject. Use when you need to get list view metadata including its ID, label, developer name, and URLs for accessing results and detailed descriptions.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    listViewId: z
      .string()
      .describe('The unique identifier (18-character ID) of the specific list view to retrieve.'),
    sobjectName: z
      .string()
      .describe(
        'The type of sObject to which the list view applies (e.g., Account, Contact, Opportunity).',
      ),
  }),
  execute: async ({ salesforceCredentials, listViewId, sobjectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobjectName}/listviews/${listViewId}`);
  },
});

export const salesforceGetSobjectListViews = tool({
  description:
    'Tool to retrieve list views for a specified sObject. Use when you need to discover available filtered views of records for objects like Account, Contact, Lead, or Opportunity.',
  inputSchema: z.object({
    salesforceCredentials: tokenField,
    sobjectName: z
      .string()
      .describe(
        "The API name of the sObject type (e.g., Account, Contact, Lead, Opportunity, Case). Required to specify which object type's list views to retrieve.",
      ),
  }),
  execute: async ({ salesforceCredentials, sobjectName }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/${sobjectName}/listviews`);
  },
});

export const salesforceRetrieveNoteObjectInformation = tool({
  description:
    "DEPRECATED: Retrieves comprehensive metadata for the Salesforce 'Note' SObject, if it is enabled and accessible, to understand its structure and capabilities.",
  inputSchema: z.object({
    salesforceCredentials: tokenField,
  }),
  execute: async ({ salesforceCredentials }) => {
    if (!salesforceCredentials)
      return { error: 'Salesforce credentials are required. Connect Salesforce first.' };
    return sfGet(salesforceCredentials, `/sobjects/Note`);
  },
});
