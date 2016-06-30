import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction,
    Grouping,
    KeyFunction,
    Action,
    IChainableIterable
} from './types';

import * as impl from './impl';

import { iterate } from './util';

export default function iter<T>(items: Iterable<T>): IChainableIterable<T> {

    let _items: IterableIterator<any> = iterate(items);

    const monad = Object.create(null);

    monad[Symbol.iterator] = function () {
        return _items;
    }
    monad.map = function map<U>(fn: SelectorFunction<T, U>) {
        _items = impl.map(_items, fn);

        return iter(_items);
    }
    monad.flatMap = function flatMap<U>(fn: SelectorFunction<T, Iterable<U>>) {
        _items = impl.flatMap(_items, fn);

        return iter(_items);
    }
    monad.filter = function filter(fn: PredicateFunction<T>) {
        _items = impl.filter(_items, fn);

        return iter(_items);
    }
    monad.take = function take(count: number) {
        _items = impl.take(_items, count);

        return iter(_items);
    }
    monad.takeWhile = function takeWhile(fn: PredicateFunction<T>) {
        _items = impl.takeWhile(_items, fn);
        return iter(_items);
    }
    monad.skip = function skip(count: number) {
        _items = impl.skip(_items, count);
        return iter(_items);
    }
    monad.skipWhile = function skipWhile(fn: PredicateFunction<T>) {
        _items = impl.skipWhile(_items, fn);
        return iter(_items);
    }
    monad.chain = function chain(...others: Iterable<T>[]) {
        _items = impl.chain(_items, ...others);
        return iter(_items);
    }
    monad.some = function some(fn?: PredicateFunction<T>) {
        return impl.some(_items, fn);
    }
    monad.none = function none(fn?: PredicateFunction<T>) {
        return impl.none(_items, fn);
    }
    monad.every = function every(fn: PredicateFunction<T>) {
        return impl.every(_items, fn);
    }
    monad.includes = function includes(item: T) {
        return impl.includes(_items, item);
    }
    monad.reduce = function reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U) {
        return impl.reduce(_items, fn, defaultValue);
    }
    monad.single = function single(predicate?: PredicateFunction<T>) {
        return impl.single(_items, predicate);
    }
    monad.first = function first(fn?: PredicateFunction<T>) {
        return impl.first(_items, fn);
    }
    monad.last = function last(fn?: PredicateFunction<T>) {
        return impl.last(_items, fn);
    }
    monad.count = function count(fn?: PredicateFunction<T>) {
        return impl.count(_items, fn);
    }
    monad.transformWith = function transformWith<U>(fn: (iterable: Iterable<T>, ...args: any[]) => Iterable<U>, ...args: any[]) {
        _items = iterate(fn(_items, ...args));

        return iter(_items);
    }
    monad.zip = function zip(...iterables: Iterable<any>[]) {
        _items = impl.zip(_items, ...iterables);

        return iter(_items);
    }
    monad.groupBy = function groupBy<K>(keySelector: KeyFunction<K, T>) {
        _items = impl.groupBy(_items, keySelector);

        return iter(_items);
    }
    monad.sortedGroupBy = function sortedGroupBy<K>(keySelector: KeyFunction<K, T>) {
        _items = impl.sortedGroupBy(_items, keySelector);

        return iter(_items);
    }
    monad.forEach = function forEach(fn: Action<T>) {
        impl.forEach(_items, fn);
    }
    monad.toArray = function toArray() {
        return Array.from(_items);
    }
    monad.toSet = function toSet() {
        return new Set(_items);
    }
    monad.toMap = function toMap<K, V>(keySelector: KeyFunction<T, K>, valueSelector: KeyFunction<T, V>) {
        return impl.toMap(_items, keySelector, valueSelector);
    }

    return monad;
};

export function repeat<T>(item: T, count?: number) { return iter(impl.repeat(item, count)); }

export function range(start: number, count?: number) { return iter(impl.range(start, count)); }

export function between(start: number, end: number, inclusive?: boolean) { return iter(impl.between(start, end, inclusive)); }