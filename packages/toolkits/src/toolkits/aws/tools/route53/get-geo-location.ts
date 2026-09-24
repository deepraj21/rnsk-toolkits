import { tool } from 'ai';
import { z } from 'zod';
import { GetGeoLocationCommand } from '@aws-sdk/client-route-53';
import { createRoute53Client } from '../client.js';

export const awsGetRoute53GeoLocation = tool({
  description: 'Get information about a specific geo location. Use it to inspect current state before making changes.',
  inputSchema: z.object({
    awsCredentials: z.string().optional().describe('Injected by system; do not provide'),
    region: z.string().optional().describe('AWS region to query (default: us-east-1)'),
    continentCode: z.string().optional().describe('Continent code'),
    countryCode: z.string().optional().describe('Country code'),
    subdivisionCode: z.string().optional().describe('Subdivision code'),
  }),
  execute: async ({ awsCredentials, region, continentCode, countryCode, subdivisionCode }) => {
    if (!awsCredentials) {
      return { error: 'AWS credentials are required. Connect AWS first.' };
    }
    try {
      const client = createRoute53Client(awsCredentials, region);

      const command = new GetGeoLocationCommand({
          ContinentCode: continentCode,
          CountryCode: countryCode,
          SubdivisionCode: subdivisionCode,
      });
      const response = await client.send(command);
      return {
                  geoLocationDetails: response.GeoLocationDetails,
              };
    } catch (err) {
      return { error: 'Failed to get information about a specific geo location', message: err instanceof Error ? err.message : 'Unknown error' };
    }
  },
});
