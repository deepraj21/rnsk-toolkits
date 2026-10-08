// @ts-nocheck
import { sapODataGet } from './odata.js';
import { sapODataCreate } from './odata.js';
import { sapODataUpdate } from './odata.js';
import { sapODataDelete } from './odata.js';
import { sapGetServiceMetadata } from './odata.js';
import { sapListBusinessPartners } from './business.js';
import { sapGetBusinessPartner } from './business.js';
import { sapListSalesOrders } from './business.js';
import { sapGetSalesOrder } from './business.js';
import { sapListProducts } from './business.js';
import { sapGetProduct } from './business.js';

export {
  sapODataGet,
  sapODataCreate,
  sapODataUpdate,
  sapODataDelete,
  sapGetServiceMetadata,
  sapListBusinessPartners,
  sapGetBusinessPartner,
  sapListSalesOrders,
  sapGetSalesOrder,
  sapListProducts,
  sapGetProduct,
};

const auth = 'sapCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[] = []) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const sapTools = [
  entry('sapODataGet', sapODataGet, 'read', []),
  entry('sapODataCreate', sapODataCreate, 'write', []),
  entry('sapODataUpdate', sapODataUpdate, 'write', []),
  entry('sapODataDelete', sapODataDelete, 'delete', []),
  entry('sapGetServiceMetadata', sapGetServiceMetadata, 'read', []),
  entry('sapListBusinessPartners', sapListBusinessPartners, 'read', ['erp', 'customer']),
  entry('sapGetBusinessPartner', sapGetBusinessPartner, 'read', []),
  entry('sapListSalesOrders', sapListSalesOrders, 'read', ['erp', 'orders']),
  entry('sapGetSalesOrder', sapGetSalesOrder, 'read', []),
  entry('sapListProducts', sapListProducts, 'read', []),
  entry('sapGetProduct', sapGetProduct, 'read', []),
];
