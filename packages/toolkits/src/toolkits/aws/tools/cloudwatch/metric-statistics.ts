import { CloudWatchClient, GetMetricStatisticsCommand } from '@aws-sdk/client-cloudwatch';

export interface MetricStatisticsQuery {
  namespace: string;
  metricName: string;
  dimensions?: Record<string, any>;
  startTime?: string;
  endTime?: string;
  period?: number;
  statistics?: string[];
}

/** Shared GetMetricStatistics fetch used by metric tools (avoids MCP round-trips). */
export async function fetchMetricStatistics(client: CloudWatchClient, query: MetricStatisticsQuery) {
  const response = await client.send(
    new GetMetricStatisticsCommand({
      Namespace: query.namespace,
      MetricName: query.metricName,
      Dimensions: query.dimensions
        ? Object.entries(query.dimensions).map(([Name, Value]) => ({ Name, Value }))
        : undefined,
      StartTime: query.startTime ? new Date(query.startTime) : new Date(Date.now() - 3600000),
      EndTime: query.endTime ? new Date(query.endTime) : new Date(),
      Period: query.period || 3600,
      Statistics: (query.statistics || ['Average', 'Maximum', 'Minimum']) as any[],
    }),
  );
  return {
    label: response.Label,
    datapoints: (response.Datapoints ?? []).map((d: any) => ({
      timestamp: d.Timestamp,
      average: d.Average,
      maximum: d.Maximum,
      minimum: d.Minimum,
      sum: d.Sum,
      sampleCount: d.SampleCount,
      unit: d.Unit,
    })),
  };
}
