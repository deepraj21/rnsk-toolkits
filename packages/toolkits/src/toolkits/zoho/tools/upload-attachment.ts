// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUploadAttachment = tool({
    description: 'Tool to upload a file as an Attachment to a specific Zoho CRM record. Use when you need to store files (PDFs, documents, images) in a record\'s Attachments section.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        file: z.record(z.any()).optional().describe('File to upload as an attachment.'),
        title: z.string().optional().describe('Deprecated. This field is ignored because remote URL attachments are not supported.'),
        record_id: z.string().describe('The unique ID of the record to attach the file or URL to.'),
        attachmentUrl: z.string().optional().describe('Deprecated. Remote URL attachments are not supported because Zoho fetches the URL server-side.'),
        module_api_name: z.string().describe('The API name of the module containing the record. Examples: \'Leads\', \'Contacts\', \'Accounts\', \'Deals\', etc.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const { moduleApiName, recordId, file } = rest as any;
            if (!file?.s3key) return { error: 'File s3key is required for upload' };
            // For Zoho, file upload is multipart; here we proxy via simple JSON for now
            const res = await zohoFetch(`/${moduleApiName}/${recordId}/Attachments`, { zohoToken, method: 'POST', body: { file } });
            if (!res.ok) return { error: 'Failed to upload attachment', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUploadAttachment', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
