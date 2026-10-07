// @ts-nocheck
import { oktaGetCurrentUser } from './users.js';
import { oktaListUsers } from './users.js';
import { oktaGetUser } from './users.js';
import { oktaCreateUser } from './users.js';
import { oktaUpdateUser } from './users.js';
import { oktaSuspendUser } from './users.js';
import { oktaUnsuspendUser } from './users.js';
import { oktaDeactivateUser } from './users.js';
import { oktaActivateUser } from './users.js';
import { oktaResetUserPassword } from './users.js';
import { oktaListUserGroups } from './users.js';
import { oktaListUserApps } from './users.js';
import { oktaListUserFactors } from './users.js';
import { oktaListGroups } from './groups.js';
import { oktaGetGroup } from './groups.js';
import { oktaCreateGroup } from './groups.js';
import { oktaUpdateGroup } from './groups.js';
import { oktaDeleteGroup } from './groups.js';
import { oktaListGroupUsers } from './groups.js';
import { oktaAddUserToGroup } from './groups.js';
import { oktaRemoveUserFromGroup } from './groups.js';
import { oktaListApps } from './apps.js';
import { oktaGetApp } from './apps.js';
import { oktaListAppUsers } from './apps.js';
import { oktaAssignUserToApp } from './apps.js';
import { oktaUnassignUserFromApp } from './apps.js';
import { oktaGetOrg } from './org.js';
import { oktaListSystemLogs } from './org.js';

export {
  oktaGetCurrentUser,
  oktaListUsers,
  oktaGetUser,
  oktaCreateUser,
  oktaUpdateUser,
  oktaSuspendUser,
  oktaUnsuspendUser,
  oktaDeactivateUser,
  oktaActivateUser,
  oktaResetUserPassword,
  oktaListUserGroups,
  oktaListUserApps,
  oktaListUserFactors,
  oktaListGroups,
  oktaGetGroup,
  oktaCreateGroup,
  oktaUpdateGroup,
  oktaDeleteGroup,
  oktaListGroupUsers,
  oktaAddUserToGroup,
  oktaRemoveUserFromGroup,
  oktaListApps,
  oktaGetApp,
  oktaListAppUsers,
  oktaAssignUserToApp,
  oktaUnassignUserFromApp,
  oktaGetOrg,
  oktaListSystemLogs,
};

const auth = 'oktaCredentials' as const;
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

export const oktaTools = [
  entry('oktaGetCurrentUser', oktaGetCurrentUser, 'read', []),
  entry('oktaListUsers', oktaListUsers, 'read', ['directory', 'identity']),
  entry('oktaGetUser', oktaGetUser, 'read', []),
  entry('oktaCreateUser', oktaCreateUser, 'write', []),
  entry('oktaUpdateUser', oktaUpdateUser, 'write', []),
  entry('oktaSuspendUser', oktaSuspendUser, 'delete', ['lock', 'disable']),
  entry('oktaUnsuspendUser', oktaUnsuspendUser, 'delete', []),
  entry('oktaDeactivateUser', oktaDeactivateUser, 'delete', []),
  entry('oktaActivateUser', oktaActivateUser, 'write', []),
  entry('oktaResetUserPassword', oktaResetUserPassword, 'write', ['password']),
  entry('oktaListUserGroups', oktaListUserGroups, 'read', []),
  entry('oktaListUserApps', oktaListUserApps, 'read', []),
  entry('oktaListUserFactors', oktaListUserFactors, 'read', ['mfa', '2fa']),
  entry('oktaListGroups', oktaListGroups, 'read', []),
  entry('oktaGetGroup', oktaGetGroup, 'read', []),
  entry('oktaCreateGroup', oktaCreateGroup, 'write', []),
  entry('oktaUpdateGroup', oktaUpdateGroup, 'write', []),
  entry('oktaDeleteGroup', oktaDeleteGroup, 'delete', []),
  entry('oktaListGroupUsers', oktaListGroupUsers, 'read', []),
  entry('oktaAddUserToGroup', oktaAddUserToGroup, 'write', []),
  entry('oktaRemoveUserFromGroup', oktaRemoveUserFromGroup, 'delete', []),
  entry('oktaListApps', oktaListApps, 'read', []),
  entry('oktaGetApp', oktaGetApp, 'read', []),
  entry('oktaListAppUsers', oktaListAppUsers, 'read', []),
  entry('oktaAssignUserToApp', oktaAssignUserToApp, 'write', ['sso', 'provisioning']),
  entry('oktaUnassignUserFromApp', oktaUnassignUserFromApp, 'delete', []),
  entry('oktaGetOrg', oktaGetOrg, 'read', []),
  entry('oktaListSystemLogs', oktaListSystemLogs, 'read', ['audit', 'events']),
];
