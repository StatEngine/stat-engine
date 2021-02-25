/* eslint-disable no-restricted-globals */
export function isUndefined(value) {
  return (typeof value === 'undefined' ||
          value === null ||
          isNaN(value) ||
          value === Infinity);
}

export function isGreaterThan(value, comparison) {
  return !isUndefined(value) &&
         value > comparison;
}

export function isLessThan(value, comparison) {
  return !isUndefined(value) &&
         value < comparison;
}

export function isBetween(value, left, right) {
  return !isUndefined(value) &&
         value > left &&
         value < right;
}
