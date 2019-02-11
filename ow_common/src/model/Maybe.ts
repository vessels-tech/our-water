export type Maybe<T> = T | void;

export function isDefined<T>(x: Maybe<T>): x is T {
  return x !== undefined && x !== null;
}

export function isUndefined<T>(x: Maybe<T>): x is void {
  return x === undefined || x === null;
}

export function getOrElse<T>(x: Maybe<T>, defaultValue: T): T {
  return isDefined(x) ? x : defaultValue;
}