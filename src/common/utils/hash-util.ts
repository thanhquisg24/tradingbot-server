import { InternalServerErrorException } from '@nestjs/common';
import dotenv from 'dotenv';
dotenv.config();
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CryptoJS = require('crypto-js');
const PASSPHRASE = process.env.PASSPHRASE_ENCRYPT;

export const encryptWithAES = (text) => {
  if (!PASSPHRASE) {
    return new InternalServerErrorException('Not found PASSPHRASE');
  }

  return CryptoJS.AES.encrypt(text, PASSPHRASE).toString();
};

export const decryptWithAES = (ciphertext) => {
  if (!PASSPHRASE) {
    return new InternalServerErrorException('Not found PASSPHRASE');
  }
  const bytes = CryptoJS.AES.decrypt(ciphertext, PASSPHRASE);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
};
