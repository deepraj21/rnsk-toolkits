// @ts-nocheck
import { vaultKvRead } from './kv.js';
import { vaultKvWrite } from './kv.js';
import { vaultKvDelete } from './kv.js';
import { vaultKvList } from './kv.js';
import { vaultKvReadMetadata } from './kv.js';
import { vaultKvDeleteMetadata } from './kv.js';
import { vaultKvDestroyVersions } from './kv.js';
import { vaultGetHealth } from './sys.js';
import { vaultListMounts } from './sys.js';
import { vaultReadMount } from './sys.js';
import { vaultGetSealStatus } from './sys.js';
import { vaultGetLeader } from './sys.js';
import { vaultListPolicies } from './policies.js';
import { vaultReadPolicy } from './policies.js';
import { vaultLookupSelf } from './token.js';
import { vaultRenewSelf } from './token.js';
import { vaultRevokeSelf } from './token.js';
import { vaultAppRoleLogin } from './token.js';

export {
  vaultKvRead,
  vaultKvWrite,
  vaultKvDelete,
  vaultKvList,
  vaultKvReadMetadata,
  vaultKvDeleteMetadata,
  vaultKvDestroyVersions,
  vaultGetHealth,
  vaultListMounts,
  vaultReadMount,
  vaultGetSealStatus,
  vaultGetLeader,
  vaultListPolicies,
  vaultReadPolicy,
  vaultLookupSelf,
  vaultRenewSelf,
  vaultRevokeSelf,
  vaultAppRoleLogin,
};

const auth = 'vaultCredentials' as const;
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

export const vaultTools = [
  entry('vaultKvRead', vaultKvRead, 'read', ['secrets', 'kv']),
  entry('vaultKvWrite', vaultKvWrite, 'write', ['secrets', 'put']),
  entry('vaultKvDelete', vaultKvDelete, 'delete', []),
  entry('vaultKvList', vaultKvList, 'read', ['paths', 'directories']),
  entry('vaultKvReadMetadata', vaultKvReadMetadata, 'read', []),
  entry('vaultKvDeleteMetadata', vaultKvDeleteMetadata, 'delete', []),
  entry('vaultKvDestroyVersions', vaultKvDestroyVersions, 'delete', []),
  entry('vaultGetHealth', vaultGetHealth, 'read', ['sealed', 'standby']),
  entry('vaultListMounts', vaultListMounts, 'read', []),
  entry('vaultReadMount', vaultReadMount, 'read', []),
  entry('vaultGetSealStatus', vaultGetSealStatus, 'read', []),
  entry('vaultGetLeader', vaultGetLeader, 'read', []),
  entry('vaultListPolicies', vaultListPolicies, 'read', ['acl', 'hcl']),
  entry('vaultReadPolicy', vaultReadPolicy, 'read', []),
  entry('vaultLookupSelf', vaultLookupSelf, 'read', []),
  entry('vaultRenewSelf', vaultRenewSelf, 'write', []),
  entry('vaultRevokeSelf', vaultRevokeSelf, 'delete', []),
  entry('vaultAppRoleLogin', vaultAppRoleLogin, 'write', ['approle', 'auth']),
];
