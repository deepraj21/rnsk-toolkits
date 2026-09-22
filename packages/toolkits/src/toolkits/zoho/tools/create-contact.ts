// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zohoFetch } from './utils.js';

export const ZohoCreateContact = tool({
    description: 'Creates a new contact record in Zoho CRM. Use this action when you need to add a new contact to the CRM system. The Last_Name field is mandatory and must be provided with a non-empty value.',
    inputSchema: z.object({
        zohoToken: z.string().describe('Zoho OAuth access token (Zoho-oauthtoken).'),
        fax: z.string().optional().describe('Fax number of the contact'),
        email: z.string().optional().describe('Email address of the contact'),
        owner: z.record(z.any()).optional().describe('Reference to another contact or user in Zoho CRM.'),
        phone: z.string().optional().describe('Phone number of the contact'),
        title: z.string().optional().describe('Job title of the contact'),
        mobile: z.string().optional().describe('Mobile phone number of the contact'),
        twitter: z.string().optional().describe('Twitter handle of the contact'),
        skype_id: z.string().optional().describe('Skype ID of the contact'),
        assistant: z.string().optional().describe('Name of the contact\'s assistant'),
        last_name: z.string().describe('Last name of the contact (required field, must be non-empty)'),
        other_zip: z.string().optional().describe('ZIP code for other address'),
        asst_phone: z.string().optional().describe('Phone number of the contact\'s assistant'),
        department: z.string().optional().describe('Department where the contact works'),
        first_name: z.string().optional().describe('First name of the contact'),
        home_phone: z.string().optional().describe('Home phone number of the contact'),
        other_city: z.string().optional().describe('City for other address'),
        description: z.string().optional().describe('Description or notes about the contact'),
        lead_source: z.string().optional().describe('Source from which the contact was acquired'),
        mailing_zip: z.string().optional().describe('ZIP code for mailing address'),
        other_phone: z.string().optional().describe('Alternative phone number of the contact'),
        other_state: z.string().optional().describe('State for other address'),
        vendor_name: z.string().optional().describe('Name of the vendor associated with this contact'),
        account_name: z.string().optional().describe('Name of the account associated with this contact'),
        mailing_city: z.string().optional().describe('City for mailing address'),
        other_street: z.string().optional().describe('Street address for other address'),
        reporting_to: z.record(z.any()).optional().describe('Reference to another contact or user in Zoho CRM.'),
        date_of_birth: z.string().optional().describe('Date of birth of the contact in YYYY-MM-DD format'),
        mailing_state: z.string().optional().describe('State for mailing address'),
        other_country: z.string().optional().describe('Country for other address'),
        mailing_street: z.string().optional().describe('Street address for mailing'),
        mailing_country: z.string().optional().describe('Country for mailing address'),
        secondary_email: z.string().optional().describe('Secondary email address of the contact'),
    }),
    execute: async (params) => {
        const { zohoToken, ...rest } = params as any;
        if (!zohoToken) return { error: 'Zoho token is required. Connect Zoho CRM first.' };
        try {
            const body = { data: [rest] };
            const res = await zohoFetch('/Contacts', { zohoToken, method: 'POST', body });
            if (!res.ok) return { error: 'Failed to create contacts', details: res.data };
            return res.data;
        } catch (e) {
            return { error: 'Error in ZohoCreateContact', message: e instanceof Error ? e.message : 'Unknown error' };
        }
    },
});
