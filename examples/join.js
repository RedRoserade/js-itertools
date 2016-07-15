var impl = require('../lib/impl');

var left = [
	{ a: 1, b: 'l1' },
	{ a: 1, b: 'l2' },
	{ a: 2, b: 'l3' },
    { a: 3, b: 'l4' },
    { a: 3, b: 'l5' }
];

var right = [
	{ a: 1, b: 'r1' },
	{ a: 2, b: 'r2' },
	{ a: 2, b: 'r3' },
    { a: 4, b: 'r4' },
    { a: 4, b: 'r5' }
];

function _map(seq) {
    var result = impl.map(seq, x => ({ l: x[0] || null, r: x[1] || null }));

    return JSON.stringify(Array.from(result), null, 4);
}

var innerJoined = impl.innerJoin(left, right, c => c.a, d => d.a)

console.log('inner', _map(innerJoined));

var leftJoined = impl.leftJoin(left, right, c => c.a, d => d.a)

console.log('left', _map(leftJoined));

var rightJoined = impl.rightJoin(left, right, c => c.a, d => d.a)

console.log('right', _map(rightJoined));

var fullJoined = impl.fullJoin(left, right, c => c.a, d => d.a)

console.log('full', _map(fullJoined));
