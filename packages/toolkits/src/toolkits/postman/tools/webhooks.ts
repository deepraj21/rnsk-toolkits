// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { postmanRequest, toPostmanError } from './client.js';

const authField = {
    postmanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

function missingKey() {
    return { error: 'Postman API key is required. Connect Postman first.' };
}

export const postmanCreateAWebhook = tool({
    description:
        'Create a webhook that triggers a collection with a custom payload. Use when you need to set up a webhook endpoint that can trigger a Postman collection run. The webhook URL is available in the webhookUrl property of the response.',
    inputSchema: z.object({
        ...authField,
        workspaceId: z.string().describe('The workspace ID where the webhook will be created'),
        name: z.string().describe('Name of the webhook to be created'),
        collectionId: z.string().describe('Collection UID (owner-collectionId format) that will be triggered by the webhook'),
        environmentId: z.string().optional().describe('Optional environment UID to use when the webhook triggers the collection'),
    }),
    execute: async ({ postmanApiKey, workspaceId, name, collectionId, environmentId }) => {
        try {
            if (!postmanApiKey) return missingKey();
            return await postmanRequest(postmanApiKey, 'POST', '/webhooks', {
                query: { workspace: workspaceId },
                body: {
                    webhook: {
                        name,
                        collection: collectionId,
                        ...(environmentId !== undefined ? { environment: environmentId } : {}),
                    },
                },
            });
        } catch (error) {
            return toPostmanError(error, 'Failed to create webhook');
        }
    },
});
