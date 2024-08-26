/**
 * Splits an array into chunks of specified size.
 * @param {Array<T>} arr The array you want to split into chunks.
 * @param {number} n The size of each chunks.
 * @yields {Array<T>} A chunk of size `n`.
 */
export function* arrayChunks<T>(arr: Array<T>, n: number): Generator<Array<T>, void> {
	for (let i = 0; i < arr.length; i += n) {
		yield arr.slice(i, i + n);
	}
}

/**
 * Maps over a generator, applying a function to each yielded value.
 * @param {Generator<T>} gen The generator to map over.
 * @param {(value: T) => U} fn The function to apply to each value.
 * @yields {U} The mapped value.
 */
export function* mapGenerator<T, U>(gen: Generator<T>, fn: (value: T) => U): Generator<U> {
	for (const value of gen) {
		yield fn(value);
	}
}

/**
 * Filter a generator values.
 * @param {Generator<T>} gen The generator to map over.
 * @param {(value: T) => boolean} fn The filter function.
 * @yields {T} A valid yielded value.
 */
export function* filterGenerator<T>(gen: Generator<T>, fn: (value: T) => boolean): Generator<T> {
	for (const value of gen) {
		if (!fn(value)) continue;
		yield value;
	}
}
