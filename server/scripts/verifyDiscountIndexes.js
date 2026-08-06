import assert from "assert";
import Discount from "../models/discountModel.js";
import Coupon from "../models/couponModel.js";

function verifyDiscountIndexes() {
  console.log("Running Discount Indexes Verification Tests...");

  const discountIndexes = Discount.schema.indexes();
  assert.ok(Array.isArray(discountIndexes), "Discount schema indexes should be an array");

  const hasNameIndex = discountIndexes.some(([fields]) => fields.name === 1);
  assert.strictEqual(hasNameIndex, true, "Discount schema should have an index on 'name'");

  const hasCompoundIndex = discountIndexes.some(
    ([fields]) => fields.discountType === 1 && fields.isActive === 1
  );
  assert.strictEqual(hasCompoundIndex, true, "Discount schema should have a compound index on 'discountType' and 'isActive'");

  const couponIndexes = Coupon.schema.indexes();
  const hasCouponCompoundIndex = couponIndexes.some(
    ([fields]) => fields.discountType === 1 && fields.isActive === 1
  );
  assert.strictEqual(hasCouponCompoundIndex, true, "Coupon schema should have a compound index on 'discountType' and 'isActive'");

  console.log("✅ All Discount Index verification tests passed successfully!");
}

verifyDiscountIndexes();
