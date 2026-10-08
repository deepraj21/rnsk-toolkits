// @ts-nocheck
import { shopifyGetShop } from './shop.js';
import {
  shopifyListProducts,
  shopifyGetProduct,
  shopifyCreateProduct,
  shopifyUpdateProduct,
  shopifyDeleteProduct,
} from './products.js';
import {
  shopifyListOrders,
  shopifyGetOrder,
  shopifyUpdateOrder,
  shopifyCancelOrder,
} from './orders.js';
import {
  shopifyListCustomers,
  shopifyGetCustomer,
  shopifyCreateCustomer,
  shopifyUpdateCustomer,
} from './customers.js';
import { shopifyListInventoryLevels, shopifyAdjustInventoryLevel } from './inventory.js';

export {
  shopifyGetShop,
  shopifyListProducts,
  shopifyGetProduct,
  shopifyCreateProduct,
  shopifyUpdateProduct,
  shopifyDeleteProduct,
  shopifyListOrders,
  shopifyGetOrder,
  shopifyUpdateOrder,
  shopifyCancelOrder,
  shopifyListCustomers,
  shopifyGetCustomer,
  shopifyCreateCustomer,
  shopifyUpdateCustomer,
  shopifyListInventoryLevels,
  shopifyAdjustInventoryLevel,
};

const auth = 'shopifyCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[]) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const shopifyTools = [
  entry('shopifyGetShop', shopifyGetShop, 'read', ['store', 'merchant']),
  entry('shopifyListProducts', shopifyListProducts, 'read', ['catalog', 'sku']),
  entry('shopifyGetProduct', shopifyGetProduct, 'read', ['catalog']),
  entry('shopifyCreateProduct', shopifyCreateProduct, 'write', ['catalog']),
  entry('shopifyUpdateProduct', shopifyUpdateProduct, 'write', ['catalog']),
  entry('shopifyDeleteProduct', shopifyDeleteProduct, 'delete', ['catalog']),
  entry('shopifyListOrders', shopifyListOrders, 'read', ['checkout', 'sales']),
  entry('shopifyGetOrder', shopifyGetOrder, 'read', ['checkout']),
  entry('shopifyUpdateOrder', shopifyUpdateOrder, 'write', ['checkout']),
  entry('shopifyCancelOrder', shopifyCancelOrder, 'write', ['refund', 'void']),
  entry('shopifyListCustomers', shopifyListCustomers, 'read', ['buyers']),
  entry('shopifyGetCustomer', shopifyGetCustomer, 'read', ['buyers']),
  entry('shopifyCreateCustomer', shopifyCreateCustomer, 'write', ['buyers']),
  entry('shopifyUpdateCustomer', shopifyUpdateCustomer, 'write', ['buyers']),
  entry('shopifyListInventoryLevels', shopifyListInventoryLevels, 'read', ['stock', 'warehouse']),
  entry('shopifyAdjustInventoryLevel', shopifyAdjustInventoryLevel, 'write', ['stock']),
];
