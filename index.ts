export type PredicateFunction<T> = (item: T, index?: number) => boolean;

export type SelectorFunction<T, U> = (item: T, index?: number) => U;

export type UnitFunction<T> = () => T;

export type ReducerFunction<T, U> = (accumulated: U, item: T) => U;

interface GroupedIterable<K, T> extends Iterable<T> {
    
}

interface Iterable<T> {    
    includes(item: T): boolean;
    
    take(count: number): Iterable<T>;
    
    some(test?: PredicateFunction<T>): boolean;
    
    every(test: PredicateFunction<T>): boolean;
        
    filter(test: PredicateFunction<T>): Iterable<T>;
    
    takeWhile(test: PredicateFunction<T>): Iterable<T>;
    
    map<U>(mapper: SelectorFunction<T, U>): Iterable<U>;
    
    flatten<U>(mapper: SelectorFunction<T, Iterable<U>>): Iterable<U>;
    
    reduce<U>(reducer: ReducerFunction<T, U>): U;
    
    chain(other: Iterable<T>): Iterable<T>;
    
    groupBy<K>(key: SelectorFunction<T, K>, sorted?: boolean): GroupedIterable<K, T>;
    
    single(orDefault?: UnitFunction<T>): T;
    
    first(orDefault?: UnitFunction<T>): T;
    
    last(orDefault?: UnitFunction<T>): T;
    
    count(test?: PredicateFunction<T>): number;
    
    toArray(): Array<T>;
    
    toMap<K, V>(keys: SelectorFunction<T, K>, values: SelectorFunction<T, V>): Map<K, V>;
    
    toSet(): Set<T>;
}