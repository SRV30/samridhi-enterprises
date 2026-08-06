export const buildSearchAggregation = (q, filters) => {
  const pipeline = [];
  if (q) {
    pipeline.push({ $match: { $text: { $search: q } } });
  }
  const matchFilters = {};
  if (filters.category) matchFilters.category = filters.category;
  if (filters.minPrice || filters.maxPrice) {
    matchFilters.price = {};
    if (filters.minPrice) matchFilters.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) matchFilters.price.$lte = Number(filters.maxPrice);
  }
  if (Object.keys(matchFilters).length > 0) {
    pipeline.push({ $match: matchFilters });
  }
  pipeline.push({
    $facet: {
      results: [{ $limit: 100 }],
      categories: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
      priceRange: [{ $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }]
    }
  });
  return pipeline;
};
