// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
    GOOGLE_ADS_API_VERSION,
    adsRequest,
    customerIdField,
    developerTokenField,
    googleAdsTokenField,
    loginCustomerIdField,
    normalizeCustomerId,
} from './client.js';

export const listSubAccounts = tool({
    description:
        'Lists direct child/sub-accounts under a manager (MCC) account. Use before account-scoped calls so the user can pick which child account to target.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        pageToken: z.string().optional().describe('Pagination token from a previous nextPageToken'),
        customerId: customerIdField.describe(
            'Manager/MCC customer ID whose sub-accounts should be listed',
        ),
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, pageToken, customerId, loginCustomerId }) => {
        try {
            const cid = normalizeCustomerId(customerId);
            if (!cid) return { error: 'customerId (manager account) is required' };
            const body: Record<string, unknown> = {
                query: 'SELECT customer_client.client_customer, customer_client.id, customer_client.descriptive_name, customer_client.manager, customer_client.status, customer_client.level, customer_client.resource_name FROM customer_client',
            };
            if (pageToken) body.pageToken = pageToken;
            const result = await adsRequest(
                googleAdsToken,
                developerToken,
                `/${GOOGLE_ADS_API_VERSION}/customers/${cid}/googleAds:search`,
                { method: 'POST', body, loginCustomerId },
            );
            if (!result.ok) return { error: 'Failed to list sub accounts', details: result.error };
            const data = result.data as {
                results?: Array<{ customerClient?: Record<string, unknown> }>;
                nextPageToken?: string;
                fieldMask?: string;
                requestId?: string;
                queryResourceConsumption?: string;
            };
            const subAccounts = (data.results ?? [])
                .map((r) => r.customerClient)
                .filter(Boolean)
                .map((c) => ({
                    customerId: c!.clientCustomer ?? c!.id,
                    resourceName: c!.resourceName,
                    descriptiveName: c!.descriptiveName,
                    manager: c!.manager,
                    status: c!.status,
                    level: c!.level,
                }));
            return {
                subAccounts,
                nextPageToken: data.nextPageToken,
                fieldMask: data.fieldMask,
                requestId: data.requestId,
                queryResourceConsumption: data.queryResourceConsumption,
            };
        } catch (error) {
            return {
                error: 'Error listing sub accounts',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
