export declare type Maybe<T> = T | void;
export declare function isDefined<T>(x: Maybe<T>): x is T;
export declare function isUndefined<T>(x: Maybe<T>): x is void;
export declare function getOrElse<T>(x: Maybe<T>, defaultValue: T): T;
