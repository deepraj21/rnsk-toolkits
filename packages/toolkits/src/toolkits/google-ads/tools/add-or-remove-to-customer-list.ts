// @ts-nocheck
import { createHash } from 'node:crypto';
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

function hashEmail(email: string): string {
    return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

export const addOrRemoveToCustomerList = tool({
    description:
        'Adds or removes contacts from a customer list (UserList audience, not an account) via an offline user data job. Changes take 6-12 hours to reflect. Emails must comply with Ads policies and privacy/consent laws.',
    inputSchema: z.object({
        googleAdsToken: googleAdsTokenField,
        developerToken: developerTokenField,
        resourceName: z.string().describe('UserList resource name, e.g. customers/123/userLists/456'),
        emails: z.array(z.string()).min(1).describe('Contact emails to add or remove (normalized and SHA-256 hashed automatically)'),
        operation: z.enum(['create', 'remove']).optional().describe('Operation to perform (default create)'),
        customerId: customerIdField,
        loginCustomerId: loginCustomerIdField,
    }),
    execute: async ({ googleAdsToken, developerToken, resourceName, emails, operation, customerId, loginCustomerId }) => {
        try {
            const cid = normalizeCustomerId(customerId);
            if (!cid) return { error: 'customerId is required' };
            const op = operation ?? 'create';
            const base = `/${GOOGLE_ADS_API_VERSION}/customers/${cid}/offlineUserDataJobs`;

            const createResult = await adsRequest(googleAdsToken, developerToken, `${base}:create`, {
                method: 'POST',
                loginCustomerId,
                body: {
                    job: {
                        type: 'CUSTOMER_MATCH_USER_LIST',
                        customerMatchUserListMetadata: { userList: resourceName },
                    },
                },
            });
            if (!createResult.ok) return { error: 'Failed to create user data job', details: createResult.error };
            const jobName = (createResult.data as { resourceName?: string })?.resourceName;
            if (!jobName) return { error: 'Failed to create user data job', details: createResult.data };

            const operations = emails.map((email) => ({
                [op]: { userIdentifiers: [{ hashedEmail: hashEmail(email) }] },
            }));
            const addResult = await adsRequest(googleAdsToken, developerToken, `${base}/${jobName.split('/').pop()}:addOperations`, {
                method: 'POST',
                loginCustomerId,
                body: { operations, enablePartialFailure: true },
            });
            if (!addResult.ok) return { error: 'Failed to add members to user data job', details: addResult.error };

            const runResult = await adsRequest(googleAdsToken, developerToken, `${base}/${jobName.split('/').pop()}:run`, {
                method: 'POST',
                loginCustomerId,
                body: {},
            });
            if (!runResult.ok) return { error: 'Failed to run user data job', details: runResult.error };

            return { status: `User data job ${jobName} is running for ${emails.length} contact(s)` };
        } catch (error) {
            return {
                error: 'Error updating customer list',
                message: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    },
});
