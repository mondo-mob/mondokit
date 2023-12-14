export type OneOrMany<T> = T | ReadonlyArray<T>;

export const isReadonlyArray = <T>(input: OneOrMany<T>): input is ReadonlyArray<T> => Array.isArray(input);
