/**
 * Tiered coupon discount calculator engine with customer usage and item category evaluation.
 */
export class CouponRulesEngine {
  /**
   * Evaluates complex coupon rules against cart subtotal, items, and user history
   */
  static evaluateCouponEligibility(coupon, { subtotal, items = [], userUsageCount = 0 }) {
    const redeemable = coupon.isRedeemable();
    if (!redeemable.ok) {
      return { eligible: false, reason: redeemable.reason, discount: 0 };
    }

    if (subtotal < (coupon.minOrderAmount || 0)) {
      return {
        eligible: false,
        reason: `Minimum order subtotal of ₹${coupon.minOrderAmount} required for this coupon`,
        discount: 0,
      };
    }

    if (coupon.perUserLimit && userUsageCount >= coupon.perUserLimit) {
      return {
        eligible: false,
        reason: `You have reached the maximum allowed uses (${coupon.perUserLimit}) for this promo code`,
        discount: 0,
      };
    }

    // Category restriction matching if configured
    if (Array.isArray(coupon.applicableCategories) && coupon.applicableCategories.length > 0) {
      const matchingItems = items.filter((item) =>
        coupon.applicableCategories.includes(item.category || item.partId?.category)
      );
      if (matchingItems.length === 0) {
        return {
          eligible: false,
          reason: "This coupon is not applicable to any items in your cart",
          discount: 0,
        };
      }
    }

    const discount = coupon.computeDiscount(subtotal);
    return { eligible: true, discount, reason: "Coupon applied successfully" };
  }
}
