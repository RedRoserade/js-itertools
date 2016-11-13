
import * as impl from '../src/transformers-impl';
import * as gen from '../src/generators-impl';
import * as collect from '../src/collectors-impl';
import { assert } from 'chai';

describe('repeat', () => {
    it('throws an error if count is negative', () => {
        assert.throws(() => gen.repeat('should throw', -1));
    });

    it('returns N items when N > 0', () => {
        assert.lengthOf([...gen.repeat('hi', 5)], 5);
    });

    it('returns empty when N === 0', () => {
        assert.lengthOf([...gen.repeat('none', 0)], 0);
    });

    it('always returns the same item', () => {
        const items = [...gen.repeat({ hi: 'hello' }, 10)];

        const first = items[0];

        assert.isTrue(items.every(i => i === first));
    });
});

describe('range', () => {
    it('throws on a negative count', () => {
        assert.throws(() => gen.range(1, -1));
    });

    it('returns C numbers between S and (S + C) - 1', () => {
        const result = [...gen.range(1, 10)];

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
        const original = gen.range(1, 3);
        const expected = [2, 4, 6];
        const actual = [...impl.map(original, n => n * 2)]

        assert.deepEqual(actual, expected);
    });
});

describe('flatMap', () => {
    it('flattens an array of arrays', () => {
        const original = [[1, 2, 3], [4, 5, 6]];
        const expected = [1, 2, 3, 4, 5, 6];
        const actual = [...impl.flatMap(original, n => n)];

        assert.deepEqual(actual, expected);
    });

    it('flattens a string into its characters', () => {
        const original = 'hello';
        const expected = 'hello'.split('');
        const actual = [...impl.flatMap(original, n => n)];

        assert.deepEqual(expected, actual);
    });

    it('retrieves the iterable property of objects and flattens it', () => {
        const original = [{ arr: [1, 2, 3] }, { arr: [4, 5, 6] }];
        const expected = [1, 2, 3, 4, 5, 6];
        const actual = [...impl.flatMap(original, n => n.arr)];

        assert.deepEqual(actual, expected);
    });

    it('doesn\'t recursively flatten nested iterables', () => {
        const original = [{ arr: [1, [2], 3] }, { arr: [4, 5, 6] }];
        const expected = [1, [2], 3, 4, 5, 6];
        const actual = [...impl.flatMap(original, n => n.arr)];

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
        const original = gen.repeat('infinite');
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

describe('skip', () => {
    it('skips the first N items', () => {
        const original = [1, 2, 3, 4, 5];

        assert.deepEqual([...impl.skip(original, 2)], [3, 4, 5]);
    });

    it('returns an empty sequence if N is larger than the number of items in the source', () => {
        const original = [1, 2, 3, 4, 5];

        assert.deepEqual([...impl.skip(original, 10)], []);
    });
});

describe('skipWhile', () => {
    it('skips items while a condition is true', () => {
        const original = [1, 2, 3, 4, 5];
        const expected = [4, 5];
        const actual = [...impl.skipWhile(original, n => n <= 3)];

        assert.deepEqual(actual, expected);
    });

    it('only skips the items up to the first that doesn\'t (exclusive), even if later items still match the condition', () => {
        const original = [1, 2, 3, 4, 5, 4, 3, 2, 1];
        const expected = [4, 5, 4, 3, 2, 1];
        const actual = [...impl.skipWhile(original, n => n <= 3)];

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
        const actual = collect.some(original, n => n % 2 === 0);

        assert.isTrue(actual);
    });

    it('returns false if no item matches', () => {
        const original = [1, 2, 3];
        const actual = collect.some(original, n => n === 0);

        assert.isFalse(actual);
    });

    it('returns true if at least one item is matched in an infinite sequence', () => {
        const original = gen.repeat(10);

        assert.isTrue(collect.some(original, n => n === 10));
    });

    it('doesn\'t iterate over a sequence more times than it needs to', () => {
        function* infiniteCounter() {
            let c = 0;
            while (true) {
                assert.isBelow(c, 6, 'Iterated more than 5 times.');

                yield c++;
            }
        }

        assert.isTrue(collect.some(infiniteCounter(), n => n === 5));
    });

    it('returns true if no predicate is passed and the sequence is not empty', () => {
        assert.isTrue(collect.some([1]));
        assert.isTrue(collect.some(gen.repeat('hi', 1)));
    });

    it('returns false if no predicate is passed and the sequence is empty', () => {
        assert.isFalse(collect.some([]));
        assert.isFalse(collect.some(gen.repeat('hi', 0)));
    });
});

describe('every', () => {
    it('returns false when one item doesn\'t match', () => {
        assert.isFalse(collect.every([2, 4, 5], n => n % 2 === 0));
    });

    it('returns true if all items pass the predicate', () => {
        assert.isTrue(collect.every([1, 2, 3, 4, 5], n => n < 10));
    });

    it('returns false on the first item that is found, even if the sequence is infinite', () => {
        assert.isFalse(collect.every(gen.range(1), n => n < 10));
    });
});

describe('includes', () => {
    it('returns true if an item is in the list', () => {
        assert.isTrue(collect.includes([1, 2, 3], 2));
        assert.isFalse(collect.includes([1, '2', 3], 2));
    });

    it('returns true for NaN', () => {
        assert.isTrue(collect.includes([0, NaN], NaN));
    });

    it('returns false of +0/-0', () => {
        assert.isTrue(collect.includes([+0], -0));
    });
});

describe('reduce', () => {
    it('throws if an empty sequence and no default values are passed', () => {
        assert.throws(() => collect.reduce([], (acc, v) => acc + v));
    });

    it('takes the first item in the sequence if no default value is passed', () => {
        assert.equal(collect.reduce([1, 2, 3, 4, 5], (acc: number, v) => acc + v), 15);
    });

    it('uses the default value if passed', () => {
        assert.equal(collect.reduce([1, 2, 3, 4, 5], (acc, v) => acc + v, 10), 25);
    });
});

describe('single', () => {
    it('throws if the sequence has more than one value and no predicate was passed.', () => {
        assert.throws(() => collect.single([1, 2]));
    });

    it('returns the single item if it\'s the only item that matches', () => {
        assert.equal(collect.single([1]), 1);
        assert.equal(collect.single([1, 2, 3], i => i === 1), 1);
    });

    it('throws if more than one item matches a predicate', () => {
        assert.throws(() => collect.single([1, 2], (i) => i < 3));

        assert.throws(() => collect.single([1, 2, 1], (i) => i === 1));
    });
});

describe('first', () => {
    it('throws if the sequence is empty an no predicate was passed.', () => {
        assert.throws(() => collect.first([]));
    });

    it('returns the first item if no predicate was passed', () => {
        assert.equal(collect.first([1, 2, 3]), 1);
    })

    it('returns the first item that does match, even if more exist', () => {
        assert.equal(collect.first([1, 2, 4, 5], (i) => i % 2 === 0), 2);
    });
});

describe('last', () => {
    it('throws if the sequence is empty an no predicate was passed', () => {
        assert.throws(() => collect.first([]));
    });

    it('returns the last item that does match, even if previous items matched', () => {
        assert.equal(collect.last([1, 2, 4, 5], (i) => i % 2 === 0), 4);
    });

    it('returns the last item if no predicate was passed', () => {
        assert.equal(collect.last([1, 2, 3]), 3);
    })
});

describe('count', () => {
    it('returns the number of items in the sequence when no predicate is passed', () => {
        assert.equal(collect.count([1, 2, 3]), 3);
    });

    it('returns the number of items that match the predicate', () => {
        assert.equal(collect.count([1, 2, 3, 4, 5], n => n % 2 === 0), 2);
    })
});

describe('zip', () => {
    it('returns an iterable of arrays of N length', () => {
        const iter1 = [1, 2, 3];
        const iter2 = ['a', 'b', 'c'];

        const result = [...impl.zip(iter1, iter2)];

        assert.deepEqual([[1, 'a'], [2, 'b'], [3, 'c']], result);
    });

    it('stops yielding items if one of the iterables is shorter', () => {
        assert.deepEqual(
            [...impl.zip([1, 2, 3], ['a', 'b'])],
            [[1, 'a'], [2, 'b']]
        );

        assert.deepEqual(
            [...impl.zip([1, 2], ['a', 'b', 'c'])],
            [[1, 'a'], [2, 'b']]
        );
    });
});
