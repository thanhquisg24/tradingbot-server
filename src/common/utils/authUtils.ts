import gen from 'random-seed';
export const GenerateUniqeString = (wallet_address: string, count: number) => {
  console.log(`GEN CODE : ${wallet_address}`);
  const rand = gen.create(wallet_address);
  return rand.intBetween(1000000, 10000000);
};
export const GenerateLuckyDrawIndex = (
  wallet_address: string,
  count: number,
) => {
  console.log(`GEN CODE : ${wallet_address}`);
  const rand = gen.create(wallet_address);
  return rand.intBetween(0, count);
};
