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

import * as collectors from './collectors-impl';

import { iterate, fail, truePredicate, unit } from './util';

/**
 * Returns a generator whose items are the result of applying [fn] to each of the items in [iter].
 */
export function* map<T, U>(iter: Iterable<T>, fn: SelectorFunction<T, U>): IterableIterator<U> {
    let i = 0;

    for (const item of iter) {
        yield fn(item, i++);
    }
}

/**
 * Returns a generator whose items are the result of applying [fn] to each of the items in [iter],
 * and expanding them into one single sequence.
 *
 * [fn] must return an iterable.
 *
 * flatten([[1], [2], [3]], n => n) === [1, 2, 3]
 */
export function* flatMap<T, U>(iter: Iterable<T>, fn?: SelectorFunction<T, Iterable<U>>): IterableIterator<U> {
    let i = 0;

    if (typeof fn !== 'function') {
        fn = unit;
    }

    for (const item of iter) {
        yield* fn(item, i++);
    }
}

/**
 * Returns a generator whose items are those from [iter] which [fn] returns true.
 */
export function* filter<T>(iter: Iterable<T>, fn: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (fn(item, i++) === true) {
            yield item;
        }
    }
}

/**
 * Returns a generator that returns up to [count] items from [iter].
 *
 * If [iter] has *less* items than [count], then all the items from [iter] are returned.
 */
export function take<T>(iter: Iterable<T>, count: number): IterableIterator<T> {
    fail(count < 0, 'Count cannot be negative.');

    return (function* take() {
        let taken = 0;

        for (const item of iter) {
            if (taken++ < count) {
                yield item;
            } else {
                return;
            }
        }
    }());
}

/**
 * Returns a generator that returns items from [iter] until [predicate] returns false. Iteration
 * will stop as soon as the first non-match is found.
 *
 * The first item for which [predicate] returns false will *not* be returned.
 *
 * Unlike [filter], even if later items would pass [predicate], they will not be returned.
 */
export function* takeWhile<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i += 1)) { break; }
        yield item;
    }
}

/**
 * Returns a generator whose items are those from [iter], except the first [count].
 *
 * If [count] is larger than the number of items in [iter], the resulting generator
 * will be empty.
 */
export function* skip<T>(iter: Iterable<T>, count: number): IterableIterator<T> {
    fail(count < 0, 'Count cannot be negative.');

    let skipped = 0;

    for (const item of iter) {
        if (skipped++ >= count) {
            yield item;
        }
    }
}

/**
 * Returns a generator whose items are those from [iter], except the first ones whose [predicate] returns true.
 *
 * The first item in the resulting generator will be, thus, the first item for which [predicate] returns false.
 */
export function* skipWhile<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;
    let nonMatchFound = false;

    for (const item of iter) {
        if (!nonMatchFound) {
            if (predicate(item, i += 1)) { continue; }
            nonMatchFound = true;
        }

        yield item;
    }
}

/**
 * Returns a generator whose items are the result of yielding the contents
 * of each of the iterables passed through the arguments, in the order they were passed into the function.
 */
export function* chain<T>(...others: Iterable<T>[]): IterableIterator<T> {
    for (let i = 0; i < others.length; i++) {
        yield* others[i];
    }
}


/**
 * Returns an iterable whose items are arrays, each containing the nth item from
 * each iterable passed in the arguments.
 *
 * Iteration stops as soon as one iterable is exhausted. No item is yielded then.
 *
 * [...zip([1, 2, 3], ['hi', 'hello'])] -> [[1, 'hi], [2, 'hello']]
 */
export function* zip(...iterables: Iterable<any>[]): IterableIterator<Array<any>> {
    const _iterables = iterables.map(iterate);
    const iterableLength = _iterables.length

    while (true) {
        const item = [];

        for (let i = 0; i < iterableLength; i++) {
            const result = _iterables[i].next();

            if (result.done) { return; }

            item.push(result.value);
        }

        yield item;
    }
}

/**
 * Implementation of [groupBy] for sources that are known
 * to have their keys already sorted.
 *
 * The implementation was adapted from Python's itertools:
 * https://docs.python.org/3/library/itertools.html#itertools.groupby
 */
export function* groupBy<T, K>(iter: Iterable<T>, keySelector?: KeyFunction<T, K>): IterableIterator<Grouping<K, T>> {
    if (typeof keySelector !== 'function') {
        keySelector = unit;
    }

    const items = iterate(iter);

    let targetKey: K;
    let currentKey: K;
    let currentValue: T;

    while (true) {
        while (currentKey === targetKey) {
            const currentIteration = items.next();

            if (currentIteration.done) { return; }

            currentValue = currentIteration.value;

            currentKey = keySelector(currentValue);
        }

        targetKey = currentKey;

        yield {
            key: currentKey,
            *[Symbol.iterator]() {
                while (currentKey === targetKey) {
                    yield currentValue;

                    const currentIteration = items.next();

                    if (currentIteration.done) { return; }

                    currentValue = currentIteration.value;

                    currentKey = keySelector(currentValue);
                }
            }
        };
    }
}

/**
 * Executes [fn] for each item in [iter].
 */
export function forEach<T>(iter: Iterable<T>, fn: Action<T>) {
    for (const item of iter) {
        fn(item);
    }
}

export function* intersperse<T>(iter: Iterable<T>, interspersed: T): IterableIterator<T> {
    let isFirst = true;

    const iterable = iterate(iter);

    for (const item of iterable) {
        if (!isFirst) {
            yield interspersed;
        } else {
            isFirst = false;
        }

        yield item;
    }
}

export function* innerJoin<TOuter, TInner, K>(outer: Iterable<TOuter>, inner: Iterable<TInner>, outerKey: KeyFunction<TOuter, K>, innerKey: KeyFunction<TInner, K>): IterableIterator<[TOuter, TInner]> {
    const lookup = collectors.toLookup(inner, innerKey);

    for (const item of outer) {
        const g = lookup.get(outerKey(item));

        if (g !== undefined) {
            for (const element of g) {
                yield [item, element];
            }
        }
    }
}

export function* leftJoin<TOuter, TInner, K>(outer: Iterable<TOuter>, inner: Iterable<TInner>, outerKey: KeyFunction<TOuter, K>, innerKey: KeyFunction<TInner, K>): IterableIterator<[TOuter, TInner]> {
    const lookup = collectors.toLookup(inner, innerKey);

    for (const item of outer) {
        const g = lookup.get(outerKey(item));

        if (g !== undefined) {
            for (const element of g) {
                yield [item, element];
            }
        } else {
            yield [item, undefined];
        }
    }
}

export function* rightJoin<TOuter, TInner, K>(outer: Iterable<TOuter>, inner: Iterable<TInner>, outerKey: KeyFunction<TOuter, K>, innerKey: KeyFunction<TInner, K>): IterableIterator<[TOuter, TInner]> {
    const lookup = collectors.toLookup(outer, outerKey);

    for (const item of inner) {
        const g = lookup.get(innerKey(item));

        if (g !== undefined) {
            for (const element of g) {
                yield [element, item];
            }
        } else {
            yield [undefined, item];
        }
    }
}

export function* fullJoin<TOuter, TInner, K>(outer: Iterable<TOuter>, inner: Iterable<TInner>, outerKey: KeyFunction<TOuter, K>, innerKey: KeyFunction<TInner, K>): IterableIterator<[TOuter, TInner]> {
    const innerLookup = collectors.toLookup(inner, innerKey);
    const outerLookup = collectors.toLookup(outer, outerKey);

    for (const outerKey of outerLookup.keys()) {
        if (!innerLookup.has(outerKey)) {
            innerLookup.set(outerKey, undefined);
        }
    }

    for (const pair of innerLookup) {
        const key = pair[0];
        const innerItems = pair[1];
        const outerItems = outerLookup.get(key);

        if (innerItems !== undefined) {
            for (const innerItem of innerItems) {
                if (outerItems !== undefined) {
                    for (const outerItem of outerItems) {
                        yield [outerItem, innerItem];
                    }
                } else {
                    yield [undefined, innerItem];
                }
            }
        } else {
            for (const outerItem of outerItems) {
                yield [outerItem, undefined];
            }
        }
    }
}
