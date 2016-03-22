import * as impl from '../impl';
import { assert } from 'chai';

describe('map', () => {

    it('transforms an array of numbers', () => {
        const original = [1, 2, 3];
        const expected = [2, 4, 6];
        const actual = [...impl.map(original, n => n * 2)];

        assert.deepEqual(actual, expected);
    });

    it('transforms a generator', () => {
        const original = impl.range(1, 3);
        const expected = [2, 4, 6];
        const actual = [...impl.map(original, n => n * 2)]

        assert.deepEqual(actual, expected);
    });
});

describe('flatten', () => {
    it('flattens an array of arrays', () => {
        const original = [[1, 2, 3], [4, 5, 6]];
        const expected = [1, 2, 3, 4, 5, 6];
        const actual = [...impl.flatten(original, n => n)];

        assert.deepEqual(actual, expected);
    });

    it('flattens a string into its characters', () => {
        const original = 'hello';
        const expected = 'hello'.split('');
        const actual = [...impl.flatten(original, n => n)];

        assert.deepEqual(expected, actual);
    });

    it('retrieves the iterable property of objects and flattens it', () => {
        const original = [{ arr: [1, 2, 3] }, { arr: [4, 5, 6] }];
        const expected = [1, 2, 3, 4, 5, 6];
        const actual = [...impl.flatten(original, n => n.arr)];

        assert.deepEqual(actual, expected);
    });
});

describe('filter', () => {
    it('removes items based on a predicate', () => {
        const original = [1, 2, 3];
        const expected = [2];
        const actual = [...impl.filter(original, n => n % 2 === 0)];

        assert.deepEqual(actual, expected);
    });
});

describe('take', () => {
    it('takes N items if source is of N length', () => {
        const original = [1, 2, 3];
        const expected = 3;
        const actual = [...impl.take(original, 3)].length;

        assert.equal(actual, expected);
    });

    it('takes M items if source is of M length (N > M)', () => {
        const original = [1, 2, 3];
        const expected = 3;
        const actual = [...impl.take(original, 5)].length;

        assert.equal(actual, expected);
    });

    it('takes N items if N < length of source', () => {
        const original = [1, 2, 3, 4, 5];
        const expected = 2;
        const actual = [...impl.take(original, 2)].length;

        assert.equal(actual, expected);
    });

    it('takes N items of an infinite source', () => {
        const original = impl.repeat('infinite');
        const expected = 2;
        const actual = [...impl.take(original, 2)].length;

        assert.equal(actual, expected);
    });
});

describe('takeWhile', () => {
    it('takes items while a condition is true', () => {
        const original = [1, 2, 3, 4, 5];
        const expected = [1, 2, 3];
        const actual = [...impl.takeWhile(original, n => n <= 3)];

        assert.deepEqual(actual, expected);
    });

    it('only takes the items up to the first that doesn\'t (exclusive), even if later items still match the condition', () => {
        const original = [1, 2, 3, 4, 5, 4, 3, 2, 1];
        const expected = [1, 2, 3];
        const actual = [...impl.takeWhile(original, n => n <= 3)];

        assert.deepEqual(actual, expected);
    });
});