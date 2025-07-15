export function asyncMap<T, U>(fn: (item: T) => Promise<U>): (items: T[]) => Promise<U[]> {
  return async (items: T[]): Promise<U[]> => {
    return Promise.all(items.map(fn));
  };
}
