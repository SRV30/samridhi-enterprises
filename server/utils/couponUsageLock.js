export const verifyCouponLimitAtomic = async (couponModel, code) => {
  const result = await couponModel.findOneAndUpdate(
    { code, isActive: true, $expr: { $lt: ["$usedCount", "$usageLimit"] } },
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  return result;
};
