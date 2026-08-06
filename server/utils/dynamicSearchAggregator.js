import PartModel from "../models/partModel.js";

/**
 * Builds dynamic search autocomplete regex and sidebar aggregation filters.
 */
export const buildDynamicSearchFilters = (queryParams) => {
  const { keyword, category, minPrice, maxPrice, brand } = queryParams;
  const filter = { isDeleted: false };

  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (brand) {
    filter.brand = brand;
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  return filter;
};

/**
 * Get aggregate sidebar facets (categories, price range, brand totals)
 */
export const getSidebarFacets = async () => {
  const facets = await PartModel.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        categories: [{ $group: { _id: "$category", count: { $sum: 1 } } }],
        priceStats: [
          {
            $group: {
              _id: null,
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" },
            },
          },
        ],
      },
    },
  ]);

  return facets[0];
};
