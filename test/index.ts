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

describe('every', () => {
    it('returns false when one item doesn\'t match', () => {
        assert.isFalse(impl.every([2, 4, 5], n => n % 2 === 0));
    });

    it('returns true if all items pass the predicate', () => {
        assert.isTrue(impl.every([1, 2, 3, 4, 5], n => n < 10));
    });

    it('returns false on the first item that is found, even if the sequence is infinite', () => {
        assert.isFalse(impl.every(impl.range(1), n => n < 10));
    });
});

describe('includes', () => {
    it('returns true if an item is in the list', () => {
        assert.isTrue(impl.includes([1, 2, 3], 2));
        assert.isFalse(impl.includes([1, '2', 3], 2));
    });
    
    it('returns true for NaN', () => {
        assert.isTrue(impl.includes([0, NaN], NaN));
    });
    
    it('returns false of +0/-0', () => {
        assert.isTrue(impl.includes([+0], -0));
    });
});

describe('reduce', () => {
    it('throws if an empty sequence and no default values are passed', () => {
        assert.throws(() => impl.reduce([], (acc, v) => acc + v));
    });

    it('takes the first item in the sequence if no default value is passed', () => {
        assert.equal(impl.reduce([1, 2, 3, 4, 5], (acc: number, v) => acc + v), 15);
    });

    it('uses the default value if passed', () => {
        assert.equal(impl.reduce([1, 2, 3, 4, 5], (acc, v) => acc + v, 10), 25);
    });
});

describe('single', () => {
    it('throws if the sequence has more than one value and no predicate was passed.', () => {
        assert.throws(() => impl.single([1, 2]));
    });

    it('returns the single item if it\'s the only item that matches', () => {
        assert.equal(impl.single([1]), 1);
    });

    it('throws if more than one item matches a predicate', () => {
        assert.throws(() => impl.single([1, 2], (i) => i < 3));
    });
});

describe('first', () => {
    it('throws if the sequence is empty an no predicate was passed.', () => {
        assert.throws(() => impl.first([]));
    });

    it('returns the first item if no predicate was passed', () => {
        assert.equal(impl.first([1, 2, 3]), 1);
    })

    it('returns the first item that does match, even if more exist', () => {
        assert.equal(impl.first([1, 2, 4, 5], (i) => i % 2 === 0), 2);
    });
});

describe('last', () => {
    it('throws if the sequence is empty an no predicate was passed', () => {
        assert.throws(() => impl.first([]));
    });

    it('returns the last item that does match, even if previous items matched', () => {
        assert.equal(impl.last([1, 2, 4, 5], (i) => i % 2 === 0), 4);
    });

    it('returns the last item if no predicate was passed', () => {
        assert.equal(impl.last([1, 2, 3]), 3);
    })
});

describe('count', () => {
    it('returns the number of items in the sequence when no predicate is passed', () => {
        assert.equal(impl.count([1, 2, 3]), 3);
    });

    it('returns the number of items that match the predicate', () => {
        assert.equal(impl.count([1, 2, 3, 4, 5], n => n % 2 === 0), 2);
    })
});