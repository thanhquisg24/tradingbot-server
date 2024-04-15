export type StatusDeal3Commas =
  | 'created'
  | 'base_order_placed'
  | 'bought'
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'panic_sell_pending'
  | 'panic_sell_order_placed'
  | 'panic_sold'
  | 'cancel_pending'
  | 'stop_loss_pending'
  | 'stop_loss_finished'
  | 'stop_loss_order_placed'
  | 'switched'
  | 'switched_take_profit'
  | 'ttp_activated'
  | 'ttp_order_placed'
  | 'liquidated'
  | 'bought_safety_pending'
  | 'bought_take_profit_pending'
  | 'settled'
  | 'close_strategy_activated';

export interface I3CommasDeal {
  from_currency_id: number;
  to_currency_id: number;
  id: number;
  type: string;
  bot_id: number;
  max_safety_orders: number; //use for logic fillter
  deal_has_error: boolean;
  account_id: number;
  active_safety_orders_count: number;
  created_at: string;
  updated_at: string;
  closed_at: any;
  'finished?': boolean;
  current_active_safety_orders_count: number;
  current_active_safety_orders: number;
  completed_safety_orders_count: number; //use for logic fillter
  completed_manual_safety_orders_count: number;
  'cancellable?': boolean;
  'panic_sellable?': boolean;
  trailing_enabled: boolean;
  tsl_enabled: boolean;
  stop_loss_timeout_enabled: boolean;
  stop_loss_timeout_in_seconds: number;
  active_manual_safety_orders: number;
  pair: string; //"USDT_ADAUSDT"
  status: StatusDeal3Commas; //use for logic fillter
  localized_status: string;
  take_profit: string;
  take_profit_steps: any[];
  base_order_volume: string;
  safety_order_volume: string;
  safety_order_step_percentage: string;
  leverage_type: string;
  leverage_custom_value: string;
  bought_amount: string; //use for get current Deal qty
  bought_average_price: string; //use for get current Deal average price
  bought_volume: string;
  base_order_average_price: string;
  sold_amount: string;
  sold_volume: string;
  sold_average_price: string;
  take_profit_type: string;
  final_profit: string;
  martingale_coefficient: string;
  martingale_volume_coefficient: string;
  martingale_step_coefficient: string;
  stop_loss_percentage: string;
  error_message: any;
  profit_currency: string;
  stop_loss_type: string;
  safety_order_volume_type: string;
  base_order_volume_type: string;
  from_currency: string; //USDT
  to_currency: string; //ARBUSDT use with binance symbol
  final_profit_percentage: string;
  usd_final_profit: string;
  actual_profit: string;
  actual_usd_profit: string;
  failed_message: any;
  reserved_base_coin: string;
  reserved_second_coin: string;
  trailing_deviation: string;
  trailing_max_price: any;
  tsl_max_price: any;
  strategy: string;
  min_profit_percentage: string;
  min_profit_type: any;
  note: any;
  add_fundable: boolean;
  smart_trade_convertable: boolean;
  bot_name: string;
  account_name: string;
  market_type: string;
  current_price: string;
  take_profit_price: string;
  stop_loss_price: any;
  actual_profit_percentage: string;
  reserved_quote_funds: string;
  reserved_base_funds: string;
  orderbook_price_currency: string;
}

export interface I3CommasOrder {
  order_id: number;
  order_type: 'BUY' | 'SELL';
  deal_order_type: 'Base' | 'Safety' | 'Take Profit';
  cancellable: boolean;
  status_string: 'Filled' | 'Untriggered' | 'Active' | string;
  created_at: string;
  updated_at: string;
  quantity: number;
  quantity_remaining: number;
  total: number;
  rate: number;
  average_price: number;
}
