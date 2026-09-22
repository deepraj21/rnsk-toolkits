// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoUpdateAccount = tool({
    description: 'Updates an existing Account record in Zoho CRM with the specified field values. Only the fields provided in the request will be updated; other fields remain unchanged. Use this action when you need to modify specific details of an existing account, such as contact information, address, ownership, or',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        Fax: z.string().optional().describe('Fax number for the account'),
        Owner: z.record(z.any()).optional().describe('Owner lookup field, formatted as {\'id\': \'zoho_user_id\'}. Use the Zoho user ID, not email or display name'),
        Phone: z.string().optional().describe('Primary phone number for the account'),
        Rating: z.string().optional().describe('Rating of the account (e.g., \'Active\', \'Market Failed\', \'Project Cancelled\', \'Shutdown\')'),
        Website: z.string().optional().describe('Company website URL'),
        Industry: z.string().optional().describe('Industry sector of the account (e.g., \'ASP\', \'Data/Telecom OEM\', \'ERP\', \'Government/Military\', \'Large Enterprise\', \'ManagementISV\', \'MSP\', \'Network Equipment\', \'Non-profit\', \'Small '),
        SIC_Code: z.string().optional().describe('Standard Industrial Classification Code'),
        Employees: z.number().int().optional().describe('Number of employees at the company'),
        Ownership: z.string().optional().describe('Ownership type (e.g., \'Public\', \'Private\', \'Subsidiary\', \'Other\')'),
        record_id: z.string().describe('Unique identifier of the Account record to update'),
        Description: z.string().optional().describe('Additional notes or description about the account'),
        Account_Name: z.string().optional().describe('Name of the account/company'),
        Account_Site: z.string().optional().describe('Account site or location identifier'),
        Account_Type: z.string().optional().describe('Type/category of the account (e.g., \'Analyst\', \'Competitor\', \'Customer\', \'Integrator\', \'Investor\', \'Partner\', \'Press\', \'Prospect\', \'Reseller\', \'Other\')'),
        Billing_City: z.string().optional().describe('City for billing address'),
        Billing_Code: z.string().optional().describe('Postal/ZIP code for billing address'),
        Billing_State: z.string().optional().describe('State/province for billing address'),
        Shipping_City: z.string().optional().describe('City for shipping address'),
        Shipping_Code: z.string().optional().describe('Postal/ZIP code for shipping address'),
        Ticker_Symbol: z.string().optional().describe('Stock ticker symbol (if publicly traded)'),
        Account_Number: z.number().int().optional().describe('Account number or identifier (numeric value)'),
        Annual_Revenue: z.number().optional().describe('Annual revenue of the company'),
        Billing_Street: z.string().optional().describe('Street address for billing'),
        Parent_Account: z.record(z.any()).optional().describe('Parent account lookup field, formatted as {\'id\': \'parent_account_id\'}'),
        Shipping_State: z.string().optional().describe('State/province for shipping address'),
        Billing_Country: z.string().optional().describe('Country for billing address'),
        Shipping_Street: z.string().optional().describe('Street address for shipping'),
        Shipping_Country: z.string().optional().describe('Country for shipping address'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const { recordId, ...fields } = rest as any;
            const body = { data: [{ id: recordId, ...fields }] };
            const res = await zohoFetch('/Accounts', { zohoToken, method: 'PUT', body });
            if (!res.ok) return { error: 'Failed to update account', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoUpdateAccount', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
