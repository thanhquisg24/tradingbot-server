import ccxt from 'ccxt';
import winston from 'winston';

export const wrapExReq = async (
  func: Promise<any>,
  botLogger?: winston.Logger,
): Promise<any> => {
  // try to call a unified method
  try {
    const response = await func;
    return response;
  } catch (e) {
    // if the exception is thrown, it is "caught" and can be handled here
    // the handling reaction depends on the type of the exception
    // and on the purpose or business logic of your application
    if (botLogger) {
      if (e instanceof ccxt.NetworkError) {
        botLogger.error('failed due to a network error:', e.message);
        // retry or whatever
      } else if (e instanceof ccxt.ExchangeError) {
        botLogger.error('failed due to exchange error:', e.message);
        // retry or whatever
      } else {
        botLogger.error('failed with:', e.message);
        // retry or whatever
      }
    }

    throw new Error(e);
  }
};
