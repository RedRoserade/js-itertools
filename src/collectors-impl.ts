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

import { iterate, fail, truePredicate } from './util';

export function toArray<T>(seq: Iterable<T>): Array<T> {
    return Array.from(seq);
}

export function toSet<T>(seq: Iterable<T>): Set<T> {
    return new Set(seq);
}

/**
 * Constructs a new Map using [iter], a function to extract the key
 * from each item, and anoter to extract the key's corresponding value.
 */
export function toMap<K, V, T>(seq: Iterable<T>, keySelector: SelectorFunction<T, K>, valueSelector: SelectorFunction<T, V>): Map<K, V> {
    return new Map<K, V>(
        (function* () {
            let i = 0;
            for (const item of seq) {
                yield <[K, V]>[keySelector(item, i), valueSelector(item, i)];
                i += 1;
            }
        }())
    );
}

export function toLookup<T, K>(iter: Iterable<T>, keySelector?: KeyFunction<T, K>): Lookup<K, T> {
    const groups = new Map<K, Array<T>>();

    if (typeof keySelector !== 'function') {
        keySelector = v => v as any;
    }

    for (const item of iter) {
        const key = keySelector(item);
        let values: Array<T>;

        if (!groups.has(key)) {
            values = [];
            groups.set(key, values);
        } else {
            values = groups.get(key);
        }

        values.push(item);
    }

    return groups;
}

export function avg<T>(seq: Iterable<T>, selector?: SelectorFunction<T, number>): number {
    let count = 0;
    let sum = 0;

    let fn: (x: any, index: number) => number = typeof selector !== 'function' ? x => x : selector;

    for (const item of seq) {
        sum += fn(item, count++);
    }

    return sum / count;
}

export function sum<T>(seq: Iterable<T>, selector?: SelectorFunction<T, number>): number {
    let i = 0;
    let sum = 0;

    let fn: (x: any, index: number) => number = typeof selector !== 'function' ? x => x : selector;

    for (const item of seq) {
        sum += fn(item, i++);
    }

    return sum;
}

/**
 * Returns the number of items in [iter] that match [predicate] (if present).
 *
 * If [predicate] is absent, it simply returns the number of items in [iter].
 */
export function count<T>(iter: Iterable<T>, predicate?: PredicateFunction<T>): number {

    if (typeof predicate === 'undefined') {
        predicate = truePredicate;
    }

    let c = 0;

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            c++
        }
    }

    return c;
}

/**
 * Reduces [source] to a single value by applying [fn] to each item in [source].
 *
 * The [initialValue] is optional, and can be used to initialize the [accumulator] variable
 * on the first iteration. Otherwise, the first item in [source] is used.
 *
 * If the source is empty and no [initialValue] is supplied, an error is thrown.
 *
 * Otherwise, the [initialValue] is returned without applying [fn] to it.
 */
export function reduce<T, U>(source: Iterable<T>, fn: ReducerFunction<T, U>, initialValue?: U): U {
    let currentValue: any;

    let iter = iterate(source);

    const iterResult = iter.next();

    if (typeof initialValue !== 'undefined') {
        currentValue = initialValue;

        if (iterResult.done) {
            return currentValue;
        } else {
            currentValue = fn(initialValue, iterResult.value);
        }
    } else {
        fail(iterResult.done, 'Empty sequence with no default value.');

        currentValue = iterResult.value;
    }

    for (const item of iter) {
        currentValue = fn(currentValue, item);
    }

    return currentValue;
}



/**
 * Tests whether the [source] has at least one item which matches [predicate].
 *
 * Iteration stops as soon as the match is found (if any). False will only be returned
 * if the [source] is exhausted.
 *
 * Note: Unlike [Array.prototype.some], [predicate] is optional. In this case, it'll be
 * tested whether the [source] has any items.
 */
export function some<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): boolean {

    const iter = iterate(source);

    if (typeof predicate !== 'function') {
        predicate = truePredicate;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) { return true; }
    }

    return false;
}

/**
 * Returns true if [source] contains no matching element.
 *
 * If [predicate] is ommited, this returns whether [source] contains any item.
 *
 * Iteration stops as soon as a match is found.
 */
export function none<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): boolean {
    const iter = iterate(source);

    if (typeof predicate !== 'function') {
        predicate = truePredicate;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) { return false; }
    }

    return true;
}

/**
 * Tests if *all* the items in [iter] pass the [predicate] function.
 *
 * Iteration stops as soon as a non-match is found.
 */
export function every<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): boolean {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i++)) { return false; }
    }

    return true;
}

/**
 * Tests whether [iter] contains [test], using the same semantics as [Array.prototype.includes].
 *
 * Iteration stops as soon as the first match is found. False is returned otherwise.
 */
export function includes<T>(iter: Iterable<T>, test: T): boolean {
    for (const item of iter) {
        // Test cases which take NaN into account.
        // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
        if (item === test || (test !== test && item !== item)) {
            return true;
        }
    }

    return false;
}



/**
 * Returns the single item present in [source] that matches the [predicate].
 *
 * If [predicate] is absent, the sole item is returned.
 *
 * This method will throw if the sequence is empty or contains more than one elements
 * that match [predicate], or if the sequence contains more than one item (when [predicate] is not present).
 */
export function single<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): T {
    if (typeof predicate === 'undefined') {
        predicate = truePredicate;
    }

    const iter = iterate(source);
    let timesFound = 0;
    let foundItem: T;
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            foundItem = item;
            timesFound++;
            fail(timesFound > 1, 'Sequence contains more than one matching element.');
        }
    }

    fail(timesFound === 0, 'Sequence contains no matching element.');

    return foundItem;
}

/**
 * Returns the first item in [source] that matches [predicate]. Iteration stops
 * as soon as the item is found.
 *
 * If no item matches and the sequence is exhausted, an error is thrown.
 */
export function first<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): T {

    if (typeof predicate === 'undefined') {
        predicate = truePredicate;
    }

    const iter = iterate(source);
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            return item;
        }
    }
    // We only get here if no item was found.
    fail(true, 'Sequence contains no matching elements.');
}

/**
 * Returns the last item in [iter] that matches [predicate]. This will consume
 * the whole iterable.
 *
 * If no item matches and the sequence is exhausted, an error is thrown.
 */
export function last<T>(iter: Iterable<T>, predicate?: PredicateFunction<T>): T {
    if (typeof predicate === 'undefined') {
        predicate = truePredicate;
    }

    let i = 0;
    let match, found = false;

    for (const item of iter) {
        if (predicate(item, i++)) {
            match = item;
            found = true;
        }
    }

    fail(!found, 'Sequence contains no matching elements.');

    return match;
}