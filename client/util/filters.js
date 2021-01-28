import _ from 'lodash';

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function convertWildcardStringToRegExp(expression) {
  const terms = expression.split('*');

  let trailingWildcard = false;

  let expr = '';
  for (let i = 0; i < terms.length; i++) {
    if (terms[i]) {
      if (i > 0 && terms[i - 1]) {
        expr += '.*';
      }
      trailingWildcard = false;
      expr += escapeRegExp(terms[i]);
    } else {
      trailingWildcard = true;
      expr += '.*';
    }
  }

  if (!trailingWildcard) {
    expr += '.*';
  }

  return new RegExp(`^${expr}$`, 'i');
}

const compose = (...fns) => fns.reduce((f, g) => (...xs) => {
  const r = g(...xs);
  return f(r);
});

const applyUnitFilters = (units, filterConfiguration) => {
  try {
    const wildcardFilters = filterConfiguration.config_json.wildcards
      .map(wildcard => convertWildcardStringToRegExp(wildcard))
      .map(regex => value => value.filter(item => !regex.test(item.id))) || [];

    const individualFilters = filterConfiguration.config_json.individuals
      .map(individual => value => value.filter(item => item.id !== individual)) || [];

    if (wildcardFilters.length === 0 && individualFilters.length === 0) {
      return {
        excluded: [],
        included: units,
      };
    }

    const applyFilters = compose(
      ...wildcardFilters,
      ...individualFilters,
    );

    const included = applyFilters(units);
    const excluded = _.differenceWith(units, included, _.isEqual);

    return {
      excluded,
      included,
    };
  } catch (err) {
    console.error(err);
    return {
      excluded: [],
      included: units,
    };
  }
};

export default applyUnitFilters;
