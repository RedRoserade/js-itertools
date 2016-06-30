export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

export type KeyFunction<T, K> = (item: T) => K;

export type Grouping<K, T> = { key: K, [Symbol.iterator](): Iterator<T> };

export type Action<T> = (item: T) => void;

export interface IChainableIterable<T> {
    /**
     * Returns the iterator for the existing sequence.
     */
    [Symbol.iterator](): Iterator<T>;
    /**
     * Projects the existing sequence into a new one.
     */
    map<U>(fn: SelectorFunction<T, U>): IChainableIterable<U>;
    /**
     * Projects the existing sequence into a new one, and flattens the resulting
     * iterables into a single one (non-recursive).
     */
    flatMap<U>(fn: SelectorFunction<T, Iterable<U>>): IChainableIterable<U>;
    /**
     * Returns the items from the sequence that match the predicate.
     */
    filter(fn: PredicateFunction<T>): IChainableIterable<T>;
    /**
     * Returns up to [count] items from the existing sequence.
     */
    take(count: number): IChainableIterable<T>;
    /**
     * Returns items from the existing sequence while they match the predicate, excluding
     * the first that fails the test.
     *
     * Further items are not returned.
     */
    takeWhile(fn: PredicateFunction<T>): IChainableIterable<T>;
    /**
     * Skips the first [count] items from the existing sequence.
     */
    skip(count: number): IChainableIterable<T>;
    /**
     * Skips items from the existing sequence until the first one that doesn't.
     */
    skipWhile(fn: PredicateFunction<T>): IChainableIterable<T>;
    /**
     * Concatenates, in order, the iterables passed by parameter into the current one.
     */
    chain(...others: Iterable<T>[]): IChainableIterable<T>;
    /**
     * Tests whether at least one item passes the predicate function. If none is passed,
     * tests whether the sequence contains any items.
     */
    some(fn?: PredicateFunction<T>): boolean;
    /**
     * Tests whether the sequence is empty, or if no item in it passes the predicate function.
     */
    none(fn?: PredicateFunction<T>): boolean;
    /**
     * Tests if every item in the sequence passes the predicate.
     */
    every(fn: PredicateFunction<T>): boolean;
    /**
     * Tests whether the sequence contains the item passed by parameter.
     */
    includes(item: T): boolean;
    /**
     * Reduces the sequence into a single value.
     */
    reduce<U>(fn: ReducerFunction<T, U>, defaultValue?: U): U;
    /**
     * Returns the only item that passes the predicate function.
     *
     * Fails if no item or more than one item passes the sequence.
     */
    single(predicate?: PredicateFunction<T>): T;
    /**
     * Returns the first item in a sequence that passes the predicate function.
     *
     * Fails if none passes the sequence.
     */
    first(fn?: PredicateFunction<T>): T;
    /**
     * Returns the last item in a sequence that passes the predicate function.
     *
     * Fails if none passes the sequence.
     */
    last(fn?: PredicateFunction<T>): T;
    /**
     * Returns the number of elements in the sequence that pass the predicate function.
     *
     * If ommitted, it returns the number of items in it.
     */
    count(fn?: PredicateFunction<T>): number;
    /**
     * Allows passing any function that returns an iterable.
     */
    transformWith<U>(fn: (iterable: Iterable<T>, ...args: any[]) => Iterable<U>, ...args: any[]): IChainableIterable<U>;
    /**
     * Returns an iterable whose items are arrays, each containing the nth item from
     * each iterable passed in the arguments.
     *
     * Iteration stops as soon as one iterable is exhausted. No item is yielded then.
     */
    zip(...iterables: Iterable<any>[]): IChainableIterable<Array<any>>;
    /**
     * Groups items by a key.
     */
    groupBy<K>(keySelector: KeyFunction<K, T>): IChainableIterable<Grouping<K, T>>;
    /**
     * Version of [groupBy] that's optimized for sequences that are known to be
     * already sorted by the key.
     */
    sortedGroupBy<K>(keySelector: KeyFunction<K, T>): IChainableIterable<Grouping<K, T>>;
    /**
     * Calls the function for each item in this sequence.
     */
    forEach(fn: Action<T>): void;
    /**
     * Converts the current sequence into an Array.
     */
    toArray(): Array<T>;
    /**
     * Converts the current sequence into a Set.
     */
    toSet(): Set<T>;
    /**
     * Converts the current sequence into a Map.
     */
    toMap<K, V>(keySelector: KeyFunction<T, K>, valueSelector: KeyFunction<T, V>): Map<K, V>;
};