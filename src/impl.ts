import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction,
    Grouping,
    KeyFunction,
    Action
} from './types';

import { iterate } from './util';

function _truthyPredicate(item) { return true; }

function _fail(cond, msg) { if (cond) { throw new TypeError(msg); } }


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

        _fail(count < 0, 'Count cannot be negative.');

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
        _fail(count < 0, 'Count cannot be negative.');

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
        fn = n => n as any;
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
    _fail(count < 0, 'Count cannot be negative.');

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
    _fail(count < 0, 'Count cannot be negative.');

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
        predicate = _truthyPredicate;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) { return true; }
    }

    return false;
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
        _fail(iterResult.done, 'Empty sequence with no default value.');

        currentValue = iterResult.value;
    }

    for (const item of iter) {
        currentValue = fn(currentValue, item);
    }

    return currentValue;
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
        predicate = _truthyPredicate;
    }

    const iter = iterate(source);
    let timesFound = 0;
    let foundItem: T;
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            foundItem = item;
            timesFound++;
            _fail(timesFound > 1, 'Sequence contains more than one matching element.');
        }
    }

    _fail(timesFound === 0, 'Sequence contains no matching element.');

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
        predicate = _truthyPredicate;
    }

    const iter = iterate(source);
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            return item;
        }
    }
    // We only get here if no item was found.
    _fail(true, 'Sequence contains no matching elements.');
}

/**
 * Returns the last item in [iter] that matches [predicate]. This will consume
 * the whole iterable.
 *
 * If no item matches and the sequence is exhausted, an error is thrown.
 */
export function last<T>(iter: Iterable<T>, predicate?: PredicateFunction<T>): T {
    if (typeof predicate === 'undefined') {
        predicate = _truthyPredicate;
    }

    let i = 0;
    let match, found = false;

    for (const item of iter) {
        if (predicate(item, i++)) {
            match = item;
            found = true;
        }
    }

    _fail(!found, 'Sequence contains no matching elements.');

    return match;
}

/**
 * Returns the number of items in [iter] that match [predicate] (if present).
 *
 * If [predicate] is absent, it simply returns the number of items in [iter].
 */
export function count<T>(iter: Iterable<T>, predicate?: PredicateFunction<T>): number {

    if (typeof predicate === 'undefined') {
        predicate = _truthyPredicate;
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

export function* groupBy<T, K>(iter: Iterable<T>, keySelector?: KeyFunction<T, K>): IterableIterator<Grouping<K, T>> {
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
    
    for (const pair of groups) {    
        const key = pair[0];
        const values = iterate(pair[1]);
        
        yield { 
            key, 
            [Symbol.iterator]: () => values 
        };
    }
}

/**
 * Implementation of [groupBy] for sources that are known
 * to have their keys already sorted.
 * 
 * The implementation was adapted from Python's itertools:
 * https://docs.python.org/3/library/itertools.html#itertools.groupby
 */
export function* sortedGroupBy<T, K>(iter: Iterable<T>, keySelector?: KeyFunction<T, K>): IterableIterator<Grouping<K, T>> {
    if (typeof keySelector !== 'function') {
        keySelector = v => v as any;
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

/**
 * Calls [Array.from] with [iter].
 */
export function toArray<T>(iter: Iterable<T>): Array<T> {
    return Array.from(iter);
}

/**
 * Calls the [Set] constructor with [iter].
 */
export function toSet<T>(iter: Iterable<T>): Set<T> {
    return new Set(iter);
}

/**
 * Constructs a new Map using [iter], a function to extract the key
 * from each item, and anoter to extract the key's corresponding value.
 */
export function toMap<K, V, T>(iter: Iterable<T>, keySelector: KeyFunction<T, K>, valueSelector: KeyFunction<T, V>): Map<K, V> {
    return new Map<K, V>(
        (function* () {
            for (const item of iter) {
                yield <[K, V]>[keySelector(item), valueSelector(item)];
            }
        }())
    );
}