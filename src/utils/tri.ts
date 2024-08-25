const ERROR = Symbol('error');

type Ok<T> = T;
type Err<E = unknown> = { [ERROR]: true; err: E };
type Result<T, E> = Ok<T> | Err<E>;

export function tri<T, E>(fn: () => Promise<T>): Promise<Result<T, E>>;
export function tri<T, E>(fn: () => T): Result<T, E>;
/**
 * A simple wrapper that catches errors instead of letting them break the flow.
 * @param {() => Awaitable<T>} fn - A function that either returns a T or a Promise<T>.
 * @returns {Awaitable<Result<T>>} - The result or an error object.
 */
export function tri<T, E>(fn: () => Awaitable<T>): Awaitable<Result<T, E>> {
	try {
		const res = fn();
		if (isPromise(res)) {
			return res.catch((err: E) => ({ [ERROR]: true, err }));
		}
		return res;
	} catch (err) {
		return {
			[ERROR]: true,
			err: err as E,
		};
	}
}
// @ts-expect-error The problematic part is the "never"
// it's here to prevent passing a Promise type, ensuring it's not a valid argument
// passing a Promise triggers a compile error.
export const isErr = <R, E>(err: R extends Promise<unknown> ? never : R): err is Err<E> => !!(err as Err<E>)[ERROR];
const isPromise = <T>(obj: Awaitable<T>): obj is Promise<T> => !!(obj as Promise<T>).then;
