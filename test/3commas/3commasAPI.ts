import { API } from '3commas-typescript';

export const threecommas_api = new API({
  key: '479b2749e91c47ae99ad26581e10d9bb71890b7cc93d4783a5249efc145c6168', // Optional if only query endpoints with no security requirement
  secrets:
    '3197378df44d14956beca3334b4b9158f83a768e0ccbb2a09fbda53af34e6b8f71e909e23769f69d7d869b57e15c3554f50fb47749a767a829b776341782a33bcdf18c410fa1db1bff45f9a151d9fbd0faa834c605b79c90ec3c0657de444bceb5a79da3', // Optional
  timeout: 60000, // Optional, in ms, default to 30000
  forcedMode: 'real',
  errorHandler: (response, reject) => {
    // Optional, Custom handler for 3Commas error
    const { error, error_description } = response;
    reject(new Error(error_description ?? error));
  },
});
