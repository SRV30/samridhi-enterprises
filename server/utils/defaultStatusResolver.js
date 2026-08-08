export const resolveDefaultStatus = async (model, userId, newDefaultId) => {
  await model.updateMany({ user: userId, _id: { $ne: newDefaultId } }, { isDefault: false });
};
