export function* iterate<T>(source: Iterable<T>) {
    yield* source;
}