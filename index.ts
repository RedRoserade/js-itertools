

import * as impl from './impl';

import { iterate } from './util';

import { ChainableIterable } from './types';

function iterable<T>(items: Iterable<T>): ChainableIterable<T> {
    let _items = iterate(items);

    return {
        [Symbol.iterator]: () => _items,
        map: (fn) => iterable(impl.map(_items, fn)),
        flatMap: (fn) => iterable(impl.flatMap(_items, fn)),
        filter: (fn) => iterable(impl.filter(_items, fn)),
        take: (count) => iterable(impl.take(_items, count)),
        takeWhile: (fn) => iterable(impl.takeWhile(_items, fn)),
        skip: (count) => iterable(impl.skip(_items, count)),
        skipWhile: (fn) => iterable(impl.skipWhile(_items, fn)),
        chain: (...iterables) => iterable(impl.chain(_items, ...iterables)),
        some: (fn?) => impl.some(_items, fn),
        every: (fn) => impl.every(_items, fn),
        includes: (item) => impl.includes(_items, item),
        reduce: (fn, initial?) => impl.reduce(_items, fn, initial),
        single: (fn?) => impl.single(_items, fn),
        first: (fn?) => impl.first(_items, fn),
        last: (fn?) => impl.last(_items, fn),
        count: (fn?) => impl.count(_items, fn),
        transformWith: (fn, ...args) => iterable(fn(_items, ...args)),
        zip: (...iterables) => iterable(impl.zip(_items, ...iterables)),
        groupBy: (fn) => iterable(impl.groupBy(_items, fn)),
        sortedGroupBy: (fn) => iterable(impl.sortedGroupBy(_items, fn))
    };
}
module.exports = iterable;

export function repeat<T>(item: T, count?: number) { return iterable(impl.repeat(item, count)); }
export function range(start: number, count?: number) { return iterable(impl.range(start, count)); }

export default iterable;