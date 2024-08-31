import test from "node:test";
import assert from "node:assert";
import { RingBuffer } from "./ring-buffer.js";

test("ring buffer does not grow beyond its size", () => {
  const size = 144;
  const buffer = new RingBuffer(size);

  Array.from({ length: 2 * size }, (_, i) => buffer.push(i));
  assert.strictEqual(buffer._buffer.length, size);
});

test("ring buffer overwrites old values", () => {
  const size = 3;
  const buffer = new RingBuffer(size);

  Array.from({ length: 2 * size }, (_, i) => buffer.push(i));
  assert.strictEqual(buffer.get(0), size);
  assert.strictEqual(buffer.get(size), undefined);
  assert.strictEqual(buffer.get(size - 1), 2 * size - 1);
});
