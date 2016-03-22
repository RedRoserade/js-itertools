import * as impl from '../impl';
import { assert } from 'chai';

describe('repeat', () => {
    it('throws an error if count is negative', () => {
        assert.throws(() => impl.repeat('should throw', -1));
    });

    it('returns N items when N > 0', () => {
        assert.lengthOf([...impl.repeat('hi', 5)], 5);
    });

    it('returns empty when N === 0', () => {
        assert.lengthOf([...impl.repeat('none', 0)], 0);
    });

    it('always returns the same item', () => {
        const items = [...impl.repeat({ hi: 'hello' }, 10)];

        const first = items[0];

        assert.isTrue(items.every(i => i === first));
    });
});

describe('range', () => {
    it('throws on a negative count', () => {
        assert.throws(() => impl.range(1, -1));
    });

    it('returns C numbers between S and (S + C) - 1', () => {
        const result = [...impl.range(1, 10)];

        assert.lengthOf(result, 10);

        assert.equal(result[0], 1);
        assert.equal(result[result.length - 1], 10);
    });
});

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

    it('doesn\'t recursively flatten nested iterables', () => {
        const original = [{ arr: [1, [2], 3] }, { arr: [4, 5, 6] }];
        const expected = [1, [2], 3, 4, 5, 6];
        const actual = [...impl.flatten(original, n => n.arr)];

        assert.deepEqual(actual, expected);
    });
});

describe('filter', () => {
    it('returns items based on a predicate', () => {
        const original = [1, 2, 3, 4];
        const expected = [2, 4];
        const actual = [...impl.filter(original, n => n % 2 === 0)];

        assert.deepEqual(actual, expected);
    });
});

describe('take', () => {
    it('throws if count is negative', () => {
        assert.throws(() => impl.take([], -1));
    });

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

describe('chain', () => {
    it('takes the iterables and puts them all in the order they were put in the arguments', () => {
        const iter1 = [1, 2, 3];
        const iter2 = [3, 2, 1];
        const iter3 = [4, 5, 6];

        const expected = [1, 2, 3, 3, 2, 1, 4, 5, 6];

        const actual = [...impl.chain(iter1, iter2, iter3)];

        assert.deepEqual(expected, actual);
    });

    it('doesn\'t alter the contents of nested iterables', () => {
        const iter1 = [1, 2, 3];
        const iter2 = [3, [2], 1];
        const iter3 = [4, 5, 6];

        const expected = [1, 2, 3, 3, [2], 1, 4, 5, 6];

        const actual = [...impl.chain(iter1, iter2, iter3)];

        assert.deepEqual(expected, actual);
    });
});

describe('some', () => {
    it('returns true if at least one item matches', () => {
        const original = [1, 2, 3];
        const actual = impl.some(original, n => n % 2 === 0);

        assert.isTrue(actual);
    });

    it('returns false if no item matches', () => {
        const original = [1, 2, 3];
        const actual = impl.some(original, n => n === 0);

        assert.isFalse(actual);
    });

    it('returns true if at least one item is matched in an infinite sequence', () => {
        const original = impl.repeat(10);

        assert.isTrue(impl.some(original, n => n === 10));
    });

    it('doesn\'t iterate over a sequence more times than it needs to', () => {
        function* infiniteCounter() {
            let c = 0;
            while (true) {
                assert.isBelow(c, 6, 'Iterated more than 5 times.');

                yield c++;
            }
        }

        assert.isTrue(impl.some(infiniteCounter(), n => n === 5));
    });

    it('returns true if no predicate is passed and the sequence is not empty', () => {
        assert.isTrue(impl.some([1]));
        assert.isTrue(impl.some(impl.repeat('hi', 1)));
    });

    it('returns false if no predicate is passed and the sequence is empty', () => {
        assert.isFalse(impl.some([]));
        assert.isFalse(impl.some(impl.repeat('hi', 0)));
    });
});