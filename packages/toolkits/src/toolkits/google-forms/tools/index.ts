// @ts-nocheck
import { batchUpdateForm } from './batch-update-form.js';
import { createForm } from './create-form.js';
import { createWatch } from './create-watch.js';
import { deleteWatch } from './delete-watch.js';
import { getForm } from './get-form.js';
import { getResponse } from './get-response.js';
import { listResponses } from './list-responses.js';
import { listWatches } from './list-watches.js';
import { renewWatch } from './renew-watch.js';
import { setPublishSettings } from './set-publish-settings.js';

export {
    batchUpdateForm,
    createForm,
    createWatch,
    deleteWatch,
    getForm,
    getResponse,
    listResponses,
    listWatches,
    renewWatch,
    setPublishSettings,
};

export const googleFormsTools = [
    {
        name: 'googleFormsBatchUpdateForm',
        description:
            'Applies a batch of update operations to a Google Form in a single atomic transaction. Use to add, update, or delete questions, modify form metadata, update settings, or reorganize items.',
        tool: batchUpdateForm,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleFormsCreateForm',
        description:
            'Creates a new Google Form with the specified title. After creation, use batchUpdate to add questions and other items.',
        tool: createForm,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleFormsCreateWatch',
        description:
            'Creates a watch on a Google Form to receive push notifications via Cloud Pub/Sub when form schema or responses change.',
        tool: createWatch,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleFormsDeleteWatch',
        description: 'Deletes a watch from a Google Form, stopping push notifications for that watch.',
        tool: deleteWatch,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'googleFormsGetForm',
        description:
            'Retrieves the complete structure and metadata of a Google Form including title, description, items, settings, and publishing state.',
        tool: getForm,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleFormsGetResponse',
        description:
            'Retrieves a single form response by its unique response ID, including all answers, timestamps, and quiz scores.',
        tool: getResponse,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleFormsListResponses',
        description:
            'Lists all responses submitted to a Google Form with optional filtering and pagination.',
        tool: listResponses,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleFormsListWatches',
        description:
            'Lists all watches owned by the calling project for a specific Google Form, including status and expiration times.',
        tool: listWatches,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'googleFormsRenewWatch',
        description:
            'Renews a watch on a Google Form, extending its expiration by one week from the time of renewal.',
        tool: renewWatch,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'googleFormsSetPublishSettings',
        description:
            'Updates the publishing settings of a Google Form, controlling visibility and whether it accepts responses.',
        tool: setPublishSettings,
        requiredAuth: 'googleFormsToken' as const,
        scope: 'write' as const,
    },
];
