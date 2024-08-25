/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/explicit-function-return-type */
import { describe, expect, it } from 'bun:test';

import { isErr, tri } from './tri';

describe('tri function', () => {
	describe('sync', () => {
		it('should return the result when the function does not throw an error', () => {
			const fn = () => 42;
			const result = tri(fn);
			expect(isErr<Error>(result)).toBe(false);
			expect(result).toBe(42);
		});

		it('should catch and return an error when the function throws an error', () => {
			const fn = () => {
				throw new Error('Test error');
			};
			const result = tri(fn);
			expect(isErr<Error>(result)).toBe(true);
			expect(result.err).toBeInstanceOf(Error);
			expect((result.err as Error).message).toBe('Test error');
		});
	});

	describe('promise', () => {
		it('should return the result when the promise resolves', async () => {
			const fn = () => Promise.resolve(42);
			const result = await tri(fn);
			expect(isErr<Error>(result)).toBe(false);
			expect(result).toBe(42);
		});

		it('should catch and return an error when the promise rejects', async () => {
			const fn = () => Promise.reject(new Error('Test error'));
			const result = await tri(fn);
			expect(isErr<Error>(result)).toBe(true);
			expect(result.err).toBeInstanceOf(Error);
			expect((result.err as Error).message).toBe('Test error');
		});
	});

	describe('async', () => {
		it('should return the result when the async function resolves successfully', async () => {
			const fn = async () => 42;
			const result = await tri(fn);
			expect(isErr<Error>(result)).toBe(false);
			expect(result).toBe(42);
		});

		it('should catch and return an error when the async function throws an error', async () => {
			const fn = async () => {
				throw new Error('Test error');
			};
			const result = await tri(fn);
			expect(isErr<Error>(result)).toBe(true);
			expect(result.err).toBeInstanceOf(Error);
			expect((result.err as Error).message).toBe('Test error');
		});
	});
});
