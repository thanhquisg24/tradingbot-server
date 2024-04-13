import {
  encryptWithAES,
  decryptWithAES,
} from '../../src/common/utils/hash-util';

function main() {
  const s = encryptWithAES('admin@!@3');
  console.log('🚀 ~ file: hash.test.ts:5 ~ main ~ s:', s);
}
function des() {
  const s = decryptWithAES('U2FsdGVkX19A5cOwekCbqOdK3r5WHn9DrXo/Javx8nE=');
  console.log('🚀 ~ file: hash.test.ts:5 ~ main ~ s:   Qz!23asd  ', s);
}
des();
