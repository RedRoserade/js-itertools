import chain from '../src/index';
import { sum } from '../src/collectors-impl';

import { assert } from 'chai';

describe('Chaining', () => {
    it('Allows for multiple calls on an initial iterator', () => {
        const myIter = chain([1, 2, 3, 4, 5]);

        const doubleOfEven = myIter
            .filter(n => n % 2 == 0)
            .map(n => n * 2);

        assert.deepEqual(Array.from(doubleOfEven), [4, 8]);
    });

    it('Multiple chains produce different objects', () => {
        const first = chain([1, 2, 3, 4, 5]);

        const second = first.map(n => n * 2);

        assert.notEqual(first, second);

        const total = second.collect(sum);

        assert.equal(total, 30);
    });
});