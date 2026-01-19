import { FindOptionsWhere } from 'typeorm';

export function deepMerge<T>(
  target: Partial<T>,
  source: Partial<T> | FindOptionsWhere<T>,
): T {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      result[key] = sourceValue as any;
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return result;
}

export function generateRandomString(length: number): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }

  return result;
}

// const obj1 = { name: 'Alice', age: { period: 'Genz', age: 20 } };
// const obj2 = { name: 'Bob', age: { age: 10 } };
//
// const merged = deepMerge(obj1, obj2);
//
// console.log(merged);
// {
//   name: 'Bob',
//   age: {
//     period: 'Genz',
//     age: 10
//   }
// }
