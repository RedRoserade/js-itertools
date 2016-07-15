import {
    PredicateFunction,
    SelectorFunction,
    UnitFunction,
    ReducerFunction,
    Grouping,
    KeyFunction,
    Action,
    IChainableIterable,
    Collector
} from './types';

import * as transformers from './transformers-impl';
import * as collectors from './collectors-impl';
import * as generators from './generators-impl';

import { iterate } from './util';

export default function chain<T>(items: Iterable<T>): IChainableIterable<T> {

    const _items: IterableIterator<any> = iterate(items);

    const monad: IChainableIterable<T> = Object.create(null);

    monad[Symbol.iterator] = function () {
        return _items;
    }
    monad.map = function <U>(fn: SelectorFunction<T, U>) {
        return chain(transformers.map(_items, fn));
    }
    monad.flatMap = function <U>(fn: SelectorFunction<T, Iterable<U>>) {
        return chain(transformers.flatMap(_items, fn));
    }
    monad.filter = function (fn: PredicateFunction<T>) {
        return chain(transformers.filter(_items, fn));
    }
    monad.take = function (count: number) {
        return chain(transformers.take(_items, count));
    }
    monad.takeWhile = function (fn: PredicateFunction<T>) {
        return chain(transformers.takeWhile(_items, fn));
    }
    monad.skip = function (count: number) {
        return chain(transformers.skip(_items, count));
    }
    monad.skipWhile = function (fn: PredicateFunction<T>) {
        return chain(transformers.skipWhile(_items, fn));
    }
    monad.chain = function (...others: Iterable<T>[]) {
        return chain(transformers.chain(_items, ...others));
    }
    monad.some = function (fn?: PredicateFunction<T>) {
        return collectors.some(_items, fn);
    }
    monad.none = function (fn?: PredicateFunction<T>) {
        return collectors.none(_items, fn);
    }
    monad.every = function (fn: PredicateFunction<T>) {
        return collectors.every(_items, fn);
    }
    monad.includes = function (item: T) {
        return collectors.includes(_items, item);
    }
    monad.reduce = function <U>(fn: ReducerFunction<T, U>, defaultValue?: U) {
        return collectors.reduce(_items, fn, defaultValue);
    }
    monad.single = function (predicate?: PredicateFunction<T>) {
        return collectors.single(_items, predicate);
    }
    monad.first = function (fn?: PredicateFunction<T>) {
        return collectors.first(_items, fn);
    }
    monad.last = function (fn?: PredicateFunction<T>) {
        return collectors.last(_items, fn);
    }
    monad.count = function (fn?: PredicateFunction<T>) {
        return collectors.count(_items, fn);
    }
    monad.zip = function (...iterables: Iterable<any>[]) {
        return chain(transformers.zip(_items, ...iterables));
    }
    monad.toLookup = function <K>(keySelector: KeyFunction<K, T>) {
        return collectors.toLookup(_items, keySelector);
    }
    monad.groupBy = function <K>(keySelector: KeyFunction<K, T>) {
        return chain(transformers.groupBy(_items, keySelector));
    }
    monad.forEach = function (fn: Action<T>) {
        collectors.forEach(_items, fn);
    }
    monad.toArray = function () {
        return Array.from(_items);
    }
    monad.toSet = function () {
        return collectors.toSet(_items);
    }
    monad.toMap = function <K, V>(keySelector: KeyFunction<T, K>, valueSelector: KeyFunction<T, V>) {
        return collectors.toMap(_items, keySelector, valueSelector);
    }
    monad.collect = function <T, R>(collector: Collector<T, R>): R {
        return collector(_items);
    }
    monad.intersperse = function <T>(item: T) {
        return chain(transformers.intersperse(_items, item));
    }

    return monad;
};

export function repeat<T>(item: T, count?: number) { return chain(generators.repeat(item, count)); }

export function range(start: number, count?: number) { return chain(generators.range(start, count)); }

export function between(start: number, end: number, inclusive?: boolean) { return chain(generators.between(start, end, inclusive)); }

export function sequence<T>(seq: Array<T>) { return chain(generators.sequence(seq)); }