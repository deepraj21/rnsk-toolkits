// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateZohoTag = tool({
    description: 'Creates a new tag in Zoho CRM for a specific module. Tags help organize and categorize CRM records. Each module can have up to 100 tags, and each record can have up to 10 tags assigned. Tags must have unique names within a module and can be assigned custom colors from a predefined palette. Creating ',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        name: z.string().describe('The name of the tag to create. Maximum 25 characters. Cannot contain \'<\', \'>\', commas, or emojis.'),
        color_code: z.string().optional().describe('Hex color code for the tag. Must be one of the 13 allowed colors: #F17574 (red), #F48435 (orange), #E7A826 (yellow), #A8C026 (lime), #63C57E (green), #1DB9B4 (teal), #57B1FD (blue), #879BFC (indigo), '),
        module_api_name: z.string().describe('The API name of the Zoho CRM module to create the tag in. Supported modules: Leads, Accounts, Contacts, Deals, Campaigns, Tasks, Cases, Events, Calls, Solutions, Products, Vendors, Price Books, Quotes'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const { moduleApiName, name, colorCode } = rest as any;
            const body: any = { tags: [{ name, color_code: colorCode }] };
            const res = await zohoFetch(`/settings/tags?module=${moduleApiName}`, { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create tag', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateZohoTag', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
