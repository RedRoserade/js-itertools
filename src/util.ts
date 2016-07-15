export function* iterate<T>(source: Iterable<T>) {
    yield* source;
}

/**
 * Throws a TypeError if [cond] is true.
 */
export function fail(cond, msg) { if (cond) { throw new TypeError(msg); } }

/**
 * Always returns true.
 */
export function truePredicate(item) { return true; }

/**
 * Returns its argument.
 */
export function unit(item) { return item; }