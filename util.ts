export function* coerceToIterator<T>(source: Iterable<T>) {
    yield* source;
}