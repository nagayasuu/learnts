import assert from "node:assert/strict";
import test from "node:test";
import fc from "fast-check";

test("reversing an array twice returns the original array", () => {
  fc.assert(
    fc.property(fc.array(fc.integer()), (values) => {
      const reversedTwice = [...values].reverse().reverse();

      assert.deepEqual(reversedTwice, values);
    }),
  );
});
