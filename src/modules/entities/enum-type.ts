export enum ExchangesEnum {
  BINANCEUSDM = 'binanceusdm',
  BINANCE = 'binance',
  PAPER = 'paper',
}

export enum BOT_TRADING_TYPE {
  DCA = 'DCA',
  REDUCE = 'REDUCE',
  FUD_RATE = 'FUD_RATE',
}

export enum STRATEGY_DIRECTION {
  LONG = 'LONG',
  SHORT = 'SHORT',
  BOTH = 'BOTH',
}
export enum DEAL_START_TYPE {
  ASAP = 'ASAP',
  TRADINGVIEW = 'tradingview',
  MANUAL = 'MANUAL',
}

export enum MARGIN_MODE {
  CROSS = 'cross',
  ISOLATE = 'isolated',
}

export enum DEAL_STATUS {
  'CREATED' = 'CREATED',
  'ACTIVE' = 'ACTIVE',
  'CLOSED' = 'CLOSED',
  'CANCELED' = 'CANCELED',
}
export enum CLIENT_DEAL_TYPE {
  'DCA' = 'DCA',
  'REDUCE' = 'REDUCE',
  'FUD_RATE' = 'FUD_RATE',
}

export enum CLIENT_ORDER_TYPE {
  BASE = 'BASE',
  SAFETY = 'SAFETY',
  REDUCE_BEGIN = 'REDUCE_BIGIN',
  REDUCE_END = 'REDUCE_END',
  COVER_CUT_QTY = 'COVER_CUT_QTY',
  COVER_ADD_QTY = 'COVER_ADD_QTY',
  TAKE_PROFIT = 'TAKE_PROFIT',
  TRAILING_TP = 'TRAILING_TP',
  STOP_LOSS = 'STOP_LOSS',
  CLOSE_AT_MARKET = 'CLOSE_AT_MARKET',
}

export enum CLIENT_ORDER_SPOT_TYPE {
  BASE = 'BASE',
  TAKE_PROFIT = 'TAKE_PROFIT',
  STOP_LOSS = 'STOP_LOSS',
  CLOSE_AT_MARKET = 'CLOSE_AT_MARKET',
}

export enum BOT_SPOT_TYPE {
  GRID = 'GRID',
  INVEST = 'INVENST',
  TRADE = 'TRADE',
}
export enum WATCHER_TYPE {
  LAST_SO = 'LAST_SO',
}

export enum ORDER_SOURCE_TYPE {
  EXCHANGE = 'EXCHANGE',
  VITUAL = 'VITUAL',
  THREE_COMMAS = 'THREE_COMMAS',
}
