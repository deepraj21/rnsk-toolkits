import { tool } from 'ai';
import { z } from 'zod';
import { ListGeoLocationsCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsListRoute53GeoLocations = tool({
  description: 'List all supported geo locations. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    startContinentCode: z.string().optional().describe('Start continent code for pagination'),
    startCountryCode: z.string().optional().describe('Start country code for pagination'),
    startSubdivisionCode: z.string().optional().describe('Start subdivision code for pagination'),
    maxItems: z.number().optional().describe('Maximum number of locations to return'),
  }),
  execute: async ({ awsCredentials, region, startContinentCode, startCountryCode, startSubdivisionCode, maxItems }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new ListGeoLocationsCommand({
          StartContinentCode: startContinentCode,
          StartCountryCode: startCountryCode,
          StartSubdivisionCode: startSubdivisionCode,
          MaxItems: maxItems,
      });
      const response = await client.send(command);
      return {
                  geoLocationDetailsList: response.GeoLocationDetailsList,
                  isTruncated: response.IsTruncated,
                  nextContinentCode: response.NextContinentCode,
                  nextCountryCode: response.NextCountryCode,
                  nextSubdivisionCode: response.NextSubdivisionCode,
                  maxItems: response.MaxItems,
              };
    } catch (err) {
      return { error: 'Failed to list all supported geo locations', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
