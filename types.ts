export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

export type KeyFunction<T, K> = (item: T) => K;

export type Grouping<K, T> = { key: K, [Symbol.iterator](): Iterator<T> };

export interface ChainableIterable<T> {
    [Symbol.iterator](): Iterator<T>;
    map<U>(fn: SelectorFunction<T, U>): ChainableIterable<U>;
    flatMap<U>(fn: SelectorFunction<T, Iterable<U>>): ChainableIterable<U>;
    filter(fn: PredicateFunction<T>): ChainableIterable<T>;
    take(count: number): ChainableIterable<T>;
    takeWhile(fn: PredicateFunction<T>): ChainableIterable<T>;
    skip(count: number): ChainableIterable<T>;
    skipWhile(fn: PredicateFunction<T>): ChainableIterable<T>;
    chain(...others: Iterable<T>[]): ChainableIterable<T>;
    some(fn?: PredicateFunction<T>): boolean;
    every(fn: PredicateFunction<T>): boolean;
    includes(item: T): boolean;
    reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U;
    single(predicate?: PredicateFunction<T>): T;
    first(fn?: PredicateFunction<T>): T;
    last(fn?: PredicateFunction<T>): T;
    count(fn?: PredicateFunction<T>): number;
    transformWith<U>(fn: (iterable: Iterable<T>, ...args: any[]) => Iterable<U>, ...args: any[]): ChainableIterable<U>;
    zip(...iterables: Iterable<any>[]): ChainableIterable<Array<any>>;
    groupBy<K>(keySelector: KeyFunction<K, T>): ChainableIterable<Grouping<K, T>>;
    sortedGroupBy<K>(keySelector: KeyFunction<K, T>): ChainableIterable<Grouping<K, T>>;
}