// @ts-nocheck
import { crowdstrikeQueryDevices } from './hosts.js';
import { crowdstrikeGetDevices } from './hosts.js';
import { crowdstrikeCombinedDevices } from './hosts.js';
import { crowdstrikeGetDeviceOnlineState } from './hosts.js';
import { crowdstrikeContainDevices } from './hosts.js';
import { crowdstrikeLiftContainment } from './hosts.js';
import { crowdstrikeQueryIncidents } from './incidents.js';
import { crowdstrikeGetIncidents } from './incidents.js';
import { crowdstrikePerformIncidentAction } from './incidents.js';
import { crowdstrikeQueryAlerts } from './alerts.js';
import { crowdstrikeGetAlerts } from './alerts.js';
import { crowdstrikeUpdateAlerts } from './alerts.js';

export {
  crowdstrikeQueryDevices,
  crowdstrikeGetDevices,
  crowdstrikeCombinedDevices,
  crowdstrikeGetDeviceOnlineState,
  crowdstrikeContainDevices,
  crowdstrikeLiftContainment,
  crowdstrikeQueryIncidents,
  crowdstrikeGetIncidents,
  crowdstrikePerformIncidentAction,
  crowdstrikeQueryAlerts,
  crowdstrikeGetAlerts,
  crowdstrikeUpdateAlerts,
};

const auth = 'crowdstrikeCredentials' as const;
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

export const crowdstrikeTools = [
  entry('crowdstrikeQueryDevices', crowdstrikeQueryDevices, 'read', []),
  entry('crowdstrikeGetDevices', crowdstrikeGetDevices, 'read', []),
  entry('crowdstrikeCombinedDevices', crowdstrikeCombinedDevices, 'read', []),
  entry('crowdstrikeGetDeviceOnlineState', crowdstrikeGetDeviceOnlineState, 'read', []),
  entry('crowdstrikeContainDevices', crowdstrikeContainDevices, 'write', []),
  entry('crowdstrikeLiftContainment', crowdstrikeLiftContainment, 'write', []),
  entry('crowdstrikeQueryIncidents', crowdstrikeQueryIncidents, 'read', []),
  entry('crowdstrikeGetIncidents', crowdstrikeGetIncidents, 'read', []),
  entry('crowdstrikePerformIncidentAction', crowdstrikePerformIncidentAction, 'write', []),
  entry('crowdstrikeQueryAlerts', crowdstrikeQueryAlerts, 'read', []),
  entry('crowdstrikeGetAlerts', crowdstrikeGetAlerts, 'read', []),
  entry('crowdstrikeUpdateAlerts', crowdstrikeUpdateAlerts, 'write', []),
];
