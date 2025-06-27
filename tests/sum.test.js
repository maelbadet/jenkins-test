const sum = require('../src/sum');

describe('sum()', () => {
    test('adds 1 + 2 to equal 3', () => {
        expect(sum(1, 2)).toBe(3);
    });

    test('adds -1 + -1 to equal -2', () => {
        expect(sum(-1, -1)).toBe(-2);
    });

    test('adds 0 + 0 to equal 0', () => {
        expect(sum(0, 0)).toBe(0);
    });

    test('adds 1000 + 2000 to equal 3000', () => {
        expect(sum(1000, 2000)).toBe(3000);
    });

    test('adds floating numbers 0.1 + 0.2 to be close to 0.3', () => {
        expect(sum(0.1, 0.2)).toBeCloseTo(0.3);
    });

    test('throws error when arguments are not numbers', () => {
        expect(() => sum('a', 2)).toThrow();
        expect(() => sum(1, null)).toThrow();
        expect(() => sum(undefined, 3)).toThrow();
        expect(() => sum({}, [])).toThrow();
    });
});
