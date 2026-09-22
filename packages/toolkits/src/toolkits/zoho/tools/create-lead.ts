// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateLead = tool({
    description: 'Creates a new lead record in Zoho CRM with the specified details. The only mandatory field is Last_Name - all other fields are optional. Use this action when you need to add a new lead to Zoho CRM, typically after capturing lead information from a web form, email, or other lead generation source. Th',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        Fax: z.string().optional().describe('Fax number of the lead'),
        City: z.string().optional().describe('City of the lead\'s address'),
        Email: z.string().optional().describe('Email address of the lead'),
        Phone: z.string().optional().describe('Phone number of the lead (up to 30 characters)'),
        State: z.string().optional().describe('State or province of the lead\'s address'),
        Mobile: z.string().optional().describe('Mobile phone number of the lead'),
        Rating: z.string().optional().describe('Rating of the lead (e.g., Acquired, Active, Market Failed, Project Cancelled, Shutdown)'),
        Street: z.string().optional().describe('Street address of the lead'),
        lar_id: z.string().optional().describe('Lead assignment rule ID to apply when creating the lead. This determines which user the lead will be assigned to based on predefined rules'),
        Company: z.string().optional().describe('Company name associated with the lead'),
        Country: z.string().optional().describe('Country of the lead\'s address'),
        Twitter: z.string().optional().describe('Twitter handle of the lead'),
        Website: z.string().optional().describe('Website URL of the lead\'s company'),
        trigger: z.array(z.string()).optional().describe('List of workflow triggers to execute during lead creation (e.g., [\'workflow\', \'approval\', \'blueprint\']). Use this only when you explicitly need to trigger workflows, approvals, or blueprints, as'),
        Industry: z.string().optional().describe('Industry sector of the lead\'s company'),
        Skype_ID: z.string().optional().describe('Skype ID of the lead'),
        Zip_Code: z.string().optional().describe('Postal or ZIP code of the lead\'s address'),
        Last_Name: z.string().describe('Last name of the lead - this is a mandatory field in Zoho CRM'),
        First_Name: z.string().optional().describe('First name of the lead'),
        Salutation: z.string().optional().describe('Salutation or title for the lead (e.g., Mr., Ms., Dr., Prof.)'),
        Description: z.string().optional().describe('Additional notes or description about the lead'),
        Designation: z.string().optional().describe('Job title or designation of the lead'),
        Lead_Source: z.string().optional().describe('Source from which the lead was acquired (e.g., Advertisement, Cold Call, Employee Referral, External Referral, Online Store, Partner, Public Relations, Sales Email Alias, Seminar Partner, Internal Sem'),
        Lead_Status: z.string().optional().describe('Current status of the lead (e.g., Attempted to Contact, Contact in Future, Contacted, Junk Lead, Lost Lead, Not Contacted, Pre-Qualified, Not Qualified)'),
        Annual_Revenue: z.number().optional().describe('Annual revenue of the lead\'s company'),
        No_of_Employees: z.number().int().optional().describe('Number of employees in the lead\'s company'),
        Secondary_Email: z.string().optional().describe('Secondary email address of the lead'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const body = { data: [rest] };
            const res = await zohoFetch('/Leads', { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create leads', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateLead', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
