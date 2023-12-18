import { encryptWithAES } from '../../src/common/utils/hash-util';

function main() {
  const s = encryptWithAES('admin@!@3');
  console.log('🚀 ~ file: hash.test.ts:5 ~ main ~ s:', s);
}

main();
