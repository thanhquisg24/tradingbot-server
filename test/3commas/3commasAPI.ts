import { API } from '3commas-typescript';

export const threecommas_api = new API({
  key: '48f3b6ead6434d5a913f40a26940c37d90cd9381f3c14b8b9d149f2bd29221f8', // Optional if only query endpoints with no security requirement
  secrets:
    'ba9c81cb0a06eb0d3fa7ebef286980dec925171e9b2b649865c7b64a98e671286918ab2474563490ae3cd02d19164e4b7d2b35ace7fff712f99e371d6b5fc2f94c957f6f95cda56755cfa720789bb397ada6b1e591446e274e25d60660dd59d43e0c7a54', // Optional
  timeout: 60000, // Optional, in ms, default to 30000
  forcedMode: 'real',
  errorHandler: (response, reject) => {
    // Optional, Custom handler for 3Commas error
    const { error, error_description } = response;
    reject(new Error(error_description ?? error));
  },
});
