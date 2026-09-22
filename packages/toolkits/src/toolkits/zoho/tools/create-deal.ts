// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateDeal = tool({
    description: 'Creates a new deal in Zoho CRM representing a sales opportunity with deal name, stage, amount, and closing date. Use this action when you need to create a sales deal or opportunity in Zoho CRM. Required fields are Deal_Name and Stage; all other fields are optional. The deal will be assigned to the a',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        Owner: z.record(z.any()).optional().describe('Owner of the deal.'),
        Stage: z.string().describe('The current stage of the deal in the sales pipeline. This is a required field. Common stages include: \'Qualification\', \'Needs Analysis\', \'Value Proposition\', \'Proposal/Price Quote\', \'Negotiat'),
        Amount: z.number().optional().describe('The monetary value of the deal in the account\'s currency. Use decimal format for fractional amounts.'),
        Pipeline: z.string().optional().describe('The sales pipeline this deal belongs to. Required when multiple pipelines are enabled in your Zoho CRM org. Use the exact pipeline name as configured in Zoho CRM.'),
        Deal_Name: z.string().describe('The name of the deal. This is a required field and must be a non-empty string.'),
        Next_Step: z.string().optional().describe('The next action or step planned for moving this deal forward in the sales process.'),
        Description: z.string().optional().describe('A detailed description or notes about the deal, including context, requirements, or special considerations.'),
        Lead_Source: z.string().optional().describe('The source or channel from which this deal originated.'),
        Probability: z.number().int().min(0).max(100).optional().describe('The probability of closing this deal, expressed as a percentage between 0 and 100.'),
        Account_Name: z.record(z.any()).optional().describe('Account associated with the deal.'),
        Closing_Date: z.string().optional().describe('The expected or actual closing date of the deal in YYYY-MM-DD format (ISO 8601 date format).'),
        Contact_Name: z.record(z.any()).optional().describe('Contact associated with the deal.'),
        Campaign_Source: z.record(z.any()).optional().describe('Campaign associated with the deal.'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const body = { data: [rest] };
            const res = await zohoFetch('/Deals', { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create deals', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateDeal', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
