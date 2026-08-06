export const validateReorderItems = (items) => {
  if (!items || items.length === 0) return { ok: false, reason: "No items to reorder" };
  return { ok: true };
};
