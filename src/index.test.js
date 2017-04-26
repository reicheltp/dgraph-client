/* @flow */
import foo from './index';

test("foo adds Hallo", () => {
  expect(foo("World")).toBe("Hallo World")
});