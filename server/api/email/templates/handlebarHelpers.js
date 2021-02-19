/* eslint-disable no-restricted-globals */
export function isUndefined(value) {
  return (typeof value === 'undefined' ||
          value === null ||
          isNaN(value) ||
          value === Infinity);
}

export function isGreaterThan(value, comparison) {
  return isValid(value) &&
         value > comparison;
}

export function isLessThan(value, comparison) {
  return isValid(value) &&
         value < comparison;
}

export function isBetween(value, left, right) {
  return isValid(value) &&
         left < value < right;
}

function isValid(value) {
  return value !== null &&
         value !== Infinity &&
         !isNaN(value);
}

