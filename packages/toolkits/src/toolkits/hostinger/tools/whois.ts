// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { hostingerRequest } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

const whoisDetails = z.object({
    firstName: z.string().describe('First name of the contact person'),
    lastName: z.string().describe('Last name of the contact person'),
    email: z.string().describe('Contact email address'),
    address: z.string().describe('Street address'),
    city: z.string().describe('City name'),
    state: z.string().optional().describe('State or province'),
    country: z.string().optional().describe('Country name'),
    countryCode: z.string().optional().describe('ISO 3166 2-letter country code'),
    postalCode: z.string().optional().describe('Postal or ZIP code'),
    companyName: z.string().optional().describe('Company or organization name'),
    phoneCc: z.string().optional().describe('Phone country code, e.g. "31"'),
    phoneNumber: z.string().optional().describe('Phone number'),
}).describe('WHOIS contact details');

export const hostingerCreateWhoisProfile = tool({
    description:
        'Create a WHOIS contact profile for domain registration. Required before registering domains; the profile holds registrant contact details for a given TLD.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        tld: z.string().describe('TLD without leading dot, e.g. "com"'),
        entityType: z.enum(['individual', 'organization']).describe('Legal entity type'),
        country: z.string().describe('ISO 3166 2-letter country code, e.g. "NL"'),
        whoisDetails,
    }),
    execute: async ({ hostingerApiKey, tld, entityType, country, whoisDetails }) => {
        const { firstName, lastName, address, city, state, country: c, countryCode, postalCode, companyName, phoneCc, phoneNumber, email } = whoisDetails;
        return hostingerRequest(hostingerApiKey, '/api/domains/v1/whois', {
            method: 'POST',
            body: {
                tld,
                entity_type: entityType,
                country,
                whois_details: {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    address,
                    city,
                    state,
                    country: c,
                    country_code: countryCode,
                    postal_code: postalCode,
                    company_name: companyName,
                    phone_cc: phoneCc,
                    phone_number: phoneNumber,
                },
            },
        });
    },
});

export const hostingerGetWhoisProfile = tool({
    description:
        'Get a WHOIS contact profile by ID, including registrant contact details. Use to review contact info used for domain registration.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        whoisId: z.number().int().describe('WHOIS profile ID'),
    }),
    execute: async ({ hostingerApiKey, whoisId }) => {
        return hostingerRequest(hostingerApiKey, `/api/domains/v1/whois/${whoisId}`);
    },
});

export const hostingerGetWhoisProfileUsage = tool({
    description:
        'List domains where a given WHOIS contact profile is used. Use to audit which domains share contact information.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        whoisId: z.number().int().describe('WHOIS profile ID'),
    }),
    execute: async ({ hostingerApiKey, whoisId }) => {
        return hostingerRequest(hostingerApiKey, `/api/domains/v1/whois/${whoisId}/usage`);
    },
});

export const hostingerListWhoisProfiles = tool({
    description:
        'List WHOIS contact profiles available for domain registration, optionally filtered by TLD.',
    inputSchema: z.object({
        hostingerApiKey: tokenField,
        tld: z.string().optional().describe('Filter by TLD without leading dot, e.g. "com"'),
    }),
    execute: async ({ hostingerApiKey, tld }) => {
        return hostingerRequest(hostingerApiKey, '/api/domains/v1/whois', { query: { tld } });
    },
});
