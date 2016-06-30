# Iteration tools for ECMAScript 2015

Provides utility functions (`map`, `reduce`, `filter`, and so on) that work on top of ES2015's generators, and a few others. Similar to .NET's `System.Linq` and Java's `Stream` API. These use the `for of` construct semantics.

Requires Node 4 or above.

## Installation

`npm install js-itertools`

## Examples

See the examples folder.

## Available functions

These are some of the available functions in this project. Most take functions as parameters, and the types are as follows:

- `PredicateFunction<T> = (item: T, index?: number) => boolean`
- `SelectorFunction<T, U> = (item: T, index?: number) => U`
- `UnitFunction<T> = () => T`
- `ReducerFunction<T, U> = (accumulated: U, item: T) => U`
- `KeyFunction<T, K> = (item: T) => K`
- `Grouping<K, T> = { key: K, [Symbol.iterator](): Iterator<T> }`
- `Action<T> = (item: T) => void`

### Value generation
- `<T>(source: Iterable<T>)`: The default function. Takes an existing source, such as an `Array`, and allows chained usage of the functions below.
- `repeat<T>(item: T, count?: number)`: Returns a generator that returns the `item` `count` times.
- `range(start: number, count?: number)`: Returns `count` numbers, starting from `start`.
- `between(start: number, end: number, inclusive?: boolean)`: Returns numbers between `start` and `end`.

### Projection

These functions take an already existing source, and transform it into a new generator.

- `map<U>(fn: SelectorFunction<T, U>): ChainableIterable<U>`: Similar to `Array.prototype.map`, returns a generator that calls `fn` for each item in the generator's source, and yields the result.
- `flatMap<U>(fn: SelectorFunction<T, Iterable<U>>): ChainableIterable<U>`: Similar to `map`, but flattens the resulting iterable (non-recursive).
- `reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U`: Similar to `Array.prototype.reduce`, reduces a generator to a single value.
- `zip(...iterables: Iterable<any>[]): ChainableIterable<Array<any>>`: Combines this iterable with the supplied iterables into a single one.
- `groupBy<K>(keySelector: KeyFunction<K, T>): ChainableIterable<Grouping<K, T>>`: Groups items by a key.
- `sortedGroupBy<K>(keySelector: KeyFunction<K, T>): ChainableIterable<Grouping<K, T>>`: Alternate version of `groupBy`, optimized for sources that are known to be sorted by the key.

### Filtering

These functions take an existing source, and return a new one with the items from the original that pass some truth test.

- `filter(fn: PredicateFunction<T>): ChainableIterable<T>`: Similar to `Array.prototype.filter`, returns a generator whose items are those that pass the predicate.
- `take(count: number): ChainableIterable<T>`: Takes at most N items from the source (or less, if the source doesn't contain enough items).
- `takeWhile(fn: PredicateFunction<T>): ChainableIterable<T>`: Similar to `filter`, but only yields items until the first item that fails the predicate.
- `skip(count: number): ChainableIterable<T>`: The opposite of `take`.
- `skipWhile(fn: PredicateFunction<T>): ChainableIterable<T>`: The opposite of `takeWhile`.

### Testing

These functions can be used to test whether one or more items pass a truth test.

- `some(fn?: PredicateFunction<T>): boolean`: Similar to `Array.prototype.some`, returns whether the source contains any matching item. If the predicate function is ommited, the source is tested for the existance of any item.
- `none(fn?: PredicateFunction<T>): boolean`: The opposite of `some`.
- `every(fn: PredicateFunction<T>): boolean`: Similar to `Array.prototype.every`, returns true if all items pass the predicate function.
- `includes(item: T): boolean`: Similar to `Array.prototype.includes`.

### Element finding

These functions can be used to return a matching item from a source.

- `single(predicate?: PredicateFunction<T>): T`: Returns the only item that matches the predicate function. Throws if more than one item is found.
- `first(fn?: PredicateFunction<T>): T`: Returns the first item that matches the predicate function.
- `last(fn?: PredicateFunction<T>): T`: Returns the last item that matches the predicate function.
- `count(fn?: PredicateFunction<T>): number`: Returns the number of items in the source.

### to(Array, Set, Map)

These functions can be used to construct Arrays, Sets, or Maps, for use in other applications.

- `toArray(): Array<T>`: Calls `Array.from` with the source.
- `toSet(): Set<T>`: Calls the `Set` constructor with the source.
- `toMap<K, V>(keySelector: KeyFunction<T, K>, valueSelector: KeyFunction<T, V>): Map<K, V>`: Calls the `Map` selector with the result of the key selector function and the value selector function.

### Iteration

These functions can be used to produce side-effects with the items from the source.

- `forEach(fn: Action<T>): void`: Similar to `Array.prototype.forEach`, calls the function for each item on the source.
- `for of`: The `for of` loop can be used to iterate over the resulting iterable as well.


## Why?

In my opinion, generators can be used for more than just `Promise` synchronization (see: `co` and others). They can also be used for data processing.

For example, `Array`'s methods allocate intermediate arrays at each call. By using generators, object creation can be reduced, which can (haven't tested it) improve performance and reduce memory usage in some scenarios.

This also works well for very large or even infinite collections, which is something that can be done with generators that can be inneficient, or even impossible, to do with normal Arrays.