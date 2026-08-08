import Part from "../models/partModel.js";
export const validateAndFetchFreshPrices = async (orderItems) => {
  let subtotal = 0;
  const validatedItems = [];
  for (const item of orderItems) {
    const dbPart = await Part.findOne({ _id: item.part, isDeleted: false });
    if (!dbPart) throw new Error(`Part ${item.name} not found or no longer available`);
    if (dbPart.stock < item.quantity) throw new Error(`Insufficient stock for ${dbPart.name}`);
    subtotal += dbPart.price * item.quantity;
    validatedItems.push({
      part: dbPart._id,
      name: dbPart.name,
      price: dbPart.price,
      quantity: item.quantity,
      image: item.image
    });
  }
  return { validatedItems, subtotal };
};
