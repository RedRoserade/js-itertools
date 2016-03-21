export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

import * as impl from './impl';

interface Enumerable<T> {
    [Symbol.iterator](): Iterator<T>;
    take(count?: number): Enumerable<T>;
    map<U>(fn: SelectorFunction<T, U>): Enumerable<U>;
    filter(fn: PredicateFunction<T>): Enumerable<T>;
    reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U;
    flatten<U>(fn: SelectorFunction<T, Iterable<U>>): Enumerable<U>;
    takeWhile(fn: PredicateFunction<T>): Enumerable<T>;
    skip(count: number): Enumerable<T>;
}

function iterable<T>(items: IterableIterator<T> | Iterable<T> | Iterator<T>): Enumerable<T> {
    let _items: IterableIterator<T>;
    
    if (typeof items[Symbol.iterator] === 'function') {
        _items = items[Symbol.iterator]();
    }
        
    return {
        [Symbol.iterator]: _items[Symbol.iterator].bind(items),
        map: (fn) => iterable(impl.map(_items, fn)),
        filter: (fn) => iterable(impl.filter(_items, fn)),
        take: (count?) => iterable(impl.take(_items, count)),
        reduce: (fn, initial) => impl.reduce(_items, fn, initial),
        flatten: (fn) => iterable(impl.flatten(_items, fn)),
        takeWhile: (fn) => iterable(impl.takeWhile(_items, fn)),
        skip: (count) => iterable(impl.skip(_items, count))
    };
}

module iterable {
    export function repeat<T>(item: T, count?: number): Enumerable<T> { return iterable(impl.repeat(item, count)); }
}

export default iterable;

const result = iterable.repeat('hello, world')
    .map((_, i) => { console.log(i); return _; })
    .skip(1)
    .map(i => i);
    
for (const item of result) {
    console.log([...item]);
}