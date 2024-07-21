/**
 * Either a promise or the result of said promise.
 */
type Awaitable<T> = T | PromiseLike<T>;

/**
 * Define a non empty Array to T
 */
type NonEmptyArray<T> = [T, ...Array<T>];

/**
 * An object or null.
 */
type Option<T> = T | null;

/**
 * Construct a type with the properties of T except for those in type K.
 */
type StrictOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Represent any function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fn<TReturn = any> = (...args: any) => TReturn;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<TReturn> = new (...args: any) => TReturn;
/**
 * Makes the hover overlay more readable.
 */
type Prettify<T> = {
    [K in keyof T]: T[K];
} & NonNullable<unknown>;

/////////////////////////////////////////////////////
///////            Key extractions            ///////
/////////////////////////////////////////////////////
/**
 * Returns a union type with all methods key names.
 */
type MethodsKeyNames<T> = Exclude<
    {
        [K in keyof T]: T[K] extends Fn ? K : never;
    }[keyof T],
    undefined
>;

/**
 * Returns a union type with all properties key names.
 */
type PropsKeyNames<T> = keyof StrictOmit<T, MethodsKeyNames<T>>;

/**
 * Returns a union type with all non nullable members.
 */
type NonNullMembersNames<T> = Exclude<
    {
        [K in keyof T]: null extends T[K] ? never : K;
    }[keyof T],
    undefined
>;

/**
 * Returns a union type with all non undefined members.
 */
type NonOptionnalMembersNames<T> = Exclude<
    {
        [K in keyof T]: undefined extends T[K] ? never : K;
    }[keyof T],
    undefined
>;

/////////////////////////////////////////////////////
///////            Type reductions            ///////
/////////////////////////////////////////////////////
/**
 * Returns a type containing only the members uniques to T.
 */
type UniqueProps<T, U> = Omit<T, keyof U>;

/**
 * Only keeps methods within a type.
 */
type ExtractMethods<T> = Pick<T, MethodsKeyNames<T>>;

/**
 * Only keeps propeties within a type.
 */
type ExtractProps<T> = Pick<T, PropsKeyNames<T>>;

/**
 * Only keeps non nullable members within a type.
 */
type ExtractNonNull<T> = Pick<T, NonNullMembersNames<T>>;

/**
 * Only keeps non optionnal members within a type.
 */
type ExtractNonOptionnal<T> = Pick<T, NonOptionnalMembersNames<T>>;

/**
 * Only keeps required members within a type.
 */
type ExtractRequired<T> = ExtractNonOptionnal<ExtractNonNull<T>>;

/////////////////////////////////////////////////////
///////            Type reductions            ///////
/////////////////////////////////////////////////////
type FindDiscriminent<T, U> = keyof ExtractRequired<UniqueProps<T, U>>;
