// ES6/TypeScript import syntax
import { between, range } from '../src/index';

/**
 * Returns true if n > 1 and no number between 2 and n - 1 can divide it.
 */
function isPrime(n) {
    if (n === 1) { return false; }

    return between(2, n)         // Sequence between 2 and N (excluding N).
        .none(d => n % d === 0); // This "breaks" immediately at the first match
}

const first100Primes = range(1) // Generate a sequence of numbers, starting from 1
    .filter(isPrime)            // Filter them
    .take(100);                 // Take the first 100

// Print them!
first100Primes.forEach(console.log.bind(console));