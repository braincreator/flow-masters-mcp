/**
 * Строит агрегации для поиска
 */
export function buildAggregations(aggregations: string[]): any {
  if (!aggregations || !Array.isArray(aggregations) || aggregations.length === 0) {
    return {}
  }

  return aggregations.reduce((acc, agg) => {
    if (agg.includes(':')) {
      const [field, type] = agg.split(':')
      acc[field] = { type: type || 'terms' }
    } else {
      acc[agg] = { type: 'terms' }
    }
    return acc
  }, {})
}
