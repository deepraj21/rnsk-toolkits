// @ts-nocheck
import { notionSearch } from './search';
import { notionListDatabases } from './list-databases';
import { notionQueryDatabase } from './query-database';
import { notionGetPage } from './get-page';
import { notionCreatePage } from './create-page';
import { notionUpdatePage } from './update-page';
import { notionAppendBlockChildren } from './append-block-children';
import { notionGetDatabase } from './get-database';

export {
    notionSearch,
    notionListDatabases,
    notionQueryDatabase,
    notionGetPage,
    notionCreatePage,
    notionUpdatePage,
    notionAppendBlockChildren,
    notionGetDatabase,
};

export const notionTools = [
    {
        name: 'notionSearch',
        description: notionSearch.description!,
        tool: notionSearch,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionListDatabases',
        description: notionListDatabases.description!,
        tool: notionListDatabases,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionQueryDatabase',
        description: notionQueryDatabase.description!,
        tool: notionQueryDatabase,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionGetPage',
        description: notionGetPage.description!,
        tool: notionGetPage,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionCreatePage',
        description: notionCreatePage.description!,
        tool: notionCreatePage,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionUpdatePage',
        description: notionUpdatePage.description!,
        tool: notionUpdatePage,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionAppendBlockChildren',
        description: notionAppendBlockChildren.description!,
        tool: notionAppendBlockChildren,
        requiredAuth: 'notionToken' as const,
    },
    {
        name: 'notionGetDatabase',
        description: notionGetDatabase.description!,
        tool: notionGetDatabase,
        requiredAuth: 'notionToken' as const,
    },
];
