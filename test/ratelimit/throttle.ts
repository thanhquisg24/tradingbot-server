import throttledQueue from 'throttled-queue';
const throttle = throttledQueue(10, 10000); // at most make 10 requests 10 second.

async function test() {
  for (let x = 0; x < 100; x++) {
    const result1 = await throttle<string>(() => '1');
    console.log('🚀 ~ result1:', result1);
  }
}
test();
