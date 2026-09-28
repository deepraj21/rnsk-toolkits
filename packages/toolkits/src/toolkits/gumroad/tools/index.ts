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
function entry(
  name: string,
  description: string,
  toolRef: any,
  scope: Scope,
  keywords: string[] = [],
): {
  name: string;
  description: string;
  tool: any;
  requiredAuth: typeof auth;
  scope: Scope;
  keywords: string[];
} {
  return { name, description, tool: toolRef, requiredAuth: auth, scope, keywords };
}

export const gumroadTools = [
  entry('gumroadGetUser', 'Returns the authenticated seller profile.', getUser, 'read', [
    'seller',
    'account',
    'whoami',
  ]),
  entry(
    'gumroadGetSales',
    'Lists successful sales with email/date/product filters.',
    getSales,
    'read',
    ['order', 'orders', 'revenue'],
  ),
  entry(
    'gumroadListProducts',
    'Lists all products with IDs, prices, and sales counts.',
    listProducts,
    'read',
    ['product'],
  ),
  entry(
    'gumroadVerifyLicense',
    'Verifies a license key against a product.',
    verifyLicense,
    'read',
    ['validate', 'activation'],
  ),
  entry(
    'gumroadGetResourceSubscriptions',
    'Lists active webhook subscriptions for an event type.',
    getResourceSubscriptions,
    'read',
    ['subscription', 'webhooks'],
  ),
  entry(
    'gumroadSubscribeToResource',
    'Creates a webhook subscription for an event type.',
    subscribeToResource,
    'write',
    ['webhook', 'event'],
  ),
  entry(
    'gumroadUnsubscribeFromResource',
    'Deletes a webhook subscription by ID.',
    unsubscribeFromResource,
    'delete',
    ['webhook', 'remove'],
  ),
];
