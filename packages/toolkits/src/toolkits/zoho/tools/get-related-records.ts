// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoGetRelatedRecords = tool({
    description: 'Fetch related-list records (e.g., Notes, Attachments, Emails) for a Zoho CRM parent record using related_list_api_name. Use ZOHO_GET_RELATED_LISTS first to discover the correct api_name for the related list you want to access. Supports pagination for large result sets (up to 2,000 records with page/',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        ids: z.string().optional().describe('Comma-separated list of specific related record IDs to retrieve. Use this to fetch only certain related records instead of all related records. Example: \'4876876000000636001,4876876000000636002\''),
        page: z.number().int().min(1).optional().describe('Page number to retrieve (default: 1). Without page_token, only the first 2,000 records are accessible using page/per_page pagination. Maximum page number is floor(2000/per_page). Do not use together w'),
        fields: z.string().min(1).describe('Comma-separated API names of the fields to retrieve (required by Zoho for this API). Specify the field names from the related list module whose details you want to receive. Example: \'Note_Title,Note_'),
        sort_by: z.string().optional().describe('Valid fields for sorting related records.'),
        per_page: z.number().int().min(1).max(200).optional().describe('Number of records per page (default and maximum: 200). Applies to both page and page_token pagination.'),
        converted: z.string().optional().describe('Filter for converted status (applicable to certain related lists).'),
        record_id: z.string().describe('The unique identifier of the parent record for which to retrieve related records. This is the ID of the record in the specified module.'),
        page_token: z.string().optional().describe('Token-based pagination parameter to fetch records beyond the 2,000-record discrete limit. Use the info.next_page_token from the previous response. Cannot be used together with page.'),
        sort_order: z.string().optional().describe('Sort order for related records.'),
        module_api_name: z.string().describe('The API name of the parent module containing the record. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', \'Tasks\', etc. This must be a valid module API name in Zoho CRM.'),
        related_list_api_name: z.string().describe('The API name of the related list to retrieve (e.g., \'Notes\', \'Attachments\', \'Emails\'). IMPORTANT: Use the ZOHO_GET_RELATED_LISTS action first to discover the correct api_name for the related lis'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/${p.related_list_api_name}`;
            const res = await zohoFetch(path, { zohoToken, method: 'GET', query: p });
            if (!res.ok) return { error: 'Failed', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoGetRelatedRecords', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
