

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

export function makeSuccess<T>(result: T): SomeResult < T > {
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

  
/**
 * Reduces a list of SomeResults and returns if any of them contain an error
 */
export function resultsHasError(results: Array<SomeResult<any>>): boolean {
  return results.reduce((acc, curr) => {
    if (curr.type === ResultType.ERROR) {
      return true;
    }
    return acc;
  }, false);
}