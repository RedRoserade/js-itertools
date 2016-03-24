export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

export interface Enumerable<T> {
    [Symbol.iterator](): Iterator<T>;
    map<U>(fn: SelectorFunction<T, U>): Enumerable<U>;
    flatMap<U>(fn: SelectorFunction<T, Iterable<U>>): Enumerable<U>;
    filter(fn: PredicateFunction<T>): Enumerable<T>;
    take(count: number): Enumerable<T>;
    takeWhile(fn: PredicateFunction<T>): Enumerable<T>;
    skip(count: number): Enumerable<T>;
    skipWhile(fn: PredicateFunction<T>): Enumerable<T>;
    chain(...others: Iterable<T>[]): Enumerable<T>;
    some(fn?: PredicateFunction<T>): boolean;
    every(fn: PredicateFunction<T>): boolean;
    includes(item: T): boolean;
    reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U;
    single(predicate?: PredicateFunction<T>): T;
    first(fn?: PredicateFunction<T>): T;
    last(fn?: PredicateFunction<T>): T;
    count(fn?: PredicateFunction<T>): number;
    transformWith<U>(fn: (iterable: Iterable<T>, ...args: any[]) => Iterable<U>, ...args: any[]): Enumerable<U>;
}