import PartModel from "../models/partModel.js";

/**
 * Validates prices and stock availability of checkout cart items against database in real time.
 */
export const validateCheckoutPriceIntegrity = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { isValid: false, reason: "Cart items cannot be empty" };
  }

  const verifiedItems = [];
  let priceMismatchDetected = false;

  for (const item of items) {
    const partId = item.partId || item.part || item._id;
    const dbPart = await PartModel.findById(partId);

    if (!dbPart || dbPart.isDeleted) {
      return {
        isValid: false,
        reason: `Product "${item.name || 'Item'}" is no longer available`,
      };
    }

    if (dbPart.stock < item.quantity) {
      return {
        isValid: false,
        reason: `Insufficient stock for product "${dbPart.name}". Available: ${dbPart.stock}`,
      };
    }

    if (dbPart.price !== item.price) {
      priceMismatchDetected = true;
    }

    verifiedItems.push({
      partId: dbPart._id,
      name: dbPart.name,
      price: dbPart.price,
      quantity: item.quantity,
      subtotal: dbPart.price * item.quantity,
    });
  }

  return {
    isValid: true,
    priceMismatchDetected,
    verifiedItems,
  };
};
