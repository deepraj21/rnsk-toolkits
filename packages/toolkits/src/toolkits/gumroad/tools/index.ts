// @ts-nocheck
import {
    getResourceSubscriptions,
    getSales,
    getUser,
    listProducts,
    subscribeToResource,
    unsubscribeFromResource,
    verifyLicense,
} from './sales.js';

export {
    getResourceSubscriptions,
    getSales,
    getUser,
    listProducts,
    subscribeToResource,
    unsubscribeFromResource,
    verifyLicense,
};

const auth = 'gumroadToken' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(name: string, description: string, toolRef: any, scope: Scope): { name: string; description: string; tool: any; requiredAuth: typeof auth; scope: Scope } {
    return { name, description, tool: toolRef, requiredAuth: auth, scope };
}

export const gumroadTools = [
    entry('gumroadGetUser', 'Returns the authenticated seller profile.', getUser, 'read'),
    entry('gumroadGetSales', 'Lists successful sales with email/date/product filters.', getSales, 'read'),
    entry('gumroadListProducts', 'Lists all products with IDs, prices, and sales counts.', listProducts, 'read'),
    entry('gumroadVerifyLicense', 'Verifies a license key against a product.', verifyLicense, 'read'),
    entry('gumroadGetResourceSubscriptions', 'Lists active webhook subscriptions for an event type.', getResourceSubscriptions, 'read'),
    entry('gumroadSubscribeToResource', 'Creates a webhook subscription for an event type.', subscribeToResource, 'write'),
    entry('gumroadUnsubscribeFromResource', 'Deletes a webhook subscription by ID.', unsubscribeFromResource, 'delete'),
];
