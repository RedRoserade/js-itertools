import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction,
    Grouping,
    Action,
    Lookup,
    KeyFunction
} from './types';

import { fail } from './util';

/**
 * Returns a generator that yields [item] [count] times.
 *
 * If [count] is ommited, [item] will be returned an
 * infinite amount of times.
 *
 * @param item: The item to repeatedly return.
 * @param count: The number of times to return the item. Optional. May not be negative, can be 0.
 */
export function repeat<T>(item: T, count?: number): IterableIterator<T> {
    if (typeof count === 'number') {

        fail(count < 0, 'Count cannot be negative.');

        return (function* repeat() {
            for (let i = 0; i < count; i++) {
                yield item;
            }
        }());

    } else {
        return (function* repeatInfinite() {
            while (true) {
                yield item;
            }
        }());
    }
}

/**
 * Returns a generator that yields numbers from [start] up to [start] + [count] - 1.
 *
 * If count is ommitted, it goes on forever. Overflow testing is not done.
 */
export function range(start: number, count?: number): IterableIterator<number> {
    if (typeof count === 'number') {
        fail(count < 0, 'Count cannot be negative.');

        return (function* range() {
            for (let i = 0; i < count; i++) {
                yield start + i;
            }
        }());
    } else {
        return (function* rangeInfinite() {
            for (let i = 0; ; i++) {
                yield start + i;
            }
        }());
    }
}

/**
 * Returns a generator that yields numbers from [start] to [end] - 1, or [end] if [inclusive] === true
 */
export function between(start: number, end: number, inclusive?: boolean): IterableIterator<number> {
    fail(end < start, 'End cannot be lower than start.');

    if (inclusive === true) {
        end += 1;
    }

    return (function* between() {
        for (let i = start; i < end; i++) {
            yield i;
        }
    }());
}

export function sequence<T>(seq: Array<T>): IterableIterator<T> {
    fail(!Array.isArray(seq), 'The sequence must be an array');

    return (function* sequence() {
        let i = 0;
        const count = seq.length;

        while (true) {
            for (i = 0; i < count; i++) {
                yield seq[i];
            }
        }
    }());
}