import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction
} from './index';

function _truthyPredicate(item) { return true; }

function _fail(cond, msg) { if (cond) { throw new TypeError(msg); } }

function* _coerceToIterator<T>(source: Iterable<T>) {
    yield* source;
}

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

export function* map<T, U>(iter: Iterable<T>, fn: SelectorFunction<T, U>): IterableIterator<U> {
    let i = 0;

    for (const item of iter) {
        yield fn(item, i++);
    }
}

export function* flatten<T, U>(iter: Iterable<T>, fn: SelectorFunction<T, Iterable<U>>): IterableIterator<U> {
    let i = 0;

    for (const item of iter) {
        yield* fn(item, i++);
    }
}

export function* filter<T>(iter: Iterable<T>, fn: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (fn(item, i++)) {
            yield item;
        }
    }
}

export function take<T>(iter: Iterable<T>, count: number): IterableIterator<T> {
    _fail(count < 0, 'Count cannot be negative.');

    return (function* take() {
        let taken = 0;

        for (const item of iter) {
            if (taken++ < count) {
                yield item;
            } else {
                break;
            }
        }
    }());
}

export function* takeWhile<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i += 1)) { break; }
        yield item;
    }
}

export function* skip<T>(iter: Iterable<T>, count: number): IterableIterator<T> {
    _fail(count < 0, 'Count cannot be negative.');

    let skipped = 0;

    for (const item of iter) {
        if (skipped++ >= count) {
            yield item;
        }
    }
}

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

export function* chain<T>(...others: Iterable<T>[]): IterableIterator<T> {
    for (let i = 0; i < others.length; i++) {
        yield* others[i];
    }
}

export function some<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): boolean {

    const iter = _coerceToIterator(source);

    if (typeof predicate !== 'function') {
        predicate = _truthyPredicate;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) { return true; }
    }

    return false;
}

export function every<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): boolean {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i++)) { return false; }
    }

    return true;
}

export function includes<T>(iter: Iterable<T>, test: T): boolean {
    for (const item of iter) {
        if (item === test) {
            return true;
        }
    }

    return false;
}

export function reduce<T, U>(source: Iterable<T>, fn: ReducerFunction<T, U>, initialValue?: U): U {
    let currentValue: any;

    let iter = _coerceToIterator(source);

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

export function single<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): T {
    if (typeof predicate === 'undefined') {
        predicate = _truthyPredicate;
    }

    const iter = _coerceToIterator(source);
    let itemAlreadyFound = false;
    let foundItem: T;
    let i = 0;

    for (const item of iter) {
        _fail(itemAlreadyFound, 'Sequence contains more than one matching element.');
        itemAlreadyFound = predicate(item, i++);

        if (itemAlreadyFound) {
            foundItem = item;
        }
    }

    _fail(!itemAlreadyFound, 'Sequence contains no matching element.');

    return foundItem;
}

export function first<T>(source: Iterable<T>, predicate?: PredicateFunction<T>): T {

    if (typeof predicate === 'undefined') {
        predicate = _truthyPredicate;
    }

    const iter = _coerceToIterator(source);
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            return item;
        }
    }

    _fail(true, 'Sequence contains no matching elements.');
}

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