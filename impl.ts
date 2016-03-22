import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction
} from './index';

function _truthyPredicate(item) { return true; }

function _fail(cond, msg) { if (cond) {throw new TypeError(msg); } }

export function* repeat<T>(item: T, count?: number): IterableIterator<T> {
    if (typeof count === 'number') {
        _fail(count < 0, 'Count cannot be negative.');

        for (let i = 0; i < count; i++) {
            yield item;
        }
    } else {
        while (true) {
            yield item;
        }
    }
}

export function* range(start: number, count?: number): IterableIterator<number> {
    if (typeof count === 'number') {
        _fail(count < 0, 'Count cannot be negative.');

        for (let i = 0; i < count; i++) {
            yield start + i;
        }
    } else {
        let i = 0;

        while (true) {
            yield start + i;
            i++;
        }
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

export function* take<T>(iter: Iterable<T>, count: number): IterableIterator<T> {
    _fail(count < 0, 'Count cannot be negative.');

    let taken = 0;

    for (const item of iter) {
        if (taken++ < count) {
            yield item;
        } else {
            break;
        }
    }
}

export function* takeWhile<T>(iter: Iterable<T>, predicate: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i += 1)) { break; }
        yield item;
    }
}

export function* skip<T>(iter: IterableIterator<T>, count: number): IterableIterator<T> {
    _fail(count < 0, 'Count cannot be negative.');

    let skipped = 0;

    for (const item of iter) {
        if (skipped++ >= count) {
            yield item;
        }
    }
}

export function* skipWhile<T>(iter: IterableIterator<T>, predicate: PredicateFunction<T>): IterableIterator<T> {
    let i = 0;

    for (const item of iter) {
        if (predicate(item, i += 1)) { continue; }

        break;
    }

    yield* iter;
}

export function* chain<T>(...others: IterableIterator<T>[]): IterableIterator<T> {
    for (let i = 0; i < others.length; i++) {
        yield* others[i];
    }
}

export function some<T>(iter: IterableIterator<T>, predicate?: PredicateFunction<T>): boolean {

    const iterResult = iter.next();

    if (iterResult.done) {
        return true;
    }

    if (typeof predicate !== 'function') {
        predicate = _truthyPredicate;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) { return true; }
    }

    return false;
}

export function every<T>(iter: IterableIterator<T>, predicate: PredicateFunction<T>): boolean {
    let i = 0;

    for (const item of iter) {
        if (!predicate(item, i++)) { return false; }
    }

    return true;
}



export function includes<T>(iter: IterableIterator<T>, test: T): boolean {
    for (const item of iter) {
        if (Object.is(item, test)) {
            return true;
        }
    }

    return false;
}

export function reduce<T, U>(iter: IterableIterator<T>, fn: ReducerFunction<T, U>, initialValue?: U): U {
    let currentValue: any;

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

export function single<T>(iter: IterableIterator<T>, orElse?: UnitFunction<T>): T {
    const iterResult = iter.next();

    if (iterResult.done) {
        _fail(typeof orElse !== 'function', 'Sequence contains no elements and orElse wasn\'t specified.');

        return orElse();
    }

    _fail(!iter.next().done, 'Sequence contains more than one element.');

    return iterResult.value;
}

export function first<T>(iter: IterableIterator<T>, predicate?: PredicateFunction<T>): T {
    if (typeof predicate === 'undefined') {
        const iterResult = iter.next();

        _fail(iterResult.done, 'Sequence contains no elements.');

        return iterResult.value;
    }

    let i = 0;

    for (const item of iter) {
        if (predicate(item, i++)) {
            return item;
        }
    }

    _fail(true, 'Sequence contains no matching elements.');
}

export function last<T>(iter: IterableIterator<T>, predicate?: PredicateFunction<T>): T {
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

export function count<T>(iter: IterableIterator<T>, predicate?: PredicateFunction<T>): number {
    let c = 0;

    if (typeof predicate === 'function') {
        let i = 0;

        for (const item of iter) {
            if (predicate(item, i++)) {
                c++
            }
        }
    } else {
        for (const item of iter) {
            c++;
        }
    }

    return c;
}