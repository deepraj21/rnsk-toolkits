import { defineToolkit, defineTool } from '../../core/define.js';
import { NOTEBOOK_LM_ICON } from './icon.js';
import { notebookLmTools } from './tools/index.js';

export default defineToolkit({
    id: 'notebook-lm',
    displayName: 'NotebookLM',
    shortDescription: 'Create and manage NotebookLM Enterprise notebooks, sources, and audio overviews.',
    category: 'AI & Machine Learning',
    icon: NOTEBOOK_LM_ICON,
    auth: {
        type: 'oauth2',
        tokenField: 'notebookLmToken',
        provider: {
            slug: 'notebook-lm',
            env: { clientId: 'NOTEBOOK_LM_CLIENT_ID', clientSecret: 'NOTEBOOK_LM_CLIENT_SECRET' },
            authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
            tokenUrl: 'https://oauth2.googleapis.com/token',
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/discoveryengine.readwrite',
            ],
            exchangeStyle: 'form',
            extraAuthParams: { access_type: 'offline', prompt: 'consent' },
            connectDescription:
                'Connect NotebookLM Enterprise to create notebooks, add text and file sources, and generate audio overviews. Requires a licensed Google Cloud project with the NotebookLM Enterprise API enabled and discoveryengine IAM permissions.',
            callbackPath: '/api/auth/notebook-lm/callback',
            stateCookie: 'notebook_lm_oauth_state',
        },
    },
    allowedHosts: [
        'discoveryengine.googleapis.com',
        'us-discoveryengine.googleapis.com',
        'eu-discoveryengine.googleapis.com',
        'global-discoveryengine.googleapis.com',
    ],
    tools: notebookLmTools.map((entry) =>
        defineTool({
            name: entry.name,
            description: entry.description,
            tool: entry.tool,
            requiredAuth: entry.requiredAuth,
            scope: entry.scope,
        }),
    ),
    meta: { since: '0.0.10' },
});
