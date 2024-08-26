/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable jsdoc/require-jsdoc */
import { describe, expect, it } from 'bun:test';

import { arrayChunks, filterGenerator, mapGenerator } from './generators';

function* range(begin: number, end: number, step = 1): Generator<number, void> {
	for (let i = begin; i <= end; i += step) yield i;
}

describe('arrayChunks', () => {
	it('should split array into chunks of specified size', () => {
		const arr = [1, 2, 3, 4, 5];
		const chunks = Array.from(arrayChunks(arr, 2));
		expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
	});

	it('should handle chunk size larger than array', () => {
		const arr = [1, 2, 3];
		const chunks = Array.from(arrayChunks(arr, 5));
		expect(chunks).toEqual([[1, 2, 3]]);
	});

	it('should return empty array when input array is empty', () => {
		const arr: Array<number> = [];
		const chunks = Array.from(arrayChunks(arr, 2));
		expect(chunks).toEqual([]);
	});

	it('should handle chunk size of 1', () => {
		const arr = [1, 2, 3];
		const chunks = Array.from(arrayChunks(arr, 1));
		expect(chunks).toEqual([[1], [2], [3]]);
	});

	it('should handle chunk size equal to array length', () => {
		const arr = [1, 2, 3];
		const chunks = Array.from(arrayChunks(arr, arr.length));
		expect(chunks).toEqual([[1, 2, 3]]);
	});
});

describe('mapGenerator', () => {
	it('should apply function to each value yielded by generator', () => {
		const mapped = Array.from(mapGenerator(range(1, 3), (x) => x * 2));
		expect(mapped).toEqual([2, 4, 6]);
	});

	it('should work with empty generator', () => {
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		function* emptyGenerator() {}

		const mapped = Array.from(mapGenerator(emptyGenerator(), (x) => x * 2));
		expect(mapped).toEqual([]);
	});
});

describe('filterGenerator', () => {
	it('should filter values based on predicate function', () => {
		const filtered = Array.from(filterGenerator(range(1, 5), (x) => x % 2 === 0));
		expect(filtered).toEqual([2, 4]);
	});

	it('should return all values when all pass predicate', () => {
		const filtered = Array.from(filterGenerator(range(1, 3), (x) => x > 0));
		expect(filtered).toEqual([1, 2, 3]);
	});

	it('should return no values when none pass predicate', () => {
		const filtered = Array.from(filterGenerator(range(0, 5), (x) => x > 10));
		expect(filtered).toEqual([]);
	});
});
