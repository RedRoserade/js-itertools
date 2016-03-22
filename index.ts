export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

import * as impl from './impl';

interface Enumerable<T> {
    [Symbol.iterator](): Iterator<T>;
    map<U>(fn: SelectorFunction<T, U>): Enumerable<U>;
    flatten<U>(fn: SelectorFunction<T, Iterable<U>>): Enumerable<U>;
    filter(fn: PredicateFunction<T>): Enumerable<T>;
    take(count?: number): Enumerable<T>;
    takeWhile(fn: PredicateFunction<T>): Enumerable<T>;
    skip(count: number): Enumerable<T>;
    skipWhile(fn: PredicateFunction<T>): Enumerable<T>;
    chain(...others: IterableIterator<T>[]): Enumerable<T>;
    some(fn?: PredicateFunction<T>): boolean;
    every(fn: PredicateFunction<T>): boolean;
    includes(item: T): boolean;
    reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U;
    single(orElse?: UnitFunction<T>): T;
    first(fn?: PredicateFunction<T>): T;
    last(fn?: PredicateFunction<T>): T;
    count(fn?: PredicateFunction<T>): number;
}


function iterable<T>(items: IterableIterator<T> | Iterable<T> | Iterator<T>): Enumerable<T> {
    let _items: IterableIterator<T>;
    
    if (typeof items[Symbol.iterator] === 'function') {
        _items = items[Symbol.iterator]();
    }
        
    return {
        [Symbol.iterator]: _items[Symbol.iterator].bind(items),
        map: (fn) => iterable(impl.map(_items, fn)),
        flatten: (fn) => iterable(impl.flatten(_items, fn)),
        filter: (fn) => iterable(impl.filter(_items, fn)),
        take: (count?) => iterable(impl.take(_items, count)),
        takeWhile: (fn) => iterable(impl.takeWhile(_items, fn)),
        skip: (count) => iterable(impl.skip(_items, count)),
        skipWhile: (fn) => iterable(impl.skipWhile(_items, fn)),
        chain: (...iterables) => iterable(impl.chain(...[_items, ...iterables])),
        some: (fn?) => impl.some(_items, fn),
        every: (fn) => impl.every(_items, fn),
        includes: (item) => impl.includes(_items, item),
        reduce: (fn, initial?) => impl.reduce(_items, fn, initial),
        single: (fn?) => impl.single(_items, fn),
        first: (fn?) => impl.first(_items, fn),
        last: (fn?) => impl.last(_items, fn),
        count: (fn?) => impl.count(_items, fn)
    };
}
module iterable {
    export function repeat<T>(item: T, count?: number) { return iterable(impl.repeat(item, count)); }
    export function range(start: number, count?: number) { return iterable(impl.range(start, count)); }
}

export default iterable;

const result = iterable.range(2)
    .take(50)
    .last();

console.log(result);