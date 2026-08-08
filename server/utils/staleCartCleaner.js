import CartModel from "../models/cartModel.js";

/**
 * Utility worker to clean up inactive abandoned shopping carts older than specified threshold.
 */
export const purgeAbandonedCarts = async (retentionDays = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await CartModel.deleteMany({
      updatedAt: { $lt: cutoffDate },
    });

    return {
      success: true,
      purgedCount: result.deletedCount,
      cutoffDate,
    };
  } catch (error) {
    console.error("Cart cleanup error:", error.message);
    throw error;
  }
};
