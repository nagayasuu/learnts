import assert from 'node:assert';
import test from 'node:test';

test('should follow the rule: fibo(n) = fibo(n-1) + fibo(n-2)', () => {
  assert.strictEqual(fibo(3), 2);
});

function fibo(n: number) {
  let a = 0;

  if (n === 0) {
    return a;
  }

  let b = 1;

  for (let i = 1; i !== n; ++i) {
    const c = a + b;
    a = b;
    b = c;
  }

  return b;
}
