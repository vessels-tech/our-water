export type SomeResult<T> = ErrorResult | SuccessResult<T>;

export type SuccessResult<T> = {
  result: T,
  type: ResultType.SUCCESS,
}

export type ErrorResult = {
  message: string,
  type: ResultType.ERROR,
}


export enum ResultType {
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export function makeSuccess<T>(result: T): SomeResult<T> {
  return {
    type: ResultType.SUCCESS,
    result,
  };
}

export function makeError<T>(message: string): SomeResult<T> {
  return {
    type: ResultType.ERROR,
    message,
  };
}