

import * as impl from './impl';

import { coerceToIterator } from './util';

import { Enumerable } from './types';

function iterable<T>(items: Iterable<T>): Enumerable<T> {
    let _items = coerceToIterator(items);

    return {
        [Symbol.iterator]: () => _items,
        map: (fn) => iterable(impl.map(_items, fn)),
        flatten: (fn) => iterable(impl.flatten(_items, fn)),
        filter: (fn) => iterable(impl.filter(_items, fn)),
        take: (count) => iterable(impl.take(_items, count)),
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

export function repeat<T>(item: T, count?: number) { return iterable(impl.repeat(item, count)); }
export function range(start: number, count?: number) { return iterable(impl.range(start, count)); }

export default iterable;