// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { growwRequest, handleGrowwResult } from './utils.js';

const tokenField = z.string().optional().describe('Groww API access token (injected by system)');
const segmentField = z.string().describe('Segment: CASH or FNO');

export const growwCreateGttOrder = tool({
  description: 'Create a GTT (Good Till Triggered) smart order that arms a single order when the trigger price is crossed. GTT defaults to one-year validity.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    reference_id: z.string().describe('Unique 8-20 char alphanumeric idempotency key, max two hyphens'),
    segment: segmentField,
    trading_symbol: z.string().describe('Trading symbol, e.g. TCS'),
    quantity: z.number().int().positive().describe('Quantity for the post-trigger order'),
    trigger_price: z.string().describe('Trigger price as decimal string, e.g. 3985.00'),
    trigger_direction: z.string().describe('UP or DOWN'),
    order_type: z.string().describe('Post-trigger order type: LIMIT or SL'),
    price: z.string().optional().describe('Post-trigger limit price, required for LIMIT/SL'),
    transaction_type: z.string().describe('BUY or SELL'),
    product_type: z.string().describe('Product type, e.g. CNC'),
    exchange: z.string().describe('Exchange: NSE or BSE'),
    duration: z.string().describe('Validity of post-trigger order, e.g. DAY'),
  }),
  execute: async ({ growwAccessToken, order_type, price, transaction_type, ...rest }) => {
    try {
      const body = {
        ...rest,
        smart_order_type: 'GTT',
        order: { order_type, ...(price ? { price } : {}), transaction_type },
      };
      const result = await growwRequest(growwAccessToken, '/v1/order-advance/create', { method: 'POST', body });
      return handleGrowwResult(result, 'create GTT order');
    } catch (error) {
      return { error: 'Error creating GTT order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwCreateOcoOrder = tool({
  description: 'Create an OCO (One Cancels Other) smart order with target and stop-loss legs. Quantity must be <= abs(net_position_quantity).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    reference_id: z.string().describe('Unique 8-20 char alphanumeric idempotency key, max two hyphens'),
    segment: segmentField,
    trading_symbol: z.string().describe('Trading symbol, e.g. NIFTY25OCT24000CE'),
    quantity: z.number().int().positive().describe('Total quantity for both legs'),
    net_position_quantity: z.number().int().describe('Current net position in this symbol'),
    transaction_type: z.string().describe('Direction of protection/exit: BUY or SELL'),
    target_trigger_price: z.string().describe('Take-profit trigger price as decimal string'),
    target_order_type: z.string().describe('Target leg order type: LIMIT or MARKET'),
    target_price: z.string().optional().describe('Target leg limit price, required if target_order_type is LIMIT'),
    stop_loss_trigger_price: z.string().describe('Stop-loss trigger price as decimal string'),
    stop_loss_order_type: z.string().describe('Stop-loss leg order type: SL or SL_M'),
    stop_loss_price: z.string().optional().describe('Stop-loss leg limit price, required if stop_loss_order_type is SL'),
    product_type: z.string().describe('Product: MIS for CASH, NRML for FNO'),
    exchange: z.string().describe('Exchange: NSE or BSE'),
    duration: z.string().describe('Validity for both legs, e.g. DAY'),
  }),
  execute: async ({ growwAccessToken, target_trigger_price, target_order_type, target_price, stop_loss_trigger_price, stop_loss_order_type, stop_loss_price, ...rest }) => {
    try {
      const body = {
        ...rest,
        smart_order_type: 'OCO',
        target: {
          trigger_price: target_trigger_price,
          order_type: target_order_type,
          ...(target_price ? { price: target_price } : {}),
        },
        stop_loss: {
          trigger_price: stop_loss_trigger_price,
          order_type: stop_loss_order_type,
          ...(stop_loss_price ? { price: stop_loss_price } : {}),
        },
      };
      const result = await growwRequest(growwAccessToken, '/v1/order-advance/create', { method: 'POST', body });
      return handleGrowwResult(result, 'create OCO order');
    } catch (error) {
      return { error: 'Error creating OCO order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwModifySmartOrder = tool({
  description: 'Modify an active GTT or OCO smart order. GTT allows quantity, trigger_price, trigger_direction, order type/price. OCO allows quantity, duration, product_type and both leg trigger prices. Symbol/exchange/segment/type are immutable (cancel + recreate instead).',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    smart_order_id: z.string().describe('Smart order ID, e.g. gtt_91a7f4'),
    smart_order_type: z.string().describe('GTT or OCO'),
    segment: segmentField,
    quantity: z.number().int().positive().optional().describe('Updated quantity'),
    trigger_price: z.string().optional().describe('GTT: updated trigger price as decimal string'),
    trigger_direction: z.string().optional().describe('GTT: UP or DOWN'),
    order_type: z.string().optional().describe('GTT: updated order type'),
    order_price: z.string().optional().describe('GTT: updated limit price'),
    order_transaction_type: z.string().optional().describe('GTT: transaction type (required but not modifiable)'),
    duration: z.string().optional().describe('OCO: updated validity'),
    product_type: z.string().optional().describe('OCO: updated product'),
    target_trigger_price: z.string().optional().describe('OCO: updated target trigger price'),
    stop_loss_trigger_price: z.string().optional().describe('OCO: updated stop-loss trigger price'),
  }),
  execute: async ({ growwAccessToken, smart_order_id, smart_order_type, segment, quantity, trigger_price, trigger_direction, order_type, order_price, order_transaction_type, duration, product_type, target_trigger_price, stop_loss_trigger_price }) => {
    try {
      const body: Record<string, unknown> = { smart_order_type, segment };
      if (smart_order_type === 'GTT') {
        if (quantity !== undefined) body.quantity = quantity;
        if (trigger_price) body.trigger_price = trigger_price;
        if (trigger_direction) body.trigger_direction = trigger_direction;
        if (order_type || order_price || order_transaction_type) {
          body.order = {
            ...(order_type ? { order_type } : {}),
            ...(order_price ? { price: order_price } : {}),
            ...(order_transaction_type ? { transaction_type: order_transaction_type } : {}),
          };
        }
      } else {
        if (quantity !== undefined) body.quantity = quantity;
        if (duration) body.duration = duration;
        if (product_type) body.product_type = product_type;
        if (target_trigger_price) body.target = { trigger_price: target_trigger_price };
        if (stop_loss_trigger_price) body.stop_loss = { trigger_price: stop_loss_trigger_price };
      }
      const result = await growwRequest(growwAccessToken, `/v1/order-advance/modify/${encodeURIComponent(smart_order_id)}`, {
        method: 'PUT',
        body,
      });
      return handleGrowwResult(result, 'modify smart order');
    } catch (error) {
      return { error: 'Error modifying smart order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwCancelSmartOrder = tool({
  description: 'Cancel an active GTT or OCO smart order.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: segmentField,
    smart_order_type: z.string().describe('GTT or OCO'),
    smart_order_id: z.string().describe('Smart order ID'),
  }),
  execute: async ({ growwAccessToken, segment, smart_order_type, smart_order_id }) => {
    try {
      const result = await growwRequest(
        growwAccessToken,
        `/v1/order-advance/cancel/${encodeURIComponent(segment)}/${encodeURIComponent(smart_order_type)}/${encodeURIComponent(smart_order_id)}`,
        { method: 'POST' },
      );
      return handleGrowwResult(result, 'cancel smart order');
    } catch (error) {
      return { error: 'Error cancelling smart order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwGetSmartOrder = tool({
  description: 'Get full details of a GTT or OCO smart order.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: segmentField,
    smart_order_type: z.string().describe('GTT or OCO'),
    smart_order_id: z.string().describe('Smart order ID'),
  }),
  execute: async ({ growwAccessToken, segment, smart_order_type, smart_order_id }) => {
    try {
      const result = await growwRequest(
        growwAccessToken,
        `/v1/order-advance/status/${encodeURIComponent(segment)}/${encodeURIComponent(smart_order_type)}/internal/${encodeURIComponent(smart_order_id)}`,
      );
      return handleGrowwResult(result, 'get smart order');
    } catch (error) {
      return { error: 'Error getting smart order', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const growwListSmartOrders = tool({
  description: 'List smart orders filtered by segment, type, status and time window with pagination.',
  inputSchema: z.object({
    growwAccessToken: tokenField,
    segment: z.string().optional().describe('CASH or FNO'),
    smart_order_type: z.string().optional().describe('GTT or OCO, default OCO'),
    status: z.string().optional().describe('ACTIVE, CANCELLED or COMPLETED, default ACTIVE'),
    page: z.number().int().min(0).max(500).optional().describe('Page number from 0, default 0'),
    page_size: z.number().int().min(1).max(50).optional().describe('Records per page, default 10, max 50'),
    start_date_time: z.string().optional().describe('Inclusive start ISO8601 YYYY-MM-DDThh:mm:ss'),
    end_date_time: z.string().optional().describe('Inclusive end ISO8601, must be >= start, max 1-month span'),
  }),
  execute: async ({ growwAccessToken, ...query }) => {
    try {
      const result = await growwRequest(growwAccessToken, '/v1/order-advance/list', { query });
      return handleGrowwResult(result, 'list smart orders');
    } catch (error) {
      return { error: 'Error listing smart orders', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
