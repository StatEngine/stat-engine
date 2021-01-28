export default function validateAggregateMetricsParams(params) {
  const { comparison, reportOptions } = params;

  if (!comparison || comparison === {} || !reportOptions || reportOptions === {}) {
    return false;
  }
  return true;
}
