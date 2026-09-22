// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateEmailDraft = tool({
    description: 'Updates an existing email draft associated with a record in Zoho CRM. Requires the draft ID, sender address, and text format. Use this action when you need to modify the recipients, subject, content, scheduling, or attachments of an existing email draft before sending. Supports updating up to 100 em',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        cc: z.array(z.record(z.any())).optional().describe('Array of CC recipient objects'),
        id: z.string().describe('Unique identifier of the email draft to update'),
        to: z.array(z.record(z.any())).optional().describe('Array of recipient objects with user_name and email'),
        bcc: z.array(z.record(z.any())).optional().describe('Array of BCC recipient objects'),
        from: z.string().describe('Sender\'s email address'),
        content: z.string().optional().describe('Email body content (plain text or HTML based on rich_text setting)'),
        subject: z.string().optional().describe('Email subject line'),
        reply_to: z.string().optional().describe('Reply-to email address for recipient responses'),
        record_id: z.string().describe('Unique identifier of the record to which the email draft is associated'),
        rich_text: z.boolean().describe('Indicates email format: true for rich text (HTML), false for plain text'),
        attachments: z.array(z.record(z.any())).optional().describe('Array of attachment objects with id and file_name'),
        module_api_name: z.string().describe('The API name of the module containing the record to which the email draft is associated. Valid modules: Leads, Contacts, Deals, Accounts, Sales_Orders, Purchase_Orders, Invoices, Quotes, Cases, or Cus'),
        schedule_details: z.record(z.any()).optional().describe('Scheduling information for the email draft.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const p: any = rest;
            const path = `/${p.module_api_name}/${p.record_id}/__email_drafts/${p.id}`;
            // For bulk updates, Zoho expects {data: [...]}
            const body = p.data ? { data: p.data, trigger: p.trigger } : { data: [p] };
            const res = await zohoFetch(path, { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateEmailDraft', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
