import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
import Part from "../models/partModel.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// Revenue is only counted for orders whose payment has actually succeeded, so
// COD orders awaiting delivery and online orders pending verification do not
// inflate the totals. Centralised here so every metric uses the same rule.
const PAID_MATCH = { paymentStatus: "Success" };

// Stock at or below this level is treated as "low" on the dashboard. Kept as a
// named constant so the dashboard, inventory module, and alerts stay in sync.
const LOW_STOCK_THRESHOLD = 5;

// GET /api/orders/admin/analytics  (auth, admin)
// Returns the at-a-glance numbers for the dashboard overview. Each figure is
// computed from real order / user / part records — never hardcoded. The work is
// split into a small number of aggregation queries that run together so the
// endpoint stays fast even as the collections grow.
export const adminGetDashboardAnalytics = catchAsyncErrors(
  async (req, res, next) => {
    const [
      revenueAgg,
      totalOrders,
      totalCustomers,
      statusAgg,
      lowStockCount,
      outOfStockCount,
    ] = await Promise.all([
      // Total revenue + paid-order count in a single pass over paid orders.
      Order.aggregate([
        { $match: PAID_MATCH },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$itemsTotal" },
            paidOrders: { $sum: 1 },
          },
        },
      ]),
      // Every order regardless of payment state (operational volume).
      Order.countDocuments({}),
      // Customers = registered users with the default USER role.
      User.countDocuments({ role: "USER" }),
      // Order count grouped by lifecycle status, for the status breakdown.
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
      // Parts running low (but not yet out).
      Part.countDocuments({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } }),
      // Parts completely out of stock.
      Part.countDocuments({ stock: { $lte: 0 } }),
    ]);

    const revenue = revenueAgg[0]?.revenue || 0;
    const paidOrders = revenueAgg[0]?.paidOrders || 0;

    // Convert the status aggregation into a plain object so the frontend can
    // read e.g. ordersByStatus.Confirmed without scanning an array.
    const ordersByStatus = statusAgg.reduce((acc, { _id, count }) => {
      if (_id) acc[_id] = count;
      return acc;
    }, {});

    res.sendSuccess({
      analytics: {
        totalRevenue: revenue,
        totalOrders,
        paidOrders,
        totalCustomers,
        lowStockCount,
        outOfStockCount,
        ordersByStatus,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
    });
  }
);

// GET /api/orders/admin/inventory  (auth, admin)
// Returns parts with their current stock levels, sorted lowest-first so the
// items needing attention surface at the top. Each row is tagged with a simple
// status the UI can colour-code without re-deriving the threshold logic.
export const adminGetInventoryOverview = catchAsyncErrors(
  async (req, res, next) => {
    const parts = await Part.find({})
      .select("name price stock category")
      .sort({ stock: 1 });

    const inventory = parts.map((p) => {
      let status = "In Stock";
      if (p.stock <= 0) status = "Out of Stock";
      else if (p.stock <= LOW_STOCK_THRESHOLD) status = "Low Stock";
      return {
        _id: p._id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        status,
      };
    });

    res.sendSuccess({
      count: inventory.length,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      inventory,
    });
  }
);

// GET /api/orders/admin/sales-analytics  (auth, admin)
// Returns the chart-oriented datasets for the dedicated Sales Analytics page:
// monthly sales trends, top selling products, customer growth, and the most
// recent orders. Every figure is derived from real order / user records.
// All four datasets are gathered with Promise.all so the endpoint issues its
// queries concurrently and stays responsive as the collections grow.
//
// The structure deliberately mirrors adminGetDashboardAnalytics so future
// additions (category performance, profit analysis, conversion metrics,
// sales forecasting) can be added as extra aggregation branches here without
// touching the route or the existing summary endpoint.
export const adminGetSalesAnalytics = catchAsyncErrors(
  async (req, res, next) => {
    // The reporting window for the two time-series charts. Twelve months gives
    // a full year of context while keeping the aggregation bounded. Anything
    // older than this is excluded by the $match stages below.
    const TREND_MONTHS = 12;
    const windowStart = new Date();
    windowStart.setMonth(windowStart.getMonth() - (TREND_MONTHS - 1));
    windowStart.setDate(1);
    windowStart.setHours(0, 0, 0, 0);

    const [monthlySalesAgg, topProductsAgg, customerGrowthAgg, recentOrders] =
      await Promise.all([
        // 1. Monthly sales trends — revenue and paid-order count per calendar
        //    month, paid orders only so the revenue line is trustworthy.
        Order.aggregate([
          { $match: { ...PAID_MATCH, createdAt: { $gte: windowStart } } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$itemsTotal" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // 2. Top selling products — unwind each paid order's line items and
        //    rank by total quantity sold. Revenue per product is included so
        //    the UI can show both volume and value. Limited to the top 8.
        Order.aggregate([
          { $match: PAID_MATCH },
          { $unwind: "$items" },
          {
            $group: {
              _id: "$items.part",
              name: { $first: "$items.name" },
              unitsSold: { $sum: "$items.quantity" },
              revenue: {
                $sum: { $multiply: ["$items.price", "$items.quantity"] },
              },
            },
          },
          { $sort: { unitsSold: -1 } },
          { $limit: 8 },
        ]),

        // 3. Customer growth — new USER registrations per calendar month over
        //    the same window, so sign-ups can be compared against sales.
        User.aggregate([
          {
            $match: { role: "USER", createdAt: { $gte: windowStart } },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              newCustomers: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),

        // 4. Recent orders — the ten most recent regardless of payment state,
        //    with just the fields the table needs (customer name comes from the
        //    populated user, falling back to the shipping name).
        Order.find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .populate("user", "name email")
          .select(
            "itemsTotal paymentStatus orderStatus paymentMethod createdAt shippingAddress.fullName user"
          ),
      ]);

    // Build a continuous list of the last TREND_MONTHS months so the charts
    // show every month on the axis even when a month had zero sales or zero
    // sign-ups. Missing months are filled with zeros rather than skipped.
    const months = [];
    const cursor = new Date(windowStart);
    for (let i = 0; i < TREND_MONTHS; i += 1) {
      months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const monthLabel = (year, month) =>
      new Date(year, month - 1, 1).toLocaleDateString("en-IN", {
        month: "short",
        year: "2-digit",
      });

    const salesByKey = monthlySalesAgg.reduce((acc, row) => {
      acc[`${row._id.year}-${row._id.month}`] = row;
      return acc;
    }, {});

    const growthByKey = customerGrowthAgg.reduce((acc, row) => {
      acc[`${row._id.year}-${row._id.month}`] = row;
      return acc;
    }, {});

    const monthlySales = months.map(({ year, month }) => {
      const row = salesByKey[`${year}-${month}`];
      return {
        label: monthLabel(year, month),
        revenue: row?.revenue || 0,
        orders: row?.orders || 0,
      };
    });

    const customerGrowth = months.map(({ year, month }) => {
      const row = growthByKey[`${year}-${month}`];
      return {
        label: monthLabel(year, month),
        newCustomers: row?.newCustomers || 0,
      };
    });

    const topProducts = topProductsAgg.map((p) => ({
      _id: p._id,
      name: p.name || "Unknown product",
      unitsSold: p.unitsSold,
      revenue: p.revenue,
    }));

    const recent = recentOrders.map((o) => ({
      _id: o._id,
      customerName: o.user?.name || o.shippingAddress?.fullName || "Guest",
      customerEmail: o.user?.email || "",
      itemsTotal: o.itemsTotal,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      createdAt: o.createdAt,
    }));

    res.sendSuccess({
      salesAnalytics: {
        monthlySales,
        topProducts,
        customerGrowth,
        recentOrders: recent,
        windowMonths: TREND_MONTHS,
      },
    });
  }
);
