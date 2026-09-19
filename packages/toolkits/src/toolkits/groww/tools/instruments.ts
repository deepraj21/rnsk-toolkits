// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { GROWW_INSTRUMENTS_URL } from './utils.js';

const INSTRUMENT_COLUMNS = [
  'exchange',
  'exchange_token',
  'trading_symbol',
  'groww_symbol',
  'name',
  'instrument_type',
  'segment',
  'series',
  'isin',
  'underlying_symbol',
  'underlying_exchange_token',
  'lot_size',
  'expiry_date',
  'strike_price',
  'tick_size',
  'freeze_quantity',
  'is_reserved',
  'buy_allowed',
  'sell_allowed',
];

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((v) => v.trim());
}

export const growwSearchInstruments = tool({
  description: 'Search the Groww instruments master (no auth needed). Downloads the official CSV and filters by exchange, segment, symbol text, underlying or instrument type. Use it to resolve trading_symbol (for orders) and groww_symbol (for backtesting).',
  inputSchema: z.object({
    exchange: z.string().optional().describe('Filter by exchange: NSE or BSE'),
    segment: z.string().optional().describe('Filter by segment: CASH or FNO'),
    trading_symbol: z.string().optional().describe('Substring match on trading_symbol, e.g. RELIANCE'),
    groww_symbol: z.string().optional().describe('Substring match on groww_symbol, e.g. NSE-NIFTY'),
    underlying_symbol: z.string().optional().describe('Exact match on underlying symbol, e.g. NIFTY'),
    instrument_type: z.string().optional().describe('CE, PE, FUT, EQ, etc.'),
    limit: z.number().int().min(1).max(200).optional().describe('Max rows to return, default 50, max 200'),
    offset: z.number().int().min(0).optional().describe('Rows to skip, default 0'),
  }),
  execute: async ({ exchange, segment, trading_symbol, groww_symbol, underlying_symbol, instrument_type, limit = 50, offset = 0 }) => {
    try {
      const response = await fetch(GROWW_INSTRUMENTS_URL);
      if (!response.ok) {
        return { error: 'Failed to download instruments CSV', statusCode: response.status };
      }
      const text = await response.text();
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length === 0) return { error: 'Empty instruments CSV' };
      const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
      const idx: Record<string, number> = {};
      header.forEach((h, i) => {
        idx[h] = i;
      });
      const matches: Record<string, string>[] = [];
      let scanned = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        const get = (name: string) => (idx[name] !== undefined ? (cols[idx[name]] ?? '') : '');
        if (exchange && get('exchange').toUpperCase() !== exchange.toUpperCase()) continue;
        if (segment && get('segment').toUpperCase() !== segment.toUpperCase()) continue;
        if (trading_symbol && !get('trading_symbol').toUpperCase().includes(trading_symbol.toUpperCase())) continue;
        if (groww_symbol && !get('groww_symbol').toUpperCase().includes(groww_symbol.toUpperCase())) continue;
        if (underlying_symbol && get('underlying_symbol').toUpperCase() !== underlying_symbol.toUpperCase()) continue;
        if (instrument_type && get('instrument_type').toUpperCase() !== instrument_type.toUpperCase()) continue;
        scanned++;
        if (scanned <= offset) continue;
        const row: Record<string, string> = {};
        for (const col of INSTRUMENT_COLUMNS) row[col] = get(col);
        matches.push(row);
        if (matches.length >= limit) break;
      }
      return {
        source: GROWW_INSTRUMENTS_URL,
        columns: INSTRUMENT_COLUMNS,
        returned: matches.length,
        offset,
        instruments: matches,
        note: 'Full CSV is large; results are filtered server-side in this tool. Narrow filters for precise symbol resolution.',
      };
    } catch (error) {
      return { error: 'Error searching instruments', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
