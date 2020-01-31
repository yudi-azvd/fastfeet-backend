function sum(a, b) {
  return a + b;
}

test('3 and 4 should be 7', () => {
  expect(sum(3, 4)).toBe(7);
});
