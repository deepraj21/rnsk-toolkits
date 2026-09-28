// @ts-nocheck
import {
  kubernetesListNamespaces,
  kubernetesGetNamespace,
  kubernetesCreateNamespace,
  kubernetesDeleteNamespace,
} from './namespaces.js';
import {
  kubernetesListPods,
  kubernetesGetPod,
  kubernetesGetPodLogs,
  kubernetesDeletePod,
} from './pods.js';
import {
  kubernetesListDeployments,
  kubernetesGetDeployment,
  kubernetesCreateDeployment,
  kubernetesScaleDeployment,
  kubernetesRestartDeployment,
  kubernetesDeleteDeployment,
} from './deployments.js';
import {
  kubernetesListStatefulSets,
  kubernetesListDaemonSets,
  kubernetesListReplicaSets,
} from './workloads.js';
import {
  kubernetesListServices,
  kubernetesGetService,
  kubernetesCreateService,
  kubernetesDeleteService,
  kubernetesListIngresses,
  kubernetesGetIngress,
} from './services.js';
import {
  kubernetesListConfigMaps,
  kubernetesGetConfigMap,
  kubernetesCreateConfigMap,
  kubernetesListSecrets,
} from './config.js';
import {
  kubernetesListPersistentVolumeClaims,
  kubernetesGetPersistentVolumeClaim,
  kubernetesListPersistentVolumes,
} from './storage.js';
import {
  kubernetesListNodes,
  kubernetesGetNode,
  kubernetesCordonNode,
  kubernetesUncordonNode,
} from './nodes.js';
import {
  kubernetesListJobs,
  kubernetesListCronJobs,
  kubernetesCreateJob,
  kubernetesDeleteJob,
} from './jobs.js';
import {
  kubernetesListHorizontalPodAutoscalers,
  kubernetesGetHorizontalPodAutoscaler,
} from './autoscaling.js';
import {
  kubernetesGetClusterVersion,
  kubernetesListApiGroups,
  kubernetesListEvents,
} from './cluster.js';

export {
  kubernetesListNamespaces,
  kubernetesGetNamespace,
  kubernetesCreateNamespace,
  kubernetesDeleteNamespace,
  kubernetesListPods,
  kubernetesGetPod,
  kubernetesGetPodLogs,
  kubernetesDeletePod,
  kubernetesListDeployments,
  kubernetesGetDeployment,
  kubernetesCreateDeployment,
  kubernetesScaleDeployment,
  kubernetesRestartDeployment,
  kubernetesDeleteDeployment,
  kubernetesListStatefulSets,
  kubernetesListDaemonSets,
  kubernetesListReplicaSets,
  kubernetesListServices,
  kubernetesGetService,
  kubernetesCreateService,
  kubernetesDeleteService,
  kubernetesListIngresses,
  kubernetesGetIngress,
  kubernetesListConfigMaps,
  kubernetesGetConfigMap,
  kubernetesCreateConfigMap,
  kubernetesListSecrets,
  kubernetesListPersistentVolumeClaims,
  kubernetesGetPersistentVolumeClaim,
  kubernetesListPersistentVolumes,
  kubernetesListNodes,
  kubernetesGetNode,
  kubernetesCordonNode,
  kubernetesUncordonNode,
  kubernetesListJobs,
  kubernetesListCronJobs,
  kubernetesCreateJob,
  kubernetesDeleteJob,
  kubernetesListHorizontalPodAutoscalers,
  kubernetesGetHorizontalPodAutoscaler,
  kubernetesGetClusterVersion,
  kubernetesListApiGroups,
  kubernetesListEvents,
};

const auth = 'kubernetesCredentials' as const;

export const kubernetesTools = [
  {
    name: 'kubernetesListNamespaces',
    keywords: ['namespace', 'k8s', 'kubectl'],
    description:
      'List Kubernetes namespaces. Use to discover where workloads are deployed before other calls.',
    tool: kubernetesListNamespaces,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetNamespace',
    keywords: ['namespaces', 'k8s', 'kubectl'],
    description: 'Get details of a namespace including labels, annotations and phase.',
    tool: kubernetesGetNamespace,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCreateNamespace',
    keywords: ['namespaces', 'k8s', 'kubectl', 'isolate'],
    description:
      'Create a new namespace, optionally with labels. Use to isolate a new application or environment.',
    tool: kubernetesCreateNamespace,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesDeleteNamespace',
    keywords: ['namespaces', 'k8s', 'remove'],
    description:
      'Delete a namespace and everything in it. Irreversible — confirm with the user first.',
    tool: kubernetesDeleteNamespace,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'kubernetesListPods',
    keywords: ['pod', 'k8s', 'kubectl', 'container', 'containers', 'workload'],
    description:
      'List pods in a namespace or across all namespaces. Returns phase, IP, node, restart counts and images. Use to check workload health.',
    tool: kubernetesListPods,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetPod',
    keywords: ['pods', 'k8s', 'container', 'kubectl'],
    description:
      'Get full details of a pod including spec, container statuses, events-ready conditions and IPs.',
    tool: kubernetesGetPod,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetPodLogs',
    keywords: ['pod', 'pods', 'log', 'logging', 'k8s', 'kubectl', 'debug', 'crash'],
    description:
      'Fetch container logs for a pod. Use to debug crashes, CrashLoopBackOff and application errors.',
    tool: kubernetesGetPodLogs,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesDeletePod',
    keywords: ['pods', 'k8s', 'restart', 'kubectl', 'remove'],
    description:
      'Delete a pod to force a restart (the controller recreates it). Use to recover stuck pods or pick up new config.',
    tool: kubernetesDeletePod,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'kubernetesListDeployments',
    keywords: ['deployment', 'k8s', 'kubectl', 'rollout', 'workload'],
    description:
      'List deployments in a namespace or across all namespaces. Returns desired vs available replica counts for rollout health.',
    tool: kubernetesListDeployments,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetDeployment',
    keywords: ['deployments', 'k8s', 'rollout', 'kubectl'],
    description:
      'Get full details of a deployment including strategy, selector, pod template and rollout status.',
    tool: kubernetesGetDeployment,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCreateDeployment',
    keywords: ['deployments', 'deploy', 'k8s', 'kubectl', 'workload', 'image'],
    description:
      'Create a deployment from a container image with replicas, port and env vars. Use to deploy a new stateless workload.',
    tool: kubernetesCreateDeployment,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesScaleDeployment',
    keywords: ['deployments', 'scale', 'scaling', 'replicas', 'k8s', 'kubectl'],
    description:
      'Scale a deployment to a replica count. Use to handle traffic spikes or scale down idle workloads.',
    tool: kubernetesScaleDeployment,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesRestartDeployment',
    keywords: ['deployments', 'rollout', 'restart', 'k8s', 'kubectl', 'redeploy'],
    description:
      'Rolling-restart a deployment (kubectl rollout restart equivalent). Use to pick up new images with the same tag or fresh config.',
    tool: kubernetesRestartDeployment,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesDeleteDeployment',
    keywords: ['deployments', 'k8s', 'remove'],
    description:
      'Delete a deployment and its pods. Services, config and PVCs are left untouched — confirm with the user first.',
    tool: kubernetesDeleteDeployment,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'kubernetesListStatefulSets',
    keywords: ['statefulset', 'database', 'k8s', 'kubectl', 'workload'],
    description:
      'List StatefulSets for stateful workloads like databases and queues. Returns desired vs ready replicas.',
    tool: kubernetesListStatefulSets,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListDaemonSets',
    keywords: ['daemonset', 'node', 'nodes', 'k8s', 'agent'],
    description:
      'List DaemonSets running node-level agents like log collectors and CNI plugins. Returns scheduling status.',
    tool: kubernetesListDaemonSets,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListReplicaSets',
    keywords: ['replicaset', 'rollout', 'deployments', 'k8s'],
    description:
      'List ReplicaSets backing deployments. Use to inspect rollout history and old revisions during a stuck rollout.',
    tool: kubernetesListReplicaSets,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListServices',
    keywords: ['service', 'k8s', 'endpoint', 'networking', 'discovery'],
    description:
      'List services in a namespace or across all namespaces. Returns type, cluster IP and ports for service discovery.',
    tool: kubernetesListServices,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetService',
    keywords: ['services', 'k8s', 'endpoint', 'networking'],
    description:
      'Get full details of a service including selector, ports, endpoints-ready status and load balancer ingress.',
    tool: kubernetesGetService,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCreateService',
    keywords: ['services', 'expose', 'k8s', 'loadbalancer', 'networking'],
    description:
      'Create a ClusterIP, NodePort or LoadBalancer service for a set of pods. Use to expose a deployment inside or outside the cluster.',
    tool: kubernetesCreateService,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesDeleteService',
    keywords: ['services', 'k8s', 'remove'],
    description:
      'Delete a service. Pods keep running but lose the stable endpoint — confirm with the user first.',
    tool: kubernetesDeleteService,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'kubernetesListIngresses',
    keywords: ['ingress', 'routing', 'http', 'k8s', 'external'],
    description:
      'List ingresses with hosts, paths and backend services. Use to audit external HTTP routing into the cluster.',
    tool: kubernetesListIngresses,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetIngress',
    keywords: ['ingresses', 'tls', 'routing', 'k8s'],
    description:
      'Get full ingress details including TLS config, rules, paths and load balancer status.',
    tool: kubernetesGetIngress,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListConfigMaps',
    keywords: ['configmap', 'config', 'configuration', 'k8s'],
    description:
      'List ConfigMaps. Returns names and data keys only (never values) for config auditing.',
    tool: kubernetesListConfigMaps,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetConfigMap',
    keywords: ['configmaps', 'config', 'configuration', 'k8s'],
    description:
      'Get a ConfigMap including its data. Use to inspect application configuration mounted into pods.',
    tool: kubernetesGetConfigMap,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCreateConfigMap',
    keywords: ['configmaps', 'config', 'configuration', 'k8s'],
    description:
      'Create a ConfigMap from key/value pairs. Use to add non-sensitive configuration for pods to consume.',
    tool: kubernetesCreateConfigMap,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesListSecrets',
    keywords: ['secret', 'k8s', 'credentials'],
    description:
      'List secrets returning metadata and data keys only — values are never exposed. Use to audit secret presence and types.',
    tool: kubernetesListSecrets,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListPersistentVolumeClaims',
    keywords: ['pvc', 'storage', 'volume', 'volumes', 'k8s', 'claim'],
    description:
      'List PersistentVolumeClaims with bound volumes, storage class, capacity and phase. Use to debug Pending pods waiting on storage.',
    tool: kubernetesListPersistentVolumeClaims,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetPersistentVolumeClaim',
    keywords: ['pvc', 'storage', 'volume', 'k8s'],
    description:
      'Get a PersistentVolumeClaim including access modes, resources, selectors and bound volume details.',
    tool: kubernetesGetPersistentVolumeClaim,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListPersistentVolumes',
    keywords: ['pv', 'storage', 'volume', 'volumes', 'k8s', 'capacity'],
    description:
      'List cluster PersistentVolumes with capacity, reclaim policy, storage class and claim binding. Use for storage capacity planning.',
    tool: kubernetesListPersistentVolumes,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListNodes',
    keywords: ['node', 'k8s', 'kubectl', 'cluster', 'capacity'],
    description:
      'List cluster nodes with Ready status, capacity, allocatable resources and versions. Use for capacity and upgrade planning.',
    tool: kubernetesListNodes,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetNode',
    keywords: ['nodes', 'k8s', 'cluster'],
    description:
      'Get full node details including addresses, taints, images, volumes and system info.',
    tool: kubernetesGetNode,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCordonNode',
    keywords: ['nodes', 'k8s', 'kubectl', 'drain', 'maintenance', 'unschedulable'],
    description:
      'Mark a node unschedulable (kubectl cordon equivalent). Use before draining or maintaining a node.',
    tool: kubernetesCordonNode,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesUncordonNode',
    keywords: ['nodes', 'k8s', 'kubectl', 'schedulable', 'maintenance'],
    description:
      'Mark a node schedulable again (kubectl uncordon equivalent). Use after maintenance completes.',
    tool: kubernetesUncordonNode,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesListJobs',
    keywords: ['job', 'batch', 'k8s', 'task'],
    description:
      'List batch jobs with active/succeeded/failed counts. Use to check one-off task and migration outcomes.',
    tool: kubernetesListJobs,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListCronJobs',
    keywords: ['cronjob', 'cron', 'schedule', 'scheduled', 'k8s', 'recurring'],
    description:
      'List CronJobs with schedules, suspend state and last schedule time. Use to audit recurring workloads.',
    tool: kubernetesListCronJobs,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesCreateJob',
    keywords: ['jobs', 'batch', 'migration', 'k8s', 'task'],
    description:
      'Create a one-off batch job from a container image and command. Use for migrations, scripts and manual triggers of cron work.',
    tool: kubernetesCreateJob,
    requiredAuth: auth,
    scope: 'write' as const,
  },
  {
    name: 'kubernetesDeleteJob',
    keywords: ['jobs', 'k8s', 'remove', 'cleanup'],
    description: 'Delete a batch job and its pods. Use to clean up finished or stuck jobs.',
    tool: kubernetesDeleteJob,
    requiredAuth: auth,
    scope: 'delete' as const,
  },
  {
    name: 'kubernetesListHorizontalPodAutoscalers',
    keywords: ['hpa', 'autoscale', 'autoscaling', 'scale', 'scaling', 'k8s'],
    description:
      'List HorizontalPodAutoscalers with current vs desired replicas, targets and scaling status.',
    tool: kubernetesListHorizontalPodAutoscalers,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetHorizontalPodAutoscaler',
    keywords: ['hpa', 'autoscale', 'autoscaling', 'scale', 'k8s'],
    description:
      'Get an HPA including scale target, metrics (CPU/memory/custom) and recent scaling conditions.',
    tool: kubernetesGetHorizontalPodAutoscaler,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesGetClusterVersion',
    keywords: ['version', 'k8s', 'upgrade', 'cluster'],
    description:
      'Get the Kubernetes server version, git commit and platform. Use to check upgrade status and API compatibility.',
    tool: kubernetesGetClusterVersion,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListApiGroups',
    keywords: ['api', 'apis', 'version', 'k8s'],
    description:
      'Discover available API groups and versions (apps/v1, batch/v1, networking.k8s.io/v1...). Use to check feature support before other calls.',
    tool: kubernetesListApiGroups,
    requiredAuth: auth,
    scope: 'read' as const,
  },
  {
    name: 'kubernetesListEvents',
    keywords: ['event', 'warning', 'warnings', 'k8s', 'debug'],
    description:
      'List cluster events (warnings, scheduling failures, image pulls). Use first when debugging unhealthy resources.',
    tool: kubernetesListEvents,
    requiredAuth: auth,
    scope: 'read' as const,
  },
];
